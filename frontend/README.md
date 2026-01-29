# Dashboard - Gestão de Encomendas

## Descrição
Dashboard React com componentes de KPIs e gráficos utilizando Recharts para visualização de dados de encomendas.

## Componentes Criados

### 1. KPICard.jsx
Card individual para exibição de métricas com ícone, valor, descrição e trend.

### 2. KPISummary.jsx
Grid de 6 cards KPI: Encomendas Ativas, Atrasadas, Concluídas, Entregas (Semana/Mês) e Taxa de Cumprimento.

### 3. OrdersStatusChart.jsx
Gráfico de pizza mostrando distribuição de encomendas por estado (concluída, em produção, atrasada, em risco).

### 4. OrdersByClientChart.jsx
Gráfico de barras com top 10 clientes por número de encomendas e quantidade.

### 5. SectorOccupancyChart.jsx
Gráfico de barras horizontal mostrando ocupação por sector (em processamento e à espera).

### 6. DashboardPage.jsx
Página principal que integra todos os componentes com controle de dateRange e estados de loading.

### 7. useDashboard.js
Hook customizado para gerenciar estado e fetch dos dados do dashboard.

## Instalação

```bash
cd frontend
npm install
```

## Uso

```bash
npm run dev
```

Acesse `http://localhost:3000`

## Dependências

- React 18
- Recharts
- Lucide React (ícones)
- Axios (para API calls)
- Tailwind CSS (estilização)
- Vite (build tool)

## Estrutura de Pastas

```
frontend/
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── KPICard.jsx
│   │   │   ├── KPISummary.jsx
│   │   │   ├── OrdersStatusChart.jsx
│   │   │   ├── OrdersByClientChart.jsx
│   │   │   └── SectorOccupancyChart.jsx
│   │   └── pages/
│   │       └── DashboardPage.jsx
│   ├── hooks/
│   │   └── useDashboard.js
│   ├── index.css
│   └── main.jsx
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

## Critérios de Aceitação Atendidos

✅ KPI Cards renderizam corretamente
✅ Valores dos KPIs mockados para teste
✅ Gráfico de Pizza mostra distribuição por estado
✅ Gráfico de Barras mostra top clientes
✅ Gráfico de Sector mostra ocupação
✅ Cores aplicadas corretamente por tipo
✅ Tooltips funcionam nos gráficos
✅ Loading state (skeletons) durante fetch
✅ Seletor de dateRange funciona
✅ Responsivo em todos os tamanhos de tela

## Notas

- O código inclui mock data para teste sem backend
- Comente o mock e descomente a API real quando o backend estiver pronto
- Configurado para deploy estático (GitHub Pages)