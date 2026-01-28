// Visual feedback component for scan results

import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { ScanStatus } from '../types';
import { COLORS } from '../utils/config';

interface ScanFeedbackProps {
  status: ScanStatus;
  lastBatchCode?: string;
}

const STATUS_CONFIG = {
  idle: {
    color: COLORS.textLight,
    text: 'Point camera at barcode',
    icon: '📷',
  },
  scanning: {
    color: COLORS.primary,
    text: 'Processing...',
    icon: '⏳',
  },
  success: {
    color: COLORS.success,
    text: 'Scan recorded!',
    icon: '✓',
  },
  error: {
    color: COLORS.error,
    text: 'Invalid barcode',
    icon: '✗',
  },
  duplicate: {
    color: COLORS.warning,
    text: 'Already scanned',
    icon: '⚠',
  },
};

export const ScanFeedback: React.FC<ScanFeedbackProps> = ({
  status,
  lastBatchCode,
}) => {
  const config = STATUS_CONFIG[status];

  return (
    <View style={[styles.container, { borderColor: config.color }]}>
      <Text style={[styles.icon, { color: config.color }]}>{config.icon}</Text>
      <Text style={[styles.statusText, { color: config.color }]}>
        {config.text}
      </Text>
      {status === 'success' && lastBatchCode && (
        <Text style={styles.batchCode} numberOfLines={1}>
          {lastBatchCode}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    borderWidth: 3,
    padding: 20,
    alignItems: 'center',
    minWidth: 200,
  },
  icon: {
    fontSize: 48,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  batchCode: {
    color: COLORS.surface,
    fontSize: 14,
    marginTop: 8,
    fontFamily: 'monospace',
  },
});
