import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Footer from '../components/footer';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
//import VaccinationSection, { VacinaItemState } from '../components/VaccinationSection';

export default function AddAnimalScreen({ navigation }: any) {
  const { token, employeeId } = useAuth();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [breedId, setBreedId] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [sex, setSex] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [sterilized, setSterilized] = useState(false);
  const [adopted, setAdopted] = useState(false);
  const [selectedCharacteristics, setselectedCharacteristics] = useState<number[]>([]);
  const [photo, setPhoto] = useState('');

  const [specie, setSpecie] = useState([]);
  const [specieId, setSpecieId] = useState('');
  const [breedFiltered, setBreedFiltered] = useState([]);
  
  const [characteristics, setCharacteristics] = useState([]);

  const [vaccineList, setVaccineList] = useState([]);
  const [vaccinated, setVaccinated] = useState(false);
  const [weightAt, setWeightAt] = useState('');
  const [loggedEmployeeId, setLoggedEmployeeId] = useState<number | null>(null);
//   const [vaccinesApplied, setVaccinesApplied] = useState<VaccineItemState[]>([
//         { id: Date.now(), vaccineId: '', dosage: '' }
//         ]);
  
  const toggleCharacteristic = (id: number) => {
    if (selectedCharacteristics.includes(id)) {
        setselectedCharacteristics(selectedCharacteristics.filter(item => item !== id));
    } else {
        setselectedCharacteristics([...selectedCharacteristics, id]);
    }
  };

  useEffect(() => {
    fetch('http://127.0.0.1:8000/especies/', { headers: { 'Authorization': `Token ${token}` }
        })
        .then(res => res.json())
        .then(data => setSpecie(data))
        .catch(err => console.error("Erro ao buscar espécies", err));

    fetch('http://127.0.0.1:8000/caracteristicas/', { headers: { 'Authorization': `Token ${token}` } })
        .then(res => res.json())
        .then(data => setCharacteristics(data))
        .catch(err => console.error("Erro ao buscar características", err));
    
    fetch('http://127.0.0.1:8000/vacinas/', { headers: { 'Authorization': `Token ${token}` } })
        .then(res => res.json())
        .then(data => setVaccineList(data))
        .catch(err => console.error("Erro ao buscar vacinas", err)); 
  }, []);

  useEffect(() => {
    if (!specieId) {
    setBreedFiltered([]);
    return;
    }
    fetch(`http://127.0.0.1:8000/racas/?specie=${specieId}`, { headers: { 'Authorization': `Token ${token}` } })
        .then(res => res.json())
        .then(data => setBreedFiltered(data))
        .catch(err => console.error("Erro ao buscar raças filtradas", err));
  }, [specieId]);

  useEffect(() => {
    const getLoggedEmployee = async () => {
        try {
        const idSalvo = await AsyncStorage.getItem('employeeId');
        if (idSalvo !== null) {
            setLoggedEmployeeId(parseInt(idSalvo));
        }
        } catch (error) {
        console.error("Erro ao ler o ID do funcionário", error);
        }
    };

    getLoggedEmployee();
    }, []);

  const handleCadastrar = async () => {
    if (!name.trim() || !breedId || !sex.trim() || !size.trim()
        || !color.trim() || !birthDate.trim() || !characteristics || !sterilized) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!loggedEmployeeId) {
        alert('Erro de autenticação: Funcionário logado não identificado. Tente refazer o login.');
        return;
    }

    const dataDeHoje = new Date().toISOString().split('T')[0];

    setLoading(true);

    try {
      const responseAnimal = await fetch('http://127.0.0.1:8000/animais/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          breed: breedId,
          sex: sex.trim(),
          size: size.trim(),
          color: color.trim(),
          birth_date: birthDate,
          characteristics: characteristics,
          sterilized: sterilized,
          photo: 'https://example.com/photo.jpg',
          listed_at: dataDeHoje,
          adopted: adopted,
        }),
      });

      const resData = await responseAnimal.json();

      if (responseAnimal.ok) {
        setName('');
        setSpecie([]);
        setBreedId('');
        setSex('');
        setSize('');
        setColor('');
        setBirthDate('');
        setCharacteristics([]);
        setSterilized(false);
        setPhoto('');
        navigation.navigate('Admin')
      } else {
        Alert.alert('Erro ao cadastrar', resData.error || 'Verifique as informações fornecidas.');
      }

      const newAnimal = await responseAnimal.json();
      const newAnimalId = newAnimal.id;

      if (vaccinated) {
        const vaccinationPayload = {
            vaccinatedAt: dataDeHoje,
            weight_at: weightAt ? parseFloat(weightAt) : null,
            animal: newAnimalId, // ID que o banco acabou de retornar do animal
            employee: loggedEmployeeId,   // ID do context que corrigimos no primeiro passo
        };
        
        const responseVaccination = await fetch('http://127.0.0.1:8000/vacinacoes/', {
            method: 'POST',
            headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'},
            body: JSON.stringify(vaccinationPayload),
        });

        if (!responseVaccination.ok) {
            alert('Animal cadastrado, , mas falhou ao criar o registro de vacinação.');
            navigation.navigate('Admin');
            return;
        }
        
        const newVaccination = await responseVaccination.json();
        const newVaccinationId = newVaccination.id;

        const dataValidade = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];

        // for (const vacina of vaccinesApplied) {
        //     const vaccineItemPayload = {
        //     expiration_date: dataValidade,
        //     dosage: vacina.dosage.trim(),
        //     vaccination: newVaccinationId, // Vincula todas as vacinas ao mesmo cabeçalho
        //     vaccines: vacina.vaccineId        // ID real da vacina vindo do Picker
        //     };

        const responseItem = await fetch('http://127.0.0.1:8000/itens-vacina/', {
            method: 'POST',
            headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' },
            //body: JSON.stringify({vaccineItemPayload}),
        });

        if (!responseItem.ok) {
            alert('Animal e evento de vacinação criados, mas houve um erro ao vincular a vacina específica.');
        }

        }
        // Sucesso Total
        alert('Cadastro realizado com sucesso!');
        navigation.navigate('Admin');

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
          <Text style={styles.headerTitle}>Novo Animal</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          
          <Text style={styles.sectionTitle}>Espécie</Text>
          <View style={styles.inputWrapper}>
                <Ionicons name="list-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
                <Picker
                    selectedValue={specieId}
                    onValueChange={(itemValue) => setSpecieId(itemValue)}
                    style={[styles.pickerWrapper, styles.input, 
                        { color: specieId === "" ? COLORS.grey : COLORS.textDark },
                        { flex: 1 }]}
                >   {specieId === "" && <Picker.Item label="Selecione uma espécie" value="" color="COLORS.grey" />}
                    {specie.map((esp: any) => (
                    <Picker.Item key={esp.id} label={esp.name} value={esp.id} color={COLORS.textDark}/>
                    ))}
                </Picker>
          </View>

          <Text style={styles.sectionTitle}>Raça</Text>
          <View style={styles.inputWrapper}>
                <Ionicons name="list-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
                <Picker
                    selectedValue={breedId}
                    onValueChange={(itemValue) => setBreedId(itemValue)}
                    style={[styles.pickerWrapper, styles.input, 
                        { color: specieId === "" ? COLORS.grey : COLORS.textDark },
                        { flex: 1 }]}
                    enabled={specieId !== ''}
                >   
                    {specieId === "" ? (
                    <Picker.Item label="Escolha uma espécie primeiro..." value="" />
                    ) : ( 
                    <Picker.Item label="Selecione uma raça" value="" color="COLORS.grey" />)}
                    {breedFiltered.map((breed: any) => (
                    <Picker.Item key={breed.id} label={breed.name} value={breed.id} color={COLORS.textDark}/>
                    ))}
                </Picker>
          </View>
          <View style={styles.divider} />

          {renderInput('paw-outline', 'Nome', name, setName)}
          {renderInput('calendar-number-outline', 'Data de Nascimento', birthDate, setBirthDate, false, 'numeric')}
          {renderInput('color-palette-outline', 'Cor', color, setColor)}

                    
          <Text style={styles.pickerText}>
            <Ionicons name="male-female-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
            Sexo</Text>
            <View style={styles.chipsContainer}>
            {['M', 'F'].map((opcao) => (
                <TouchableOpacity
                key={opcao}
                style={[styles.chip, sex === opcao && styles.chipSelected]}
                onPress={() => setSex(opcao)}
                >
                <Text style={[styles.chipText, sex === opcao && styles.chipTextSelected]}>
                    {opcao === 'M' ? 'Macho (M)' : 'Fêmea (F)'}
                </Text>
                </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.pickerText}>
            <Ionicons name="resize-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
            Porte</Text>
            <View style={styles.chipsContainer}>
            {['P', 'M', 'G'].map((opcao) => (
                <TouchableOpacity
                key={opcao}
                style={[styles.chip, size === opcao && styles.chipSelected]}
                onPress={() => setSize(opcao)}
                >
                <Text style={[styles.chipText, size === opcao && styles.chipTextSelected]}>
                    {opcao === 'P' ? 'Pequeno (P)' : opcao === 'M' ? 'Médio (M)' : 'Grande (G)'}
                </Text>
                </TouchableOpacity>
            ))}
          </View>

          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Características</Text>
          <View style={styles.chipsContainer}>
            {characteristics.map((item: any) => {
                const isSelected = selectedCharacteristics.includes(item.id);
                return (
                <TouchableOpacity
                    key={item.id}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => toggleCharacteristic(item.id)}
                >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {item.name}
                    </Text>
                </TouchableOpacity>
                );
            })}
          </View>
          <View style={styles.divider} />        

          <View style={styles.switchWrapper}>
            <Text style={styles.switchLabel}>
            <Ionicons name="heart-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />   
            Castrado?</Text>
            <Switch
              value={sterilized}
              onValueChange={setSterilized}
              trackColor={{ false: COLORS.grey, true: COLORS.secondary }}
              thumbColor={sterilized ? COLORS.primary : COLORS.background}
            />
          </View>

          <View style={styles.switchWrapper}>
            <Text style={styles.switchLabel}>
            <Ionicons name="medkit-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />   
            Vacinado?</Text>
            <Switch
               value={vaccinated}
               onValueChange={(value) => setVaccinated(value)}
               trackColor={{ false: COLORS.grey, true: COLORS.secondary }}
               thumbColor={vaccinated ? COLORS.primary : COLORS.background}
            />
          </View>
          {vaccinated && (
            <> console.log("Exibir seção de vacinação")
            </>
            // <VaccinationSection
            //     vaccinesApplied={vaccinesApplied}
            //     setVaccinesApplied={setVaccinesApplied}
            //     weightAt={weightAt}
            //     setWeightAt={setWeightAt}
            //     listaVacinas={vaccineList}
            //     renderInput={renderInput}
            //     COLORS={COLORS}
            //     stylesPai={styles}
            // />
            )}

          <TouchableOpacity style={styles.button} onPress={handleCadastrar} disabled={loading}>
            {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonText}>Cadastrar Animal</Text>}
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
chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 10,
},
chip: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.grey,
},
chipSelected: {
    backgroundColor: COLORS.primary, // Cor laranja do seu tema
    borderColor: COLORS.primary,
},
chipText: {
    color: COLORS.dark,
    fontSize: 14,
},
chipTextSelected: {
    color: COLORS.white,
    fontWeight: 'bold',
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