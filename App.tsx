// Main App entry point

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ScannerScreen } from './src/screens/ScannerScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <ScannerScreen />
    </SafeAreaProvider>
  );
}
