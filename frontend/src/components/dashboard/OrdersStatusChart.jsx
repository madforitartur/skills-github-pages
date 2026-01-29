import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const STATUS_COLORS = {
  completed: '#10b981',
  in_production: '#fbbf24',
  delayed: '#ef4444',
  at_risk: '#f97316',
  waiting: '#6b7280'
};

const STATUS_LABELS = {
  completed: 'Concluída',
  in_production: 'Em Produção',
  delayed: 'Atrasada',
  at_risk: 'Em Risco',
  waiting: 'À Espera'
};

export default function OrdersStatusChart({ data = [], isLoading }) {
  if (isLoading) {
    return <div className="h-80 bg-gray-200 animate-pulse rounded-lg" />;
  }

  const processedData = data.map(item => ({
    ...item,
    name: STATUS_LABELS[item.status] || item.status
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Encomendas por Estado</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={processedData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="count"
          >
            {processedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={STATUS_COLORS[entry.status] || '#6b7280'}
                stroke="#ffffff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`${value} encomendas`, 'Total']}
            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            wrapperStyle={{ paddingTop: '16px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}