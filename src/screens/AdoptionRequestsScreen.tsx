import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/header';
import Footer from '../components/footer';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const BASE_URL = 'http://127.0.0.1:8000';

interface Solicitation {
  id: number;
  submitted_at: string;
  status: 'pending' | 'approved' | 'rejected';
  animal: number;
  animal_name: string;
  adopter: number;
  full_name: string;
  cpf: string;
  birth_date: string;
  phone: string;
  email: string;
  occupation: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  housing_type: string;
  ownership_type: string;
  has_yard: boolean;
  yard_secured: boolean;
  residents_count: number;
  has_children: boolean;
  children_ages: string;
  had_pets_before: boolean;
  currently_has_pets: boolean;
  current_pets_description: string;
  reason_for_adoption: string;
  caretaker: string;
  agreed_to_policy: boolean;
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

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

export default function AdoptionRequestsScreen() {
  const { token } = useAuth();
  const [data, setData] = useState<Solicitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>('pending');
  const [selected, setSelected] = useState<Solicitation | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchData = async () => {
    try {
      const response = await fetch(`${BASE_URL}/adocoes/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const text = await response.text();
      console.log('GET /adocoes/ status:', response.status, 'body:', text.slice(0, 300));
      if (!response.ok) throw new Error(text);
      const json = JSON.parse(text);
      setData(json);
    } catch (e) {
      console.error('Erro ao buscar solicitações:', e);
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


  const doUpdateStatus = async (id: number, status: 'approved' | 'rejected') => {
    setUpdating(true);
    setSelected(null);
    try {
      const response = await fetch(`${BASE_URL}/adocoes/${id}/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      const resText = await response.text();
      console.log('PATCH /adocoes/', id, 'status:', response.status, 'body:', resText.slice(0, 200));
      if (!response.ok) throw new Error(resText);
      setData((prev) => prev.filter((item) => item.id !== id));
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar o status.');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('pt-BR');

  const filtered = filter === 'all' ? data : data.filter((d) => d.status === filter);

  const renderFilterButton = (value: FilterStatus, label: string) => (
    <TouchableOpacity
      key={value}
      style={[styles.filterBtn, filter === value && styles.filterBtnActive]}
      onPress={() => setFilter(value)}
    >
      <Text style={[styles.filterText, filter === value && styles.filterTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: Solicitation }) => (
    <TouchableOpacity style={styles.card} onPress={() => setSelected(item)}>
      <View style={styles.cardHeader}>
        <Ionicons name="paw" size={18} color={COLORS.primary} />
        <Text style={styles.animalName}>{item.animal_name}</Text>
        <View style={[styles.badge, { backgroundColor: STATUS_COLOR[item.status] }]}>
          <Text style={styles.badgeText}>{STATUS_LABEL[item.status]}</Text>
        </View>
      </View>

      <View style={styles.cardRow}>
        <Ionicons name="person-outline" size={14} color={COLORS.textLight} />
        <Text style={styles.metaText}>{item.full_name}</Text>
      </View>

      <View style={styles.cardRow}>
        <Ionicons name="calendar-outline" size={14} color={COLORS.textLight} />
        <Text style={styles.metaText}>{formatDate(item.submitted_at)}</Text>
      </View>

      {item.status === 'pending' && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.approveBtn]}
            onPress={(e) => { e.stopPropagation?.(); doUpdateStatus(item.id, 'approved'); }}
          >
            <Ionicons name="checkmark" size={14} color={COLORS.white} />
            <Text style={styles.actionText}>Aprovar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.rejectBtn]}
            onPress={(e) => { e.stopPropagation?.(); doUpdateStatus(item.id, 'rejected'); }}
          >
            <Ionicons name="close" size={14} color={COLORS.white} />
            <Text style={styles.actionText}>Rejeitar</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="Solicitações de Adoção" showBack />

      <View style={styles.filterRow}>
        {renderFilterButton('pending', 'Pendentes')}
        {renderFilterButton('approved', 'Aprovadas')}
        {renderFilterButton('rejected', 'Rejeitadas')}
        {renderFilterButton('all', 'Todas')}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={filtered.length === 0 ? styles.emptyContainer : styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyInner}>
              <Ionicons name="checkmark-done-outline" size={64} color={COLORS.grey} />
              <Text style={styles.emptyTitle}>Nenhuma solicitação</Text>
            </View>
          }
          ListFooterComponent={filtered.length > 0 ? <Footer /> : null}
        />
      )}

      {updating && (
        <View style={styles.updatingOverlay}>
          <ActivityIndicator size="large" color={COLORS.white} />
        </View>
      )}

      <Modal visible={!!selected} animationType="slide" transparent onRequestClose={() => setSelected(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalhes da Solicitação</Text>
              <TouchableOpacity onPress={() => setSelected(null)}>
                <Ionicons name="close" size={24} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            {selected && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[styles.badge, { backgroundColor: STATUS_COLOR[selected.status], alignSelf: 'flex-start', marginBottom: 12 }]}>
                  <Text style={styles.badgeText}>{STATUS_LABEL[selected.status]}</Text>
                </View>

                <DetailSection title="Animal">
                  <DetailRow label="Animal" value={selected.animal_name} />
                  <DetailRow label="Enviado em" value={formatDate(selected.submitted_at)} />
                </DetailSection>

                <DetailSection title="Dados Pessoais">
                  <DetailRow label="Nome" value={selected.full_name} />
                  <DetailRow label="CPF" value={selected.cpf} />
                  <DetailRow label="Nascimento" value={selected.birth_date} />
                  <DetailRow label="Telefone" value={selected.phone} />
                  {selected.email ? <DetailRow label="E-mail" value={selected.email} /> : null}
                  {selected.occupation ? <DetailRow label="Profissão" value={selected.occupation} /> : null}
                </DetailSection>

                <DetailSection title="Endereço">
                  <DetailRow label="Rua" value={`${selected.street}, ${selected.number}${selected.complement ? ` - ${selected.complement}` : ''}`} />
                  <DetailRow label="Bairro" value={selected.neighborhood} />
                  <DetailRow label="Cidade/UF" value={`${selected.city} - ${selected.state}`} />
                  <DetailRow label="CEP" value={selected.cep} />
                </DetailSection>

                <DetailSection title="Moradia">
                  <DetailRow label="Tipo" value={selected.housing_type} />
                  <DetailRow label="Posse" value={selected.ownership_type} />
                  <DetailRow label="Tem quintal" value={selected.has_yard ? 'Sim' : 'Não'} />
                  {selected.has_yard && <DetailRow label="Quintal seguro" value={selected.yard_secured ? 'Sim' : 'Não'} />}
                  <DetailRow label="Moradores" value={String(selected.residents_count)} />
                  <DetailRow label="Tem crianças" value={selected.has_children ? 'Sim' : 'Não'} />
                  {selected.has_children && selected.children_ages ? (
                    <DetailRow label="Idades" value={selected.children_ages} />
                  ) : null}
                </DetailSection>

                <DetailSection title="Experiência com Animais">
                  <DetailRow label="Já teve pets" value={selected.had_pets_before ? 'Sim' : 'Não'} />
                  <DetailRow label="Tem pets atualmente" value={selected.currently_has_pets ? 'Sim' : 'Não'} />
                  {selected.currently_has_pets && selected.current_pets_description ? (
                    <DetailRow label="Descrição" value={selected.current_pets_description} />
                  ) : null}
                </DetailSection>

                <DetailSection title="Motivação">
                  <DetailRow label="Motivo" value={selected.reason_for_adoption} />
                  <DetailRow label="Responsável" value={selected.caretaker} />
                </DetailSection>

                {selected.status === 'pending' && (
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.approveBtn, { flex: 1 }]}
                      onPress={() => doUpdateStatus(selected.id, 'approved')}
                    >
                      <Ionicons name="checkmark" size={16} color={COLORS.white} />
                      <Text style={styles.actionText}>Aprovar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.rejectBtn, { flex: 1 }]}
                      onPress={() => doUpdateStatus(selected.id, 'rejected')}
                    >
                      <Ionicons name="close" size={16} color={COLORS.white} />
                      <Text style={styles.actionText}>Rejeitar</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={{ height: 20 }} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}:</Text>
      <Text style={styles.detailValue}>{value}</Text>
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.grey,
  },
  filterBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  filterTextActive: {
    color: COLORS.white,
    fontWeight: '700',
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
    fontSize: 16,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
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
    fontSize: 15,
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
    fontSize: 11,
    fontWeight: '700',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 4,
  },
  approveBtn: {
    backgroundColor: COLORS.success,
  },
  rejectBtn: {
    backgroundColor: COLORS.error,
  },
  actionText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  updatingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey,
    paddingBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
    flexWrap: 'wrap',
    gap: 4,
  },
  detailLabel: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 13,
    color: COLORS.textDark,
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
});
