// ============================================================
//  useBLE.ts — React hook for Bluetooth Low Energy device management
//
//  Phase 3 implementation plan:
//    1. Use react-native-ble-plx (BleManager) to scan for peripherals
//       advertising the NeuroStep service UUID.
//    2. On connect: subscribe to the IMU characteristic (notify).
//    3. Parse incoming 12-byte packets: [ax:float32, ay:float32, az:float32]
//    4. Expose `fogActive` flag driven by on-device inference result
//       (the sock sends a 1-byte flag on a second characteristic).
//    5. Emit fall alerts to the HomeScreen via a callback.
//
//  Returns:
//    devices   — list of discovered BLE peripherals
//    scanning  — true while actively scanning
//    connected — true when a sock is paired and streaming
//    fogActive — true when the sock reports an active freeze event
//    startScan — trigger a 10-second BLE scan
//    connect   — connect to a specific peripheral by ID
//    disconnect— cleanly disconnect
// ============================================================

import { useState, useCallback } from 'react';

// TODO (Phase 3): import BleManager from 'react-native-ble-plx'
// const manager = new BleManager();

export interface BLEDevice {
  id:   string;
  name: string | null;
  rssi: number | null;
}

export interface UseBLEReturn {
  devices:    BLEDevice[];
  scanning:   boolean;
  connected:  boolean;
  fogActive:  boolean;
  startScan:  () => void;
  connect:    (deviceId: string) => Promise<void>;
  disconnect: () => void;
}

export default function useBLE(): UseBLEReturn {
  const [devices,   setDevices]   = useState<BLEDevice[]>([]);
  const [scanning,  setScanning]  = useState(false);
  const [connected, setConnected] = useState(false);
  const [fogActive, setFogActive] = useState(false);

  const startScan = useCallback(() => {
    // TODO (Phase 3): manager.startDeviceScan([NEUROSTEP_SERVICE_UUID], null, callback)
    setScanning(true);
    console.warn('useBLE: BLE scanning not yet implemented (Phase 3)');
  }, []);

  const connect = useCallback(async (_deviceId: string) => {
    // TODO (Phase 3): connect, discover services, subscribe to characteristics
    console.warn('useBLE: connect not yet implemented (Phase 3)');
  }, []);

  const disconnect = useCallback(() => {
    // TODO (Phase 3): manager.cancelDeviceConnection(connectedDeviceId)
    setConnected(false);
    setFogActive(false);
  }, []);

  return { devices, scanning, connected, fogActive, startScan, connect, disconnect };
}
