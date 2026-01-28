// Keg Batch Scanner - Manual Entry Only (Working Version)
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
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

function MainApp() {
  const [scannedCodes, setScannedCodes] = useState<string[]>([]);
  const [inputCode, setInputCode] = useState('');

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
  inputBox: {
    backgroundColor: '#FFF',
    margin: 12,
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
  saveBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 12,
    marginTop: 8,
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
