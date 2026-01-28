// Local storage service using AsyncStorage

import AsyncStorage from '@react-native-async-storage/async-storage';
import { KegScan } from '../types';
import { STORAGE_KEYS } from '../utils/config';

/**
 * Storage service for managing local scan data
 */
export const StorageService = {
  /**
   * Get all pending (unsynced) scans
   */
  async getPendingScans(): Promise<KegScan[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_SCANS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting pending scans:', error);
      return [];
    }
  },

  /**
   * Save a new scan to pending queue
   */
  async addPendingScan(scan: KegScan): Promise<void> {
    try {
      const existing = await this.getPendingScans();
      existing.push(scan);
      await AsyncStorage.setItem(
        STORAGE_KEYS.PENDING_SCANS,
        JSON.stringify(existing)
      );
    } catch (error) {
      console.error('Error adding pending scan:', error);
      throw error;
    }
  },

  /**
   * Remove synced scans from pending queue
   */
  async removeSyncedScans(scanIds: string[]): Promise<void> {
    try {
      const existing = await this.getPendingScans();
      const remaining = existing.filter((scan) => !scanIds.includes(scan.id));
      await AsyncStorage.setItem(
        STORAGE_KEYS.PENDING_SCANS,
        JSON.stringify(remaining)
      );
    } catch (error) {
      console.error('Error removing synced scans:', error);
      throw error;
    }
  },

  /**
   * Get scan history (already synced scans for display)
   */
  async getScanHistory(): Promise<KegScan[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SCAN_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting scan history:', error);
      return [];
    }
  },

  /**
   * Add scans to history (after successful sync)
   */
  async addToHistory(scans: KegScan[]): Promise<void> {
    try {
      const existing = await this.getScanHistory();
      const updated = [...scans.map((s) => ({ ...s, synced: true })), ...existing];
      // Keep only last 500 scans in history
      const trimmed = updated.slice(0, 500);
      await AsyncStorage.setItem(
        STORAGE_KEYS.SCAN_HISTORY,
        JSON.stringify(trimmed)
      );
    } catch (error) {
      console.error('Error adding to history:', error);
      throw error;
    }
  },

  /**
   * Get last sync timestamp
   */
  async getLastSyncTime(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    } catch (error) {
      console.error('Error getting last sync time:', error);
      return null;
    }
  },

  /**
   * Update last sync timestamp
   */
  async setLastSyncTime(timestamp: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp);
    } catch (error) {
      console.error('Error setting last sync time:', error);
    }
  },

  /**
   * Clear all stored data (for debugging/reset)
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.PENDING_SCANS,
        STORAGE_KEYS.SCAN_HISTORY,
        STORAGE_KEYS.LAST_SYNC,
        STORAGE_KEYS.SETTINGS,
      ]);
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  },
};
