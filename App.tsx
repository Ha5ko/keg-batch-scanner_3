// Keg Batch Scanner - OCR for printed batch codes
import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Extract batch code starting with L from OCR text
const extractBatchCode = (text: string): string | null => {
  const lines = text.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^L[0-9]/i.test(trimmed)) {
      return trimmed;
    }
  }
  const match = text.match(/L[0-9][A-Z0-9\s:]+/i);
  if (match) {
    return match[0].trim();
  }
  return null;
};

function MainApp() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedCodes, setScannedCodes] = useState<string[]>([]);
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    AsyncStorage.getItem('keg_codes')
      .then((data) => {
        if (data) setScannedCodes(JSON.parse(data));
      })
      .catch(() => {});
  }, []);

  const saveCode = async (code: string, fromOCR = false) => {
    const cleaned = code.trim().toUpperCase();
    if (!cleaned) {
      Alert.alert('Error', 'Enter a batch code');
      return false;
    }

    if (scannedCodes.includes(cleaned)) {
      Alert.alert('Duplicate', `${cleaned} already scanned`);
      return false;
    }

    const updated = [cleaned, ...scannedCodes];
    setScannedCodes(updated);
    setLastScanned(cleaned);
    if (!fromOCR) setManualCode('');

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    try {
      await AsyncStorage.setItem('keg_codes', JSON.stringify(updated));
      Alert.alert('Saved!', cleaned);
      return true;
    } catch {
      Alert.alert('Error', 'Save failed');
      return false;
    }
  };

  const captureAndScan = async () => {
    if (!cameraRef.current || isProcessing) return;
    setIsProcessing(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      const result = await TextRecognition.recognize(photo.uri);
      const batchCode = extractBatchCode(result.text);

      if (batchCode) {
        await saveCode(batchCode, true);
      } else {
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } catch {}
        Alert.alert(
          'Not Found',
          'No batch code starting with "L" detected. Try better lighting or closer position.'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to scan. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Camera scanner modal
  const renderScanner = () => (
    <Modal visible={isScanning} animationType="slide">
      <SafeAreaView style={styles.scannerContainer} edges={['top']}>
        <View style={styles.scannerHeader}>
          <Text style={styles.scannerTitle}>Scan Batch Code</Text>
          <TouchableOpacity onPress={() => setIsScanning(false)}>
            <Text style={styles.closeBtn}>Close</Text>
          </TouchableOpacity>
        </View>

        {permission?.granted ? (
          <View style={styles.cameraContainer}>
            <CameraView ref={cameraRef} style={styles.camera} facing="back">
              <View style={styles.overlay}>
                <View style={styles.scanFrame}>
                  <Text style={styles.scanHint}>
                    Position batch code (L...) here
                  </Text>
                </View>
              </View>
            </CameraView>

            <TouchableOpacity
              style={[styles.captureBtn, isProcessing && styles.captureBtnDisabled]}
              onPress={captureAndScan}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.captureBtnText}>SCAN</Text>
              )}
            </TouchableOpacity>

            {lastScanned && (
              <View style={styles.lastScannedBox}>
                <Text style={styles.lastScannedLabel}>Last: </Text>
                <Text style={styles.lastScannedCode}>{lastScanned}</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.noPermission}>
            <Text style={styles.noPermissionText}>Camera permission needed</Text>
            <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
              <Text style={styles.permissionBtnText}>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.title}>Keg Scanner</Text>
        <Text style={styles.count}>{scannedCodes.length}</Text>
      </View>

      {/* Scan Button */}
      <TouchableOpacity style={styles.scanBtn} onPress={() => setIsScanning(true)}>
        <Text style={styles.scanBtnText}>OPEN CAMERA SCANNER</Text>
      </TouchableOpacity>

      {/* Manual Entry */}
      <View style={styles.manualBox}>
        <Text style={styles.manualLabel}>Or enter manually:</Text>
        <View style={styles.manualRow}>
          <TextInput
            style={styles.input}
            value={manualCode}
            onChangeText={setManualCode}
            placeholder="L5078MA 10:52"
            placeholderTextColor="#999"
            autoCapitalize="characters"
          />
          <TouchableOpacity style={styles.addBtn} onPress={() => saveCode(manualCode)}>
            <Text style={styles.addBtnText}>ADD</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* History */}
      <Text style={styles.historyTitle}>Scanned Codes</Text>
      <FlatList
        data={scannedCodes}
        keyExtractor={(item, i) => `${item}-${i}`}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No codes yet</Text>}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.code}>{item}</Text>
          </View>
        )}
      />

      {renderScanner()}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <MainApp />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    backgroundColor: '#D00000',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  count: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  scanBtn: {
    backgroundColor: '#D00000',
    margin: 12,
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
  },
  scanBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  manualBox: {
    backgroundColor: '#FFF',
    marginHorizontal: 12,
    padding: 12,
    borderRadius: 8,
  },
  manualLabel: { fontSize: 14, color: '#666', marginBottom: 8 },
  manualRow: { flexDirection: 'row' },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    marginRight: 8,
  },
  addBtn: {
    backgroundColor: '#D00000',
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderRadius: 6,
  },
  addBtnText: { color: '#FFF', fontWeight: 'bold' },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    margin: 12,
    marginBottom: 4,
  },
  list: { paddingHorizontal: 12 },
  item: {
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 6,
    marginBottom: 6,
  },
  code: { fontSize: 16, fontWeight: '500', fontFamily: 'monospace' },
  empty: { textAlign: 'center', color: '#999', marginTop: 20 },

  // Scanner Modal
  scannerContainer: { flex: 1, backgroundColor: '#000' },
  scannerHeader: {
    backgroundColor: '#D00000',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scannerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  closeBtn: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  cameraContainer: { flex: 1 },
  camera: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  scanFrame: {
    width: 300,
    height: 120,
    borderWidth: 3,
    borderColor: '#D00000',
    borderRadius: 8,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 8,
  },
  scanHint: { color: '#FFF', fontSize: 12 },
  captureBtn: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#D00000',
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureBtnDisabled: { backgroundColor: '#666' },
  captureBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  lastScannedBox: {
    position: 'absolute',
    bottom: 160,
    alignSelf: 'center',
    backgroundColor: '#28A745',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flexDirection: 'row',
  },
  lastScannedLabel: { color: '#FFF', fontSize: 14 },
  lastScannedCode: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  noPermission: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noPermissionText: { color: '#FFF', fontSize: 18, marginBottom: 20 },
  permissionBtn: { backgroundColor: '#D00000', padding: 16, borderRadius: 8 },
  permissionBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
