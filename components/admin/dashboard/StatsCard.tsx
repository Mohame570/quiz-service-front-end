import React from 'react';
import Card from '@/components/ui/Card';

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: string;
}

export default function StatsCard({ icon, label, value, trend }: StatsCardProps) {
  return (
    <Card className="stats-card w-full">
      <span className="stats-card-icon shrink-0">{icon}</span>
      <div className="stats-card-content min-w-0">
        <p className="stats-card-label">{label}</p>
        <h3 className="stats-card-value">{value}</h3>
        {trend && <p className="stats-card-trend">{trend}</p>}
      </div>
    </Card>
  );
}
