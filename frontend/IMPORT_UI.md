# Import UI (React)

Este documento descreve a página e componentes de UI para importação de ficheiros Excel com drag-and-drop, validação em tempo real, upload para backend e histórico de importações.

## Fluxo de importação

1. O utilizador seleciona um ficheiro Excel (.xls/.xlsx) através de:
   - Drag-and-drop para a *dropzone*; ou
   - Botão **Selecionar ficheiro**.
2. O ficheiro é validado em tempo real:
   - Tipo/MIME: apenas Excel
   - Tamanho: máximo 10MB
3. O utilizador escolhe o modo de importação:
   - **Substituir (replace)**: apaga dados existentes e importa o novo ficheiro
   - **Adicionar (append)**: mantém dados e adiciona novos registos
4. Ao clicar em **Importar Ficheiro**, a UI envia um `multipart/form-data` para o backend:
   - `file`: o ficheiro selecionado
   - `importMode`: `replace` ou `append`
5. A UI apresenta feedback visual:
   - Botão com estado *loading*
   - Mensagem de sucesso ou erro
6. Após sucesso, o histórico é atualizado automaticamente.

## Componentes

### `ImportPage.jsx`
- Local: `frontend/src/components/pages/ImportPage.jsx`
- Responsável por:
  - Layout em duas colunas (upload/opções à esquerda e histórico à direita)
  - Estado partilhado do ficheiro selecionado
  - Forçar *refresh* do histórico após import bem-sucedido

### `FileUploadDropZone.jsx`
- Local: `frontend/src/components/import/FileUploadDropZone.jsx`
- Funcionalidades:
  - Drag-and-drop com highlight ao arrastar
  - Seleção via input file oculto
  - Validação (Excel apenas, 10MB)
  - Feedback de erro/sucesso

### `ImportOptionsPanel.jsx`
- Local: `frontend/src/components/import/ImportOptionsPanel.jsx`
- Funcionalidades:
  - Seleção de modo de importação (radio)
  - Tooltips explicativos para cada modo
  - Upload com spinner e tratamento de erro/sucesso

### `ImportHistoryTable.jsx`
- Local: `frontend/src/components/import/ImportHistoryTable.jsx`
- Funcionalidades:
  - Tabela responsiva (scroll horizontal em ecrãs pequenos)
  - Ordenação por data (mais recente primeiro)
  - Paginação (10 itens por página)
  - Linhas expansíveis para mostrar erros
  - Formatação de data em português (`pt-PT`)

### `StatusBadge.jsx`
- Local: `frontend/src/components/import/StatusBadge.jsx`
- Badge visual para `pending`, `processing`, `completed`, `failed`.

## Como usar drag-and-drop

1. Arraste um ficheiro `.xls` ou `.xlsx` para a área pontilhada.
2. A área fica destacada (azul) enquanto arrasta.
3. Ao largar, o ficheiro é validado e, se OK, fica marcado como selecionado.

## Tratamento de erros na UI

- **Erro de tipo**: mostra “Apenas ficheiros Excel (.xls, .xlsx) são permitidos”.
- **Erro de tamanho**: mostra “Ficheiro muito grande (máximo 10MB)”.
- **Erro no upload**: tenta usar `error.response.data.error` do backend; caso contrário mostra “Erro ao importar ficheiro”.

## Integração com backend

- Endpoint de upload: `POST /import`
- Endpoint de histórico: `GET /import/history?limit=10&offset=N`

A instância Axios está em `frontend/src/services/api.js` e lê o `baseURL` de:
- `VITE_API_URL` (Vite)
- `REACT_APP_API_URL` (Create React App)

