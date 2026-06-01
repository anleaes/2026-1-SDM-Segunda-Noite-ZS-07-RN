import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Header from '../components/header';
import Footer from '../components/footer';
import PetCard from '../components/petCard';

export default function HomeScreen() {
  const animaisDestaque = [
    { id: '1', name: 'Pastor Alemão', breed: 'Pastor Alemão', gender: 'Macho', traits: 'Sociável • Calmo' },
    { id: '2', name: 'Golden Retriever', breed: 'Golden', gender: 'Macho', traits: 'Dócil • Sociável' },
    { id: '3', name: 'Poodle', breed: 'Poodle', gender: 'Fêmea', traits: 'Obediente • Silencioso' },
  ];

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView style={styles.content}>
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Encontre seu{"\n"}melhor amigo aqui</Text>
          <Text style={styles.bannerText}>
            Temos diversos animais aguardando um lar cheio de amor.{"\n"}
            Adotar é um ato de amor que transforma duas vidas.
          </Text>
        </View>

        <View style={styles.filterSection}>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterButtonText}>Filtrar</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Em Destaque</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContainer}
        >
          {animaisDestaque.map((pet) => (
            <PetCard 
              key={pet.id}
              name={pet.name}
              breed={pet.breed}
              gender={pet.gender}
              traits={pet.traits}
            />
          ))}
        </ScrollView>

        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F6ED', // Fundo claro do site
  },
  content: {
    flex: 1,
  },
  banner: {
    backgroundColor: '#F3A88C', // Fundo salmão claro
    padding: 30,
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  bannerText: {
    fontSize: 14,
    color: 'white',
    lineHeight: 20,
  },
  filterSection: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  filterButton: {
    backgroundColor: '#D95D39',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  filterButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 20,
    marginTop: 10,
    marginBottom: 15,
  },
  carouselContainer: {
    paddingLeft: 20,
    paddingBottom: 20,
  },
});