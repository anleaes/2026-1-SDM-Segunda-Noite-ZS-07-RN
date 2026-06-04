import { Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator } from '@react-navigation/drawer';
import React from 'react';
import HomeScreen from '../screens/HomeScreen';
import InfoAnimalScreen from '../screens/InfoAnimalScreen';
import CustomDrawerContent from '../components/CustomDrawerContent';
import {COLORS} from '../constants/theme';

export type DrawerParamList = {
  Home: undefined;
  InfoAnimalScreen: { animalId: string | number }; 
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
        name="InfoAnimalScreen"
        component={InfoAnimalScreen}
        options={{
          // Isso é a mágica: a tela existe na navegação, mas fica oculta no menu lateral
          drawerItemStyle: { display: 'none' }, 
          headerShown: false, 
        }}
      />
    </Drawer.Navigator>  
  );
};

export default DrawerNavigator;