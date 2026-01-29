import React, { useState } from 'react';

import FileUploadDropZone from '../import/FileUploadDropZone';
import ImportOptionsPanel from '../import/ImportOptionsPanel';
import ImportHistoryTable from '../import/ImportHistoryTable';

export default function ImportPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const handleImportSuccess = () => {
    setHistoryRefreshKey((k) => k + 1);
  };

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Importação de Excel</h1>
          <p className="text-sm text-gray-600 mt-1">
            Carregue um ficheiro Excel para importar encomendas e acompanhe o histórico de importações.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-6">
            <FileUploadDropZone
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              fileName={fileName}
              setFileName={setFileName}
            />

            <ImportOptionsPanel
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              fileName={fileName}
              setFileName={setFileName}
              onImportSuccess={handleImportSuccess}
            />
          </div>

          <div>
            <ImportHistoryTable refreshKey={historyRefreshKey} />
          </div>
        </div>
      </div>
    </div>
  );
}
