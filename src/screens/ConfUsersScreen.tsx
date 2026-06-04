import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator, Modal, TextInput} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Footer from '../components/footer';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

interface Usuario {
  id: number;
  name: string;
  role: string;
}

export default function GerenciarUsuariosScreen({ navigation }: any) {
  const { token, isAdmin } = useAuth();

  const [abaAtiva, setAbaAtiva] = useState<'clientes' | 'funcionarios'>('clientes');
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [localStatus, setlocalStatus] = useState<{ [key: number]: boolean }>({});
  const [enderecoStatus, setEnderecoStatus] = useState<{ [key: number]: boolean }>({});
  const [checkedStatus, setCheckedStatus] = useState<{ [key: number]: boolean }>({});
  const [ativoStatus, setAtivoStatus] = useState<{ [key: number]: boolean }>({ 1: true, 2: true });

  const [modalCargoVisible, setModalCargoVisible] = useState(false);
  const [modalSenhaVisible, setModalSenhaVisible] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null);

  const [novoCargo, setNovoCargo] = useState('');
  const [novoNivel, setNovoNivel] = useState<'admin' | 'moderador'>('moderador');
  const [novaSenha, setNovaSenha] = useState('');

  const listaClientes: Usuario[] = [
    { id: 1, name: 'Fulano da Silva', role: 'Adotante comum (User)' },
    { id: 2, name: 'Maria Oliveira', role: 'Adotante comum (User)' },
    { id: 3, name: 'João Pedro Santos', role: 'Adotante comum (User)' },
  ];

  const [listaFuncionarios, setListaFuncionarios] = useState<Usuario[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/funcionarios/', {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!res.ok) throw new Error("Sem permissão ou erro no servidor");

        const data = await res.json();

        console.log('funcionarios resgatados', data)
        
        const funcionariosFormatados = data.map((emp: any) => ({
          id: emp.register,
          name: `${emp.first_name} ${emp.last_name}`,
          role: emp.position,
        }));
        
        const statusIniciais: { [key: number]: boolean } = {};
        data.forEach((emp: any) => {
            statusIniciais[emp.register] = emp.is_active;
        });

        setListaFuncionarios(funcionariosFormatados);
        setAtivoStatus(statusIniciais);

      } catch (error) {
        console.error(error);
        Alert.alert("Erro", "Não foi possível buscar os funcionários.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const promessas = Object.keys(ativoStatus).map((idStr) => {
        const id = Number(idStr);
        return fetch(`http://127.0.0.1:8000/funcionarios/${id}/`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            is_active: ativoStatus[id]
          })
        });
      });

      await Promise.all(promessas);

      navigation.navigate("Admin")
    } catch (error) {
      Alert.alert("Erro", "Houve um problema ao salvar as alterações.");
    } finally {
      setLoading(false);
    }
  };

  const abrirModalCargo = (user: Usuario) => {
    setUsuarioSelecionado(user);
    setNovoCargo(user.role);
    setNovoNivel('moderador');
    setModalCargoVisible(true);
  };

  const salvarNovoCargo = async () => {
    if (!usuarioSelecionado) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/funcionarios/${usuarioSelecionado.id}/alterar_cargo/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ position: novoCargo, role: novoNivel })
      });
      if (res.ok) {
        Alert.alert("Sucesso", "Cargo atualizado!");
        setModalCargoVisible(false);
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar o cargo.");
    }
  };

  const abrirModalSenha = (user: Usuario) => {
    if (!isAdmin) {
      Alert.alert("Acesso Negado", "Apenas Administradores podem alterar senhas.");
      return;
    }
    setUsuarioSelecionado(user);
    setNovaSenha('');
    setModalSenhaVisible(true);
  };

  const salvarNovaSenha = async () => {
    if (!usuarioSelecionado || !novaSenha) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/funcionarios/${usuarioSelecionado.id}/alterar_senha/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ new_password: novaSenha })
      });
      if (res.ok) {
        Alert.alert("Sucesso", "Senha atualizada!");
        setModalSenhaVisible(false);
      } else {
        Alert.alert("Erro", "Sem permissão para alterar senha.");
      }
    } catch (error) {
      Alert.alert("Erro", "Falha na comunicação com o servidor.");
    }
  };

  const toggleDropdown = (id: number) => {
    setExpandedUserId(expandedUserId === id ? null : id);
  };

  const mudarAba = (aba: 'clientes' | 'funcionarios') => {
    setAbaAtiva(aba);
    setExpandedUserId(null);
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

  return (
    <View style={styles.container}>
      <View style={styles.customHeader}>
        <TouchableOpacity style={styles.headerLeft} onPress={() => navigation.navigate("Admin")}>
          <Ionicons name="arrow-back" size={26} color={COLORS.white} />
          <Text style={styles.headerTitle}>Gerenciar Usuários</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Salvar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsHorizontalScrollIndicator={false}
      >
        <View style={{ flex: 1 }}>
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tabButton, abaAtiva === 'clientes' && styles.tabButtonActive]}
              onPress={() => mudarAba('clientes')}
            >
              <Text style={[styles.tabText, abaAtiva === 'clientes' && styles.tabTextActive]}>Clientes</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.tabButton, abaAtiva === 'funcionarios' && styles.tabButtonActive]}
              onPress={() => mudarAba('funcionarios')}
            >
              <Text style={[styles.tabText, abaAtiva === 'funcionarios' && styles.tabTextActive]}>Funcionários</Text>
            </TouchableOpacity>
          </View>

          {abaAtiva === 'clientes' && (
            <View style={styles.listContainer}>
              {listaClientes.map((user) => {
                const isOpen = expandedUserId === user.id;
                return (
                  <View key={user.id} style={styles.userCard}>
                    <TouchableOpacity style={styles.userHeader} onPress={() => toggleDropdown(user.id)}>
                      <View style={styles.userInfoRow}>
                        <Ionicons name="person-circle-outline" size={36} color={COLORS.textDark} />
                        <View style={styles.userInfoText}>
                          <Text style={styles.userName}>{user.name}</Text>
                          <Text style={styles.userSub}>{user.role}</Text>
                        </View>
                      </View>
                      <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={20} color={COLORS.textLight} />
                    </TouchableOpacity>

                    {isOpen && (
                      <View style={styles.dropdownContent}>
                        <View style={styles.divider} />
                        
                        {renderConfigRow(
                          "home-outline", 
                          localStatus[user.id] ? "Local Seguro" : "Local Não Verificado", 
                          <Switch 
                            value={localStatus[user.id] || false} 
                            onValueChange={(val) => setlocalStatus({ ...localStatus, [user.id]: val })}
                            trackColor={{ false: COLORS.grey, true: COLORS.secondary }}
                            thumbColor={localStatus[user.id] ? COLORS.primary : COLORS.background}
                          />
                        )}

                        {renderConfigRow(
                          "location-outline", 
                          enderecoStatus[user.id] ? "Endereço Comprovado" : "Endereço Não Verificado", 
                          <Switch 
                            value={enderecoStatus[user.id] || false} 
                            onValueChange={(val) => setEnderecoStatus({ ...enderecoStatus, [user.id]: val })}
                            trackColor={{ false: COLORS.grey, true: COLORS.secondary }}
                            thumbColor={enderecoStatus[user.id] ? COLORS.primary : COLORS.background}
                          />
                        )}

                        {renderConfigRow(
                          "checkmark-circle-outline", 
                          checkedStatus[user.id] ? "Dados Verificados" : "Dados Pendentes", 
                          <Switch 
                            value={checkedStatus[user.id] || false} 
                            onValueChange={(val) => setCheckedStatus({ ...checkedStatus, [user.id]: val })}
                            trackColor={{ false: COLORS.grey, true: COLORS.secondary }}
                            thumbColor={checkedStatus[user.id] ? COLORS.primary : COLORS.background}
                          />
                        )}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {loading && abaAtiva === 'funcionarios' ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
          ) : (
            <>
              {abaAtiva === 'funcionarios' && (
                <View style={styles.listContainer}>
                  {listaFuncionarios.map((user) => {
                    const isOpen = expandedUserId === user.id;
                    return (
                      <View key={user.id} style={styles.userCard}>
                        <TouchableOpacity style={styles.userHeader} onPress={() => toggleDropdown(user.id)}>
                          <View style={styles.userInfoRow}>
                            <Ionicons name="briefcase-outline" size={32} color={COLORS.textDark} style={{ marginLeft: 2 }} />
                            <View style={styles.userInfoText}>
                              <Text style={styles.userName}>{user.name}</Text>
                              <Text style={styles.userSub}>{user.role}</Text>
                            </View>
                          </View>
                          <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={20} color={COLORS.textLight} />
                        </TouchableOpacity>

                        {isOpen && (
                          <View style={styles.dropdownContent}>
                            <View style={styles.divider} />

                            {renderConfigRow("shield-outline", "Alterar Cargo / Nível", 
                                <TouchableOpacity style={styles.inlineButton} onPress={() => abrirModalCargo(user)}>
                                    <Text style={styles.inlineButtonText}>Alterar</Text>
                                </TouchableOpacity>
                            )}

                            {renderConfigRow("power-outline", ativoStatus[user.id] ? "Ativo" : "Inativo", 
                                <Switch 
                                value={ativoStatus[user.id] ?? false} 
                                onValueChange={(val) => setAtivoStatus({ ...ativoStatus, [user.id]: val })}
                                trackColor={{ false: COLORS.grey, true: COLORS.secondary }}
                                thumbColor={ativoStatus[user.id] ? COLORS.primary : COLORS.background}
                                />
                            )}

                            {renderConfigRow("lock-closed-outline", "Alterar Senha", 
                                <TouchableOpacity 
                                style={[styles.inlineButton, !isAdmin && { opacity: 0.5 }]} 
                                onPress={() => abrirModalSenha(user)}
                                >
                                    <Text style={styles.inlineButtonText}>Resetar</Text>
                                </TouchableOpacity>
                            )}
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </>
          )}
        </View>

        <Footer />
      </ScrollView>
      <Modal visible={modalCargoVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Alterar Função</Text>
            <Text style={styles.modalSubtitle}>Utilizador: {usuarioSelecionado?.name}</Text>

            <Text style={styles.inputLabel}>Nome do Cargo (ex: Veterinário)</Text>
            <TextInput style={styles.input} value={novoCargo} onChangeText={setNovoCargo} />

            <Text style={styles.inputLabel}>Nível de Acesso no Sistema</Text>
            <View style={styles.roleSelector}>
              <TouchableOpacity 
                style={[styles.roleBtn, novoNivel === 'moderador' && styles.roleBtnActive]} 
                onPress={() => setNovoNivel('moderador')}
              >
                <Text style={novoNivel === 'moderador' ? styles.roleTextActive : styles.roleText}>Moderador</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.roleBtn, novoNivel === 'admin' && styles.roleBtnActive]} 
                onPress={() => setNovoNivel('admin')}
              >
                <Text style={novoNivel === 'admin' ? styles.roleTextActive : styles.roleText}>Administrador</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setModalCargoVisible(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={salvarNovoCargo}>
                <Text style={styles.modalSaveText}>Salvar Cargo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal visible={modalSenhaVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Resetar Senha</Text>
            <Text style={styles.modalSubtitle}>Defina uma nova senha para {usuarioSelecionado?.name}</Text>

            <TextInput 
              style={styles.input} 
              placeholder="Digite a nova senha" 
              secureTextEntry={true} 
              value={novaSenha} 
              onChangeText={setNovaSenha} 
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setModalSenhaVisible(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={salvarNovaSenha}>
                <Text style={styles.modalSaveText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 15,
    elevation: 4,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  saveButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginTop: 20,
    marginBottom: 15,
    textAlign: 'center', 
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginBottom: 15,
    marginTop: 15,
    backgroundColor: '#EAE5D8',
    borderRadius: 10,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: COLORS.white,
    elevation: 2,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  
  userCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfoText: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  userSub: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  
  dropdownContent: {
    marginTop: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 8,
  },
  configRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FDFDFD',
  },
  configLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  configLabel: {
    fontSize: 13,
    color: COLORS.textDark,
    marginLeft: 10,
    fontWeight: '500',
  },
  inlineButton: {
    backgroundColor: '#FFF0EB',
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  inlineButtonText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Fundo escuro transparente
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.grey,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  roleSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  roleBtn: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.grey,
    borderRadius: 8,
    alignItems: 'center',
  },
  roleBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  roleText: {
    color: COLORS.textLight,
    fontWeight: 'bold',
  },
  roleTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 15,
  },
  modalCancel: {
    padding: 10,
  },
  modalCancelText: {
    color: COLORS.textLight,
    fontWeight: 'bold',
  },
  modalSave: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  modalSaveText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
});