import React from 'react';
import { XCircleIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface AlertProps {
  type?: 'error' | 'success' | 'warning' | 'info';
  title: string;
  message?: string;
  onClose: () => void;
  className?: string;
}

const alertConfig = {
  error: {
    Icon: XCircleIcon,
    containerClasses: 'bg-red-50 p-4 rounded-md',
    iconColor: 'text-red-400',
    titleColor: 'text-red-800',
    messageColor: 'text-red-700',
    buttonClasses: 'bg-red-50 text-red-500 hover:bg-red-100 focus:ring-offset-red-50 focus:ring-red-600',
  },
  success: {
    Icon: CheckCircleIcon,
    containerClasses: 'bg-green-50 p-4 rounded-md',
    iconColor: 'text-green-400',
    titleColor: 'text-green-800',
    messageColor: 'text-green-700',
    buttonClasses: 'bg-green-50 text-green-500 hover:bg-green-100 focus:ring-offset-green-50 focus:ring-green-600',
  },
  warning: {
    Icon: ExclamationTriangleIcon,
    containerClasses: 'bg-yellow-50 p-4 rounded-md',
    iconColor: 'text-yellow-400',
    titleColor: 'text-yellow-800',
    messageColor: 'text-yellow-700',
    buttonClasses: 'bg-yellow-50 text-yellow-500 hover:bg-yellow-100 focus:ring-offset-yellow-50 focus:ring-yellow-600',
  },
  info: {
    Icon: InformationCircleIcon,
    containerClasses: 'bg-blue-50 p-4 rounded-md',
    iconColor: 'text-blue-400',
    titleColor: 'text-blue-800',
    messageColor: 'text-blue-700',
    buttonClasses: 'bg-blue-50 text-blue-500 hover:bg-blue-100 focus:ring-offset-blue-50 focus:ring-blue-600',
  },
};

const Alert: React.FC<AlertProps> = ({ type = 'info', title, message, onClose, className = '' }) => {
  const config = alertConfig[type];

  return (
    <div className={`${config.containerClasses} ${className}`} role="alert">
      <div className="flex">
        <div className="flex-shrink-0">
          <config.Icon className={`h-5 w-5 ${config.iconColor}`} aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className={`text-sm font-medium ${config.titleColor}`}>{title}</h3>
          {message && (
            <div className={`mt-2 text-sm ${config.messageColor}`}>
              <p>{message}</p>
            </div>
          )}
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              onClick={onClose}
              className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${config.buttonClasses}`}
            >
              <span className="sr-only">Dismiss</span>
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alert;