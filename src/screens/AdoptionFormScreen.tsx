import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Footer from '../components/footer';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const HOUSING_TYPES = ['Casa', 'Apartamento', 'Chácara/Sítio', 'Outro'];
const OWNERSHIP_TYPES = ['Próprio', 'Alugado', 'Cedido'];
const STATES = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

export default function AdoptionFormScreen({ navigation, route }: any) {
  const { token } = useAuth();
  const animalId = route?.params?.animalId;
  const animalName = route?.params?.animalName ?? 'Animal';

  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [occupation, setOccupation] = useState('');

  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  const [housingType, setHousingType] = useState('');
  const [ownershipType, setOwnershipType] = useState('');
  const [hasYard, setHasYard] = useState(false);
  const [yardSecured, setYardSecured] = useState(false);
  const [residentsCount, setResidentsCount] = useState('');
  const [hasChildren, setHasChildren] = useState(false);
  const [childrenAges, setChildrenAges] = useState('');

  const [hadPetsBefore, setHadPetsBefore] = useState(false);
  const [currentlyHasPets, setCurrentlyHasPets] = useState(false);
  const [currentPetsDescription, setCurrentPetsDescription] = useState('');
  const [reasonForAdoption, setReasonForAdoption] = useState('');
  const [caretaker, setCaretaker] = useState('');

  const formatCpf = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const formatPhone = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 10) {
      return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
    }
    return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
  };

  const formatBirthDate = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 8);
    return digits
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{2})(\d)/, '$1/$2');
  };

  const formatCep = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 8);
    return digits.replace(/(\d{5})(\d{0,3})/, '$1-$2').replace(/-$/, '');
  };

  const fetchAddressByCep = async (rawCep: string) => {
    const digits = rawCep.replace(/\D/g, '');
    if (digits.length !== 8) return;
    try {
      const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setStreet(data.logradouro ?? '');
        setNeighborhood(data.bairro ?? '');
        setCity(data.localidade ?? '');
        setState(data.uf ?? '');
      }
    } catch {
    }
  };

  const handleSubmit = async () => {
    if (
      !fullName.trim() || !cpf.trim() || !birthDate.trim() || !phone.trim() ||
      !cep.trim() || !street.trim() || !number.trim() || !neighborhood.trim() ||
      !city.trim() || !state.trim() || !housingType || !ownershipType ||
      !residentsCount.trim() || !reasonForAdoption.trim() || !caretaker.trim()
    ) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      const checkResponse = await fetch('http://127.0.0.1:8000/adocoes/minhas/', {
        headers: { Authorization: `Token ${token}` },
      });
      if (checkResponse.ok) {
        const minhas = await checkResponse.json();
        const jaExiste = minhas.some(
          (s: any) => String(s.animal) === String(animalId) && s.status !== 'rejected'
        );
        if (jaExiste) {
          Alert.alert('Atenção', 'Você já possui uma solicitação ativa para este animal.');
          setLoading(false);
          return;
        }
      }

      const response = await fetch('http://127.0.0.1:8000/adocoes/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          animal: animalId,
          full_name: fullName.trim(),
          cpf: cpf.replace(/\D/g, ''),
          birth_date: birthDate.trim(),
          phone: phone.replace(/\D/g, ''),
          email: email.trim(),
          occupation: occupation.trim(),
          cep: cep.replace(/\D/g, ''),
          street: street.trim(),
          number: number.trim(),
          complement: complement.trim(),
          neighborhood: neighborhood.trim(),
          city: city.trim(),
          state: state.trim(),
          housing_type: housingType,
          ownership_type: ownershipType,
          has_yard: hasYard,
          yard_secured: yardSecured,
          residents_count: Number(residentsCount),
          has_children: hasChildren,
          children_ages: childrenAges.trim(),
          had_pets_before: hadPetsBefore,
          currently_has_pets: currentlyHasPets,
          current_pets_description: currentPetsDescription.trim(),
          reason_for_adoption: reasonForAdoption.trim(),
          caretaker: caretaker.trim(),
        }),
      });

      const text = await response.text();

      if (response.ok) {
        navigation.navigate('MinhasSolicitacoes');
        Alert.alert('Sucesso!', 'Formulário de adoção enviado com sucesso. Entraremos em contato em breve.');
        return;
      }

      let errorMessage = `Status ${response.status}`;
      try {
        const resData = JSON.parse(text);
        if (resData?.animal) {
          const animalErrors: string[] = Array.isArray(resData.animal)
            ? resData.animal
            : [String(resData.animal)];
          Alert.alert('Atenção', animalErrors[0]);
          return;
        }
        errorMessage = JSON.stringify(resData, null, 2);
      } catch {
        errorMessage = text.length > 500 ? text.slice(0, 500) + '...' : text;
      }
      console.error('Erro no POST /adocoes/:', errorMessage);
      Alert.alert('Erro', errorMessage);
    } catch (err) {
      console.error('Exceção no envio:', err);
      Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    icon: keyof typeof Ionicons.glyphMap,
    placeholder: string,
    value: string,
    onChangeText: (t: string) => void,
    options?: {
      keyboardType?: any;
      multiline?: boolean;
      numberOfLines?: number;
      onEndEditing?: () => void;
    }
  ) => (
    <View style={[styles.inputWrapper, options?.multiline && styles.inputWrapperMultiline]}>
      <Ionicons name={icon} size={20} color={COLORS.textLight} style={styles.inputIcon} />
      <TextInput
        style={[styles.input, options?.multiline && styles.inputMultiline]}
        placeholder={placeholder}
        placeholderTextColor={COLORS.grey}
        value={value}
        onChangeText={onChangeText}
        keyboardType={options?.keyboardType ?? 'default'}
        multiline={options?.multiline}
        numberOfLines={options?.numberOfLines}
        onEndEditing={options?.onEndEditing}
        autoCapitalize={options?.keyboardType === 'email-address' ? 'none' : 'sentences'}
        textAlignVertical={options?.multiline ? 'top' : 'center'}
      />
    </View>
  );

  const renderSelectorRow = (
    label: string,
    options: string[],
    selected: string,
    onSelect: (v: string) => void
  ) => (
    <View style={styles.selectorGroup}>
      <Text style={styles.selectorLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[styles.selectorChip, selected === opt && styles.selectorChipActive]}
            onPress={() => onSelect(opt)}
          >
            <Text style={[styles.selectorChipText, selected === opt && styles.selectorChipTextActive]}>
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderSwitch = (label: string, value: boolean, onValueChange: (v: boolean) => void) => (
    <View style={styles.switchWrapper}>
      <Text style={styles.switchLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: COLORS.grey, true: COLORS.secondary }}
        thumbColor={value ? COLORS.primary : COLORS.background}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.customHeader}>
        <TouchableOpacity style={styles.headerLeft} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color={COLORS.white} />
          <View>
            <Text style={styles.headerTitle}>Formulário de Adoção</Text>
            <Text style={styles.headerSubtitle}>{animalName}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>

          <Text style={styles.sectionTitle}>
            <Ionicons name="person-outline" size={16} color={COLORS.primary} /> Dados Pessoais
          </Text>
          {renderInput('person-outline', 'Nome completo *', fullName, setFullName)}
          {renderInput('document-text-outline', 'CPF *', cpf, (t) => setCpf(formatCpf(t)), { keyboardType: 'numeric' })}
          {renderInput('calendar-outline', 'Data de nascimento * (DD/MM/AAAA)', birthDate, (t) => setBirthDate(formatBirthDate(t)), { keyboardType: 'numeric' })}
          {renderInput('call-outline', 'Telefone/WhatsApp *', phone, (t) => setPhone(formatPhone(t)), { keyboardType: 'phone-pad' })}
          {renderInput('mail-outline', 'E-mail', email, setEmail, { keyboardType: 'email-address' })}
          {renderInput('briefcase-outline', 'Profissão/Ocupação', occupation, setOccupation)}

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>
            <Ionicons name="location-outline" size={16} color={COLORS.primary} /> Endereço
          </Text>
          {renderInput('map-outline', 'CEP *', cep, (t) => { const f = formatCep(t); setCep(f); }, {
            keyboardType: 'numeric',
            onEndEditing: () => fetchAddressByCep(cep),
          })}
          <Text style={styles.cepHint}>Digite o CEP para preenchimento automático</Text>
          {renderInput('navigate-outline', 'Rua / Avenida *', street, setStreet)}
          <View style={styles.rowInputs}>
            <View style={[styles.inputWrapper, styles.inputSmall]}>
              <Ionicons name="home-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Número *"
                placeholderTextColor={COLORS.grey}
                value={number}
                onChangeText={setNumber}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputWrapper, styles.inputLarge]}>
              <Ionicons name="add-circle-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Complemento"
                placeholderTextColor={COLORS.grey}
                value={complement}
                onChangeText={setComplement}
              />
            </View>
          </View>
          {renderInput('business-outline', 'Bairro *', neighborhood, setNeighborhood)}
          <View style={styles.rowInputs}>
            <View style={[styles.inputWrapper, styles.inputLarge]}>
              <Ionicons name="pin-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Cidade *"
                placeholderTextColor={COLORS.grey}
                value={city}
                onChangeText={setCity}
              />
            </View>
            <View style={[styles.inputWrapper, styles.inputSmall]}>
              <Ionicons name="flag-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="UF *"
                placeholderTextColor={COLORS.grey}
                value={state}
                onChangeText={(t) => setState(t.toUpperCase().slice(0, 2))}
                autoCapitalize="characters"
                maxLength={2}
              />
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>
            <Ionicons name="home-outline" size={16} color={COLORS.primary} /> Moradia
          </Text>
          {renderSelectorRow('Tipo de moradia *', HOUSING_TYPES, housingType, setHousingType)}
          {renderSelectorRow('Moradia *', OWNERSHIP_TYPES, ownershipType, setOwnershipType)}
          {renderInput('people-outline', 'Quantas pessoas moram na residência? *', residentsCount, setResidentsCount, { keyboardType: 'numeric' })}
          {renderSwitch('Possui quintal ou área externa?', hasYard, setHasYard)}
          {hasYard && renderSwitch('O quintal/área é cercado e seguro?', yardSecured, setYardSecured)}
          {renderSwitch('Há crianças na residência?', hasChildren, setHasChildren)}
          {hasChildren && renderInput('happy-outline', 'Idades das crianças', childrenAges, setChildrenAges)}

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>
            <Ionicons name="paw-outline" size={16} color={COLORS.primary} /> Experiência com Animais
          </Text>
          {renderSwitch('Já teve animais de estimação antes?', hadPetsBefore, setHadPetsBefore)}
          {renderSwitch('Possui outros animais atualmente?', currentlyHasPets, setCurrentlyHasPets)}
          {currentlyHasPets && renderInput('paw-outline', 'Descreva os animais que possui (espécie, raça, idade)', currentPetsDescription, setCurrentPetsDescription, { multiline: true, numberOfLines: 3 })}

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>
            <Ionicons name="heart-outline" size={16} color={COLORS.primary} /> Motivação para Adoção
          </Text>
          {renderInput('chatbox-outline', 'Por que você deseja adotar? *', reasonForAdoption, setReasonForAdoption, { multiline: true, numberOfLines: 4 })}
          {renderInput('person-circle-outline', 'Quem será o responsável pelos cuidados? *', caretaker, setCaretaker)}

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={COLORS.white} />
              : (
                <View style={styles.buttonContent}>
                  <Ionicons name="heart" size={18} color={COLORS.white} />
                  <Text style={styles.buttonText}>Enviar Formulário de Adoção</Text>
                </View>
              )
            }
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
    backgroundColor: COLORS.background,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 15,
    elevation: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: COLORS.secondary,
    fontSize: 13,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginHorizontal: 15,
    marginVertical: 20,
    padding: 20,
    elevation: 3,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.grey,
    marginVertical: 20,
    opacity: 0.4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.grey,
    marginBottom: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  inputWrapperMultiline: {
    height: undefined,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: COLORS.textDark,
    fontSize: 14,
  },
  inputMultiline: {
    minHeight: 80,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  inputSmall: {
    flex: 1,
  },
  inputLarge: {
    flex: 2,
  },
  cepHint: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: -8,
    marginBottom: 10,
    marginLeft: 4,
  },
  selectorGroup: {
    marginBottom: 14,
  },
  selectorLabel: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  selectorScroll: {
    flexDirection: 'row',
  },
  selectorChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.grey,
    marginRight: 8,
    backgroundColor: COLORS.background,
  },
  selectorChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  selectorChipText: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  selectorChipTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  switchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.grey,
  },
  switchLabel: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textDark,
    paddingRight: 10,
  },
  policyBox: {
    backgroundColor: '#FFF8F6',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    borderRadius: 6,
    padding: 14,
    marginBottom: 16,
  },
  policyText: {
    fontSize: 13,
    color: COLORS.textDark,
    lineHeight: 20,
  },
  policyLink: {
    marginTop: 10,
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textDark,
    lineHeight: 20,
  },
  checkboxLabelBold: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: COLORS.grey,
    elevation: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  modalBody: {
    padding: 20,
  },
  modalText: {
    fontSize: 13,
    color: COLORS.textDark,
    lineHeight: 21,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: 'bold',
  },
});
