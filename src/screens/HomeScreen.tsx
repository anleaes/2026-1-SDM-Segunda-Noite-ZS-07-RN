import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Header from '../components/header';
import Footer from '../components/footer';
import PetCard from '../components/petCard';
import { COLORS } from '../constants/theme';

interface PetInfo {
  id: string | number;
  photo: string;
  name: string;
  breed: string;
  sex: string;
  characteristics: Array<string>;
}

export default function HomeScreen() {
  const [animais, setAnimais] = useState<PetInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnimals = async () => {
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
    fetchAnimals();
  }, []);

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

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Buscando amiguinhos...</Text>
          </View>
        ) : (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.carouselContainer}
          >
            {animais.map((pet) => (
              <PetCard
                key={pet.id.toString()}
                photo={pet.photo}
                name={pet.name}
                breed={pet.breed}
                sex={pet.sex}
                characteristics={pet.characteristics}
                isHome={true}
              />
            ))}
          </ScrollView>
        )}

        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  banner: {
    backgroundColor: COLORS.secondary,
    padding: 30,
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 10,
  },
  bannerText: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  filterSection: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  filterButton: {
    backgroundColor: COLORS.primary,
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
    color: COLORS.textDark,
    marginLeft: 20,
    marginTop: 10,
    marginBottom: 15,
  },
  carouselContainer: {
    paddingLeft: 20,
    paddingBottom: 20,
  },
});