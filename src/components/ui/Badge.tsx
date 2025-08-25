
import React from 'react';

interface BadgeProps {
  text: string;
  color?: 'green' | 'yellow' | 'red' | 'blue' | 'gray' | 'orange';
  size?: 'sm' | 'md';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ text, color = 'gray', size = 'md', className = '' }) => {
  const colorClasses = {
    green: 'bg-status-ok/20 text-status-ok ring-status-ok/30',
    yellow: 'bg-status-warning/20 text-status-warning ring-status-warning/30',
    red: 'bg-status-overdue/20 text-status-overdue ring-status-overdue/30',
    blue: 'bg-bioren-blue-light/20 text-bioren-blue-light ring-bioren-blue-light/30',
    gray: 'bg-gray-400/20 text-gray-700 ring-gray-400/30',
    orange: 'bg-criticality-medium/20 text-criticality-medium ring-criticality-medium/30',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md font-medium ring-1 ring-inset ${colorClasses[color]} ${sizeClasses[size]} ${className}`}
    >
      {text}
    </span>
  );
};

export default Badge;