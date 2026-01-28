// Status bar component showing connection and sync status

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../utils/config';
import { getTimeAgo } from '../utils/helpers';

interface StatusBarProps {
  isOnline: boolean;
  pendingCount: number;
  lastSyncTime: string | null;
  isSyncing: boolean;
  onSyncPress: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  isOnline,
  pendingCount,
  lastSyncTime,
  isSyncing,
  onSyncPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View
          style={[
            styles.indicator,
            { backgroundColor: isOnline ? COLORS.success : COLORS.error },
          ]}
        />
        <Text style={styles.statusText}>
          {isOnline ? 'Online' : 'Offline'}
        </Text>
      </View>

      <View style={styles.center}>
        {pendingCount > 0 && (
          <Text style={styles.pendingText}>
            {pendingCount} pending
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.syncButton,
          isSyncing && styles.syncButtonDisabled,
        ]}
        onPress={onSyncPress}
        disabled={isSyncing || pendingCount === 0}
      >
        <Text style={styles.syncButtonText}>
          {isSyncing ? 'Syncing...' : 'Sync'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: '500',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  pendingText: {
    color: COLORS.warning,
    fontSize: 14,
    fontWeight: '500',
  },
  syncButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  syncButtonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  syncButtonText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: '600',
  },
});
