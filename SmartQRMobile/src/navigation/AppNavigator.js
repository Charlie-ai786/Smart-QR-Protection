import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ScannerScreen from '../screens/ScannerScreen';
import ProcessingScreen from '../screens/ProcessingScreen';
import ResultScreen from '../screens/ResultScreen';
import HistoryScreen from '../screens/HistoryScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator 
      initialRouteName="Scanner"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#020617' }
      }}
    >
      <Stack.Screen name="Scanner" component={ScannerScreen} />
      <Stack.Screen name="Processing" component={ProcessingScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
    </Stack.Navigator>
  );
}
