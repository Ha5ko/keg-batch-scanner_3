// Custom hook for sync functionality

import { useState, useCallback, useEffect } from 'react';
import * as Network from 'expo-network';
import { SyncResult } from '../types';
import { ApiService } from '../services/api';
import { StorageService } from '../services/storage';
import { APP_CONFIG } from '../utils/config';

interface UseSyncReturn {
  isSyncing: boolean;
  lastSyncTime: string | null;
  pendingCount: number;
  isOnline: boolean;
  syncNow: () => Promise<SyncResult>;
  refreshPendingCount: () => Promise<void>;
}

export const useSync = (): UseSyncReturn => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  // Check network status
  const checkNetwork = useCallback(async () => {
    try {
      const networkState = await Network.getNetworkStateAsync();
      setIsOnline(networkState.isConnected ?? false);
    } catch {
      setIsOnline(true); // Assume online if check fails
    }
  }, []);

  // Refresh pending scan count
  const refreshPendingCount = useCallback(async () => {
    const pending = await StorageService.getPendingScans();
    setPendingCount(pending.length);
  }, []);

  // Load initial data
  useEffect(() => {
    const init = async () => {
      await checkNetwork();
      await refreshPendingCount();
      const lastSync = await StorageService.getLastSyncTime();
      setLastSyncTime(lastSync);
    };
    init();

    // Set up periodic network check
    const networkInterval = setInterval(checkNetwork, 30000);

    return () => clearInterval(networkInterval);
  }, [checkNetwork, refreshPendingCount]);

  // Sync pending scans
  const syncNow = useCallback(async (): Promise<SyncResult> => {
    if (isSyncing) {
      return {
        success: false,
        syncedCount: 0,
        failedCount: 0,
        message: 'Sync already in progress',
      };
    }

    setIsSyncing(true);

    try {
      await checkNetwork();

      if (!isOnline) {
        return {
          success: false,
          syncedCount: 0,
          failedCount: pendingCount,
          message: 'No network connection',
        };
      }

      const result = await ApiService.syncAllPending();

      if (result.success) {
        setLastSyncTime(new Date().toISOString());
      }

      await refreshPendingCount();

      return result;
    } catch (error) {
      return {
        success: false,
        syncedCount: 0,
        failedCount: pendingCount,
        message: error instanceof Error ? error.message : 'Sync failed',
      };
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, isOnline, pendingCount, checkNetwork, refreshPendingCount]);

  // Auto-sync periodically
  useEffect(() => {
    const autoSync = async () => {
      if (pendingCount > 0 && isOnline && !isSyncing) {
        await syncNow();
      }
    };

    const interval = setInterval(autoSync, APP_CONFIG.AUTO_SYNC_INTERVAL);
    return () => clearInterval(interval);
  }, [pendingCount, isOnline, isSyncing, syncNow]);

  return {
    isSyncing,
    lastSyncTime,
    pendingCount,
    isOnline,
    syncNow,
    refreshPendingCount,
  };
};
