import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Footer from '../components/footer';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

export default function CriarClienteScreen({ navigation }: any) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [cpf, setCpf] = useState('');
  const [address, setAddress] = useState('');
  const [yardSecurity, setYardSecurity] = useState(false);
  const [addressComprove, setAddressComprove] = useState(false);
  const [checkedData, setCheckedData] = useState(false);

  const handleCadastrar = async () => {
    if (!username.trim() || !password || !firstName.trim() || !lastName.trim() || !cpf.trim() || !address.trim()) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/adotantes/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password: password,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          cpf: cpf.trim(),
          address: address.trim(),
          yard_security: yardSecurity,
          addressComprove: addressComprove,
          checkedData: checkedData,
        }),
      });

      const resData = await response.json();

      if (response.ok) {
        navigation.navigate('Admin')
      } else {
        Alert.alert('Erro ao cadastrar', resData.error || 'Verifique as informações fornecidas.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (icon: keyof typeof Ionicons.glyphMap, placeholder: string, value: string, onChangeText: (t: string) => void, isPassword = false, keyboardType: any = 'default') => (
    <View style={styles.inputWrapper}>
      <Ionicons name={icon} size={20} color={COLORS.textLight} style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.grey}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={isPassword}
        keyboardType={keyboardType}
        autoCapitalize={isPassword || keyboardType === 'email-address' ? 'none' : 'sentences'}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.customHeader}>
        <TouchableOpacity style={styles.headerLeft} onPress={() => navigation.navigate('Admin')}>
          <Ionicons name="arrow-back" size={26} color={COLORS.white} />
          <Text style={styles.headerTitle}>Novo Cliente (Adotante)</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          
          <Text style={styles.sectionTitle}>Dados da Conta de Acesso</Text>
          {renderInput('person-outline', 'Usuário (Username)', username, setUsername)}
          {renderInput('mail-outline', 'E-mail', email, setEmail, false, 'email-address')}
          {renderInput('lock-closed-outline', 'Senha inicial', password, setPassword, true)}

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Informações Pessoais</Text>
          {renderInput('id-card-outline', 'Nome', firstName, setFirstName)}
          {renderInput('id-card-outline', 'Sobrenome', lastName, setLastName)}
          {renderInput('document-text-outline', 'CPF (apenas números)', cpf, setCpf, false, 'numeric')}

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Dados de Moradia</Text>
          {renderInput('home-outline', 'Endereço Completo', address, setAddress)}

          <Text style={styles.sectionTitle}>Status de Verificação Inicial</Text>
          
          <View style={styles.switchWrapper}>
            <Text style={styles.switchLabel}>Jardim/Moradia Seguro?</Text>
            <Switch
              value={yardSecurity}
              onValueChange={setYardSecurity}
              trackColor={{ false: COLORS.grey, true: COLORS.secondary }}
              thumbColor={yardSecurity ? COLORS.primary : COLORS.background}
            />
          </View>

          <View style={styles.switchWrapper}>
            <Text style={styles.switchLabel}>Endereço Comprovado?</Text>
            <Switch
              value={addressComprove}
              onValueChange={setAddressComprove}
              trackColor={{ false: COLORS.grey, true: COLORS.secondary }}
              thumbColor={addressComprove ? COLORS.primary : COLORS.background}
            />
          </View>

          <View style={styles.switchWrapper}>
            <Text style={styles.switchLabel}>Dados Gerais Verificados?</Text>
            <Switch
              value={checkedData}
              onValueChange={setCheckedData}
              trackColor={{ false: COLORS.grey, true: COLORS.secondary }}
              thumbColor={checkedData ? COLORS.primary : COLORS.background}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleCadastrar} disabled={loading}>
            {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonText}>Cadastrar Cliente</Text>}
          </TouchableOpacity>

        </View>
        <Footer />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor:
    COLORS.background
},
customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 15,
    elevation: 4
},
headerLeft: {
    flexDirection: 'row',
    alignItems: 'center'
},
headerTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 15
},
content: {
    flex: 1
},
scrollContent: {
    flexGrow: 1
},
formCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginHorizontal: 15,
    marginVertical: 20,
    padding: 20,
    elevation: 3,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4
},
sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold', 
    color: COLORS.primary, 
    marginBottom: 12 
},
inputWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: COLORS.grey, 
    borderRadius: 8, 
    paddingHorizontal: 12, 
    marginBottom: 14, 
    backgroundColor: COLORS.background 
},
inputIcon: { 
    marginRight: 8 
},
input: { 
    flex: 1, 
    height: 44, 
    color: COLORS.textDark, 
    fontSize: 14 
},
divider: { 
    height: 1, 
    backgroundColor: '#F0F0F0', 
    marginVertical: 15 
},
switchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    marginBottom: 8,
  },
  switchLabel: {
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: '500',
  },
button: { 
    backgroundColor: COLORS.primary, 
    borderRadius: 8, 
    height: 48, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 15 
},
buttonText: { 
    color: COLORS.white, 
    fontSize: 16, 
    fontWeight: 'bold' 
},
});