import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function OrdersByClientChart({ data = [], isLoading }) {
  if (isLoading) {
    return <div className="h-80 bg-gray-200 animate-pulse rounded-lg" />;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Top Clientes</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="client_code" 
            angle={-45} 
            textAnchor="end" 
            height={80}
            tick={{ fontSize: 12 }}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
            formatter={(value, name) => {
              if (name === 'count') return [`${value}`, 'Encomendas'];
              if (name === 'total_quantity') return [`${value}`, 'Quantidade'];
              return [value, name];
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '16px' }} />
          <Bar 
            dataKey="count" 
            fill="#3b82f6" 
            name="Encomendas"
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="total_quantity" 
            fill="#1e40af" 
            name="Quantidade"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}