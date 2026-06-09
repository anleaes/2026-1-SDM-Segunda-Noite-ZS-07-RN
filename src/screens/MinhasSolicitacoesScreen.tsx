import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
  RefreshControl, TouchableOpacity, Alert, Linking,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/header';
import Footer from '../components/footer';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const BASE_URL = 'http://127.0.0.1:8000';

interface AdoptionTerm {
  number: number;
  adopted_at: string;
  document: string;
  adoption: number;
}

interface MySolicitation {
  id: number;
  submitted_at: string;
  status: 'pending' | 'approved' | 'rejected';
  animal: number;
  animal_name: string;
  adoption_term?: AdoptionTerm | null;
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendente',
  approved: 'Aprovada',
  rejected: 'Rejeitada',
};

const STATUS_COLOR: Record<string, string> = {
  pending: COLORS.warning,
  approved: COLORS.success,
  rejected: COLORS.error,
};

export default function MinhasSolicitacoesScreen() {
  const { token } = useAuth();
  const [data, setData] = useState<MySolicitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const response = await fetch(`${BASE_URL}/adocoes/minhas/`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (!response.ok) throw new Error('Erro ao buscar solicitações');
      const json: MySolicitation[] = await response.json();
      setData(json);
    } catch {
      // mantém dados anteriores
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchData();
    }, [token])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Abre o PDF direto no browser/visualizador do sistema — sem dependências extras
  const handleDownloadTerm = async (item: MySolicitation) => {
    const term = item.adoption_term;

    if (!term?.document) {
      Alert.alert(
        'Termo não disponível',
        'O termo ainda não foi gerado. Tente novamente em instantes.'
      );
      return;
    }

    const url = term.document.startsWith('http')
      ? term.document
      : `${BASE_URL}${term.document}`;

    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Erro', 'Não foi possível abrir o documento.');
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR');

  const renderItem = ({ item }: { item: MySolicitation }) => {
    const hasTerm = item.status === 'approved' && !!item.adoption_term;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="paw" size={20} color={COLORS.primary} />
          <Text style={styles.animalName}>{item.animal_name}</Text>
          <View style={[styles.badge, { backgroundColor: STATUS_COLOR[item.status] }]}>
            <Text style={styles.badgeText}>{STATUS_LABEL[item.status]}</Text>
          </View>
        </View>

        <View style={styles.cardRow}>
          <Ionicons name="calendar-outline" size={15} color={COLORS.textLight} />
          <Text style={styles.dateText}>Enviada em {formatDate(item.submitted_at)}</Text>
        </View>

        {item.status === 'pending' && (
          <Text style={styles.infoText}>Sua solicitação está sendo analisada pela equipe.</Text>
        )}
        {item.status === 'approved' && (
          <Text style={styles.infoText}>
            Parabéns! Sua adoção foi aprovada. Baixe o termo abaixo e entre em contato
            para os próximos passos.
          </Text>
        )}
        {item.status === 'rejected' && (
          <Text style={styles.infoText}>
            Infelizmente sua solicitação foi rejeitada. Você pode tentar novamente com outro animal.
          </Text>
        )}

        {item.status === 'approved' && (
          <TouchableOpacity
            style={[styles.downloadButton, !hasTerm && styles.downloadButtonDisabled]}
            onPress={() => handleDownloadTerm(item)}
            disabled={!hasTerm}
            activeOpacity={0.75}
          >
            <Ionicons
              name={hasTerm ? 'document-text-outline' : 'time-outline'}
              size={16}
              color={COLORS.white}
            />
            <Text style={styles.downloadButtonText}>
              {hasTerm ? 'Abrir Termo de Adoção' : 'Termo sendo gerado…'}
            </Text>
          </TouchableOpacity>
        )}

        {hasTerm && item.adoption_term && (
          <View style={styles.cardRow}>
            <Ionicons name="checkmark-circle-outline" size={14} color={COLORS.success} />
            <Text style={[styles.dateText, { color: COLORS.success }]}>
              Termo gerado em {formatDate(item.adoption_term.adopted_at)}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Minhas Solicitações" showBack />

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={data.length === 0 ? styles.emptyContainer : styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyInner}>
              <Ionicons name="document-text-outline" size={64} color={COLORS.grey} />
              <Text style={styles.emptyTitle}>Nenhuma solicitação</Text>
              <Text style={styles.emptySubtitle}>
                Você ainda não enviou nenhuma solicitação de adoção.
              </Text>
            </View>
          }
          ListFooterComponent={data.length > 0 ? <Footer /> : null}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loader: { marginTop: 60 },
  list: { padding: 16, paddingBottom: 20 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyInner: { alignItems: 'center', gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: COLORS.textDark },
  emptySubtitle: { fontSize: 14, color: COLORS.textLight, textAlign: 'center' },
  card: {
    backgroundColor: COLORS.white, borderRadius: 12, padding: 16,
    marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2, gap: 8,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  animalName: { flex: 1, fontSize: 16, fontWeight: '700', color: COLORS.textDark },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { fontSize: 13, color: COLORS.textLight },
  infoText: { fontSize: 13, color: COLORS.textLight, fontStyle: 'italic', marginTop: 4 },
  downloadButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: COLORS.primary, borderRadius: 8,
    paddingVertical: 10, paddingHorizontal: 16, marginTop: 4,
  },
  downloadButtonDisabled: { opacity: 0.5 },
  downloadButtonText: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
});