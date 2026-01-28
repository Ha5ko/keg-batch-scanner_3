// API service for Google Sheets integration

import { KegScan, SyncResult } from '../types';
import { GOOGLE_SCRIPT_URL, USER_EMAIL } from '../utils/config';
import { StorageService } from './storage';

/**
 * API service for syncing scans to Google Sheets
 */
export const ApiService = {
  /**
   * Check if the API is configured
   */
  isConfigured(): boolean {
    return (
      GOOGLE_SCRIPT_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE' &&
      GOOGLE_SCRIPT_URL.length > 0
    );
  },

  /**
   * Send scans to Google Sheets
   */
  async syncScans(scans: KegScan[]): Promise<SyncResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        syncedCount: 0,
        failedCount: scans.length,
        message: 'API not configured. Please set GOOGLE_SCRIPT_URL in config.',
      };
    }

    if (scans.length === 0) {
      return {
        success: true,
        syncedCount: 0,
        failedCount: 0,
        message: 'No scans to sync',
      };
    }

    try {
      const payload = {
        action: 'addScans',
        email: USER_EMAIL,
        scans: scans.map((scan) => ({
          batchCode: scan.batchCode,
          timestamp: scan.timestamp,
          id: scan.id,
        })),
      };

      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        // Google Apps Script requires no-cors or the script must handle CORS
      });

      // For Google Apps Script, we might get a redirect
      // The script returns JSON on success
      if (response.ok) {
        const result = await response.json();

        if (result.success) {
          // Move synced scans to history
          await StorageService.addToHistory(scans);
          await StorageService.removeSyncedScans(scans.map((s) => s.id));
          await StorageService.setLastSyncTime(new Date().toISOString());

          return {
            success: true,
            syncedCount: scans.length,
            failedCount: 0,
            message: `Successfully synced ${scans.length} scan(s)`,
          };
        } else {
          return {
            success: false,
            syncedCount: 0,
            failedCount: scans.length,
            message: result.error || 'Unknown error from server',
          };
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Sync error:', error);
      return {
        success: false,
        syncedCount: 0,
        failedCount: scans.length,
        message: error instanceof Error ? error.message : 'Network error',
      };
    }
  },

  /**
   * Sync all pending scans
   */
  async syncAllPending(): Promise<SyncResult> {
    const pending = await StorageService.getPendingScans();
    return this.syncScans(pending);
  },

  /**
   * Test connection to Google Sheets
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        message: 'API not configured',
      };
    }

    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=ping`, {
        method: 'GET',
      });

      if (response.ok) {
        const result = await response.json();
        return {
          success: result.success === true,
          message: result.success ? 'Connected!' : 'Invalid response',
        };
      } else {
        return {
          success: false,
          message: `HTTP ${response.status}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  },
};
