// pages/LoginPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { APP_NAME } from '../constants';
import Button from '../components/ui/Button';
import { User } from '../types';

const LoginPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/users');
        if (!response.ok) {
          throw new Error("No se pudo cargar la lista de usuarios");
        }
        const data: User[] = await response.json();
        setUsers(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUsers();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserId) {
      login(selectedUserId);
    } else {
      alert("Por favor, seleccione un usuario para iniciar sesión.");
    }
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-bioren-blue to-bioren-blue-light flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        {/* --- INICIO DEL CÓDIGO REEMPLAZADO --- */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <img
              className="mx-auto h-40 w-auto" // Hice el logo un poco más grande
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXDde6T8GvmnO4I3U1RvjDADdL0yLwfBXXXw&s" // Tu nueva URL
              alt="BIOREN Logo"
              style={{ borderRadius: '8px' }} // Añadimos el borde redondeado
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            {APP_NAME}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Inicie sesión para gestionar los equipos científicos
          </p>
        </div>
        {/* --- FIN DEL CÓDIGO REEMPLAZADO --- */}

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label htmlFor="user" className="block text-sm font-medium text-gray-700">
                  Seleccionar Usuario (Inicio de Sesión Simulado)
                </label>
                <div className="mt-1">
                  <select
                      id="user"
                      name="user"
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      required
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-bioren-blue-light focus:border-bioren-blue-light sm:text-sm"
                  >
                    <option value="" disabled>-- Seleccione un usuario --</option>
                    {users.map((user: User) => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.role})
                        </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Button type="submit" className="w-full" variant="primary" size="lg">
                  Iniciar Sesión
                </Button>
              </div>
            </form>
            <p className="mt-6 text-center text-xs text-gray-500">
              Este es un inicio de sesión simulado. No se realiza autenticación real.
            </p>
          </div>
        </div>
      </div>
  );
};

export default LoginPage;