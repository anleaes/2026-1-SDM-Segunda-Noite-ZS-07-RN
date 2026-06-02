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
  onRegister: () => void;
}

export default function LoginScreen({ onRegister }: Props) {
  const { login } = useAuth();
  const { height } = useWindowDimensions();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const isSmall = height < 700;

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Preencha o usuário e a senha.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await login(username.trim(), password);
    } catch (e: any) {
      setError(e.message ?? 'Usuário ou senha inválidos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, isSmall && styles.cardSmall]}>
          <View style={[styles.logoWrapper, isSmall && styles.logoWrapperSmall]}>
            <Ionicons name="paw" size={isSmall ? 36 : 48} color={COLORS.primary} />
          </View>
          <Text style={[styles.title, isSmall && styles.titleSmall]}>Bem-vindo!</Text>
          <Text style={styles.subtitle}>
            Use seu <Text style={styles.subtitleBold}>usuário</Text> e{' '}
            <Text style={styles.subtitleBold}>senha</Text> para entrar
          </Text>

          {!!error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color={COLORS.error ?? '#d32f2f'} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
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

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.registerButton} onPress={onRegister}>
            <Text style={styles.registerText}>
              Não tem uma conta?{' '}
              <Text style={styles.registerLink}>Registre-se</Text>
            </Text>
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
    padding: 20,
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoWrapperSmall: {
    marginBottom: 10,
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
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  subtitleBold: {
    fontWeight: '600',
    color: COLORS.dark,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.grey,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: COLORS.background,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 46,
    color: COLORS.dark,
    fontSize: 15,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    alignItems: 'center',
    marginTop: 18,
  },
  registerText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  registerLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
