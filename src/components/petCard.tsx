import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

// Definindo o que o card precisa receber
interface PetCardProps {
  name: string;
  breed: string;
  gender: string;
  traits: string;
}

export default function PetCard({ name, breed, gender, traits }: PetCardProps) {
  return (
    <View style={styles.card}>
      {/* Placeholder da Imagem (depois você troca pela prop de URL da imagem real) */}
      <View style={styles.imagePlaceholder}>
        <Text style={styles.imageText}>Foto do {name}</Text>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.petName}>{name}</Text>
        <Text style={styles.petDetails}>{breed} • {gender}</Text>
        <Text style={styles.petTraits}>{traits}</Text>
      </View>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>ADOTAR</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    width: 200, // Largura fixa para caber no carrossel horizontal
    marginRight: 15,
    elevation: 3, // Sombra no Android
    shadowColor: '#000', // Sombra no iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  imagePlaceholder: {
    height: 120,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageText: { color: '#888' },
  infoContainer: {
    padding: 10,
    alignItems: 'center',
  },
  petName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  petDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  petTraits: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#D95D39',
    padding: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});