import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import TextInput from '@/components/ui/TextInput';
import Alert from '@/components/ui/Alert';
import { requestPasswordReset } from '@/lib/api/services/authService';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'No se pudo enviar el correo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto min-h-screen bg-gradient-to-br from-bioren-blue to-bioren-blue-light flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="bg-white mx-auto rounded p-2 max-w-md w-full">
        <h2 className="mt-6 text-center text-2xl font-bold text-blue-900">Recuperar contraseña</h2>
        <p className="mt-2 text-center text-md text-blue-500">Ingresa tu correo institucional y te enviaremos un enlace para restablecer tu contraseña.</p>
        <form className="space-y-6 mt-6" onSubmit={handleSubmit}>
          <TextInput
            label="Correo electrónico"
            type="email"
            name="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" variant="primary" size="lg" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar enlace'}
          </Button>
        </form>
        {success && <Alert type="success" title="¡Listo!" message="Si el correo existe, se ha enviado un enlace para restablecer la contraseña." onClose={() => setSuccess(false)} />}
        {error && <Alert type="error" title="Error" message={error} onClose={() => setError(null)} />}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
