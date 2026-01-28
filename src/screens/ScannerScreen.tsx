// Main scanner screen with camera and barcode detection

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import {
  Header,
  SyncStatusBar,
  ScanFeedback,
  ScanCounter,
  HistoryList,
} from '../components';
import { useScanner } from '../hooks/useScanner';
import { useSync } from '../hooks/useSync';
import { StorageService } from '../services/storage';
import { KegScan } from '../types';
import { COLORS } from '../utils/config';

export const ScannerScreen: React.FC = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [showHistory, setShowHistory] = useState(false);
  const [historyScans, setHistoryScans] = useState<KegScan[]>([]);

  const {
    status,
    lastScan,
    scanCount,
    pendingCount: scannerPending,
    handleBarcodeScan,
  } = useScanner();

  const {
    isSyncing,
    pendingCount: syncPending,
    isOnline,
    syncNow,
  } = useSync();

  // Use the max of both pending counts
  const pendingCount = Math.max(scannerPending, syncPending);

  // Load history when modal opens
  const loadHistory = async () => {
    try {
      const pending = await StorageService.getPendingScans();
      const history = await StorageService.getScanHistory();
      setHistoryScans([...pending, ...history]);
    } catch (error) {
      console.log('Error loading history:', error);
      setHistoryScans([]);
    }
  };

  const handleHistoryPress = async () => {
    await loadHistory();
    setShowHistory(true);
  };

  const handleSyncPress = async () => {
    try {
      const result = await syncNow();
      if (!result.success && result.message) {
        Alert.alert('Sync Status', result.message);
      } else if (result.success && result.syncedCount > 0) {
        Alert.alert('Sync Complete', `Synced ${result.syncedCount} scan(s)`);
      }
    } catch (error) {
      Alert.alert('Sync Error', 'Failed to sync. Please try again.');
    }
  };

  // Handle barcode scanned
  const onBarcodeScanned = (result: BarcodeScanningResult) => {
    if (result.data) {
      handleBarcodeScan(result.data);
    }
  };

  // Permission not yet determined
  if (!permission) {
    return (
      <View style={styles.container}>
        <Header title="Keg Scanner" showHistory={false} />
        <View style={styles.centered}>
          <Text style={styles.message}>Loading...</Text>
        </View>
      </View>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Header title="Keg Scanner" showHistory={false} />
        <View style={styles.centered}>
          <Text style={styles.message}>Camera permission required</Text>
          <Text style={styles.submessage}>
            This app needs camera access to scan barcodes
          </Text>
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Keg Scanner" onHistoryPress={handleHistoryPress} />
      <SyncStatusBar
        isOnline={isOnline}
        pendingCount={pendingCount}
        isSyncing={isSyncing}
        onSyncPress={handleSyncPress}
      />

      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: [
              'qr',
              'ean13',
              'ean8',
              'code128',
              'code39',
              'code93',
              'codabar',
              'itf14',
              'upc_a',
              'upc_e',
              'pdf417',
            ],
          }}
          onBarcodeScanned={status === 'idle' ? onBarcodeScanned : undefined}
        >
          {/* Scanning overlay */}
          <View style={styles.overlay}>
            <View style={styles.scanArea}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>

          {/* Feedback overlay */}
          <View style={styles.feedbackContainer}>
            <ScanFeedback status={status} lastBatchCode={lastScan?.batchCode} />
          </View>
        </CameraView>
      </View>

      {/* Counter at bottom */}
      <View style={styles.counterContainer}>
        <ScanCounter todayCount={scanCount} pendingCount={pendingCount} />
      </View>

      {/* History Modal */}
      <Modal
        visible={showHistory}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <HistoryList
          scans={historyScans}
          onClose={() => setShowHistory(false)}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  message: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  submessage: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  buttonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  cameraContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanArea: {
    width: 280,
    height: 280,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: COLORS.primary,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  feedbackContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  counterContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
