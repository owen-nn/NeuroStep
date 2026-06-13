# NeuroStep

A wearable smart sock for individuals living with Parkinson's disease. The sock detects freezing of gait (FOG) using an on-device CNN running on an ESP32-S3, delivers rhythmic vibration cues to break the freeze, and streams event data to a companion mobile app.

---

## Repo structure

```
neurostep/
├── firmware/     ESP32-S3 PlatformIO project (MPU6050 + TFLite + vibration motor)
├── ml/           Python CNN training pipeline (DAPHNET dataset → TFLite → C header)
├── backend/      Node.js/Express REST API (Phase 2 — Vultr + MongoDB Atlas)
└── mobile/       React Native Expo companion app (iOS + Android)
```

---

## Development phases

### Phase 1 — Mobile UI with mock data and dev toggle

Goal: a fully navigable app that looks and feels real, with zero backend dependency.

- All three screens (Home, Analytics, Devices) render using `mobile/src/constants/mockData.ts`.
- A **DevToggle** switch (visible only in dev builds) flips between mock and real data without a rebuild.
- Components (`StatusBadge`, `NotificationCard`, `BottomDock`) are built and styled.
- No BLE, no backend calls — purely local.

Deliverable: demoed on a simulator with convincing mock FOG events and medication reminders.

---

### Phase 2 — Vultr backend + MongoDB Atlas integration

Goal: replace mock data with real persistence, surfaced through the Express API.

- Deploy `backend/` to a Vultr VPS (Node.js + PM2 or Docker).
- Provision a MongoDB Atlas cluster; connect via `MONGODB_URI` in `.env`.
- Implement Mongoose models: `FreezeEvent`, `FallEvent`, `Medication`.
- Wire up `backend/routes/events.js` and `backend/routes/medications.js`.
- Mobile `services/api.ts` calls switch from mock returns to real `fetch()`.
- The DevToggle now switches between the live API and mock data for regression testing.

Deliverable: FOG events recorded by the firmware (or manually POSTed) appear in the mobile app's Analytics screen in real time.

---

### Phase 3 — Real BLE hardware handoff

Goal: the physical sock talks to the mobile app over Bluetooth Low Energy.

- Finalize `firmware/src/main.cpp.bak` → rename to `main.cpp` (active build).
- Implement `ml/convert_to_tflite.py` to regenerate `firmware/src/fog_model.h` from a retrained model.
- Implement `mobile/src/hooks/useBLE.ts` using `react-native-ble-plx`:
  - Scan for the NeuroStep service UUID.
  - Subscribe to IMU and FOG-alert BLE characteristics.
  - Post confirmed FOG events to the backend automatically.
- `DevicesScreen` renders discovered peripherals and a connect button.
- `StatusBadge` goes green and `fogActive` fires in real time.

Deliverable: end-to-end demo — sock detects FOG → vibrates → app logs event → Analytics screen updates.

---

## Quick start

### Firmware
```bash
cd firmware
pio run --target upload   # flash to ESP32-S3
pio device monitor        # serial output at 115200 baud
```

### ML
```bash
cd ml
pip install torch numpy pandas scikit-learn matplotlib
python fog_detector.py    # trains on daphnet/ folder, saves fog_model.pth
python convert_to_tflite.py  # (Phase 3) exports fog_model.h for the ESP32
```

### Backend
```bash
cd backend
cp .env.example .env      # fill in MONGODB_URI
npm install
npm run dev
```

### Mobile
```bash
cd mobile
npm install
npx expo start
```
