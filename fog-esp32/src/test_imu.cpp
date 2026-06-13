#include <Arduino.h>
#include <Wire.h>

#define MPU_ADDR 0x68

void writeReg(byte reg, byte val) {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(reg);
  Wire.write(val);
  Wire.endTransmission();
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Wire.begin(8, 9);
  delay(500);

  // full reset
  writeReg(0x6B, 0x80);
  delay(200);

  // wake up
  writeReg(0x6B, 0x00);
  delay(100);

  // set accel to +-2G
  writeReg(0x1C, 0x00);
  delay(10);

  // low pass filter
  writeReg(0x1A, 0x04);
  delay(10);

  Serial.println("mpu ready, reading...");
}

void loop() {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADDR, 6);

  int16_t ax = (Wire.read() << 8) | Wire.read();
  int16_t ay = (Wire.read() << 8) | Wire.read();
  int16_t az = (Wire.read() << 8) | Wire.read();

  // convert to mg to match DAPHNET units
  float ax_mg = ax / 16384.0 * 1000.0;
  float ay_mg = ay / 16384.0 * 1000.0;
  float az_mg = az / 16384.0 * 1000.0;

  Serial.print("ax: "); Serial.print(ax_mg, 1);
  Serial.print("  ay: "); Serial.print(ay_mg, 1);
  Serial.print("  az: "); Serial.println(az_mg, 1);

  delay(100);
}