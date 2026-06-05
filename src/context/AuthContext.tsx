import React, { createContext, useContext, useState } from 'react';

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
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);

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
  };

  const logout = () => { setToken(null); setFirstName(null); };

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
    <AuthContext.Provider value={{ isAuthenticated: token !== null, token, role, isAdmin, firstName, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
