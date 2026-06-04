import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS } from '../constants/theme';

interface PetCardProps {
  name: string;
  photo: string;
  breed: string;
  sex: string;
  characteristic: Array<string>;
  onPressButton: () => void;
}

const mapSex: { [key: string]: string } = {
    'M': 'Macho',
    'F': 'Fêmea',
  };

export default function PetCard({ name, photo, breed, sex, characteristic, onPressButton }: PetCardProps) {
  return (
    <View style={styles.card}>
      {photo ? (
        <Image 
          source={{ uri: photo }} 
          style={styles.image} 
          resizeMode="cover"
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imageText}>Sem foto</Text>
        </View>
      )}
      
      <View style={styles.infoContainer}>
        <Text style={styles.petName}>{name}</Text>
        <Text style={styles.petDetails}>{breed} • {sex ? (mapSex[sex.toUpperCase()] ?? sex) : '-'}</Text>
        
        <Text style={styles.petTraits}>
          {characteristic && characteristic.length > 0 
            ? characteristic.join(' • ') 
            : 'Sem características'}
        </Text>

      </View>

      <TouchableOpacity style={styles.button} onPress={onPressButton}>
        <Text style={styles.buttonText}>Ver mais</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    width: 200,
    marginRight: 15,
    elevation: 3,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 120,
  },
  imagePlaceholder: {
    height: 120,
    backgroundColor: COLORS.grey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageText: { color: COLORS.textDark },
  infoContainer: {
    padding: 10,
    alignItems: 'center',
  },
  petName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: COLORS.textDark,
  },
  petDetails: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
    textAlign: 'center',
  },
  petTraits: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 10,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    alignItems: 'center',
    marginTop: 'auto',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});