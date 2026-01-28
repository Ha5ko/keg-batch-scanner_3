// Keg Batch Scanner - With Camera (No OCR)
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.title}>Keg Scanner</Text>
        <TouchableOpacity onPress={clearAll}>
          <Text style={styles.headerBtn}>{scannedCodes.length} scans</Text>
        </TouchableOpacity>
      </View>

      {/* Camera Button */}
      <TouchableOpacity
        style={styles.cameraBtn}
        onPress={() => setShowCamera(true)}
      >
        <Text style={styles.cameraBtnText}>OPEN CAMERA</Text>
      </TouchableOpacity>

      {/* Manual Entry */}
      <View style={styles.inputBox}>
        <Text style={styles.label}>Enter Batch Code:</Text>
        <TextInput
          style={styles.input}
          value={inputCode}
          onChangeText={setInputCode}
          placeholder="e.g. L5078MA 10:52"
          placeholderTextColor="#999"
          autoCapitalize="characters"
        />
        <TouchableOpacity style={styles.saveBtn} onPress={saveCode}>
          <Text style={styles.saveBtnText}>SAVE CODE</Text>
        </TouchableOpacity>
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

      {/* Camera Modal */}
      <Modal visible={showCamera} animationType="slide">
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Camera</Text>
            <TouchableOpacity onPress={() => setShowCamera(false)}>
              <Text style={styles.closeBtn}>Close</Text>
            </TouchableOpacity>
          </View>

          {permission?.granted ? (
            <CameraView style={styles.camera} facing="back">
              <View style={styles.overlay}>
                <View style={styles.frame} />
              </View>
            </CameraView>
          ) : (
            <View style={styles.noPermission}>
              <Text style={styles.noPermissionText}>Camera permission needed</Text>
              <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
                <Text style={styles.permBtnText}>Grant Permission</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.modalInput}>
            <TextInput
              style={styles.modalInputField}
              value={inputCode}
              onChangeText={setInputCode}
              placeholder="Type code here"
              placeholderTextColor="#999"
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.modalSaveBtn} onPress={() => {
              saveCode();
              setShowCamera(false);
            }}>
              <Text style={styles.modalSaveBtnText}>SAVE</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
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
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cameraBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  inputBox: {
    backgroundColor: '#FFF',
    marginHorizontal: 12,
    padding: 16,
    borderRadius: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  input: {
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 14,
    fontSize: 18,
    marginBottom: 12,
  },
  saveBtn: {
    backgroundColor: '#D00000',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 4,
  },
  list: { paddingHorizontal: 12, paddingBottom: 20 },
  item: {
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 8,
    marginBottom: 6,
  },
  code: { fontSize: 16, fontWeight: '500', fontFamily: 'monospace' },
  empty: { textAlign: 'center', color: '#999', marginTop: 20 },

  // Modal styles
  modalContainer: { flex: 1, backgroundColor: '#000' },
  modalHeader: {
    backgroundColor: '#D00000',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  closeBtn: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  camera: { flex: 1 },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: 280,
    height: 100,
    borderWidth: 3,
    borderColor: '#D00000',
    borderRadius: 8,
  },
  noPermission: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noPermissionText: { color: '#FFF', fontSize: 18, marginBottom: 20 },
  permBtn: { backgroundColor: '#D00000', padding: 16, borderRadius: 8 },
  permBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  modalInput: {
    backgroundColor: '#FFF',
    padding: 12,
    flexDirection: 'row',
  },
  modalInputField: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#D00000',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 8,
  },
  modalSaveBtn: {
    backgroundColor: '#D00000',
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderRadius: 8,
  },
  modalSaveBtnText: { color: '#FFF', fontWeight: 'bold' },
});
