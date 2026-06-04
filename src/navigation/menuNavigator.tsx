import { Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator } from '@react-navigation/drawer';
import React from 'react';
import HomeScreen from '../screens/HomeScreen';
import InfoAnimalScreen from '../screens/InfoAnimalScreen';
import AnimalsScreen from '../screens/AnimalsScreen';
import CustomDrawerContent from '../components/CustomDrawerContent';
import {COLORS} from '../constants/theme';

export type DrawerParamList = {
  Home: undefined;
  InfoAnimalScreen: { animalId: string | number }; 
  Animais: undefined;
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
          drawerItemStyle: { display: 'none' }, 
          headerShown: false, 
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
    </Drawer.Navigator>  
  );
};

export default DrawerNavigator;