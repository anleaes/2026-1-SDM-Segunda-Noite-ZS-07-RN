import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Footer from '../components/footer';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { Picker } from '@react-native-picker/picker';

export default function AddBreedScreen({ navigation }: any) {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);

    const [specie, setSpecie] = useState([]);
    const [specieId, setSpecieId] = useState('');
    const [name, setName] = useState('');

    useEffect(() => {
        fetch('http://127.0.0.1:8000/especies/', { // Ajuste a URL da sua API
            headers: { 'Authorization': `Token ${token}` }
        })
        .then(res => res.json())
        .then(data => setSpecie(data))
        .catch(err => console.error("Erro ao buscar espécies", err));
    }, []);

    const handleCadastrar = async () => {
        if (!name.trim() || !specieId) {
        Alert.alert('Atenção', 'Por favor, preencha todos os campos obrigatórios.');
        return;
        }

        setLoading(true);
        
        try {
        const response = await fetch('http://127.0.0.1:8000/racas/', {
            method: 'POST',
            headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
            name: name.trim(),
            specie: specieId,
            }),
        });

        const resData = await response.json();

        if (response.ok) {
            setName('');
            setSpecie([]);
            navigation.navigate('Admin')
        } else {
            Alert.alert('Erro ao cadastrar', resData.error || 'Verifique as informações fornecidas.');
        }
        } catch (error) {
        Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
        } finally {
        setLoading(false);
        }
    }

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
              <Text style={styles.headerTitle}>Adicionar Raça</Text>
            </TouchableOpacity>
          </View>
    
          <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.formCard}>
              
              <Text style={styles.sectionTitle}>Dados da Raça</Text>
              {renderInput('paw-outline', 'Nome da Raça', name, setName)}
              <View style={[styles.inputWrapper, { marginBottom: 20 }]}>
                <Picker
                    selectedValue={specieId}
                    onValueChange={(itemValue) => setSpecieId(itemValue)}
                    style={{ flex: 1 }}
                >
                    <Picker.Item label="Selecione uma espécie" value="" />
                    {specie.map((esp: any) => (
                    <Picker.Item key={esp.id} label={esp.name} value={esp.id} />
                    ))}
                </Picker>
              </View>
              <View style={styles.divider} />
              
              <TouchableOpacity style={styles.button} onPress={handleCadastrar} disabled={loading}>
                {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonText}>Cadastrar Raça</Text>}
              </TouchableOpacity>
    
            </View>
            <Footer />
          </ScrollView>
        </KeyboardAvoidingView>
      );
};

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