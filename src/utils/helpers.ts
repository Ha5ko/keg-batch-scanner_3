// Helper utility functions

/**
 * Generate a unique ID for scans
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Format timestamp for display
 */
export const formatTimestamp = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

/**
 * Format date for Google Sheets
 */
export const formatDateForSheets = (date: Date): string => {
  return date.toISOString();
};

/**
 * Check if a batch code looks valid
 * Adjust this regex based on your actual batch code format
 */
export const isValidBatchCode = (code: string): boolean => {
  // Accept alphanumeric codes of reasonable length
  const trimmed = code.trim();
  return trimmed.length >= 3 && trimmed.length <= 50;
};

/**
 * Clean and normalize a scanned batch code
 */
export const normalizeBatchCode = (code: string): string => {
  return code.trim().toUpperCase();
};

/**
 * Get time elapsed since a date in human-readable format
 */
export const getTimeAgo = (isoString: string): string => {
  const now = new Date();
  const past = new Date(isoString);
  const diffMs = now.getTime() - past.getTime();

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
};
