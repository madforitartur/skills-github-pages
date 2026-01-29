import React from 'react';

const colorMap = {
  green: {
    border: 'border-green-500',
    icon: 'text-green-600'
  },
  red: {
    border: 'border-red-500',
    icon: 'text-red-600'
  },
  yellow: {
    border: 'border-yellow-500',
    icon: 'text-yellow-600'
  },
  blue: {
    border: 'border-blue-500',
    icon: 'text-blue-600'
  },
  indigo: {
    border: 'border-indigo-500',
    icon: 'text-indigo-600'
  },
  purple: {
    border: 'border-purple-500',
    icon: 'text-purple-600'
  },
  orange: {
    border: 'border-orange-500',
    icon: 'text-orange-600'
  }
};

export default function KPICard({ 
  icon, 
  label, 
  value, 
  description, 
  trend, 
  color = 'blue', 
  onClick 
}) {
  const colors = colorMap[color] || colorMap.blue;
  
  return (
    <div 
      className={`
        bg-white rounded-lg shadow p-6
        border-l-4 ${colors.border}
        hover:shadow-lg transition-shadow cursor-pointer
        ${onClick ? 'hover:scale-105 transform transition-transform' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold mt-2 text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {description && (
            <p className="text-gray-500 text-xs mt-1">{description}</p>
          )}
        </div>
        <div className={`text-3xl ${colors.icon} flex-shrink-0 ml-4`}>
          {icon}
        </div>
      </div>
      {trend !== undefined && (
        <div className={`mt-4 text-sm font-medium flex items-center ${
          trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'
        }`}>
          <span className="mr-1">{trend > 0 ? '↑' : trend < 0 ? '↓' : '→'}</span>
          {Math.abs(trend)}% vs período anterior
        </div>
      )}
    </div>
  );
}