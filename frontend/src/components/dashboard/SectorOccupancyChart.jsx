import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function SectorOccupancyChart({ data = [], isLoading }) {
  if (isLoading) {
    return <div className="h-96 bg-gray-200 animate-pulse rounded-lg" />;
  }

  const processedData = data.map(item => ({
    ...item,
    sector_name: item.sector_name || item.sector_code || 'N/A'
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Ocupação por Sector</h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={processedData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis 
            dataKey="sector_name" 
            type="category" 
            width={140}
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
            formatter={(value, name) => {
              if (name === 'quantity_in_progress') return [`${value}`, 'Em Processamento'];
              if (name === 'orders_waiting') return [`${value}`, 'À Espera'];
              return [value, name];
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '16px' }} />
          <Bar 
            dataKey="quantity_in_progress" 
            fill="#fbbf24" 
            name="Em Processamento"
            radius={[0, 4, 4, 0]}
          />
          <Bar 
            dataKey="orders_waiting" 
            fill="#ef4444" 
            name="À Espera"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}