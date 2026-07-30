import { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { LayoutDashboard, CarFront, Users, Map, Wrench, Fuel, Banknote, Activity, Clock } from 'lucide-react';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { SkeletonKpiGrid } from '../../components/ui/Skeleton';

const PIE_COLORS = ['#14b8a6', '#6366f1', '#f59e0b'];

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/stats');
      setData(response.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const tooltipStyle = {
    backgroundColor: 'var(--bg-surface)',
    borderColor: 'var(--border-base)',
    color: 'var(--text-primary)',
    borderRadius: '8px',
    boxShadow: 'var(--shadow-md)',
    border: '1px solid var(--border-base)',
    padding: '8px 12px',
    fontWeight: 500,
  };

  if (loading) {
    return (
      <div className="app-page-stack">
        <PageHeader icon={LayoutDashboard} title="Overview" subtitle="Real-time insights and metrics for your fleet operations." />
        <SkeletonKpiGrid count={8} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-page-stack">
        <PageHeader icon={LayoutDashboard} title="Overview" subtitle="Real-time insights and metrics for your fleet operations." />
        <Card className="flex flex-col items-center py-12 text-center">
          <p className="text-body-lg font-medium text-[var(--color-error-text)]">{error}</p>
          <Button onClick={fetchDashboardData} variant="outline" className="mt-6">Try again</Button>
        </Card>
      </div>
    );
  }

  const { kpis, charts } = data;

  const kpiCards = [
    { label: 'Total vehicles', value: kpis.vehicles.total, accent: 'var(--color-brand-500)' },
    { label: 'Available', value: kpis.vehicles.available, accent: 'var(--color-accent-500)' },
    { label: 'On trip', value: kpis.vehicles.onTrip, accent: 'var(--color-brand-400)' },
    { label: 'In shop', value: kpis.vehicles.inShop, accent: 'var(--color-warning)' },
    { label: 'Fleet utilization', value: `${kpis.vehicles.utilization}%`, accent: 'var(--color-brand-600)' },
    { label: 'Active trips', value: kpis.trips.active, accent: 'var(--color-brand-500)' },
    { label: 'Pending trips', value: kpis.trips.pending, accent: 'var(--color-warning)' },
    { label: 'Drivers on duty', value: kpis.drivers.onDuty, accent: 'var(--color-accent-500)' },
    { label: 'Total fuel cost', value: `$${kpis.costs.totalFuelCost.toLocaleString()}`, accent: 'var(--color-brand-500)' },
    { label: 'Maintenance cost', value: `$${kpis.costs.totalMaintenanceCost.toLocaleString()}`, accent: 'var(--color-warning)' },
  ];

  const kpiIcons = [CarFront, Activity, Map, Wrench, Activity, Map, Clock, Users, Fuel, Banknote];

  return (
    <div className="app-page-stack">
      <PageHeader
        icon={LayoutDashboard}
        title="Overview"
        subtitle="Real-time insights and metrics for your fleet operations."
      />

      <div className="app-kpi-grid">
        {kpiCards.map((kpi, i) => {
          const Icon = kpiIcons[i];
          return (
            <div key={kpi.label} className="kpi-card" style={{ '--kpi-accent': kpi.accent }}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-label">{kpi.label}</p>
                <div className="app-kpi-icon">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
              </div>
              <p className="text-kpi-value kpi-card-value">{kpi.value}</p>
            </div>
          );
        })}
      </div>

      <div className="app-chart-grid">
        <Card className="flex h-[22rem] flex-col sm:h-[24rem]">
          <h3 className="text-h3 mb-4">Completed trips by month</h3>
          <div className="min-h-0 flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.tripsTrend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-base)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--bg-surface-hover)' }} />
                <Bar dataKey="count" fill="var(--color-brand-500)" radius={[4, 4, 0, 0]} name="Trips" maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="flex h-[22rem] flex-col sm:h-[24rem]">
          <h3 className="text-h3 mb-2">Fleet status</h3>
          <div className="relative min-h-0 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={charts.fleetStatus} cx="50%" cy="50%" innerRadius={64} outerRadius={96} paddingAngle={4} dataKey="value" stroke="none">
                  {charts.fleetStatus.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" layout="horizontal" verticalAlign="bottom" wrapperStyle={{ fontSize: '13px', color: 'var(--text-secondary)', paddingTop: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center -mt-6">
              <span className="text-kpi-value !text-3xl">{kpis.vehicles.total}</span>
              <span className="text-label">Total</span>
            </div>
          </div>
        </Card>

        <Card className="flex h-[22rem] flex-col sm:h-[24rem]">
          <h3 className="text-h3 mb-4">Fuel cost trend</h3>
          <div className="min-h-0 flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.fuelTrend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-base)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`$${value}`, 'Cost']} />
                <Line type="monotone" dataKey="cost" stroke="var(--color-brand-500)" strokeWidth={2.5} dot={{ r: 3, fill: 'var(--bg-surface)' }} name="Fuel cost" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="flex h-[22rem] flex-col sm:h-[24rem]">
          <h3 className="text-h3 mb-4">Maintenance cost trend</h3>
          <div className="min-h-0 flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.maintenanceTrend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-base)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`$${value}`, 'Cost']} />
                <Line type="monotone" dataKey="cost" stroke="var(--color-warning)" strokeWidth={2.5} dot={{ r: 3, fill: 'var(--bg-surface)' }} name="Maintenance cost" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
