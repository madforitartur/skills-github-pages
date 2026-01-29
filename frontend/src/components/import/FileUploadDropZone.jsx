import React, { useRef, useState } from 'react';
import { CloudUpload } from 'lucide-react';

const VALID_MIME_TYPES = [
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

const MAX_BYTES = 10 * 1024 * 1024;

export default function FileUploadDropZone({
  selectedFile,
  setSelectedFile,
  fileName,
  setFileName
}) {
  const inputRef = useRef(null);

  const [fileError, setFileError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    validateAndSetFile(files?.[0]);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    validateAndSetFile(file);

    if (e.target) {
      e.target.value = '';
    }
  };

  const validateAndSetFile = (file) => {
    if (!file) return;

    if (!VALID_MIME_TYPES.includes(file.type)) {
      setFileError('Apenas ficheiros Excel (.xls, .xlsx) são permitidos');
      setSelectedFile?.(null);
      setFileName?.('');
      return;
    }

    if (file.size > MAX_BYTES) {
      setFileError('Ficheiro muito grande (máximo 10MB)');
      setSelectedFile?.(null);
      setFileName?.('');
      return;
    }

    setFileError('');
    setSelectedFile?.(file);
    setFileName?.(file.name);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const wrapperClasses = [
    'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors select-none',
    isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400',
    selectedFile ? 'bg-green-50 border-green-500' : 'bg-white'
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="bg-white rounded-lg p-6 shadow">
      <h3 className="text-lg font-semibold mb-4">Upload do ficheiro</h3>

      <input
        ref={inputRef}
        type="file"
        accept=".xls,.xlsx"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleClick();
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={wrapperClasses}
      >
        <CloudUpload size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-lg font-semibold">Arraste o ficheiro aqui ou clique para selecionar</p>
        <p className="text-sm text-gray-500 mt-2">Ficheiros Excel (.xls, .xlsx) até 10MB</p>

        {selectedFile && (
          <p className="text-green-600 mt-2">✓ {fileName} selecionado</p>
        )}

        {fileError && <p className="text-red-600 mt-2">✗ {fileError}</p>}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleClick}
          className="px-4 py-2 rounded bg-gray-900 text-white hover:bg-gray-800"
        >
          Selecionar ficheiro
        </button>

        {selectedFile && (
          <button
            type="button"
            onClick={() => {
              setSelectedFile?.(null);
              setFileName?.('');
              setFileError('');
            }}
            className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50"
          >
            Remover
          </button>
        )}
      </div>
    </div>
  );
}
