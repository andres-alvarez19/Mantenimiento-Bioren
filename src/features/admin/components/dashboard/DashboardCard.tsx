
import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  colorClass?: string; // e.g., 'bg-blue-500', 'text-green-500'
  footerText?: string;
  onClick?: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, colorClass = 'bg-bioren-blue', footerText, onClick }) => {
  return (
    <div 
      className={`bg-white shadow-lg rounded-lg p-6 flex items-center space-x-4 ${onClick ? 'cursor-pointer hover:shadow-xl transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className={`p-3 rounded-full ${colorClass} text-white`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-semibold text-gray-800">{value}</p>
        {footerText && <p className="text-xs text-gray-400 mt-1">{footerText}</p>}
      </div>
    </div>
  );
};

export default DashboardCard;
