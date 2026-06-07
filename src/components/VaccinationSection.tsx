import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

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
  renderInput: (icon: string, placeholder: string, value: string, onChangeText: (text: string) => void, secure?: boolean, keyboardType?: string) => React.ReactNode;
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
    <View style={styles.container}>
      <Text style={[stylesPai.sectionTitle, { fontSize: 16, marginBottom: 10 }]}>
        Histórico de Vacinas
      </Text>
      
      {vaccinesApplied.map((item, index) => (
        <View key={item.id} style={[styles.cardItem, index !== vaccinesApplied.length - 1 && styles.borderBottom]}>
          <View style={styles.headerRow}>
            <Text style={styles.itemTitle}>Vacina #{index + 1}</Text>
            
            {vaccinesApplied.length > 1 && (
              <TouchableOpacity onPress={() => removeVaccineForm(item.id)}>
                <Ionicons name="trash-outline" size={18} color="red" />
              </TouchableOpacity>
            )}
          </View>

          <Text style={stylesPai.label}>Vacina</Text>
          <View style={stylesPai.inputWrapper}>
            <Picker
              selectedValue={item.vaccineId}
              onValueChange={(valor) => updateVaccineField(item.id, 'vaccineId', valor)}
              style={stylesPai.pickerText}
            >
              <Picker.Item label="Selecione a vacina..." value="" />
              {vaccineList.map((vac: any) => (
                <Picker.Item key={vac.id} label={vac.name} value={vac.id} />
              ))}
            </Picker>
          </View>

          {renderInput(
            'flask-outline', 
            'Dosagem (ml ou mg)', 
            item.dosage, 
            (valor) => updateVaccineField(item.id, 'dosage', valor), 
            false, 
            'numeric'
          )}
        </View>
      ))}

      {renderInput('speedometer-outline', 'Peso do animal na aplicação (kg)', weightAt, setWeightAt, false, 'numeric')}

      <TouchableOpacity style={styles.addButton} onPress={addNewVaccineForm}>
        <Ionicons name="add-circle-outline" size={20} color={COLORS.textDark} style={{ marginRight: 5 }} />
        <Text style={styles.addButtonText}>Adicionar outra vacina</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee'
  },
  cardItem: {
    marginBottom: 15,
    paddingBottom: 10,
  },
  borderBottom: {
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
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    padding: 10,
    borderRadius: 6,
    marginTop: 10
  },
  addButtonText: {
    color: COLORS.dark,
    fontWeight: '600'
  }
});