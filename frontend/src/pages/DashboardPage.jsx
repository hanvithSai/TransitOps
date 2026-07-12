import { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../services/api';
import { Card } from '../components/ui/Card';

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

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

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-brand-500)] border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[10px] border border-red-500/20 bg-red-50 p-6 text-center text-red-600 dark:bg-red-900/10 dark:text-red-400">
        <p>{error}</p>
        <button onClick={fetchDashboardData} className="mt-4 rounded-[10px] bg-red-100 px-4 py-2 text-sm font-medium hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50">
          Try Again
        </button>
      </div>
    );
  }

  const { kpis, charts } = data;
  
  const PIE_COLORS = ['#10b981', '#3b82f6', '#f43f5e'];

  const kpiCards = [
    { label: 'Total Vehicles', value: kpis.vehicles.total },
    { label: 'Available Vehicles', value: kpis.vehicles.available },
    { label: 'On Trip', value: kpis.vehicles.onTrip },
    { label: 'In Shop', value: kpis.vehicles.inShop },
    { label: 'Active Trips', value: kpis.trips.active },
    { label: 'Pending Trips', value: kpis.trips.pending },
    { label: 'Drivers On Duty', value: kpis.drivers.onDuty },
    { label: 'Fleet Utilization', value: `${kpis.vehicles.utilization}%` },
    { label: 'Total Fuel Cost', value: `$${kpis.costs.totalFuelCost.toLocaleString()}` },
    { label: 'Maintenance Cost', value: `$${kpis.costs.totalMaintenanceCost.toLocaleString()}` },
  ];

  const tooltipStyle = {
    backgroundColor: 'var(--bg-surface)',
    borderColor: 'var(--border-base)',
    color: 'var(--text-primary)',
    borderRadius: '10px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  };

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Fleet overview and key performance indicators
        </p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {kpiCards.map((kpi, i) => (
          <Card key={i} className="p-5 flex flex-col justify-center">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">{kpi.label}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-[var(--text-primary)]">{kpi.value}</p>
          </Card>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* Trips by Month */}
        <Card className="p-6">
          <h3 className="mb-6 text-sm font-semibold tracking-wide text-[var(--text-primary)]">Completed Trips by Month</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.tripsTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-base)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--bg-surface-hover)' }} />
                <Bar dataKey="count" fill="var(--color-brand-500)" radius={[4, 4, 0, 0]} name="Trips" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Fleet Status */}
        <Card className="p-6">
          <h3 className="mb-6 text-sm font-semibold tracking-wide text-[var(--text-primary)]">Fleet Status</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.fleetStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {charts.fleetStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Fuel Consumption */}
        <Card className="p-6">
          <h3 className="mb-6 text-sm font-semibold tracking-wide text-[var(--text-primary)]">Fuel Cost Trend</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.fuelTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-base)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`$${value}`, 'Cost']} />
                <Line type="monotone" dataKey="cost" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Fuel Cost" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Maintenance Trend */}
        <Card className="p-6">
          <h3 className="mb-6 text-sm font-semibold tracking-wide text-[var(--text-primary)]">Maintenance Cost Trend</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.maintenanceTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-base)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`$${value}`, 'Cost']} />
                <Line type="monotone" dataKey="cost" stroke="#eab308" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Maintenance Cost" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>
    </div>
  );
};

export default DashboardPage;
