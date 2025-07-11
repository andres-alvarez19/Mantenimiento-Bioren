import React from 'react';

const InvitePage: React.FC = () => (
  <div className="mx-auto min-h-screen bg-gradient-to-br from-bioren-blue to-bioren-blue-light flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div className="bg-white mx-auto rounded p-2 max-w-md w-full">
      <h2 className="mt-6 text-center text-2xl font-bold text-blue-900">¡Bienvenido a BIOREN!</h2>
      <p className="mt-4 text-center text-md text-blue-500">
        Has sido invitado a la plataforma. Revisa tu correo electrónico y haz clic en el enlace para activar tu cuenta y definir tu contraseña.
      </p>
      <p className="mt-4 text-center text-sm text-gray-600">
        Si no encuentras el correo, revisa la carpeta de spam o solicita un nuevo enlace a tu administrador.
      </p>
    </div>
  </div>
);

export default InvitePage; 