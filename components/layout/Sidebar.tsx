import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { APP_NAME, NAVIGATION_ITEMS, QUICK_ISSUE_REPORT_PATH } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldExclamationIcon } from '@heroicons/react/24/solid';
import Button from '../ui/Button';

const Sidebar: React.FC = () => {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) return null;
  const allowedNavItems = NAVIGATION_ITEMS.filter(item => {
     return item.allowedRoles.includes(currentUser.role)
    });

  return (
    <div className="w-64 bg-bioren-blue text-white flex flex-col min-h-screen">
      <div className="p-4 border-b border-bioren-blue-light">
        <h1 className="text-xl font-bold text-center text-bioren-gold">{APP_NAME}</h1>
      </div>
      <nav className="flex-grow p-4 space-y-2">
        {allowedNavItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-bioren-blue-light transition-colors
              ${isActive ? 'bg-bioren-blue-light text-bioren-gold' : 'text-gray-300 hover:text-white'}`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-bioren-blue-light">
        <Button 
            variant="secondary" 
            className="w-full bg-bioren-gold text-bioren-blue hover:bg-bioren-gold-hover" // Updated text color to bioren-blue
            onClick={() => window.location.hash = QUICK_ISSUE_REPORT_PATH}
            leftIcon={<ShieldExclamationIcon className="w-5 h-5" />}
        >
            Reportar Incidencia
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;