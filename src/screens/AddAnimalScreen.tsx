import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Footer from '../components/footer';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import VaccinationSection, { VaccineItemState } from '../components/VaccinationSection';

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
  const [selectedCharacteristics, setselectedCharacteristics] = useState<string[]>([]);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const [specie, setSpecie] = useState([]);
  const [specieId, setSpecieId] = useState('');
  const [breedFiltered, setBreedFiltered] = useState([]);
  
  const [characteristics, setCharacteristics] = useState([]);

  const [vaccineList, setVaccineList] = useState([]);
  const [vaccinated, setVaccinated] = useState(false);
  const [weightAt, setWeightAt] = useState('');
  const loggedEmployeeId = employeeId ? employeeId : 81;
  const [vaccinesApplied, setVaccinesApplied] = useState<VaccineItemState[]>([
        { id: Date.now(), vaccineId: '', dosage: '' }
        ]);
  
  const toggleCharacteristic = (name: string) => {
    if (selectedCharacteristics.includes(name)) {
        setselectedCharacteristics(selectedCharacteristics.filter(item => item !== name));
    } else {
        setselectedCharacteristics([...selectedCharacteristics, name]);
    }
  };
  
  const converterDataParaDjango = (dataBR: string) => {
    if (dataBR.includes('/')) {
      const [dia, mes, ano] = dataBR.split('/');
      return `${ano}-${mes}-${dia}`;
    }
    return dataBR;
  };

  useFocusEffect(
    useCallback(() => {
        setName('');
        setSpecieId('');
        setBreedId('');
        setBirthDate('');
        setSex('');
        setSize('');
        setColor('');
        setSterilized(false);
        setAdopted(false);
        setselectedCharacteristics([]);
        setVaccinated(false);
        setPhotoUri(null);
    }, [])
  );

  const pickImage = async () => {
  // Solicita permissão para acessar a galeria
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
  if (permissionResult.granted === false) {
    alert("Você precisa permitir o acesso à galeria para enviar uma foto!");
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true, 
        aspect: [4, 3],
        quality: 0.8,
    });

    if (!result.canceled) {
        setPhotoUri(result.assets[0].uri); 
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

  const handleCadastrar = async () => {
    if (!name.trim() || !breedId || !sex.trim() || !size.trim()
        || !color.trim() || !birthDate.trim() || !characteristics || !photoUri) {
      console.log("Campos obrigatórios faltando:", { name, breedId, sex, size, 
        color, birthDate, characteristics, sterilized, photoUri });
      Alert.alert('Atenção', 'Por favor, preencha todos os campos obrigatórios.');
      setLoading(false);
      return;
    }

    const dataDeHoje = new Date().toISOString().split('T')[0];

    const formData = new FormData();

    formData.append('name', name.trim());
    formData.append('birth_date', converterDataParaDjango(birthDate.trim()));
    formData.append('sex', sex);
    formData.append('size', size);
    formData.append('color', color.trim());
    formData.append('sterilized', sterilized ? '1' : '0'); // FormData só aceita strings ou arquivos
    formData.append('listedAt', dataDeHoje);
    formData.append('breed', String(breedId));

    selectedCharacteristics.forEach(name => {
        formData.append('characteristic', String(name));
    });

    if (photoUri) {
        const filename = photoUri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        // 1. Checa se o app está rodando em ambiente Web (Navegador)
        if (photoUri.startsWith('data:') || photoUri.startsWith('blob:') || typeof window !== 'undefined') {
            try {
                // 1. Força a descoberta ou criação de um nome de arquivo válido com extensão
                let filename = photoUri.split('/').pop() || 'photo.jpg';
                
                // Garante que o nome do arquivo termina com alguma extensão padrão caso venha limpo
                if (!filename.includes('.')) {
                filename = `${filename}.jpg`;
                }

                const responseEspelho = await fetch(photoUri);
                const blobArquivo = await responseEspelho.blob();
                
                // 2. CRUCIAL: Passe o 'filename' como o terceiro parâmetro aqui!
                // formData.append(campo, arquivo, nome_do_arquivo_com_extensao)
                formData.append('photo', blobArquivo, filename); 
                
                console.log("Foto anexada com sucesso no formato Web com nome:", filename);
            } catch (errBlob) {
                console.error("Erro ao gerar o blob da imagem na web:", errBlob);
            }
            } else {
                // 2. Se for celular nativo (iOS/Android), mantém a estrutura anterior
                formData.append('photo', {
                uri: photoUri,
                name: filename,
                type: type,
                } as any);
                console.log("Foto anexada com sucesso no formato Mobile!");
            }
    }

    try {
      setLoading(true);
    
      const responseAnimal = await fetch('http://127.0.0.1:8000/animais/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
        },
        body: formData,
      });

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
        setPhotoUri(null);
        console.log("Sucesso no cadastro:");
      } else {
        const errData = await responseAnimal.json();
        console.log("============== ERRO DO DJANGO ==============");
        console.log(errData);
        console.log("============================================");
        alert(`Erro: ${JSON.stringify(errData)}`);
        Alert.alert('Erro ao cadastrar', errData.error || 'Verifique as informações fornecidas.');
      }

      console.log("pegando dados do animal");
      const newAnimal = await responseAnimal.json();
      const newAnimalId = newAnimal.id;
      console.log(" Animal cadastrado com sucesso! ID:", newAnimalId);

      if (vaccinated) {
        console.log("💉 [ENTROU] Código identificou isVaccinated = true. Iniciando cabeçalho...");
        const vaccinationPayload = {
            vaccinatedAt: dataDeHoje,
            weight_at: weightAt ? parseFloat(weightAt) : null,
            animal: newAnimalId, 
            employee: loggedEmployeeId, 
        };
        console.log("Enviando payload de Vaccination:", vaccinationPayload);
        const responseVaccination = await fetch('http://127.0.0.1:8000/vacinacoes/', {
            method: 'POST',
            headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(vaccinationPayload),
        });
        console.log("Status da resposta da Vaccination:", responseVaccination.status);

        if (!responseVaccination.ok) {
            const errVac = await responseVaccination.text();
            console.log('Animal cadastrado, mas falhou ao criar o registro de vacinação.');
            console.log("❌ Erro no cabeçalho Vaccination:", errVac);
            return;
        }
        
        const newVaccination = await responseVaccination.json();
        const newVaccinationId = newVaccination.id;
        console.log(" Cabeçalho de vacinação criado! ID:", newVaccinationId);
        console.log("🔄 Iniciando loop para gravar os itens de vacina...");

        const dataValidade = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];

        for (const vacina of vaccinesApplied) {
            const vaccineItemPayload = {
            expiration_date: converterDataParaDjango(dataValidade), 
            dosage: vacina.dosage.trim(),
            vaccination: newVaccinationId, 
            vaccines: vacina.vaccineId  
            };

            const responseItem = await fetch('http://127.0.0.1:8000/itens-vacina/', {
                method: 'POST',
                headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(vaccineItemPayload),
            });

        if (responseItem.ok) {
          console.log(` Item de vacina (ID: ${vacina.vaccineId}) salvo com sucesso!`);
        } else {
          const errItem = await responseItem.text();
          console.log(`❌ Erro ao salvar o item da vacina ID ${vacina.vaccineId}:`, errItem);
        }

        }
        // Sucesso Total
        console.log("🏁 Cadastro realizado com sucesso!");
        alert('Cadastro realizado com sucesso!');
        navigation.navigate('Admin');
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

          <Text style={styles.sectionTitle}>Informações Básicas</Text>        
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
                const nomeItem = item.name;
                const isSelected = selectedCharacteristics.includes(nomeItem);
                return (
                <TouchableOpacity
                    key={item.id}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => toggleCharacteristic(nomeItem)}
                >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {nomeItem}
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
            <VaccinationSection
                vaccinesApplied={vaccinesApplied}
                setVaccinesApplied={setVaccinesApplied}
                weightAt={weightAt}
                setWeightAt={setWeightAt}
                vaccineList={vaccineList}
                renderInput={renderInput as any}
                COLORS={COLORS}
                stylesPai={styles}
            />
            )}
          <View style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Foto do Animal</Text>
          <View style={{ alignItems: 'center', margin: 10}}>
            {photoUri ? (
                // Se já escolheu a foto, mostra a prévia dela
                <TouchableOpacity onPress={pickImage}>
                <Image source={{ uri: photoUri }} style={{ width: 150, height: 150, borderRadius: 75, marginBottom: 10 }} />
                <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Alterar Foto</Text>
                </TouchableOpacity>
            ) : (
                // Se não escolheu, mostra um botão cinza padrão
                <TouchableOpacity 
                style={[styles.inputWrapper, { justifyContent: 'center', height: 50, borderStyle: 'dashed' }]} 
                onPress={pickImage}
                >
                <Ionicons name="camera-outline" size={30} color={COLORS.textLight} />
                <Text style={{ color: COLORS.textLight, marginLeft: 10 }}>Selecionar Foto</Text>
                </TouchableOpacity>
            )}
          </View>

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