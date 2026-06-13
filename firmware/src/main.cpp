#include <Arduino.h>
#include <Wire.h>
#include "TensorFlowLite_ESP32.h"
#include "tensorflow/lite/micro/all_ops_resolver.h"
#include "tensorflow/lite/micro/micro_interpreter.h"
#include "tensorflow/lite/micro/micro_error_reporter.h"
#include "tensorflow/lite/schema/schema_generated.h"
#include "fog_model.h"

// pins
#define MOTOR_PIN      13   // transistor base via 1k resistor
#define SDA_PIN         8   // MPU6050 data line
#define SCL_PIN         9   // MPU6050 clock line
#define LED_PIN         2   // onboard LED, lights up on FOG
#define MPU_ADDR     0x68   // default I2C address of MPU6050

// model settings — must match what we trained with
#define SAMPLE_RATE_HZ 64   // readings per second
#define WINDOW_SIZE    64   // 1 second of data per inference
#define NUM_CHANNELS    3   // ax, ay, az
#define FOG_THRESHOLD  0.6f // confidence needed to trigger alert
#define MOTOR_DURATION 500  // how long to buzz in milliseconds

// normalization — centers the data the same way training did
// these match the DAPHNET ankle sensor statistics
const float MEAN[3] = { -98.07f,  998.45f,  243.05f };
const float STD[3]  = { 570.03f,  364.03f,  315.52f };

// tflite needs a chunk of RAM to run the model in
const int TENSOR_ARENA_SIZE = 60 * 1024;
uint8_t tensor_arena[TENSOR_ARENA_SIZE];

// tflite objects
tflite::AllOpsResolver resolver;
tflite::MicroErrorReporter micro_error_reporter;
const tflite::Model* tf_model = nullptr;
tflite::MicroInterpreter* interpreter = nullptr;
TfLiteTensor* input_tensor  = nullptr;
TfLiteTensor* output_tensor = nullptr;

// circular buffer stores the last 64 sensor readings
float window_buf[WINDOW_SIZE][NUM_CHANNELS];
int   buf_idx  = 0;
bool  buf_full = false;

// timing
unsigned long last_sample_ms = 0;
unsigned long motor_off_ms   = 0;
bool motor_on = false;

// write a value to an MPU6050 register directly
void writeReg(byte reg, byte val) {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(reg);
  Wire.write(val);
  Wire.endTransmission();
}

// read 3 axes of accelerometer data in one burst
void readAccel(float &ax, float &ay, float &az) {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x3B);  // start of accelerometer registers
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADDR, 6);

  int16_t raw_ax = (Wire.read() << 8) | Wire.read();
  int16_t raw_ay = (Wire.read() << 8) | Wire.read();
  int16_t raw_az = (Wire.read() << 8) | Wire.read();

  // // convert to mg using 4G range sensitivity to match DAPHNET
  // ax = raw_ax / 8192.0f * 1000.0f;
  // ay = raw_ay / 8192.0f * 1000.0f;
  // az = raw_az / 8192.0f * 1000.0f;

  // swap axes to match DAPHNET ankle sensor orientation
  ax = raw_ay / 8192.0f * 1000.0f;
  ay = raw_ax / 8192.0f * 1000.0f;
  az = raw_az / 8192.0f * 1000.0f;
}

float run_inference();
void trigger_alert();

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("starting up...");

  // set up output pins
  pinMode(MOTOR_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(MOTOR_PIN, LOW);
  digitalWrite(LED_PIN, LOW);

  // start I2C on correct pins for ESP32-S3
  Wire.begin(SDA_PIN, SCL_PIN);
  delay(500);

  // full chip reset
  writeReg(0x6B, 0x80);
  delay(200);

  // wake up from sleep mode
  writeReg(0x6B, 0x00);
  delay(100);

  // set accelerometer to +-4G range to match DAPHNET training data
  writeReg(0x1C, 0x08);
  delay(10);

  // low pass filter to smooth out noise
  writeReg(0x1A, 0x04);
  delay(10);

  Serial.println("mpu ready");

  // load the tflite model from fog_model.h
  tf_model = tflite::GetModel(fog_model);
  if (tf_model->version() != TFLITE_SCHEMA_VERSION) {
    Serial.println("tflite version mismatch");
    while (1) {}
  }

  // create the interpreter that runs inference
  static tflite::MicroInterpreter static_interpreter(
    tf_model, resolver, tensor_arena, TENSOR_ARENA_SIZE, &micro_error_reporter);
  interpreter = &static_interpreter;

  // allocate memory for all tensors
  if (interpreter->AllocateTensors() != kTfLiteOk) {
    Serial.println("tensor allocation failed, try increasing arena size");
    while (1) {}
  }

  input_tensor  = interpreter->input(0);
  output_tensor = interpreter->output(0);

  Serial.printf("model loaded, using %d bytes of RAM\n", interpreter->arena_used_bytes());
  Serial.println("walk around to start collecting data...");
}

void loop() {
  unsigned long now = millis();

  // turn motor off after buzz duration
  if (motor_on && now >= motor_off_ms) {
    digitalWrite(MOTOR_PIN, LOW);
    digitalWrite(LED_PIN, LOW);
    motor_on = false;
  }

  // sample at exactly 64hz
  if (now - last_sample_ms < (1000 / SAMPLE_RATE_HZ)) return;
  last_sample_ms = now;

  // read sensor directly without Adafruit library
  float ax, ay, az;
  readAccel(ax, ay, az);

  Serial.printf("raw: ax=%.1f ay=%.1f az=%.1f\n", ax, ay, az);

  // store in circular buffer
  window_buf[buf_idx][0] = ax;
  window_buf[buf_idx][1] = ay;
  window_buf[buf_idx][2] = az;

  // move buffer forward
  buf_idx = (buf_idx + 1) % WINDOW_SIZE;
  if (buf_idx == 0) buf_full = true;

  // wait until we have a full window before running inference
  if (!buf_full) return;

  float fog_prob = run_inference();
  Serial.printf("fog: %.2f  %s\n", fog_prob,
    fog_prob >= FOG_THRESHOLD ? "<<< FOG DETECTED >>>" : "normal");

  if (fog_prob >= FOG_THRESHOLD && !motor_on) {
    trigger_alert();
  }
}

float run_inference() {
  // fill input tensor with normalized sensor data
  // oldest sample first, channels first layout to match training
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

  // softmax — converts raw scores to a probability between 0 and 1
  float l0 = output_tensor->data.f[0];  // normal score
  float l1 = output_tensor->data.f[1];  // fog score
  float mx = max(l0, l1);
  float e0 = exp(l0 - mx);
  float e1 = exp(l1 - mx);
  return e1 / (e0 + e1);
}

void trigger_alert() {
  Serial.println("FOG DETECTED - buzzing motor");
  digitalWrite(MOTOR_PIN, HIGH);
  digitalWrite(LED_PIN, HIGH);
  motor_on     = true;
  motor_off_ms = millis() + MOTOR_DURATION;
}