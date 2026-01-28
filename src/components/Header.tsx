// App header component

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../utils/config';

interface HeaderProps {
  title: string;
  onHistoryPress?: () => void;
  showHistory?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onHistoryPress,
  showHistory = true,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>AB InBev</Text>
      </View>
      {showHistory && onHistoryPress && (
        <TouchableOpacity style={styles.historyButton} onPress={onHistoryPress}>
          <Text style={styles.historyButtonText}>History</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50, // Account for status bar
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.surface,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  historyButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  historyButtonText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: '600',
  },
});
