import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/header';
import Footer from '../components/footer';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const BASE_URL = 'http://127.0.0.1:8000';

interface MySolicitation {
  id: number;
  submitted_at: string;
  status: 'pending' | 'approved' | 'rejected';
  animal: number;
  animal_name: string;
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
      if (!response.ok) throw new Error();
      const json = await response.json();
      setData(json);
    } catch {
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

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR');
  };

  const renderItem = ({ item }: { item: MySolicitation }) => (
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
          Parabéns! Sua adoção foi aprovada. Entre em contato conosco para os próximos passos.
        </Text>
      )}
      {item.status === 'rejected' && (
        <Text style={styles.infoText}>
          Infelizmente sua solicitação foi rejeitada. Você pode tentar novamente com outro animal.
        </Text>
      )}
    </View>
  );

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
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loader: {
    marginTop: 60,
  },
  list: {
    padding: 16,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyInner: {
    alignItems: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  animalName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textLight,
    fontStyle: 'italic',
    marginTop: 4,
  },
});
