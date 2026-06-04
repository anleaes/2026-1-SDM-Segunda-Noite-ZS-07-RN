import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/header';
import Footer from '../components/footer';
import PetCard from '../components/petCard';
import { COLORS } from '../constants/theme';
import { useNavigation } from '@react-navigation/native';

interface PetInfo {
  id: string | number;
  photo: string;
  name: string;
  breed: string;
  sex: string;
  characteristic: Array<string>;
  isHome?: boolean;
}

export default function AnimalsScreen() {
  const navigation = useNavigation<any>();
  
  const [animais, setAnimais] = useState<PetInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  const carregandoDados = async () => {
    try {
        const response = await fetch('http://127.0.0.1:8000/animais/');
      
        const data = await response.json();
        setAnimais(data);
    } catch (error) {
        console.error("Erro ao buscar os animais do back-end:", error);
    } finally {
        setLoading(false); 
    }
  };

  useEffect(() => {
    carregandoDados();
  }, []);

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView style={styles.content} showsHorizontalScrollIndicator={false} contentContainerStyle={{flexGrow: 1}}>
        <View style={{flex: 1}}>
          <View style={styles.searchSection}>
            <TouchableOpacity 
              style={styles.filterToggleBtn}
              onPress={() => setFiltrosAbertos(!filtrosAbertos)}
            >
              <Ionicons name="options-outline" size={24} color={COLORS.primary} />
              <Text style={styles.filterToggleText}>Filtros</Text>
              <Ionicons 
                name={filtrosAbertos ? "chevron-up" : "chevron-down"}
                size={20} 
                color={COLORS.primary} 
              />
            </TouchableOpacity>
          </View>

          {filtrosAbertos && (
            <View style={styles.dropdownMenu}>
              <Text style={styles.dropdownTitle}>Filtrar Busca</Text>
              <Text style={styles.dropdownSubtitle}>Espécie</Text>
              <View style={styles.filterRow}>
                  <TouchableOpacity style={styles.filterOption}><Text>Cachorro</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.filterOption}><Text>Gato</Text></TouchableOpacity>
              </View>

              <Text style={styles.dropdownSubtitle}>Porte</Text>
              <View style={styles.filterRow}>
                  <TouchableOpacity style={styles.filterOption}><Text>Pequeno</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.filterOption}><Text>Médio</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.filterOption}><Text>Grande</Text></TouchableOpacity>
              </View>
              
              <TouchableOpacity style={styles.applyFiltersBtn}>
                  <Text style={styles.applyFiltersText}>Aplicar Filtros</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.resultsHeader}>
            <Text style={styles.resultsText}>Mostrando {animais.length} animais</Text>
          </View>

          {loading ? (
              <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Buscando amiguinhos...</Text>
              </View>
          ) : (
              <View style={styles.gridContainer}>
                  {animais.slice(0,10).map((pet) => (
                      <PetCard
                          key={pet.id.toString()}
                          photo={pet.photo}
                          name={pet.name}
                          breed={pet.breed}
                          sex={pet.sex}
                          characteristic={pet.characteristic}
                          isHome={false}
                          onPressButton={() => navigation.navigate('InfoAnimalScreen', { animalId: pet.id })}
                      />
                  ))}
              </View>
          )}

        </View>

        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingTop: 15,
        paddingBottom: 20,
    },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  searchSection: {
    padding: 15,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff0eb',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  filterToggleText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
    marginRight: 8,
  },
  dropdownMenu: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 15,
    textAlign: 'center',
  },
  dropdownSubtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginTop: 10,
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  applyFiltersBtn: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  applyFiltersText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  resultsText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginLeft: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  carouselContainer: {
    paddingLeft: 20,
    paddingBottom: 15,
  },
  loadingContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.textLight,
    fontWeight: 'bold',
  },
});