// contexts/AuthContext.tsx

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '../types';
// Ya no necesitamos MOCK_USERS aquí

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (userToLogin: User | null) => void; // <-- AHORA ESPERA UN OBJETO User
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const isAuthenticated = !!currentUser;

  // La función login ahora es mucho más simple y segura
  const login = (userToLogin: User | null) => {
    if (userToLogin) {
      setCurrentUser(userToLogin);
      localStorage.setItem('currentUser', JSON.stringify(userToLogin));
    } else {
      console.error("Intento de login con usuario nulo.");
      alert("Error al iniciar sesión: Usuario no encontrado.");
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
      <AuthContext.Provider value={{ currentUser, isAuthenticated, login, logout }}>
        {children}
      </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};