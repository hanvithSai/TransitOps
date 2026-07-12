import { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../services/api';

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
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-500">
        <p>{error}</p>
        <button onClick={fetchDashboardData} className="mt-4 rounded bg-red-500/20 px-4 py-2 hover:bg-red-500/30">
          Try Again
        </button>
      </div>
    );
  }

  const { kpis, charts } = data;
  
  const PIE_COLORS = ['#10b981', '#3b82f6', '#ef4444']; // Available (Green), On Trip (Blue), In Shop (Red)

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

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Fleet overview and key performance indicators
        </p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {kpiCards.map((kpi, i) => (
          <div
            key={i}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-800)] p-5 transition-shadow hover:shadow-lg"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">{kpi.label}</p>
            <p className="mt-3 text-2xl font-bold text-[var(--color-text-primary)]">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* Trips by Month */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-800)] p-5">
          <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">Completed Trips by Month</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.tripsTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                  itemStyle={{ color: '#8b5cf6' }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Trips" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fleet Status */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-800)] p-5">
          <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">Fleet Status</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.fleetStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {charts.fleetStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fuel Consumption */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-800)] p-5">
          <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">Fuel Cost Trend</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.fuelTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                  itemStyle={{ color: '#ec4899' }}
                  formatter={(value) => [`$${value}`, 'Cost']}
                />
                <Line type="monotone" dataKey="cost" stroke="#ec4899" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Fuel Cost" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Maintenance Trend */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-800)] p-5">
          <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">Maintenance Cost Trend</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.maintenanceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                  itemStyle={{ color: '#eab308' }}
                  formatter={(value) => [`$${value}`, 'Cost']}
                />
                <Line type="monotone" dataKey="cost" stroke="#eab308" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Maintenance Cost" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
