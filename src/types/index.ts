// Core data types for the Keg Batch Scanner app

export interface KegScan {
  id: string;
  batchCode: string;
  timestamp: string;
  synced: boolean;
  location?: string;
}

export interface ScanSession {
  id: string;
  startTime: string;
  endTime?: string;
  scans: KegScan[];
  totalScans: number;
  syncedScans: number;
}

export interface AppConfig {
  googleSheetUrl: string;
  userEmail: string;
  offlineMode: boolean;
}

export interface SyncResult {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  message: string;
}

export type ScanStatus = 'idle' | 'scanning' | 'success' | 'error' | 'duplicate';
