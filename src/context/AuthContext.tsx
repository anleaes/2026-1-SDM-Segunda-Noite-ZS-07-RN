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
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

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
  };

  const logout = () => setToken(null);

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
  };

  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider value={{ isAuthenticated: token !== null, token, role, isAdmin, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
