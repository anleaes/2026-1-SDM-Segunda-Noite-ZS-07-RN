import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator, Modal, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Footer from '../components/footer';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

interface Animal {
  id: number;
  name: string;
  breed_name: string;
  sex: string;
  photo?: string;
  characteristic: string[];
}

interface Caracteristica {
  id: number;
  name: string;
  is_positive: boolean;
}

export default function GerenciarAnimaisScreen({ navigation }: any) {
  const { token } = useAuth();

  const [expandedAnimalId, setExpandedAnimalId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [castradoStatus, setCastradoStatus] = useState<{ [key: number]: boolean }>({});
  const [adotadoStatus, setAdotadoStatus] = useState<{ [key: number]: boolean }>({});

  const [listaAnimais, setListaAnimais] = useState<Animal[]>([]);
  
  const [caracteristicasBD, setCaracteristicasBD] = useState<Caracteristica[]>([]);

  const [modalCharVisible, setModalCharVisible] = useState(false);
  const [animalSelecionado, setAnimalSelecionado] = useState<Animal | null>(null);
  const [charSelecionadas, setCharSelecionadas] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const headersConfig = {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        };
        
        const [respAnimais, respChars] = await Promise.all([
          fetch('http://127.0.0.1:8000/animais/', { headers: headersConfig }),
          fetch('http://127.0.0.1:8000/caracteristicas/', { headers: headersConfig })
        ]);

        if (!respAnimais.ok || !respChars.ok) {
            throw new Error("Erro ao buscar dados no servidor");
        }

        const dataAnimais = await respAnimais.json();
        const dataChars = await respChars.json();

        setCaracteristicasBD(dataChars);

        const animaisFormatados = dataAnimais.map((anim: any) => ({
          id: anim.id,
          name: anim.name,
          breed_name: anim.breed_name || 'Raça não definida',
          sex: anim.sex,
          photo: anim.photo,
          characteristic: anim.characteristic || [],
        }));
        
        const statusCastrado: { [key: number]: boolean } = {};
        const statusAdotado: { [key: number]: boolean } = {};
        
        dataAnimais.forEach((anim: any) => {
          statusCastrado[anim.id] = anim.sterilized;
          statusAdotado[anim.id] = anim.adopted;
        });

        setListaAnimais(animaisFormatados);
        setCastradoStatus(statusCastrado);
        setAdotadoStatus(statusAdotado);

      } catch (error) {
        Alert.alert("Erro", "Não foi possível buscar os dados do servidor.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const promessas = Object.keys(castradoStatus).map((idStr) => {
        const id = Number(idStr);
        return fetch(`http://127.0.0.1:8000/animais/${id}/`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sterilized: castradoStatus[id],
            adopted: adotadoStatus[id],
          })
        });
      });
      await Promise.all(promessas);
      Alert.alert("Sucesso", "Status dos animais atualizados com sucesso!");
    } catch (error) {
      Alert.alert("Erro", "Houve um problema ao salvar as alterações.");
    } finally {
      setLoading(false);
    }
  };

  const salvarCaracteristicas = async () => {
    if (!animalSelecionado) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/animais/${animalSelecionado.id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ characteristic: charSelecionadas })
      });

      if (res.ok) {
        Alert.alert("Sucesso", "Características atualizadas!");
        setListaAnimais(prev => prev.map(a => 
          a.id === animalSelecionado.id ? { ...a, characteristic: charSelecionadas } : a
        ));
        setModalCharVisible(false);
      } else {
        Alert.alert("Erro", "Não foi possível atualizar o animal.");
      }
    } catch (error) {
      Alert.alert("Erro", "Falha na comunicação com o servidor.");
    }
  };

  const toggleDropdown = (id: number) => setExpandedAnimalId(expandedAnimalId === id ? null : id);

  const abrirModalCaracteristicas = (animal: Animal) => {
    setAnimalSelecionado(animal);
    setCharSelecionadas([...animal.characteristic]); 
    setModalCharVisible(true);
  };

  const toggleCaracteristica = (charName: string) => {
    if (charSelecionadas.includes(charName)) {
      setCharSelecionadas(prev => prev.filter(c => c !== charName));
    } else {
      setCharSelecionadas(prev => [...prev, charName]);
    }
  };

  const renderConfigRow = (iconName: keyof typeof Ionicons.glyphMap, label: string, rightComponent: React.ReactNode) => (
    <View style={styles.configRow}>
      <View style={styles.configLeft}>
        <Ionicons name={iconName} size={20} color={COLORS.primary} />
        <Text style={styles.configLabel}>{label}</Text>
      </View>
      {rightComponent}
    </View>
  );

  const renderBadge = (charName: string, isSelectable = false, isSelected = true) => {
    const charObj = caracteristicasBD.find(c => c.name === charName);
    const isNegative = charObj ? !charObj.is_positive : false;
    
    if (isSelectable && !isSelected) {
      return (
        <View key={charName} style={[styles.badgeBase, styles.badgeInactive]}>
          <Text style={styles.badgeTextInactive}>{charName}</Text>
        </View>
      );
    }

    return (
      <View key={charName} style={[styles.badgeBase, isNegative ? styles.badgeRed : styles.badgeGreen]}>
        <Text style={isNegative ? styles.badgeTextRed : styles.badgeTextGreen}>{charName}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.customHeader}>
        <TouchableOpacity style={styles.headerLeft} onPress={() => navigation.navigate("Admin")}>
          <Ionicons name="arrow-back" size={26} color={COLORS.white} />
          <Text style={styles.headerTitle}>Gerenciar Animais</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Salvar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
        ) : (
          <View style={styles.listContainer}>
            {listaAnimais.map((animal) => {
              const isOpen = expandedAnimalId === animal.id;

              return (
                <View key={animal.id} style={styles.userCard}>
                  
                  <TouchableOpacity style={styles.userHeader} onPress={() => toggleDropdown(animal.id)}>
                    <View style={styles.userInfoRow}>
                      
                      {animal.photo ? (
                        <Image source={{ uri: animal.photo }} style={styles.animalPhoto} resizeMode="cover" />
                      ) : (
                        <View style={styles.noPhotoFallback}>
                          <Ionicons name="paw" size={30} color={COLORS.textLight} />
                        </View>
                      )}

                      <View style={styles.userInfoText}>
                        <Text style={styles.userName}>{animal.name}</Text>
                        <Text style={styles.userSub}>{animal.breed_name} • {animal.sex === 'M' ? 'Macho' : 'Fêmea'}</Text>
                      </View>
                    </View>
                    <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={20} color={COLORS.textLight} />
                  </TouchableOpacity>

                  {isOpen && (
                    <View style={styles.dropdownContent}>
                      <View style={styles.divider} />
                      
                      <View style={{ paddingHorizontal: 12, paddingBottom: 15, paddingTop: 5 }}>
                        
                        <View style={styles.badgeContainer}>
                          {animal.characteristic.length > 0 ? (
                            animal.characteristic.map(c => renderBadge(c))
                          ) : (
                            <Text style={{color: COLORS.textLight, fontSize: 12}}>Nenhuma característica atribuída.</Text>
                          )}
                        </View>

                        <View style={{ alignItems: 'center', marginTop: 15 }}>
                          <TouchableOpacity style={styles.btnModificar} onPress={() => abrirModalCaracteristicas(animal)}>
                            <Text style={styles.btnModificarText}>Modificar Características</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      
                      <View style={styles.divider} />
                      {renderConfigRow("medical-outline", castradoStatus[animal.id] ? "Animal Castrado" : "Não Castrado", 
                        <Switch 
                          value={castradoStatus[animal.id] || false} 
                          onValueChange={(val) => setCastradoStatus({ ...castradoStatus, [animal.id]: val })}
                          trackColor={{ false: COLORS.grey, true: COLORS.secondary }}
                          thumbColor={castradoStatus[animal.id] ? COLORS.primary : COLORS.background}
                        />
                      )}
                      {renderConfigRow("home-outline", adotadoStatus[animal.id] ? "Já Adotado" : "Disponível para Adoção", 
                        <Switch 
                          value={adotadoStatus[animal.id] || false} 
                          onValueChange={(val) => setAdotadoStatus({ ...adotadoStatus, [animal.id]: val })}
                          trackColor={{ false: COLORS.grey, true: COLORS.secondary }}
                          thumbColor={adotadoStatus[animal.id] ? COLORS.primary : COLORS.background}
                        />
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
        <Footer />
      </ScrollView>
      <Modal visible={modalCharVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Editar Características</Text>
            <Text style={styles.modalSubtitle}>Toque nas tags para adicionar ou remover de {animalSelecionado?.name}:</Text>

            <View style={styles.badgeContainer}>
              {caracteristicasBD.map(charObj => {
                const isSelected = charSelecionadas.includes(charObj.name);
                return (
                  <TouchableOpacity key={charObj.name} onPress={() => toggleCaracteristica(charObj.name)} activeOpacity={0.7}>
                    {renderBadge(charObj.name, true, isSelected)}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={[styles.modalActions, { marginTop: 30 }]}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setModalCharVisible(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={salvarCaracteristicas}>
                <Text style={styles.modalSaveText}>Salvar Tags</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  customHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.primary, paddingHorizontal: 15, paddingTop: 20, paddingBottom: 15, elevation: 4 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { color: COLORS.white, fontSize: 20, fontWeight: 'bold', marginLeft: 15 },
  saveButton: { backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  saveButtonText: { color: COLORS.white, fontSize: 14, fontWeight: 'bold' },
  content: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  mainTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.textDark, marginTop: 20, marginBottom: 15, textAlign: 'center' },
  listContainer: { paddingHorizontal: 15, marginVertical: 20 },
  userCard: { backgroundColor: COLORS.white, borderRadius: 10, padding: 14, marginBottom: 12, elevation: 2 },
  userHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  userInfoRow: { flexDirection: 'row', alignItems: 'center' },
  userInfoText: { marginLeft: 6 },
  userName: { fontSize: 16, fontWeight: 'bold', color: COLORS.textDark },
  userSub: { fontSize: 13, color: COLORS.textLight, marginTop: 2 },
  animalPhoto: { width: 65, height: 65, borderRadius: 12, marginRight: 12, backgroundColor: '#EAEAEA' },
  noPhotoFallback: { width: 65, height: 65, borderRadius: 12, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  dropdownContent: { marginTop: 10 },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginBottom: 8 },
  configRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#FDFDFD' },
  configLeft: { flexDirection: 'row', alignItems: 'center' },
  configLabel: { fontSize: 13, color: COLORS.textDark, marginLeft: 10, fontWeight: '500' },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 5,
    justifyContent: 'center'
  },
  badgeBase: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  badgeGreen: { backgroundColor: '#E0F3E5', borderColor: '#2E9F64' },
  badgeTextGreen: { color: '#2E9F64', fontWeight: 'bold', fontSize: 12 },
  badgeRed: { backgroundColor: '#FBE3E4', borderColor: '#E35D6A' },
  badgeTextRed: { color: '#E35D6A', fontWeight: 'bold', fontSize: 12 },
  badgeInactive: { backgroundColor: '#F5F5F5', borderColor: '#CCCCCC' },
  badgeTextInactive: { color: '#888888', fontWeight: 'bold', fontSize: 12 },
  btnModificar: {
    backgroundColor: '#D95D39',
    paddingVertical: 8,
    paddingHorizontal: 25,
    borderRadius: 20,
    marginTop: 5,
  },
  btnModificarText: { color: COLORS.white, fontWeight: 'bold', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', backgroundColor: COLORS.white, borderRadius: 12, padding: 20, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textDark },
  modalSubtitle: { fontSize: 14, color: COLORS.textLight, marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 15 },
  modalCancel: { padding: 10 },
  modalCancelText: { color: COLORS.textLight, fontWeight: 'bold' },
  modalSave: { backgroundColor: COLORS.primary, paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8 },
  modalSaveText: { color: COLORS.white, fontWeight: 'bold' },
});