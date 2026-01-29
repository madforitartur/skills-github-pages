import { useState, useEffect } from 'react';
// import api from '../services/api'; // Comentado para mock data

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
  ],
  sectorOccupancy: [
    { sector_code: 'SEC001', sector_name: 'Corte', quantity_in_progress: 45, orders_waiting: 5 },
    { sector_code: 'SEC002', sector_name: 'Costura', quantity_in_progress: 89, orders_waiting: 12 },
    { sector_code: 'SEC003', sector_name: 'Acabamento', quantity_in_progress: 32, orders_waiting: 8 }
  ]
};

export function useDashboard() {
  const [dashboardData, setDashboardData] = useState({
    kpis: null,
    ordersByStatus: [],
    ordersByClient: [],
    sectorOccupancy: []
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month');

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      // Simulando chamada API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDashboardData({
        kpis: mockData.kpis,
        ordersByStatus: mockData.ordersByStatus,
        ordersByClient: mockData.ordersByClient,
        sectorOccupancy: mockData.sectorOccupancy
      });
      
      /* Quando a API estiver pronta, descomente:
      const results = await Promise.all([
        api.get(`/dashboard/kpis?dateRange=${dateRange}`),
        api.get('/dashboard/orders-by-status'),
        api.get('/dashboard/orders-by-client'),
        api.get('/dashboard/sector-occupancy')
      ]);

      setDashboardData({
        kpis: results[0].data.data.kpis,
        ordersByStatus: results[1].data.data,
        ordersByClient: results[2].data.data,
        sectorOccupancy: results[3].data.data
      });
      */
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [dateRange]);

  return {
    ...dashboardData,
    isLoading,
    dateRange,
    setDateRange,
    refetch: fetchDashboard
  };
}