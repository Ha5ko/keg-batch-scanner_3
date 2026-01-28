// Scan counter display component

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../utils/config';

interface ScanCounterProps {
  todayCount: number;
  pendingCount: number;
}

export const ScanCounter: React.FC<ScanCounterProps> = ({
  todayCount,
  pendingCount,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.stat}>
        <Text style={styles.number}>{todayCount}</Text>
        <Text style={styles.label}>Scanned</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.stat}>
        <Text style={[styles.number, pendingCount > 0 && styles.pendingNumber]}>
          {pendingCount}
        </Text>
        <Text style={styles.label}>Pending</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stat: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  number: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.text,
  },
  pendingNumber: {
    color: COLORS.warning,
  },
  label: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 50,
    backgroundColor: COLORS.border,
  },
});
