# Documentação dos Componentes do Dashboard

## Visão Geral
Este documento descreve todos os componentes React criados para o dashboard de gestão de encomendas.

## Componentes Dashboard

### 1. KPICard.jsx
**Localização:** `src/components/dashboard/KPICard.jsx`

Componente individual de card para exibição de métricas KPI.

#### Props:
```javascript
{
  icon: ReactNode,          // Ícone do KPI
  label: String,            // Título do KPI
  value: Number|String,     // Valor principal
  description: String,      // Descrição opcional
  trend: Number,            // Mudança percentual (opcional)
  color: String,            // 'green', 'red', 'yellow', 'blue', 'indigo', 'purple', 'orange'
  onClick: Function         // Função de clique (opcional)
}
```

#### Cores Suportadas:
- `green` - Concluído/Sucesso
- `red` - Atrasado/Erro
- `yellow` - Em progresso/Aviso
- `blue` - Informação
- `indigo` - Secundário
- `purple` - Métricas
- `orange` - Risco

#### Exemplo de Uso:
```javascript
<KPICard
  icon={<Package size={32} />}
  label="Encomendas Ativas"
  value={156}
  description="Em produção"
  trend={5.2}
  color="yellow"
/>
```

---

### 2. KPISummary.jsx
**Localização:** `src/components/dashboard/KPISummary.jsx`

Grid de cards KPI que exibe as métricas principais do dashboard.

#### Props:
```javascript
{
  kpis: Object,             // Objeto com valores dos KPIs
  isLoading: Boolean        // Estado de carregamento
}
```

#### KPIs Exibidos:
1. **Encomendas Ativas** (amarelo) - `activeOrders`
2. **Encomendas Atrasadas** (vermelho) - `delayedOrders`
3. **Concluídas** (verde) - `completedOrders`
4. **Entregas Esta Semana** (azul) - `thisWeekDeliveries`
5. **Entregas Este Mês** (azul escuro) - `thisMonthDeliveries`
6. **Taxa de Cumprimento** (roxo) - `complianceRate`

#### Estrutura dos Dados:
```javascript
{
  activeOrders: Number,
  delayedOrders: Number,
  completedOrders: Number,
  thisWeekDeliveries: Number,
  thisMonthDeliveries: Number,
  complianceRate: Number
}
```

---

### 3. OrdersStatusChart.jsx
**Localização:** `src/components/dashboard/OrdersStatusChart.jsx`

Gráfico de pizza (Pie Chart) mostrando a distribuição de encomendas por estado.

#### Props:
```javascript
{
  data: Array,              // Array de objetos { status, count }
  isLoading: Boolean        // Estado de carregamento
}
```

#### Estados e Cores:
- `completed` - Verde (#10b981) - Concluída
- `in_production` - Amarelo (#fbbf24) - Em Produção
- `delayed` - Vermelho (#ef4444) - Atrasada
- `at_risk` - Laranja (#f97316) - Em Risco
- `waiting` - Cinza (#6b7280) - À Espera

#### Formato dos Dados:
```javascript
[
  { status: 'completed', count: 45 },
  { status: 'in_production', count: 89 },
  { status: 'delayed', count: 12 },
  { status: 'at_risk', count: 8 }
]
```

**Features:**
- Legenda clicável
- Tooltip com contagem de encomendas
- Labels com percentuais
- Responsivo

---

### 4. OrdersByClientChart.jsx
**Localização:** `src/components/dashboard/OrdersByClientChart.jsx`

Gráfico de barras mostrando o top 10 clientes por número de encomendas.

#### Props:
```javascript
{
  data: Array,              // Array de objetos do cliente
  isLoading: Boolean        // Estado de carregamento
}
```

#### Formato dos Dados:
```javascript
[
  {
    client_code: 'CLI001',
    count: 15,              // Número de encomendas
    total_quantity: 450     // Quantidade total
  }
]
```

**Features:**
- Barras duplas: Encomendas (azul) e Quantidade (azul escuro)
- Eixo X rotacionado para melhor legibilidade
- Tooltip detalhado
- Responsivo

---

### 5. SectorOccupancyChart.jsx
**Localização:** `src/components/dashboard/SectorOccupancyChart.jsx`

Gráfico de barras horizontal mostrando ocupação por setor de produção.

#### Props:
```javascript
{
  data: Array,              // Array de objetos do setor
  isLoading: Boolean        // Estado de carregamento
}
```

#### Formato dos Dados:
```javascript
[
  {
    sector_code: 'SEC001',
    sector_name: 'Corte',
    quantity_in_progress: 45,  // Em processamento
    orders_waiting: 5          // À espera
  }
]
```

**Features:**
- Layout vertical para melhor visualização de setores
- Barras empilhadas: Em Processamento (amarelo) e À Espera (vermelho)
- Tooltip com detalhes
- Eixo Y com nomes dos setores
- Responsivo

---

## Páginas

### DashboardPage.jsx
**Localização:** `src/components/pages/DashboardPage.jsx`

Página principal do dashboard que integra todos os componentes.

#### Estado:
- `kpis` - Dados dos KPIs
- `ordersByStatus` - Dados do gráfico de status
- `ordersByClient` - Dados do gráfico de clientes
- `sectorOccupancy` - Dados do gráfico de setores
- `isLoading` - Estado de carregamento
- `dateRange` - Filtro de período (week, month, quarter, year)

#### Funcionalidades:
- Seletor de período (última semana, mês, trimestre, ano)
- Carregamento assíncrono com Promise.all
- Estados de loading (skeletons)
- Mock data para testes

**Endpoints API (comentados para mock):**
- GET `/dashboard/kpis?dateRange={range}`
- GET `/dashboard/orders-by-status`
- GET `/dashboard/orders-by-client?limit=10`
- GET `/dashboard/sector-occupancy`

---

## Hooks

### useDashboard.js
**Localização:** `src/hooks/useDashboard.js`

Hook customizado para gerenciar estado e fetch dos dados do dashboard.

#### Retorno:
```javascript
{
  kpis: Object,             // Dados dos KPIs
  ordersByStatus: Array,    // Dados do gráfico de status
  ordersByClient: Array,    // Dados do gráfico de clientes
  sectorOccupancy: Array,   // Dados do gráfico de setores
  isLoading: Boolean,       // Estado de carregamento
  dateRange: String,        // Período selecionado
  setDateRange: Function,   // Alterar período
  refetch: Function         // Recarregar dados
}
```

#### Uso:
```javascript
import { useDashboard } from '../hooks/useDashboard';

function MyComponent() {
  const { kpis, ordersByStatus, isLoading, dateRange, setDateRange } = useDashboard();
  
  // ...
}
```

---

## Serviços

### api.js
**Localização:** `src/services/api.js`

Configuração do Axios para comunicação com a API.

#### Features:
- Base URL configurável via variável de ambiente
- Timeout de 10 segundos
- Interceptor de request para adicionar token de autenticação
- Interceptor de response para tratamento de erros 401

---

## Estilização

### Tailwind CSS Configuration
**Localização:** `tailwind.config.js`

Configuração do Tailwind com tema personalizado para cores primárias.

### Variáveis de Ambiente
Criar arquivo `.env` na raiz do frontend:
```bash
VITE_API_URL=http://localhost:3001/api
```

---

## Executando o Projeto

### Instalação
```bash
cd frontend
npm install
```

### Desenvolvimento
```bash
npm run dev
```
Acesse `http://localhost:3000`

### Build de Produção
```bash
npm run build
```
Arquivos gerados em `dist/`

### Preview de Produção
```bash
npm run preview
```

---

## Dependências

### Produção
- **react** ^18.2.0 - Framework UI
- **react-dom** ^18.2.0 - DOM renderer
- **recharts** ^2.8.0 - Gráficos e visualizações
- **lucide-react** ^0.294.0 - Ícones
- **axios** ^1.6.0 - Cliente HTTP

### Desenvolvimento
- **@vitejs/plugin-react** ^4.1.0 - Plugin React do Vite
- **vite** ^4.5.0 - Build tool
- **eslint** ^8.53.0 - Linter
- **tailwindcss** ^3.3.5 - Framework CSS
- **autoprefixer** ^10.4.16 - Prefixos CSS
- **postcss** ^8.4.31 - Processador CSS

---

## Estrutura de Pastas

```
frontend/
├── node_modules/           # Dependências
├── public/                 # Arquivos estáticos
├── src/
│   ├── components/
│   │   ├── dashboard/      # Componentes do dashboard
│   │   └── pages/          # Páginas
│   ├── hooks/              # Hooks customizados
│   ├── services/           # Serviços API
│   ├── index.css           # Estilos globais
│   └── main.jsx            # Ponto de entrada
├── dist/                   # Build de produção
├── .gitignore             # Git ignore
├── index.html             # HTML base
├── package.json           # Dependências e scripts
├── tailwind.config.js     # Config Tailwind
├── postcss.config.js      # Config PostCSS
├── vite.config.js         # Config Vite
└── README.md              # Documentação
```

---

## Critérios de Aceitação

✅ **Completo** - Todos os componentes implementados conforme especificação
✅ **KPI Cards** - Renderizam corretamente com ícones, valores e cores
✅ **Gráficos** - Todos os gráficos funcionam com Recharts
✅ **Cores** - Paleta de cores consistente aplicada
✅ **Tooltips** - Funcionam em todos os gráficos
✅ **Loading States** - Skeletons animados durante carregamento
✅ **Date Range** - Seletor funcional com mock data
✅ **Responsivo** - Layout adaptativo para todos os tamanhos
✅ **Build** - Build de produção gera arquivos estáticos
✅ **Documentado** - Código documentado e exemplos fornecidos

---

## Notas de Implementação

1. **Mock Data** - Componentes usam mock data para teste sem backend
2. **API Ready** - Código comentado para integração real com API
3. **Type Safety** - PropTypes podem ser adicionados para validação
4. **Testes** - Recomenda-se adicionar testes com Jest + React Testing Library
5. **Performance** - Considerar lazy loading parachunks grandes
6. **Acessibilidade** - Gráficos Recharts têm ARIA labels por padrão