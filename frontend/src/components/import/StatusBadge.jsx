import React from 'react';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800'
};

export default function StatusBadge({ status }) {
  const classes = statusColors[status] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${classes}`}>
      {status === 'completed' && '✓ Concluído'}
      {status === 'processing' && '⏳ Em progresso'}
      {status === 'pending' && '⏱ Pendente'}
      {status === 'failed' && '✗ Erro'}
      {!['completed', 'processing', 'pending', 'failed'].includes(status) && (status || '—')}
    </span>
  );
}
