
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BellIcon, UserCircleIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { MOCK_NOTIFICATIONS } from '../../constants'; // Using mock notifications
import { AppNotification } from '../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es'; // Import Spanish locale

const Header: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Simulate unread notifications count
  const unreadNotificationsCount = MOCK_NOTIFICATIONS.filter(n => !n.isRead).length;

  if (!currentUser) return null; // Should not happen if routing is correct

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div>
            {/* Placeholder for breadcrumbs or page title if needed */}
            <h2 className="text-xl font-semibold text-gray-700">Bienvenido/a, {currentUser.name}</h2>
          </div>
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bioren-blue-light"
              >
                <span className="sr-only">Ver notificaciones</span>
                <BellIcon className="h-6 w-6" aria-hidden="true" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
              {notificationsOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 md:w-96 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none max-h-96 overflow-y-auto">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b">
                      <h3 className="text-sm font-medium text-gray-900">Notificaciones</h3>
                    </div>
                    {MOCK_NOTIFICATIONS.length === 0 ? (
                       <p className="text-sm text-gray-500 px-4 py-3">No hay notificaciones nuevas.</p>
                    ) : (
                      MOCK_NOTIFICATIONS.map((notification: AppNotification) => (
                        <a
                          key={notification.id}
                          href={notification.link || '#'}
                          className={`block px-4 py-3 text-sm ${notification.isRead ? 'text-gray-500' : 'text-gray-700 font-medium'} hover:bg-gray-100 border-b last:border-b-0`}
                          onClick={() => setNotificationsOpen(false)} // and mark as read ideally
                        >
                          <p className={`font-semibold ${notification.type === 'error' ? 'text-red-600' : notification.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'}`}>
                            {notification.message}
                          </p>
                          {notification.details && <p className="text-xs text-gray-500">{notification.details}</p>}
                          <p className="text-xs text-gray-400 mt-1">{format(new Date(notification.timestamp), 'MMM d, yyyy HH:mm', { locale: es })}</p>
                        </a>
                      ))
                    )}
                    <div className="px-4 py-2 border-t">
                        <button className="text-sm text-bioren-blue hover:underline w-full text-center">Ver todas las notificaciones</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bioren-blue-light"
              >
                <span className="sr-only">Abrir menú de usuario</span>
                <UserCircleIcon className="h-8 w-8 text-gray-500" />
                <span className="ml-2 hidden md:block text-gray-700">{currentUser.name} ({currentUser.role})</span>
              </button>
              {userMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <button
                    onClick={() => { logout(); setUserMenuOpen(false); }}
                    className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2 text-gray-500" />
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;