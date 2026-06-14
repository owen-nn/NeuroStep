// ============================================================
//  NeuroStep — Freezing of Gait detector
//  ESP32-S3 + MPU6050 + vibration motor
//  Runs a CNN locally to detect FOG and gives rhythmic
//  vibration cueing to help the wearer resume walking.
// ============================================================

#include <Arduino.h>
#include <Wire.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include "secrets.h"
#include "TensorFlowLite_ESP32.h"
#include "tensorflow/lite/micro/all_ops_resolver.h"
#include "tensorflow/lite/micro/micro_interpreter.h"
#include "tensorflow/lite/micro/micro_error_reporter.h"
#include "tensorflow/lite/schema/schema_generated.h"
#include "fog_model.h"

// ── WiFi + backend ────────────────────────────────────────────
// credentials live in secrets.h (gitignored)
const char* BACKEND_URL = "http://149.248.52.166:3000/api/events/freeze";

// pins
#define MOTOR_PIN      13
#define SDA_PIN         8
#define SCL_PIN         9
#define LED_PIN         2
#define MPU_ADDR     0x68

// model + detection settings
#define SAMPLE_RATE_HZ   64
#define WINDOW_SIZE      64
#define NUM_CHANNELS      3
#define FOG_THRESHOLD  0.70f   // average confidence needed to alert
#define MAX_ACCEL      3000.0f // reject glitch spikes above this
#define PROB_HISTORY      8    // rolling average length (smooths spikes)

// vibration cueing (research-backed 1Hz rhythm)
// rhythmic cueing at walking cadence helps Parkinson's patients
// break out of a freeze: 400ms on / 600ms off = 1Hz, 10s total
#define ALERT_DURATION_MS  10000
#define CUE_PERIOD_MS       1000   // full on+off cycle = 1Hz
#define CUE_ON_MS            400    // motor on portion of each cycle

// DAPHNET resting reference (ankle, standing still)
#define REF_AX   50.0f
#define REF_AY 1024.0f
#define REF_AZ  175.0f

// normalization stats from training — shifted by calibration
float MEAN[3] = { -98.07f,  998.45f,  243.05f };
const float STD[3] = { 570.03f,  364.03f,  315.52f };

// tflite
const int TENSOR_ARENA_SIZE = 60 * 1024;
uint8_t tensor_arena[TENSOR_ARENA_SIZE];

tflite::AllOpsResolver resolver;
tflite::MicroErrorReporter micro_error_reporter;
const tflite::Model* tf_model = nullptr;
tflite::MicroInterpreter* interpreter = nullptr;
TfLiteTensor* input_tensor  = nullptr;
TfLiteTensor* output_tensor = nullptr;

// circular buffer
float window_buf[WINDOW_SIZE][NUM_CHANNELS];
int   buf_idx  = 0;
bool  buf_full = false;

// rolling average buffer
float prob_history[PROB_HISTORY] = {0};
int   prob_idx = 0;

// timing + alert state
unsigned long last_sample_ms = 0;
bool alerting = false;
unsigned long alert_start_ms = 0;

// MPU6050 I2C helpers
void writeReg(byte reg, byte val) {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(reg);
  Wire.write(val);
  Wire.endTransmission();
}

// burst-read all 3 axes in one transaction
// signs chosen so output matches DAPHNET ankle when still:
//   ax ~ +50, ay ~ +1024, az ~ +175
void readAccel(float &ax, float &ay, float &az) {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADDR, 6);

  int16_t raw_ax = (Wire.read() << 8) | Wire.read();
  int16_t raw_ay = (Wire.read() << 8) | Wire.read();
  int16_t raw_az = (Wire.read() << 8) | Wire.read();

  ax =  raw_ay / 8192.0f * 1000.0f;
  ay = -raw_ax / 8192.0f * 1000.0f;  // flipped so ay is positive
  az = -raw_az / 8192.0f * 1000.0f;
}

// reject dropouts and glitch spikes
bool validReading(float ax, float ay, float az) {
  if (abs(ay) < 10.0f) return false;
  if (abs(ax) > MAX_ACCEL) return false;
  if (abs(ay) > MAX_ACCEL) return false;
  if (abs(az) > MAX_ACCEL) return false;
  return true;
}

// collect resting samples, shift MEAN to match this sensor
void calibrate() {
  Serial.println("calibrating — stand still for 2 seconds...");
  float sum[3] = {0, 0, 0};
  int valid = 0;

  for (int i = 0; i < 150; i++) {
    float ax, ay, az;
    readAccel(ax, ay, az);
    if (validReading(ax, ay, az)) {
      sum[0] += ax; sum[1] += ay; sum[2] += az;
      valid++;
    }
    delay(15);
  }

  if (valid > 50) {
    float rax = sum[0] / valid;
    float ray = sum[1] / valid;
    float raz = sum[2] / valid;
    Serial.printf("resting: ax=%.1f ay=%.1f az=%.1f\n", rax, ray, raz);
    MEAN[0] += (rax - REF_AX);
    MEAN[1] += (ray - REF_AY);
    MEAN[2] += (raz - REF_AZ);
    Serial.printf("adjusted mean: %.1f  %.1f  %.1f\n", MEAN[0], MEAN[1], MEAN[2]);
  } else {
    Serial.println("calibration failed — using defaults");
  }
}

// connect to WiFi — non-blocking after 10s timeout, runs offline if fails
void connect_wifi() {
  Serial.print("connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  int tries = 0;
  while (WiFi.status() != WL_CONNECTED && tries < 20) {
    delay(500);
    Serial.print(".");
    tries++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\nWiFi connected: %s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("\nWiFi failed — running offline, events won't be posted");
  }
}

// POST freeze event to backend — fire and forget, won't block the cue
void post_freeze_event(float fogConfidence) {
  if (WiFi.status() != WL_CONNECTED) return;
  HTTPClient http;
  http.begin(BACKEND_URL);
  http.addHeader("Content-Type", "application/json");
  String body = "{\"durationMs\":10000,\"fogConfidence\":"
                + String(fogConfidence, 2) + ",\"cueDelivered\":true}";
  int code = http.POST(body);
  Serial.printf("posted freeze event → HTTP %d\n", code);
  http.end();
}

float run_inference();
void  start_alert(float fogConfidence);
void  update_alert();

// ============================================================
void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("starting up...");

  pinMode(MOTOR_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(MOTOR_PIN, LOW);
  digitalWrite(LED_PIN, LOW);

  Wire.begin(SDA_PIN, SCL_PIN);
  delay(500);

  writeReg(0x6B, 0x80); delay(200);  // reset
  writeReg(0x6B, 0x00); delay(100);  // wake
  writeReg(0x1C, 0x08); delay(10);   // +-4G range
  writeReg(0x1A, 0x04); delay(10);   // low pass filter
  Serial.println("mpu ready");

  calibrate();
  connect_wifi();

  tf_model = tflite::GetModel(fog_model);
  if (tf_model->version() != TFLITE_SCHEMA_VERSION) {
    Serial.println("tflite version mismatch");
    while (1) {}
  }

  static tflite::MicroInterpreter static_interpreter(
    tf_model, resolver, tensor_arena, TENSOR_ARENA_SIZE, &micro_error_reporter);
  interpreter = &static_interpreter;

  if (interpreter->AllocateTensors() != kTfLiteOk) {
    Serial.println("tensor allocation failed — increase arena size");
    while (1) {}
  }

  input_tensor  = interpreter->input(0);
  output_tensor = interpreter->output(0);
  Serial.printf("model loaded, using %d bytes of RAM\n", interpreter->arena_used_bytes());
  Serial.println("ready — walk around to begin");
}

// ============================================================
void loop() {
  unsigned long now = millis();

  // keep the rhythmic cue running smoothly
  update_alert();

  if (now - last_sample_ms < (1000 / SAMPLE_RATE_HZ)) return;
  last_sample_ms = now;

  float ax, ay, az;
  readAccel(ax, ay, az);

  if (!validReading(ax, ay, az)) return;

  window_buf[buf_idx][0] = ax;
  window_buf[buf_idx][1] = ay;
  window_buf[buf_idx][2] = az;
  buf_idx = (buf_idx + 1) % WINDOW_SIZE;
  if (buf_idx == 0) buf_full = true;

  if (!buf_full) return;

  float fog_prob = run_inference();

  // rolling average smooths single-window spikes
  prob_history[prob_idx] = fog_prob;
  prob_idx = (prob_idx + 1) % PROB_HISTORY;
  float avg = 0;
  for (int i = 0; i < PROB_HISTORY; i++) avg += prob_history[i];
  avg /= PROB_HISTORY;

  // print everything on one line, once per inference (keeps serial fast)
  Serial.printf("raw: ax=%.1f ay=%.1f az=%.1f  fog: %.2f  avg: %.2f  %s\n",
    ax, ay, az, fog_prob, avg,
    avg >= FOG_THRESHOLD ? "<<< FOG >>>" : "ok");

  if (avg >= FOG_THRESHOLD && !alerting) {
    start_alert(avg);
  }
}

// ============================================================
float run_inference() {
  int idx = buf_idx;
  for (int t = 0; t < WINDOW_SIZE; t++) {
    int src = (idx + t) % WINDOW_SIZE;
    for (int ch = 0; ch < NUM_CHANNELS; ch++) {
      input_tensor->data.f[ch * WINDOW_SIZE + t] =
        (window_buf[src][ch] - MEAN[ch]) / STD[ch];
    }
  }

  if (interpreter->Invoke() != kTfLiteOk) {
    Serial.println("inference failed");
    return 0.0f;
  }

  float l0 = output_tensor->data.f[0];
  float l1 = output_tensor->data.f[1];
  float mx = max(l0, l1);
  float e0 = exp(l0 - mx);
  float e1 = exp(l1 - mx);
  return e1 / (e0 + e1);
}

// ============================================================
void start_alert(float fogConfidence) {
  Serial.println(">>> FOG confirmed — 10s rhythmic cue at 1Hz");
  alerting       = true;
  alert_start_ms = millis();
  post_freeze_event(fogConfidence);
}

// rhythmic 1Hz pulse for 10 seconds
// computed from elapsed time so it can never get out of sync
void update_alert() {
  if (!alerting) return;
  unsigned long elapsed = millis() - alert_start_ms;

  // stop after 10 seconds
  if (elapsed >= ALERT_DURATION_MS) {
    alerting = false;
    digitalWrite(MOTOR_PIN, LOW);
    digitalWrite(LED_PIN,   LOW);
    for (int i = 0; i < PROB_HISTORY; i++) prob_history[i] = 0;
    Serial.println("alert ended");
    return;
  }

  // where are we within the current 1-second cycle?
  unsigned long phase = elapsed % CUE_PERIOD_MS;
  bool should_be_on = (phase < CUE_ON_MS);

  digitalWrite(MOTOR_PIN, should_be_on ? HIGH : LOW);
  digitalWrite(LED_PIN,   should_be_on ? HIGH : LOW);
}
