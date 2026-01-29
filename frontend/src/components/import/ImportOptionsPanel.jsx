import React, { useMemo, useState } from 'react';
import { Info, Loader2 } from 'lucide-react';

import { useImport } from '../../hooks/useImport';

function Tooltip({ text }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="ml-2 text-gray-400 hover:text-gray-600"
        aria-label="Mais informação"
      >
        <Info size={16} />
      </button>
      {open && (
        <span className="absolute z-10 left-0 top-6 w-72 rounded bg-gray-900 text-white text-xs px-3 py-2 shadow">
          {text}
        </span>
      )}
    </span>
  );
}

export default function ImportOptionsPanel({
  selectedFile,
  setSelectedFile,
  fileName,
  setFileName,
  onImportSuccess
}) {
  const { importMode, setImportMode, isLoading, error, uploadFile } = useImport();
  const [importError, setImportError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const effectiveError = importError || error;

  const handleImport = async () => {
    if (!selectedFile || isLoading) return;

    setImportError('');
    setSuccessMessage('');

    try {
      const data = await uploadFile(selectedFile);

      const successCount = data?.successCount ?? data?.imported ?? data?.count ?? null;
      setSuccessMessage(
        successCount != null
          ? `${successCount} encomendas importadas com sucesso`
          : 'Importação concluída com sucesso'
      );

      setSelectedFile?.(null);
      setFileName?.('');
      onImportSuccess?.();
    } catch (e) {
      setImportError(e?.response?.data?.error || 'Erro ao importar ficheiro');
    }
  };

  const importButtonLabel = useMemo(() => {
    if (isLoading) return 'Importando...';
    return 'Importar Ficheiro';
  }, [isLoading]);

  return (
    <div className="bg-white rounded-lg p-6 shadow">
      <h3 className="text-lg font-semibold mb-4">Opções de Importação</h3>

      <div className="space-y-4">
        <div>
          <label className="flex items-start">
            <input
              type="radio"
              value="replace"
              checked={importMode === 'replace'}
              onChange={(e) => setImportMode(e.target.value)}
              className="mr-2 mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center">
                <span>Substituir dados existentes</span>
                <Tooltip text="Apaga os dados atuais antes de importar o novo ficheiro." />
              </div>
              <p className="text-sm text-gray-600">Apagar todos os dados atuais e importar novo ficheiro</p>
            </div>
          </label>
        </div>

        <div>
          <label className="flex items-start">
            <input
              type="radio"
              value="append"
              checked={importMode === 'append'}
              onChange={(e) => setImportMode(e.target.value)}
              className="mr-2 mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center">
                <span>Adicionar aos dados existentes</span>
                <Tooltip text="Mantém os dados atuais e adiciona novos registos do ficheiro." />
              </div>
              <p className="text-sm text-gray-600">Adicionar novos registos aos dados já presentes</p>
            </div>
          </label>
        </div>

        {selectedFile ? (
          <div className="text-sm text-gray-700">
            Ficheiro selecionado: <span className="font-medium">{fileName}</span>
          </div>
        ) : (
          <div className="text-sm text-gray-500">Selecione um ficheiro para ativar a importação.</div>
        )}
      </div>

      <button
        type="button"
        onClick={handleImport}
        disabled={!selectedFile || isLoading}
        className="mt-6 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading && <Loader2 size={18} className="animate-spin" />}
        {importButtonLabel}
      </button>

      {successMessage && <p className="text-green-700 mt-3">✓ {successMessage}</p>}
      {effectiveError && <p className="text-red-600 mt-3">✗ {effectiveError}</p>}
    </div>
  );
}
