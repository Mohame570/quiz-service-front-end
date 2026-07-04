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
      <div className="stats-card-header">
        <span className="stats-card-icon">{icon}</span>
      </div>
      <div className="stats-card-content">
        <p className="stats-card-label">{label}</p>
        <h3 className="stats-card-value">{value}</h3>
        {trend && <p className="stats-card-trend">{trend}</p>}
      </div>
    </Card>
  );
}
