import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';

import StatusBadge from './StatusBadge';
import api from '../../services/api';

const PAGE_SIZE = 10;

function formatDatePt(value) {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleString('pt-PT', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function ImportHistoryTable({ refreshKey = 0 }) {
  const [imports, setImports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const offset = (page - 1) * PAGE_SIZE;
      const response = await api.get(`/import/history?limit=${PAGE_SIZE}&offset=${offset}`);

      const list = response?.data?.imports || response?.data || [];
      setImports(Array.isArray(list) ? list : []);

      const total = response?.data?.total;
      if (typeof total === 'number') {
        setHasNextPage(offset + PAGE_SIZE < total);
      } else {
        setHasNextPage((Array.isArray(list) ? list.length : 0) === PAGE_SIZE);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Erro ao carregar histórico:', error);
      setImports([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, refreshKey]);

  const sortedImports = useMemo(() => {
    return [...imports].sort((a, b) => {
      const da = new Date(a?.createdAt || a?.date || 0).getTime();
      const db = new Date(b?.createdAt || b?.date || 0).getTime();
      return db - da;
    });
  }, [imports]);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div>
          <h3 className="text-lg font-semibold">Histórico de importações</h3>
          <p className="text-sm text-gray-600">Clique numa linha para ver detalhes de erros.</p>
        </div>
        <button
          type="button"
          onClick={fetchHistory}
          className="inline-flex items-center gap-2 px-3 py-2 rounded border border-gray-300 hover:bg-gray-50"
        >
          <RefreshCw size={16} />
          Atualizar
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left w-10" />
              <th className="px-4 py-2 text-left">Data</th>
              <th className="px-4 py-2 text-left">Ficheiro</th>
              <th className="px-4 py-2 text-center">Total</th>
              <th className="px-4 py-2 text-center">Sucesso</th>
              <th className="px-4 py-2 text-center">Erros</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Utilizador</th>
            </tr>
          </thead>

          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                  A carregar histórico...
                </td>
              </tr>
            )}

            {!isLoading && sortedImports.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                  Sem importações ainda.
                </td>
              </tr>
            )}

            {!isLoading &&
              sortedImports.map((imp) => {
                const id = imp?.id ?? imp?._id ?? imp?.uuid;
                const isExpanded = expandedId === id;
                const errors = imp?.errors || imp?.errorDetails || [];
                const errorCount = imp?.errorCount ?? (Array.isArray(errors) ? errors.length : 0);

                return (
                  <React.Fragment key={id}>
                    <tr
                      onClick={() => setExpandedId(isExpanded ? null : id)}
                      className="border-t hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-4 py-2 text-gray-400">
                        {errorCount > 0 ? (
                          isExpanded ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronRight size={16} />
                          )
                        ) : null}
                      </td>
                      <td className="px-4 py-2">{formatDatePt(imp?.createdAt)}</td>
                      <td className="px-4 py-2">{imp?.fileName || '—'}</td>
                      <td className="px-4 py-2 text-center">{imp?.totalRecords ?? imp?.total ?? '—'}</td>
                      <td className="px-4 py-2 text-center text-green-600">{imp?.successCount ?? '—'}</td>
                      <td className="px-4 py-2 text-center text-red-600">{errorCount ?? '—'}</td>
                      <td className="px-4 py-2">
                        <StatusBadge status={imp?.status} />
                      </td>
                      <td className="px-4 py-2">
                        {imp?.user?.firstName || imp?.user?.name || imp?.userName || '—'}
                      </td>
                    </tr>

                    {isExpanded && Array.isArray(errors) && errors.length > 0 && (
                      <tr className="bg-red-50 border-t">
                        <td colSpan={8} className="px-4 py-4">
                          <h4 className="font-semibold mb-2">Erros:</h4>
                          <ul className="text-sm text-red-700 space-y-1">
                            {errors.map((err, idx) => (
                              <li key={idx}>
                                • Doc {err?.documentNumber ?? err?.doc ?? err?.id ?? '-'}: {err?.error || err?.message || 'Erro'}
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t">
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1 || isLoading}
          className="px-3 py-2 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>

        <div className="text-sm text-gray-600">
          Página <span className="font-medium">{page}</span>
        </div>

        <button
          type="button"
          onClick={() => setPage((p) => p + 1)}
          disabled={!hasNextPage || isLoading}
          className="px-3 py-2 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Seguinte
        </button>
      </div>
    </div>
  );
}
