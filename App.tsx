import 'react-native-gesture-handler'; // Essencial ficar na primeira linha!
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import MenuNavigator from './src/navigation/menuNavigator';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

function RootNavigator() {
  const { isAuthenticated } = useAuth();
  const [screen, setScreen] = useState<'login' | 'register'>('login');

  useEffect(() => {
    if (!isAuthenticated) setScreen('login');
  }, [isAuthenticated]);

  if (isAuthenticated) {
    return (
      <NavigationContainer>
        <MenuNavigator />
      </NavigationContainer>
    );
  }

  if (screen === 'register') {
    return <RegisterScreen onBack={() => setScreen('login')} />;
  }

  return <LoginScreen onRegister={() => setScreen('register')} />;
}

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}