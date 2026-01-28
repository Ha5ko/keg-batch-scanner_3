// Minimal test app - absolute simplest version
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
  const [batchCode, setBatchCode] = useState('');
  const [scannedCodes, setScannedCodes] = useState<string[]>([]);

  useEffect(() => {
    // Load saved codes
    AsyncStorage.getItem('keg_codes')
      .then((data) => {
        if (data) setScannedCodes(JSON.parse(data));
      })
      .catch(() => {});
  }, []);

  const saveCode = async () => {
    const code = batchCode.trim().toUpperCase();
    if (!code) {
      Alert.alert('Error', 'Enter a batch code');
      return;
    }

    if (scannedCodes.includes(code)) {
      Alert.alert('Duplicate', 'Already scanned');
      return;
    }

    const updated = [code, ...scannedCodes];
    setScannedCodes(updated);
    setBatchCode('');

    try {
      await AsyncStorage.setItem('keg_codes', JSON.stringify(updated));
      Alert.alert('Saved', code);
    } catch (e) {
      Alert.alert('Error', 'Save failed');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.title}>Keg Scanner</Text>
        <Text style={styles.count}>{scannedCodes.length}</Text>
      </View>

      <View style={styles.inputBox}>
        <TextInput
          style={styles.input}
          value={batchCode}
          onChangeText={setBatchCode}
          placeholder="Enter batch code (L...)"
          placeholderTextColor="#999"
          autoCapitalize="characters"
        />
        <TouchableOpacity style={styles.btn} onPress={saveCode}>
          <Text style={styles.btnText}>SAVE</Text>
        </TouchableOpacity>
      </View>

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
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#D00000',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  count: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  inputBox: {
    backgroundColor: '#FFF',
    margin: 12,
    padding: 12,
    borderRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  btn: {
    backgroundColor: '#D00000',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  list: {
    padding: 12,
  },
  item: {
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 6,
    marginBottom: 8,
  },
  code: {
    fontSize: 16,
    fontWeight: '500',
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
  },
});
