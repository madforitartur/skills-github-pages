import React from 'react';
import { Package, AlertTriangle, CheckCircle, Truck, Calendar, Target } from 'lucide-react';
import KPICard from './KPICard';

const KPIData = [
  {
    id: 'active',
    label: 'Encomendas Ativas',
    key: 'activeOrders',
    icon: Package,
    color: 'yellow',
    description: 'Em produção'
  },
  {
    id: 'delayed',
    label: 'Encomendas Atrasadas',
    key: 'delayedOrders',
    icon: AlertTriangle,
    color: 'red',
    description: 'Prazo já passou'
  },
  {
    id: 'completed',
    label: 'Concluídas',
    key: 'completedOrders',
    icon: CheckCircle,
    color: 'green',
    description: 'Este período'
  },
  {
    id: 'week',
    label: 'Entregas Esta Semana',
    key: 'thisWeekDeliveries',
    icon: Truck,
    color: 'blue',
    description: 'Agendadas'
  },
  {
    id: 'month',
    label: 'Entregas Este Mês',
    key: 'thisMonthDeliveries',
    icon: Calendar,
    color: 'indigo',
    description: 'Agendadas'
  },
  {
    id: 'compliance',
    label: 'Taxa de Cumprimento',
    key: 'complianceRate',
    icon: Target,
    color: 'purple',
    description: 'No prazo'
  }
];

export default function KPISummary({ kpis = {}, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="h-32 bg-gray-200 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {KPIData.map(kpiDef => {
        const IconComponent = kpiDef.icon;
        const value = kpis[kpiDef.key] || 0;
        
        return (
          <KPICard
            key={kpiDef.id}
            icon={<IconComponent size={32} />}
            label={kpiDef.label}
            value={value}
            description={kpiDef.description}
            color={kpiDef.color}
          />
        );
      })}
    </div>
  );
}