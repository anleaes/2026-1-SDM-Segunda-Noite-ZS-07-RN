import { Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator } from '@react-navigation/drawer';
import React from 'react';
import HomeScreen from '../screens/HomeScreen';
import AnimalsScreen from '../screens/AnimalsScreen';
import AdminScreen from '../screens/AdminScreen';
import CustomDrawerContent from '../components/CustomDrawerContent';
import {COLORS} from '../constants/theme';

export type DrawerParamList = {
  Home: undefined;
  Animais: undefined;
  Admin: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: COLORS.secondary,
        drawerLabelStyle: { marginLeft: 0, fontSize: 16 },
        drawerStyle: { backgroundColor: COLORS.background, width: 250 },
      }}>
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{
          drawerIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color}  />,
          title: 'Início',
        }}
      />
      <Drawer.Screen
        name="Animais"
        component={AnimalsScreen}
        options={{
          drawerIcon: ({ color, size }) => <Ionicons name="paw-outline" size={size} color={color}  />,
          title: 'Animais',
        }}
      />
      <Drawer.Screen
        name="Admin"
        component={AdminScreen}
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
    </Drawer.Navigator>  
  );
};

export default DrawerNavigator;