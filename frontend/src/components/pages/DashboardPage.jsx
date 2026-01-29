import React, { useState, useEffect } from 'react';
// import api from '../../services/api'; // Comentado para mock data
import KPISummary from '../dashboard/KPISummary';
import OrdersStatusChart from '../dashboard/OrdersStatusChart';
import OrdersByClientChart from '../dashboard/OrdersByClientChart';
import SectorOccupancyChart from '../dashboard/SectorOccupancyChart';

// Mock data para teste
const mockData = {
  kpis: {
    activeOrders: 156,
    delayedOrders: 12,
    completedOrders: 89,
    thisWeekDeliveries: 45,
    thisMonthDeliveries: 189,
    complianceRate: 92.5
  },
  ordersByStatus: [
    { status: 'completed', count: 45 },
    { status: 'in_production', count: 89 },
    { status: 'delayed', count: 12 },
    { status: 'at_risk', count: 8 }
  ],
  ordersByClient: [
    { client_code: 'CLI001', count: 15, total_quantity: 450 },
    { client_code: 'CLI002', count: 12, total_quantity: 380 },
    { client_code: 'CLI003', count: 10, total_quantity: 290 },
    { client_code: 'CLI004', count: 9, total_quantity: 260 },
    { client_code: 'CLI005', count: 8, total_quantity: 240 }
  ],
  sectorOccupancy: [
    { sector_code: 'SEC001', sector_name: 'Corte', quantity_in_progress: 45, orders_waiting: 5 },
    { sector_code: 'SEC002', sector_name: 'Costura', quantity_in_progress: 89, orders_waiting: 12 },
    { sector_code: 'SEC003', sector_name: 'Acabamento', quantity_in_progress: 32, orders_waiting: 8 }
  ]
};

export default function DashboardPage() {
  const [kpis, setKpis] = useState(null);
  const [ordersByStatus, setOrdersByStatus] = useState([]);
  const [ordersByClient, setOrdersByClient] = useState([]);
  const [sectorOccupancy, setSectorOccupancy] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month');

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Simulando chamada API com timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Usando mock data
      setKpis(mockData.kpis);
      setOrdersByStatus(mockData.ordersByStatus);
      setOrdersByClient(mockData.ordersByClient);
      setSectorOccupancy(mockData.sectorOccupancy);
      
      /* Quando a API estiver pronta, descomente:
      const [
        kpisResponse,
        statusResponse,
        clientsResponse,
        sectorsResponse
      ] = await Promise.all([
        api.get(`/dashboard/kpis?dateRange=${dateRange}`),
        api.get('/dashboard/orders-by-status'),
        api.get('/dashboard/orders-by-client?limit=10'),
        api.get('/dashboard/sector-occupancy')
      ]);

      setKpis(kpisResponse.data.data.kpis);
      setOrdersByStatus(statusResponse.data.data);
      setOrdersByClient(clientsResponse.data.data);
      setSectorOccupancy(sectorsResponse.data.data);
      */
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="week">Última Semana</option>
          <option value="month">Último Mês</option>
          <option value="quarter">Último Trimestre</option>
          <option value="year">Último Ano</option>
        </select>
      </div>

      {/* KPI Summary */}
      <KPISummary kpis={kpis || {}} isLoading={isLoading} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrdersStatusChart data={ordersByStatus} isLoading={isLoading} />
        <OrdersByClientChart data={ordersByClient} isLoading={isLoading} />
      </div>

      {/* Sector Occupancy */}
      <SectorOccupancyChart data={sectorOccupancy} isLoading={isLoading} />
    </div>
  );
}