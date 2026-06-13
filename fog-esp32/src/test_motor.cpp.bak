#include <Arduino.h>

#define MOTOR_PIN 13

void setup() {
  Serial.begin(115200);
  pinMode(MOTOR_PIN, OUTPUT);
  Serial.println("Motor test starting...");
}

void loop() {
  Serial.println("Motor ON");
  digitalWrite(MOTOR_PIN, HIGH);
  delay(1000);

  Serial.println("Motor OFF");
  digitalWrite(MOTOR_PIN, LOW);
  delay(1000);
}