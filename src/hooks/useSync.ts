// Custom hook for sync functionality

import { useState, useCallback, useEffect } from 'react';
import { SyncResult } from '../types';
import { ApiService } from '../services/api';
import { StorageService } from '../services/storage';
import { APP_CONFIG } from '../utils/config';

interface UseSyncReturn {
  isSyncing: boolean;
  pendingCount: number;
  isOnline: boolean;
  syncNow: () => Promise<SyncResult>;
  refreshPendingCount: () => Promise<void>;
}

export const useSync = (): UseSyncReturn => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  // Refresh pending scan count
  const refreshPendingCount = useCallback(async () => {
    try {
      const pending = await StorageService.getPendingScans();
      setPendingCount(pending.length);
    } catch (error) {
      console.log('Error refreshing pending count:', error);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    refreshPendingCount();
  }, [refreshPendingCount]);

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
      const result = await ApiService.syncAllPending();

      // Update online status based on result
      setIsOnline(result.success || result.message !== 'Network error');

      await refreshPendingCount();
      return result;
    } catch (error) {
      setIsOnline(false);
      return {
        success: false,
        syncedCount: 0,
        failedCount: pendingCount,
        message: error instanceof Error ? error.message : 'Sync failed',
      };
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, pendingCount, refreshPendingCount]);

  // Auto-sync periodically
  useEffect(() => {
    const autoSync = async () => {
      if (pendingCount > 0 && !isSyncing) {
        const result = await syncNow();
        setIsOnline(result.success || result.message !== 'Network error');
      }
    };

    const interval = setInterval(autoSync, APP_CONFIG.AUTO_SYNC_INTERVAL);
    return () => clearInterval(interval);
  }, [pendingCount, isSyncing, syncNow]);

  return {
    isSyncing,
    pendingCount,
    isOnline,
    syncNow,
    refreshPendingCount,
  };
};
