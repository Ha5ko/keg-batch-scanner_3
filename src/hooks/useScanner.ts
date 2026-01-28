// Custom hook for barcode scanning logic

import { useState, useCallback, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { KegScan, ScanStatus } from '../types';
import { StorageService } from '../services/storage';
import { ApiService } from '../services/api';
import { generateId, normalizeBatchCode, isValidBatchCode } from '../utils/helpers';
import { APP_CONFIG } from '../utils/config';

interface UseScannerReturn {
  status: ScanStatus;
  lastScan: KegScan | null;
  scanCount: number;
  pendingCount: number;
  handleBarcodeScan: (data: string) => Promise<void>;
  resetStatus: () => void;
}

export const useScanner = (): UseScannerReturn => {
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [lastScan, setLastScan] = useState<KegScan | null>(null);
  const [scanCount, setScanCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  // Track recent scans to prevent duplicates
  const recentScans = useRef<Map<string, number>>(new Map());

  // Load pending count on mount
  const loadPendingCount = useCallback(async () => {
    const pending = await StorageService.getPendingScans();
    setPendingCount(pending.length);
  }, []);

  // Check if this is a duplicate scan (within prevention window)
  const isDuplicateScan = useCallback((batchCode: string): boolean => {
    const now = Date.now();
    const lastScanTime = recentScans.current.get(batchCode);

    if (lastScanTime && now - lastScanTime < APP_CONFIG.DUPLICATE_PREVENTION_WINDOW) {
      return true;
    }

    // Clean up old entries
    for (const [code, time] of recentScans.current.entries()) {
      if (now - time > APP_CONFIG.DUPLICATE_PREVENTION_WINDOW) {
        recentScans.current.delete(code);
      }
    }

    return false;
  }, []);

  // Handle a successful barcode scan
  const handleBarcodeScan = useCallback(
    async (rawData: string) => {
      // Don't process if already scanning
      if (status === 'scanning') return;

      setStatus('scanning');

      try {
        const batchCode = normalizeBatchCode(rawData);

        // Validate the batch code
        if (!isValidBatchCode(batchCode)) {
          setStatus('error');
          setTimeout(() => setStatus('idle'), 1500);
          return;
        }

        // Check for duplicate
        if (isDuplicateScan(batchCode)) {
          setStatus('duplicate');
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          setTimeout(() => setStatus('idle'), 1000);
          return;
        }

        // Record this scan time
        recentScans.current.set(batchCode, Date.now());

        // Create the scan record
        const scan: KegScan = {
          id: generateId(),
          batchCode,
          timestamp: new Date().toISOString(),
          synced: false,
        };

        // Save to local storage
        await StorageService.addPendingScan(scan);

        // Update state
        setLastScan(scan);
        setScanCount((prev) => prev + 1);
        setPendingCount((prev) => prev + 1);
        setStatus('success');

        // Haptic feedback
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Try to sync immediately if online
        if (ApiService.isConfigured()) {
          // Fire and forget - don't wait for sync
          ApiService.syncScans([scan]).then((result) => {
            if (result.success) {
              setPendingCount((prev) => Math.max(0, prev - result.syncedCount));
            }
          });
        }

        // Reset status after brief delay
        setTimeout(() => setStatus('idle'), 800);
      } catch (error) {
        console.error('Scan error:', error);
        setStatus('error');
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setTimeout(() => setStatus('idle'), 1500);
      }
    },
    [status, isDuplicateScan]
  );

  const resetStatus = useCallback(() => {
    setStatus('idle');
  }, []);

  return {
    status,
    lastScan,
    scanCount,
    pendingCount,
    handleBarcodeScan,
    resetStatus,
  };
};
