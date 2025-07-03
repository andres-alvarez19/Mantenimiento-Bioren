import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { APP_NAME } from '../constants';
import { APP_NAME } from '../constants';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import TextInput from '../components/ui/TextInput';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); 
    if (email && password) {
      try {
        await login({ email, password });
        navigate('/', { replace: true });
      } catch (err: any) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Ha ocurrido un error inesperado durante el inicio de sesión.");
        }
      }
    } else {
      setError("Por favor, introduce el correo electrónico y la contraseña.");
    }
  };

  return (
    <div className="mx-auto min-h-screen bg-gradient-to-br from-bioren-blue to-bioren-blue-light flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="bg-white mx-auto rounded p-2">

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <img
            className="mx-auto h-40 w-auto"
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXDde6T8GvmnO4I3U1RvjDADdL0yLwfBXXXw&s"
            alt="BIOREN Logo"
          />
        </div>

        <div className="rounded m-3 p-2 bg-gray-200">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-blue-900">
            {APP_NAME}
          </h2>
          <p className="mt-2 text-center text-md text-blue-500">
            Inicie sesión para gestionar los equipos científicos
          </p>

        <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-md">
          <div className=" py-8 px-4 sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleLogin}>

              <TextInput
                label="Dirección de correo electrónico"
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                containerClassName=""
              />

              <TextInput
                label="Contraseña"
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                containerClassName=""
              />

              <div>
                <Button type="submit" className="w-full" variant="primary" size="lg">
                  Iniciar sesión
                </Button>
              </div>
            </form>
            <div className="mt-6 text-center text-xs text-gray-500 mb-4">
              <p>
                Ingrese su correo institucional y contraseña para acceder.
              </p>
            </div>
            {error && (
                <Alert
                  type="error"
                  title="Error de inicio de sesión"
                  message={error}
                  onClose={() => setError(null)}
                />
              )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;