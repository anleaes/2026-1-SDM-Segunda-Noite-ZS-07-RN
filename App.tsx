import 'react-native-gesture-handler'; // Essencial ficar na primeira linha!
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import MenuNavigator from './src/navigation/menuNavigator';

export default function App() {
  return (
    <NavigationContainer>
      <MenuNavigator />
    </NavigationContainer>
  );
}