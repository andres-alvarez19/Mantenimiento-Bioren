
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MOCK_USERS, APP_NAME } from '../constants';
import Button from '../components/ui/Button';
import { User } from '../types';

const LoginPage: React.FC = () => {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

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
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
            className="mx-auto h-16 w-auto"
            src="https://picsum.photos/seed/biorenlogo/100/100" // Placeholder logo
            alt="BIOREN Logo"
        />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          {APP_NAME}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-300">
          Inicie sesión para gestionar los equipos científicos
        </p>
      </div>

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
                  {MOCK_USERS.map((user: User) => (
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
            Este es un inicio de sesión simulado para fines de demostración. No se realiza autenticación real.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;