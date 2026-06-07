import { Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator } from '@react-navigation/drawer';
import React from 'react';
import HomeScreen from '../screens/HomeScreen';
import InfoAnimalScreen from '../screens/InfoAnimalScreen';
import AnimalsScreen from '../screens/AnimalsScreen';
import AdminScreen from '../screens/AdminScreen';
import ConfUsersScreen from '../screens/ConfUsersScreen';
import CreateEmployeeScreen from '../screens/CreateEmployeeScreen';
import CreateAdopterScreen from '../screens/CreateAdopterScreen';
import AdoptionFormScreen from '../screens/AdoptionFormScreen';
import AddVaccineScreen from '../screens/AddVaccineScreen';
import AddBreedScreen from '../screens/AddBreedScreen';
import AddAnimalScreen from '../screens/AddAnimalScreen';
import CustomDrawerContent from '../components/CustomDrawerContent';
import {COLORS} from '../constants/theme';

export type DrawerParamList = {
  Home: undefined;
  InfoAnimalScreen: { animalId: string | number }; 
  Animais: undefined;
  ConfUsers: undefined;
  CreateEmp: undefined;
  CreateAdp: undefined;
  Admin: undefined;
  AdoptionForm: { animalId?: string | number; animalName?: string };
  AddVaccine: undefined;
  AddBreed: undefined;
  AddAnimal: undefined;
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
      <Drawer.Screen
        name="Admin"
        component={AdminScreen}
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="ConfUsers"
        component={ConfUsersScreen}
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="CreateEmp"
        component={CreateEmployeeScreen}
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="CreateAdp"
        component={CreateAdopterScreen}
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="AdoptionForm"
        component={AdoptionFormScreen}
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="AddVaccine"
        component={AddVaccineScreen}
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="AddBreed"
        component={AddBreedScreen}
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="AddAnimal"
        component={AddAnimalScreen}
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
    </Drawer.Navigator>  
  );
};

export default DrawerNavigator;