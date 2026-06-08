import React, { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://127.0.0.1:8000';

interface RegisterData {
  first_name: string;
  last_name: string;
  username: string;
  password: string;
  email: string;
}

interface AuthContextData {
  isAuthenticated: boolean;
  token: string | null;
  role: string | null;
  isAdmin: boolean;
  firstName: string | null;
  employeeId: number | null;
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [employeeId, setEmployeeId] = useState<number | null>(null);

  const login = async (username: string, password: string) => {
    const response = await fetch(`${BASE_URL}/contas/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) throw new Error('Usuário ou senha inválidos');

    const data = await response.json();
    setToken(data.token);
    setRole(data.role);
    setFirstName(data.first_name ?? data.username ?? null);

    setToken(data.token);
    setEmployeeId(data.register); // Guarda o ID do funcionário logado
    
    // Salva no AsyncStorage para não deslogar ao fechar o app
    await AsyncStorage.setItem('userToken', data.token);
    await AsyncStorage.setItem('employeeId', String(data.register));
  };

  const logout = () => { setToken(null); setFirstName(null); setEmployeeId(null); };

  const register = async (data: RegisterData) => {
    const response = await fetch('http://127.0.0.1:8000/contas/novo-usuario/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(JSON.stringify(err.errors));
    }

    const result = await response.json();
    setToken(result.token);
    setRole(result.role);
    setFirstName(result.first_name ?? result.username ?? null);
  };

  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider value={{ isAuthenticated: token !== null, token, role, isAdmin, firstName, employeeId, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
