import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react'

// Definição dos tipos para o TypeScript
export interface VaccineItemState {
  id: number;
  vaccineId: string;
  dosage: string;
}

interface VaccinationSectionProps {
  vaccinesApplied: VaccineItemState[];
  setVaccinesApplied: React.Dispatch<React.SetStateAction<VaccineItemState[]>>;
  weightAt: string;
  setWeightAt: (value: string) => void;
  vaccineList: any[];
  renderInput: (icon: string, placeholder: string, value: string, onChangeText: (text: string) => void, secure?: boolean, keyboardType?: any) => React.ReactNode;
  COLORS: any;
  stylesPai: any; // Reaproveita os estilos de inputWrapper e label do pai
}

export default function VaccinationSection({
  vaccinesApplied,
  setVaccinesApplied,
  weightAt,
  setWeightAt,
  vaccineList,
  renderInput,
  COLORS,
  stylesPai,
}: VaccinationSectionProps) {

  useFocusEffect(
      useCallback(() => {
          setVaccinesApplied([
              { id: Date.now(), vaccineId: '', dosage: '' }
          ]);
          setWeightAt('');
      }, [])
   );

  const addNewVaccineForm = () => {
    setVaccinesApplied([
      ...vaccinesApplied,
      { id: Date.now(), vaccineId: '', dosage: '' }
    ]);
  };

  const updateVaccineField = (id: number, field: 'vaccineId' | 'dosage', value: string) => {
    const updatedList = vaccinesApplied.map(item => {
      if (item.id === id) return { ...item, [field]: value };
      return item;
    });
    setVaccinesApplied(updatedList);
  };

  const removeVaccineForm = (id: number) => {
    if (vaccinesApplied.length > 1) {
      setVaccinesApplied(vaccinesApplied.filter(item => item.id !== id));
    }
  };

  return (
    <View style={styles.formCard}>
      <Text style={styles.sectionTitle}>Histórico de Vacinas</Text>
      
      {vaccinesApplied.map((item, index) => (
        <View key={item.id} style={[index !== vaccinesApplied.length - 1 && styles.borderBottom]}>
          <View style={styles.headerRow}>
            <Text style={styles.itemTitle}>Vacina #{index + 1}</Text>
            
            {vaccinesApplied.length > 1 && (
              <TouchableOpacity onPress={() => removeVaccineForm(item.id)}>
                <Ionicons name="trash-outline" size={18} color="red" style={styles.inputIcon}/>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="medkit-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
            <Picker
                selectedValue={item.vaccineId}
                onValueChange={(valor) => updateVaccineField(item.id, 'vaccineId', valor)}
                style={[styles.pickerWrapper, styles.input, 
                    { color: item.vaccineId === "" ? COLORS.grey : COLORS.textDark },
                    { flex: 1 }]}
            >   {item.vaccineId === "" && 
                <Picker.Item label="Selecione a vacina..." value="" color="COLORS.grey" />}
                {vaccineList.map((vac: any) => (
                <Picker.Item key={vac.id} label={vac.name} value={vac.id} color={COLORS.textDark}/>  
                ))}
            </Picker>
          </View>

          {renderInput('flask-outline', 'Dosagem (ml ou mg)', 
            item.dosage, 
            (valor) => updateVaccineField(item.id, 'dosage', valor), 
            false, 'numeric' )}
        </View>
      ))}
      
      <View style={styles.divider} />

      {renderInput('speedometer-outline', 'Peso do animal na aplicação (kg)', weightAt, setWeightAt, false, 'numeric')} 

      <TouchableOpacity style={styles.addButton} onPress={addNewVaccineForm}>
        <Ionicons name="add-circle-outline" size={20} color={COLORS.textDark} style={styles.inputIcon} />
        <Text style={styles.addButtonText}>Adicionar outra vacina</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  borderBottom: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  itemTitle: {
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 5
  },
  addButton: {
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: COLORS.primary, 
    borderRadius: 8, 
    marginBottom: 14, 
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    padding: 10,
    marginTop: 10
  },
  addButtonText: {
    color: COLORS.dark,
    fontWeight: '600'
  },    
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginHorizontal: 0,
    marginVertical: 20,
    paddingHorizontal: 10,
    elevation: 3,
    // shadowColor: COLORS.dark,
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.05, shadowRadius: 4
  },
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
pickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 0,
    paddingHorizontal: 0,
    height: 40,
    marginTop: 0,
},
inputIcon: { 
    marginRight: 8 
},
input: { 
    flex: 1, 
    height: 44, 
    color: COLORS.textDark, 
    fontSize: 14,
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

  pickerText: {
    color: COLORS.grey,
  },
});