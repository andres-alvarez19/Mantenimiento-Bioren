import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import TextInput from '../../../components/ui/TextInput';
import Alert from '../../../components/ui/Alert';
import { resetPassword } from '../../../lib/api/services/authService';
import { validateInvitation } from '../../../lib/api/services/invitationService';

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
    validateInvitation(token)
      .then(() => setValid(true))
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
      await resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'No se pudo cambiar la contraseña.');
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
