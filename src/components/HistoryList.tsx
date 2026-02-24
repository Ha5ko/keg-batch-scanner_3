// Scan history list component

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { KegScan } from '../types';
import { COLORS } from '../utils/config';
import { formatTimestamp } from '../utils/helpers';

interface HistoryListProps {
  scans: KegScan[];
  onClose: () => void;
}

const ScanItem: React.FC<{ scan: KegScan }> = ({ scan }) => (
  <View style={styles.item}>
    <View style={styles.itemLeft}>
      <Text style={styles.batchCode}>{scan.batchCode}</Text>
      <Text style={styles.timestamp}>{formatTimestamp(scan.timestamp)}</Text>
    </View>
    <View
      style={[
        styles.syncIndicator,
        { backgroundColor: scan.synced ? COLORS.success : COLORS.warning },
      ]}
    />
  </View>
);

export const HistoryList: React.FC<HistoryListProps> = ({ scans, onClose }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan History</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>

      {scans.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No scans yet</Text>
          <Text style={styles.emptySubtext}>
            Start scanning to see history here
          </Text>
        </View>
      ) : (
        <FlatList
          data={scans}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ScanItem scan={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.surface,
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  closeButtonText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  itemLeft: {
    flex: 1,
  },
  batchCode: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    fontFamily: 'monospace',
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
  syncIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 12,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
});
