import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import {COLORS} from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Octicons from '@expo/vector-icons/Octicons';
import { useAuth } from '../context/AuthContext';

const CustomDrawerContent = (props: any) => {
  const { logout, isAdmin } = useAuth();
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, paddingBottom: 120 }}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={20} color={COLORS.primary} />
        </View>
        <Text style={styles.name}>Olá, Usuário!</Text>
      </View>
      <View style={{ flex: 1, paddingTop: 10 }}>
        <DrawerItemList {...props} />
      </View>

      {isAdmin && (
        <View style={styles.managementWrap} pointerEvents="box-none">
          <TouchableOpacity onPress={() => props.navigation.navigate('Admin')}>
            <Octicons name="gear" size={25} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.logoutWrap} pointerEvents="box-none">
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    borderRadius: 10,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 40,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: COLORS.white,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  },
  logoutWrap: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  managementWrap: {
    position: 'absolute',
    left: 16,
    bottom: 20,
  },
  logoutButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  logoutText: {
    color: COLORS.white,
    fontWeight: '600',
  },
});

export default CustomDrawerContent;
