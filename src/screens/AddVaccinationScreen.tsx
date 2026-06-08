import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Footer from '../components/footer';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react'
import VaccinationSection, { VaccineItemState } from '../components/VaccinationSection';

export default function AddVaccinationScreen({ navigation }: { navigation: any }) {
  const { token, employeeId } = useAuth();
  
  // Estados locais da nova tela
  const [selectedAnimalId, setSelectedAnimalId] = useState('');
  const [listaAnimais, setListaAnimais] = useState([]);
  const [listaVacinas, setListaVacinas] = useState([]);
  const [weightAt, setWeightAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [vaccinesApplied, setVaccinesApplied] = useState<VaccineItemState[]>([
    { id: Date.now(), vaccineId: '', dosage: '' }
  ]);
  const loggedEmployeeId = employeeId ? employeeId : 81; // Supondo que o ID do funcionário logado esteja disponível no contexto de autenticação
  
  useFocusEffect(
    useCallback(() => {
        setSelectedAnimalId('');
        setWeightAt('');
    }, [])
  );

  const VaccinationRenderInput = (icon: keyof typeof Ionicons.glyphMap, placeholder: string, value: string, onChangeText: (t: string) => void, isPassword = false, keyboardType: any = 'default') => (
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

  // Carrega animais e vacinas disponíveis
  useEffect(() => {
    fetch('http://127.0.0.1:8000/animais/', { headers: { 'Authorization': `Token ${token}` } })
      .then(res => res.json()).then(data => setListaAnimais(data));

    fetch('http://127.0.0.1:8000/vacinas/', { headers: { 'Authorization': `Token ${token}` } })
      .then(res => res.json()).then(data => setListaVacinas(data));
  }, []);

  const handleSalvarVacinaIsolada = async () => {
    if (!selectedAnimalId) {
      alert('Selecione um animal.');
      return;
    }

    const dataDeHoje = new Date().toISOString().split('T')[0];

    try {
      setLoading(true);
      
      // PASSO 1: Salva o cabeçalho Vaccination apontando para o animal escolhido
      const responseVaccination = await fetch('http://127.0.0.1:8000/vacinacoes/', {
        method: 'POST',
        headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vaccinatedAt: dataDeHoje,
          weight_at: weightAt ? parseFloat(weightAt) : null,
          animal: selectedAnimalId,
          employee: loggedEmployeeId,
        }),
      });

      const newVaccination = await responseVaccination.json();
      
      // PASSO 2: Loop para salvar os VaccineItems
      for (const vacina of vaccinesApplied) {
        await fetch('http://127.0.0.1:8000/itens-vacina/', {
          method: 'POST',
          headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            expiration_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            dosage: vacina.dosage.trim(),
            vaccination: newVaccination.id,
            vaccines: vacina.vaccineId
          }),
        });
      }

      alert('Vacinação registrada com sucesso!');
      navigation.goBack();
    } catch (error) {
      alert('Erro ao salvar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.customHeader}>
        <TouchableOpacity style={styles.headerLeft} onPress={() => navigation.navigate('Admin')}>
            <Ionicons name="arrow-back" size={26} color={COLORS.white} />
            <Text style={styles.headerTitle}>Adicionar Vacinação</Text>
        </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.formCard}>

            <Text style={styles.sectionTitle}>Animal</Text>
            <View style={styles.inputWrapper}>
                <Ionicons name="paw-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
                <Picker
                    selectedValue={selectedAnimalId}
                    onValueChange={(itemValue) => setSelectedAnimalId(itemValue)}
                    style={[styles.pickerWrapper, styles.input, 
                        { color: selectedAnimalId === "" ? COLORS.grey : COLORS.textDark },
                        { flex: 1 }]}
                >   {selectedAnimalId === "" && 
                    <Picker.Item label="Selecione um animal" value="" color="COLORS.grey" />}
                    {listaAnimais.map((ani: any) => (
                    <Picker.Item key={ani.id} label={`${ani.name} (${ani.breed})`} 
                                 value={ani.id} color={COLORS.textDark}/>  
                    ))}
                </Picker>
            </View>
        </View>

        <View style={styles.vaccinationCard}>
            <VaccinationSection
                vaccinesApplied={vaccinesApplied}
                setVaccinesApplied={setVaccinesApplied}
                weightAt={weightAt}
                setWeightAt={setWeightAt}
                vaccineList={listaVacinas}
                renderInput={VaccinationRenderInput as any} // Passe seu renderInput padrão aqui
                COLORS={{ textDark: '#333' }}
                stylesPai={{ label: {fontWeight: '600'}, inputWrapper: {borderWidth: 1, borderColor: '#ccc', borderRadius: 8, height: 50, marginBottom: 15}, pickerText: {} }}
            />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSalvarVacinaIsolada} disabled={loading}>
          {loading ? <ActivityIndicator color={COLORS.white} /> : 
          <Text style={styles.buttonText}>Salvar Registro</Text>}
        </TouchableOpacity>
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
    //flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginHorizontal: 15,
    marginVertical: 20,
    marginBottom: 0,
    padding: 20,
    elevation: 3,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4
},
vaccinationCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginHorizontal: 15,
    marginVertical: 20,
    marginBottom: 0,
    paddingHorizontal: 10,
    paddingVertical: 0,
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
pickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 0,
    paddingHorizontal: 0,
    height: 40,
    marginTop: 0,
  },
  pickerText: {
    color: COLORS.grey,
  },
});