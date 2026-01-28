// Simplified App entry point for debugging

import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple color constants
const COLORS = {
  primary: '#D00000',
  background: '#F5F5F5',
  white: '#FFFFFF',
  text: '#333333',
  green: '#28A745',
};

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedCodes, setScannedCodes] = useState<string[]>([]);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load saved scans on mount
  useEffect(() => {
    loadScans();
  }, []);

  const loadScans = async () => {
    try {
      const saved = await AsyncStorage.getItem('scanned_codes');
      if (saved) {
        setScannedCodes(JSON.parse(saved));
      }
    } catch (e) {
      console.log('Error loading scans');
    }
  };

  const saveScans = async (codes: string[]) => {
    try {
      await AsyncStorage.setItem('scanned_codes', JSON.stringify(codes));
    } catch (e) {
      console.log('Error saving scans');
    }
  };

  const handleBarcodeScan = async (data: string) => {
    if (isProcessing) return;
    if (data === lastScanned) return;

    setIsProcessing(true);
    setLastScanned(data);

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      // Haptics might not be available
    }

    const newCodes = [data, ...scannedCodes].slice(0, 100);
    setScannedCodes(newCodes);
    await saveScans(newCodes);

    Alert.alert('Scanned!', data);

    setTimeout(() => {
      setIsProcessing(false);
    }, 2000);
  };

  // Loading state
  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <Text style={styles.headerText}>Keg Scanner</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.messageText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Permission not granted
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <Text style={styles.headerText}>Keg Scanner</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.messageText}>Camera access needed</Text>
          <Text style={styles.subText}>
            This app needs camera permission to scan barcodes
          </Text>
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Allow Camera</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Main scanner view
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerText}>Keg Scanner</Text>
        <Text style={styles.countText}>{scannedCodes.length} scans</Text>
      </View>

      <View style={styles.cameraBox}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'code39'],
          }}
          onBarcodeScanned={isProcessing ? undefined : (result) => {
            if (result.data) {
              handleBarcodeScan(result.data);
            }
          }}
        />
        <View style={styles.overlay}>
          <View style={styles.scanBox} />
        </View>
      </View>

      {lastScanned && (
        <View style={styles.lastScan}>
          <Text style={styles.lastScanLabel}>Last scanned:</Text>
          <Text style={styles.lastScanCode}>{lastScanned}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 16,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  countText: {
    color: COLORS.white,
    fontSize: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  messageText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 10,
  },
  subText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  cameraBox: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanBox: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: COLORS.primary,
    borderRadius: 12,
  },
  lastScan: {
    backgroundColor: COLORS.green,
    padding: 16,
    margin: 16,
    marginTop: 0,
    borderRadius: 8,
  },
  lastScanLabel: {
    color: COLORS.white,
    fontSize: 12,
  },
  lastScanCode: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
