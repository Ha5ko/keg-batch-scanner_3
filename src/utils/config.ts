// Configuration constants for the Keg Batch Scanner app

// IMPORTANT: Replace this URL with your deployed Google Apps Script Web App URL
// See SETUP.md for instructions on how to deploy the Google Apps Script
export const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';

// User configuration
export const USER_EMAIL = 'shantu.hasko@ab-inbev.com';

// App settings
export const APP_CONFIG = {
  // Maximum scans to store offline before forcing sync
  MAX_OFFLINE_SCANS: 1000,

  // Auto-sync interval in milliseconds (5 minutes)
  AUTO_SYNC_INTERVAL: 5 * 60 * 1000,

  // Duplicate scan prevention window in milliseconds (5 seconds)
  DUPLICATE_PREVENTION_WINDOW: 5000,

  // Vibration duration for successful scan (milliseconds)
  HAPTIC_DURATION: 100,
};

// Storage keys for AsyncStorage
export const STORAGE_KEYS = {
  PENDING_SCANS: '@keg_scanner/pending_scans',
  SCAN_HISTORY: '@keg_scanner/scan_history',
  SETTINGS: '@keg_scanner/settings',
  LAST_SYNC: '@keg_scanner/last_sync',
};

// Color palette (AB InBev brand-inspired)
export const COLORS = {
  primary: '#D00000',      // AB InBev Red
  primaryDark: '#A00000',
  secondary: '#1A1A1A',
  success: '#28A745',
  warning: '#FFC107',
  error: '#DC3545',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textLight: '#666666',
  border: '#E0E0E0',
};
