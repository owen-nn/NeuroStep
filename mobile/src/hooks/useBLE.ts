import { useEffect, useRef } from 'react';
import { BleManager, type Device, type Subscription } from 'react-native-ble-plx';

const SERVICE_UUID     = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const FREEZE_CHAR_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';
const DEVICE_NAME      = 'NeuroStep';
const RECONNECT_DELAY  = 3000;

export function useBLE(
  onFreezeDetected: (confidence: number) => void,
  onConnectionChange: (connected: boolean) => void
) {
  // Refs keep async closures pointing at the latest callbacks without re-running the effect
  const onFreezeRef     = useRef(onFreezeDetected);
  const onConnectRef    = useRef(onConnectionChange);
  const reconnectingRef = useRef(false);

  useEffect(() => { onFreezeRef.current  = onFreezeDetected; }, [onFreezeDetected]);
  useEffect(() => { onConnectRef.current = onConnectionChange; }, [onConnectionChange]);

  useEffect(() => {
    const manager = new BleManager();
    let destroyed = false;
    let disconnectSub: Subscription | null = null;

    function startScan() {
      if (destroyed) return;
      console.log('[BLE] scanning for', DEVICE_NAME);

      manager.startDeviceScan(null, { allowDuplicates: false }, async (error, device) => {
        if (error) {
          console.warn('[BLE] scan error:', error.message);
          return;
        }
        if (device?.name !== DEVICE_NAME) return;

        manager.stopDeviceScan();
        await connectDevice(device);
      });
    }

    async function connectDevice(device: Device) {
      if (destroyed) return;
      try {
        console.log('[BLE] connecting...');
        const d = await device.connect();
        await d.discoverAllServicesAndCharacteristics();
        console.log('[BLE] connected');
        reconnectingRef.current = false;
        onConnectRef.current(true);

        disconnectSub?.remove();
        disconnectSub = manager.onDeviceDisconnected(d.id, () => {
          if (destroyed) return;
          console.log('[BLE] disconnected');
          onConnectRef.current(false);
          if (!reconnectingRef.current) {
            reconnectingRef.current = true;
            setTimeout(startScan, RECONNECT_DELAY);
          }
        });

        // Subscribe to freeze notifications — firmware sends float confidence as ASCII
        d.monitorCharacteristicForService(
          SERVICE_UUID,
          FREEZE_CHAR_UUID,
          (_err, char) => {
            if (!char?.value) return;
            const text = atob(char.value);
            const confidence = parseFloat(text);
            if (!isNaN(confidence)) {
              console.log('[BLE] freeze event, confidence =', confidence);
              onFreezeRef.current(confidence);
            }
          }
        );
      } catch (err: any) {
        console.warn('[BLE] connect error:', err.message);
        if (!destroyed && !reconnectingRef.current) {
          reconnectingRef.current = true;
          setTimeout(startScan, RECONNECT_DELAY);
        }
      }
    }

    const stateSub = manager.onStateChange((state) => {
      if (state === 'PoweredOn') {
        stateSub.remove();
        startScan();
      }
    }, true);

    return () => {
      destroyed = true;
      stateSub.remove();
      disconnectSub?.remove();
      manager.stopDeviceScan();
      manager.destroy();
    };
  }, []);
}
