
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { MOCK_USERS } from '../constants';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (userId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const isAuthenticated = !!currentUser;

  const login = (userId: string) => {
    const userToLogin = MOCK_USERS.find(user => user.id === userId);
    if (userToLogin) {
      setCurrentUser(userToLogin);
      localStorage.setItem('currentUser', JSON.stringify(userToLogin));
    } else {
      // Handle error: user not found
      console.error("User not found for login:", userId);
      alert("Error al iniciar sesión: Usuario no encontrado.");
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };
  
  useEffect(() => {
    if (!currentUser && MOCK_USERS.length > 0) {
       // login(MOCK_USERS[1].id); // Default to BIOREN_ADMIN for dev
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


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