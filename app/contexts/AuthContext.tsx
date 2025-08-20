import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../../types';
import { login as apiLogin } from '../../lib/api/services/authService';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (credentials: { email: string, password: string }) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const isAuthenticated = !!currentUser;

  const login = async (credentials: { email: string, password: string }) => {
    try {
      const { token, user } = await apiLogin(credentials);
      localStorage.setItem('token', token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      setCurrentUser(user);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  };
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('currentUser');
    if (!token || !user) {
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
      <AuthContext.Provider value={{ currentUser, isAuthenticated, login, logout }}>
        {children}
      </AuthContext.Provider>
  );
};

