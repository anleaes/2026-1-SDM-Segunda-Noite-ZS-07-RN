import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/header';
import Footer from '../components/footer';
import { COLORS} from '../constants/theme';

export default function AdminScreen({ navigation }: any) {

  const renderMenuButton = (iconName: keyof typeof Ionicons.glyphMap, label: string, onPress: () => void) => (
    <TouchableOpacity 
      style={styles.menuButton}
      onPress={onPress}
    >
      <View style={styles.buttonLeftContent}>
        <Ionicons name={iconName} size={24} color={COLORS.primary} />
        <Text style={styles.buttonText}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsHorizontalScrollIndicator={false}>
        <View style={{flex: 1}}>
        
            <Text style={styles.mainTitle}>Área de Gerenciamento</Text>

            <View style={styles.menuList}>
            
            {renderMenuButton("people-outline", "Gerenciar Usuários", () => {navigation.navigate("ConfUsers")})}

            {renderMenuButton("person-add-outline", "Cadastrar Funcionário", () => {navigation.navigate("CreateEmp")})}

            {renderMenuButton("person-add-outline", "Cadastrar Cliente", () => {navigation.navigate("CreateAdp")})}
            
            {renderMenuButton("paw-outline", "Adicionar Animal", () => {navigation.navigate("")})}
            
            {renderMenuButton("git-branch-outline", "Adicionar Raça", () => {navigation.navigate("")})}
            
            {renderMenuButton("medkit-outline", "Adicionar Vacina", () => {navigation.navigate("AddVaccine")})}
            
            {renderMenuButton("shield-checkmark-outline", "Verificação de Adotantes", () => {navigation.navigate("")})}

            </View>

        </View>

        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    height: '100%',
  },
  scrollContent: {
    flexGrow: 1,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'center', 
  },
  menuList: {
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  menuButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    elevation: 2,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonLeftContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
    marginLeft: 15,
  },
});