import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import TextInput from '../components/ui/TextInput';
import Alert from '../components/ui/Alert';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Token no proporcionado.');
      return;
    }
    fetch(`/api/invitations/validate?token=${token}`)
      .then(res => setValid(res.ok))
      .catch(() => setValid(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 12) {
      setError('La contraseña debe tener al menos 12 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        const data = await res.json();
        setError(data.message || 'No se pudo cambiar la contraseña.');
      }
    } catch {
      setError('Error de red o del servidor.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return <Alert type="error" title="Error" message="Token no proporcionado." onClose={() => {}} />;
  }
  if (!valid) {
    return <Alert type="error" title="Error" message="Token inválido o expirado." onClose={() => {}} />;
  }

  return (
    <div className="mx-auto min-h-screen bg-gradient-to-br from-bioren-blue to-bioren-blue-light flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="bg-white mx-auto rounded p-2 max-w-md w-full">
        <h2 className="mt-6 text-center text-2xl font-bold text-blue-900">Definir nueva contraseña</h2>
        <form className="space-y-6 mt-6" onSubmit={handleSubmit}>
          <TextInput
            label="Nueva contraseña"
            type="password"
            name="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <TextInput
            label="Confirmar contraseña"
            type="password"
            name="confirm"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" variant="primary" size="lg" disabled={loading}>
            {loading ? 'Cambiando...' : 'Cambiar contraseña'}
          </Button>
        </form>
        {success && <Alert type="success" title="¡Listo!" message="Contraseña cambiada. Redirigiendo..." onClose={() => setSuccess(false)} />}
        {error && <Alert type="error" title="Error" message={error} onClose={() => setError(null)} />}
      </div>
    </div>
  );
};

export default ResetPasswordPage; 