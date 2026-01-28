// Keg Batch Scanner - With Camera via Image Picker
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
  Image,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

function MainApp() {
  const [scannedCodes, setScannedCodes] = useState<string[]>([]);
  const [inputCode, setInputCode] = useState('');
  const [lastPhoto, setLastPhoto] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('keg_codes')
      .then((data) => {
        if (data) setScannedCodes(JSON.parse(data));
      })
      .catch(() => {});
  }, []);

  const takePhoto = async () => {
    // Request camera permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'Camera permission is required to take photos');
      return;
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      setLastPhoto(result.assets[0].uri);
      // Photo captured - user can now type the code they see
      Alert.alert('Photo Captured', 'Now type the batch code you see in the photo');
    }
  };

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
    setLastPhoto(null);

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
          setLastPhoto(null);
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
      <TouchableOpacity style={styles.cameraBtn} onPress={takePhoto}>
        <Text style={styles.cameraBtnText}>TAKE PHOTO OF BATCH CODE</Text>
      </TouchableOpacity>

      {/* Last Photo Preview */}
      {lastPhoto && (
        <View style={styles.photoContainer}>
          <Image source={{ uri: lastPhoto }} style={styles.photoPreview} />
          <Text style={styles.photoHint}>Type the code you see above</Text>
        </View>
      )}

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
  photoContainer: {
    marginHorizontal: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  photoPreview: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    backgroundColor: '#000',
  },
  photoHint: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
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
});
