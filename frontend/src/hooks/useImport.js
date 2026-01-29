import { useState } from 'react';

import api from '../services/api';

export function useImport() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [importMode, setImportMode] = useState('replace');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const uploadFile = async (file) => {
    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('importMode', importMode);

      const response = await api.post('/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao importar');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    selectedFile,
    setSelectedFile,
    importMode,
    setImportMode,
    isLoading,
    error,
    uploadFile
  };
}
