// Keg Batch Scanner - Camera assist with manual entry
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';

function MainApp() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedCodes, setScannedCodes] = useState<string[]>([]);
  const [inputCode, setInputCode] = useState('');
  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('keg_codes')
      .then((data) => {
        if (data) setScannedCodes(JSON.parse(data));
      })
      .catch(() => {});
  }, []);

  const saveCode = async () => {
    const code = inputCode.trim().toUpperCase();
    if (!code) {
      Alert.alert('Error', 'Enter a batch code');
      return;
    }

    if (scannedCodes.includes(code)) {
      Alert.alert('Duplicate', `${code} already scanned`);
      return;
    }

    const updated = [code, ...scannedCodes];
    setScannedCodes(updated);
    setInputCode('');

    try {
      await AsyncStorage.setItem('keg_codes', JSON.stringify(updated));
      Alert.alert('Saved!', code);
    } catch {
      Alert.alert('Error', 'Save failed');
    }
  };

  const clearAll = () => {
    Alert.alert('Clear All', 'Delete all scanned codes?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          setScannedCodes([]);
          await AsyncStorage.removeItem('keg_codes');
        },
      },
    ]);
  };

  // Camera modal for visual assistance
  const renderCameraModal = () => (
    <Modal visible={showCamera} animationType="slide">
      <SafeAreaView style={styles.cameraModal} edges={['top', 'bottom']}>
        <View style={styles.cameraHeader}>
          <Text style={styles.cameraTitle}>View Batch Code</Text>
          <TouchableOpacity onPress={() => setShowCamera(false)}>
            <Text style={styles.closeBtn}>Done</Text>
          </TouchableOpacity>
        </View>

        {permission?.granted ? (
          <View style={styles.cameraContainer}>
            <CameraView style={styles.camera} facing="back">
              <View style={styles.overlay}>
                <View style={styles.frame}>
                  <Text style={styles.frameText}>Position batch code here</Text>
                </View>
              </View>
            </CameraView>

            {/* Input at bottom of camera */}
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.cameraInputContainer}
            >
              <Text style={styles.cameraInputLabel}>Type the code you see:</Text>
              <View style={styles.cameraInputRow}>
                <TextInput
                  style={styles.cameraInput}
                  value={inputCode}
                  onChangeText={setInputCode}
                  placeholder="L5078MA 10:52"
                  placeholderTextColor="#999"
                  autoCapitalize="characters"
                  autoFocus
                />
                <TouchableOpacity style={styles.cameraSaveBtn} onPress={() => {
                  saveCode();
                }}>
                  <Text style={styles.cameraSaveBtnText}>SAVE</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
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
        <TouchableOpacity onPress={clearAll}>
          <Text style={styles.headerBtn}>{scannedCodes.length} scans</Text>
        </TouchableOpacity>
      </View>

      {/* Open Camera Button */}
      <TouchableOpacity style={styles.cameraBtn} onPress={() => setShowCamera(true)}>
        <Text style={styles.cameraBtnText}>📷  OPEN CAMERA</Text>
        <Text style={styles.cameraBtnSub}>Use camera to view & enter code</Text>
      </TouchableOpacity>

      {/* Manual Entry */}
      <View style={styles.manualBox}>
        <Text style={styles.manualLabel}>Or enter directly:</Text>
        <View style={styles.manualRow}>
          <TextInput
            style={styles.input}
            value={inputCode}
            onChangeText={setInputCode}
            placeholder="L5078MA 10:52"
            placeholderTextColor="#999"
            autoCapitalize="characters"
          />
          <TouchableOpacity style={styles.addBtn} onPress={saveCode}>
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

      {renderCameraModal()}
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
  headerBtn: { color: '#FFF', fontSize: 16 },

  cameraBtn: {
    backgroundColor: '#D00000',
    margin: 12,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  cameraBtnText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  cameraBtnSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },

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
  list: { paddingHorizontal: 12, paddingBottom: 20 },
  item: {
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 6,
    marginBottom: 6,
  },
  code: { fontSize: 16, fontWeight: '500', fontFamily: 'monospace' },
  empty: { textAlign: 'center', color: '#999', marginTop: 20 },

  // Camera Modal
  cameraModal: { flex: 1, backgroundColor: '#000' },
  cameraHeader: {
    backgroundColor: '#D00000',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cameraTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  closeBtn: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  cameraContainer: { flex: 1 },
  camera: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: 300,
    height: 100,
    borderWidth: 3,
    borderColor: '#D00000',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  frameText: { color: '#FFF', fontSize: 14 },

  cameraInputContainer: {
    backgroundColor: '#FFF',
    padding: 16,
  },
  cameraInputLabel: { fontSize: 14, color: '#666', marginBottom: 8 },
  cameraInputRow: { flexDirection: 'row' },
  cameraInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#D00000',
    borderRadius: 6,
    padding: 14,
    fontSize: 18,
    marginRight: 8,
  },
  cameraSaveBtn: {
    backgroundColor: '#D00000',
    paddingHorizontal: 24,
    justifyContent: 'center',
    borderRadius: 6,
  },
  cameraSaveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },

  noPermission: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noPermissionText: { color: '#FFF', fontSize: 18, marginBottom: 20 },
  permissionBtn: { backgroundColor: '#D00000', padding: 16, borderRadius: 8 },
  permissionBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
