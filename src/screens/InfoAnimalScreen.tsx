import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import Badge from '../components/Badge';
import Tag from '../components/Tag';
import InfoRow from '../components/InfoRow';
import Header from '../components/header';
import { COLORS } from '../constants/theme';
import { useRoute } from '@react-navigation/native';

export default function InfoAnimalScreen() {
  const route = useRoute();
  // Pega o ID que veio da navegação da HomeScreen
  const { animalId } = route.params as { animalId: string | number };
  
  const [pet, setPet] = useState<any | null>(null);
  // O loading começa como true para mostrar o ActivityIndicator enquanto a API responde
  const [loading, setLoading] = useState(true); 

  // --- AQUI ENTRA O FETCH ---
  const fetchAnimalDetails = async () => {
    try {
      // Faz a requisição interpolando o ID na URL
      const response = await fetch(`http://127.0.0.1:8000/animais/${animalId}`);
      const data = await response.json();
      
      setPet(data);
    } catch (error) {
      console.error("Erro ao buscar os detalhes do animal:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (animalId) {
      fetchAnimalDetails();
    }
  }, [animalId]); 
  // --------------------------

  // Tela de carregamento enquanto espera o back-end
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10, color: COLORS.textDark }}>Carregando informações...</Text>
      </View>
    );
  }

  // Se a API não retornar nada ou der erro, mostra isso:
  if (!pet) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Animal não encontrado.</Text>
      </View>
    );
  }

  const calculateAge = (birthDate: string) => {
  if (!birthDate) return '-';
  
  const birth = new Date(birthDate);
  const today = new Date();
  
  // 1. Calcula a diferença total apenas em meses
  let totalMonths = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
  
  // 2. Se o dia do mês atual for menor que o dia do nascimento, ainda não completou aquele mês
  if (today.getDate() < birth.getDate()) {
    totalMonths--;
  }
  
  // 3. Verifica o que exibir
  if (totalMonths >= 12) {
    const years = Math.floor(totalMonths / 12);
    return `${years} ${years === 1 ? 'ano' : 'anos'}`;
  } else if (totalMonths > 0) {
    return `${totalMonths} ${totalMonths === 1 ? 'mês' : 'meses'}`;
  } else {
    return 'Menos de 1 mês';
  }
  };

  return (
    <View style={styles.screen}>
      <Header title={pet.name ?? 'Detalhes'} showBack={true} />
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.imageWrap}>
          {pet.photo ? (
            <Image source={{ uri: pet.photo }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.noImage}>
              <Text style={{ color: COLORS.textDark }}>Sem foto</Text>
            </View>
          )}
        </View>

        {/* Renderização condicional das Badges (caso a API retorne esses dados) */}
        <View style={styles.badges}>
          {pet.adopted === false && <Badge text="disponível" color={COLORS.success} />}
          {pet.sterilized && <Badge text="castrado" color={COLORS.warning} />}
        </View>

        <View style={styles.meta}>
          <Text style={styles.title}>{pet.name}</Text>
          <Text style={styles.subtitle}>{`${pet.sex ?? '-'} • ${calculateAge(pet.birth_date)} • Porto Alegre/RS`}</Text>
        </View>

        {/* Tags com renderização segura */}
        {pet.tags && pet.tags.length > 0 && (
          <View style={styles.tags}>
            {pet.tags.map((t: string) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </View>
        )}

        <View style={styles.infoBox}>
          <InfoRow label="Espécie" value={pet.species ?? '-'} />
          <InfoRow label="Raça" value={pet.breed ?? '-'} />
          <InfoRow label="No abrigo há" value={calculateAge(pet.listedAt)} />
        </View>

        <View style={styles.about}>
          <Text style={styles.sectionTitle}>Sobre ele</Text>
          <Text style={styles.description}>{pet.characteristic?.join(', ') ?? pet.characteristic ?? 'Sem descrição fornecida.'}</Text>
        </View>
      </ScrollView>

      <View style={styles.footerContainer}>
        <TouchableOpacity 
          style={styles.adoptButton} 
          activeOpacity={0.8}
          onPress={() => console.log('Iniciar adoção do', pet.name)} >
          <Text style={styles.adoptButtonText}>Quero Adotar</Text>
        </TouchableOpacity>
      </View>
      {/* ------------------------------- */}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 40 },
  imageWrap: { height: 220, backgroundColor: '#e9e7e3', justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: '100%' },
  noImage: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  badges: { position: 'absolute', top: 180, left: 16, right: 16, flexDirection: 'row', gap: 8 },
  meta: { padding: 16, paddingTop: 24 },
  title: { fontSize: 22, color: COLORS.primary, fontWeight: '700' },
  subtitle: { color: '#666', marginTop: 6 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, marginTop: 12, gap: 8 },
  infoBox: { paddingHorizontal: 16, marginTop: 16, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 12 },
  about: { paddingHorizontal: 16, marginTop: 12 },
  sectionTitle: { color: COLORS.primary, fontSize: 16, marginBottom: 6 },
  description: { color: '#444', lineHeight: 20 },
  footerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
    // Sombrinha leve para destacar o rodapé do resto da tela
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 10, 
  },
  adoptButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adoptButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase', // Deixa a letra toda maiúscula para chamar atenção
  },
});