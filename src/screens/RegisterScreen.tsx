import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

interface Props {
  onBack: () => void;
}

function parseApiError(raw: string): string {
  try {
    const obj = JSON.parse(raw);
    const messages: string[] = [];
    for (const key of Object.keys(obj)) {
      const val = Array.isArray(obj[key]) ? obj[key].join(' ') : String(obj[key]);
      const label: Record<string, string> = {
        username: 'Usuário',
        email: 'E-mail',
        password: 'Senha',
        first_name: 'Nome',
        last_name: 'Sobrenome',
      };
      messages.push(`${label[key] ?? key}: ${val}`);
    }
    return messages.join('\n');
  } catch {
    return raw;
  }
}

export default function RegisterScreen({ onBack }: Props) {
  const { register } = useAuth();
  const { height } = useWindowDimensions();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isSmall = height < 700;

  const handleRegister = async () => {
    if (!firstName.trim() || !lastName.trim() || !username.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Preencha todos os campos.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await register({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
      });
    } catch (e: any) {
      setError(parseApiError(e.message ?? 'Erro ao criar conta.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={[styles.card, isSmall && styles.cardSmall]}>
          <View style={[styles.logoWrapper, isSmall && styles.logoWrapperSmall]}>
            <Ionicons name="paw" size={isSmall ? 36 : 48} color={COLORS.primary} />
          </View>
          <Text style={[styles.title, isSmall && styles.titleSmall]}>Criar conta</Text>
          <Text style={styles.subtitle}>Preencha os dados para se registrar</Text>

          {!!error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color="#d32f2f" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nome"
              placeholderTextColor={COLORS.grey}
              value={firstName}
              onChangeText={v => { setFirstName(v); setError(''); }}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Sobrenome"
              placeholderTextColor={COLORS.grey}
              value={lastName}
              onChangeText={v => { setLastName(v); setError(''); }}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="at-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Usuário"
              placeholderTextColor={COLORS.grey}
              autoCapitalize="none"
              value={username}
              onChangeText={v => { setUsername(v); setError(''); }}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="E-mail"
              placeholderTextColor={COLORS.grey}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={v => { setEmail(v); setError(''); }}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor={COLORS.grey}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={v => { setPassword(v); setError(''); }}
            />
            <TouchableOpacity onPress={() => setShowPassword(v => !v)}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={COLORS.textLight}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirmar senha"
              placeholderTextColor={COLORS.grey}
              secureTextEntry={!showPassword}
              value={confirmPassword}
              onChangeText={v => { setConfirmPassword(v); setError(''); }}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>Registrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="arrow-back-outline" size={16} color={COLORS.primary} />
            <Text style={styles.backText}>Voltar para o login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  cardSmall: {
    padding: 18,
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoWrapperSmall: {
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.dark,
    textAlign: 'center',
  },
  titleSmall: {
    fontSize: 20,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fdecea',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    gap: 6,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#d32f2f',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.grey,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    backgroundColor: COLORS.background,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    color: COLORS.dark,
    fontSize: 15,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 4,
  },
  backText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
});
