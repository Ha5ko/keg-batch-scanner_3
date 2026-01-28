// Keg Batch Scanner App with OCR for reading printed batch codes

import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Colors
const COLORS = {
  primary: '#D00000',
  background: '#F5F5F5',
  white: '#FFFFFF',
  text: '#333333',
  green: '#28A745',
  gray: '#666666',
};

// Extract batch code starting with L from OCR text
const extractBatchCode = (text: string): string | null => {
  // Split into lines and find one starting with L
  const lines = text.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    // Match lines starting with L followed by numbers/letters
    // Pattern: L followed by alphanumeric, spaces, colons
    if (/^L[0-9]/i.test(trimmed)) {
      // Clean up the batch code - remove the date line if present
      // Take only the first line that starts with L
      const cleaned = trimmed.split('\n')[0].trim();
      // Remove any trailing date patterns like "09/2025" etc
      return cleaned;
    }
  }

  // Also try to find L codes anywhere in text
  const match = text.match(/L[0-9][A-Z0-9\s:]+/i);
  if (match) {
    // Clean: take until we hit a date pattern or newline
    let code = match[0].trim();
    // Stop at common date patterns
    code = code.split(/\d{2}\/\d{4}/)[0].trim();
    return code;
  }

  return null;
};

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedCodes, setScannedCodes] = useState<string[]>([]);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const cameraRef = useRef<any>(null);

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

  const captureAndRecognize = async () => {
    if (!cameraRef.current || isProcessing) return;

    setIsProcessing(true);

    try {
      // Take photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      // Run OCR
      const result = await TextRecognition.recognize(photo.uri);

      // Extract batch code
      const batchCode = extractBatchCode(result.text);

      if (batchCode) {
        // Success - found a batch code
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (e) {}

        setLastScanned(batchCode);

        // Check for duplicate
        if (scannedCodes.includes(batchCode)) {
          Alert.alert('Duplicate', `${batchCode} was already scanned`);
        } else {
          const newCodes = [batchCode, ...scannedCodes];
          setScannedCodes(newCodes);
          await saveScans(newCodes);
          Alert.alert('Success!', `Scanned: ${batchCode}`);
        }
      } else {
        // No batch code found
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } catch (e) {}

        Alert.alert(
          'No Batch Code Found',
          'Could not find a code starting with "L". Please try again with better lighting or closer to the label.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.log('OCR Error:', error);
      Alert.alert('Error', 'Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Loading permission
  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <Text style={styles.headerText}>Keg Scanner</Text>
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
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
            This app needs camera permission to scan batch codes
          </Text>
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Allow Camera</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // History view
  if (showHistory) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <Text style={styles.headerText}>Scan History</Text>
          <TouchableOpacity onPress={() => setShowHistory(false)}>
            <Text style={styles.headerButton}>Close</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.historyList}>
          {scannedCodes.length === 0 ? (
            <Text style={styles.emptyText}>No scans yet</Text>
          ) : (
            scannedCodes.map((code, index) => (
              <View key={index} style={styles.historyItem}>
                <Text style={styles.historyCode}>{code}</Text>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Main camera view
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerText}>Keg Scanner</Text>
        <TouchableOpacity onPress={() => setShowHistory(true)}>
          <Text style={styles.headerButton}>{scannedCodes.length} scans</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cameraBox}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
        >
          <View style={styles.overlay}>
            <View style={styles.scanBox}>
              <Text style={styles.scanHint}>
                Position the batch code (starting with L) in this area
              </Text>
            </View>
          </View>
        </CameraView>
      </View>

      {/* Capture Button */}
      <View style={styles.bottomSection}>
        {lastScanned && (
          <View style={styles.lastScan}>
            <Text style={styles.lastScanLabel}>Last scanned:</Text>
            <Text style={styles.lastScanCode}>{lastScanned}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.captureButton, isProcessing && styles.captureButtonDisabled]}
          onPress={captureAndRecognize}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.captureButtonText}>SCAN</Text>
          )}
        </TouchableOpacity>
      </View>
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
  headerButton: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
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
    marginTop: 16,
    marginBottom: 10,
  },
  subText: {
    fontSize: 14,
    color: COLORS.gray,
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
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  scanBox: {
    width: 300,
    height: 150,
    borderWidth: 3,
    borderColor: COLORS.primary,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 10,
  },
  scanHint: {
    color: COLORS.white,
    fontSize: 12,
    textAlign: 'center',
  },
  bottomSection: {
    padding: 16,
    alignItems: 'center',
  },
  lastScan: {
    backgroundColor: COLORS.green,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
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
  captureButton: {
    backgroundColor: COLORS.primary,
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  captureButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  captureButtonText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  historyList: {
    flex: 1,
    padding: 16,
  },
  historyItem: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  historyCode: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    fontFamily: 'monospace',
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.gray,
    fontSize: 16,
    marginTop: 40,
  },
});
