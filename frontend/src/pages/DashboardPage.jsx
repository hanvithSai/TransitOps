import { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  CarFront, Users, Map, Wrench, Fuel, Banknote, Activity, Clock 
} from 'lucide-react';
import api from '../services/api';
import { Card } from '../components/ui/Card';
import { cn } from '../lib/utils';

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
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-brand-200)] border-t-[var(--color-brand-600)] dark:border-[var(--color-brand-800)] dark:border-t-[var(--color-brand-400)]"></div>
          <p className="text-sm font-medium text-[var(--text-muted)] animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
        <div className="rounded-2xl border border-[var(--color-error)]/20 bg-[var(--color-error-bg)] p-8 text-center shadow-sm max-w-md w-full animate-in fade-in zoom-in-95">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-error)]/10 mb-4">
            <svg className="h-6 w-6 text-[var(--color-error)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-[var(--color-error-text)] font-semibold mb-6">{error}</p>
          <button 
            onClick={fetchDashboardData} 
            className="w-full rounded-[10px] bg-[var(--color-error)] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-error)] focus:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { kpis, charts } = data;
  
  const PIE_COLORS = ['#10b981', '#3b82f6', '#f43f5e', '#f59e0b', '#8b5cf6'];

  const kpiCards = [
    { label: 'Total Vehicles', value: kpis.vehicles.total, icon: CarFront, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Available Vehicles', value: kpis.vehicles.available, icon: Activity, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'On Trip', value: kpis.vehicles.onTrip, icon: Map, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { label: 'In Shop', value: kpis.vehicles.inShop, icon: Wrench, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Fleet Utilization', value: `${kpis.vehicles.utilization}%`, icon: Activity, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    
    { label: 'Active Trips', value: kpis.trips.active, icon: Map, color: 'text-brand-600 dark:text-brand-400', bg: 'bg-brand-50 dark:bg-brand-900/20' },
    { label: 'Pending Trips', value: kpis.trips.pending, icon: Clock, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: 'Drivers On Duty', value: kpis.drivers.onDuty, icon: Users, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-900/20' },
    { label: 'Total Fuel Cost', value: `$${kpis.costs.totalFuelCost.toLocaleString()}`, icon: Fuel, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20' },
    { label: 'Maintenance Cost', value: `$${kpis.costs.totalMaintenanceCost.toLocaleString()}`, icon: Banknote, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
  ];

  const tooltipStyle = {
    backgroundColor: 'var(--bg-surface)',
    borderColor: 'var(--border-base)',
    color: 'var(--text-primary)',
    borderRadius: '8px',
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    border: '1px solid var(--border-base)',
    padding: '8px 12px',
    fontWeight: '500'
  };

  return (
    <div className="space-y-10 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Overview</h1>
        <p className="text-sm font-medium text-[var(--text-secondary)]">
          Real-time insights and metrics for your fleet operations.
        </p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 xl:gap-8">
        {kpiCards.map((kpi, i) => (
          <Card key={i} className="flex flex-col justify-center transition-smooth hover:shadow-md hover:-translate-y-0.5 hover:border-[var(--color-brand-200)] dark:hover:border-[var(--color-brand-800)]">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] line-clamp-2 pr-2">{kpi.label}</p>
              <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", kpi.bg, kpi.color)}>
                <kpi.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">{kpi.value}</p>
          </Card>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:gap-10">
        
        {/* Trips by Month */}
        <Card className="p-6 flex flex-col h-[380px]">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-base font-bold tracking-wide text-[var(--text-primary)]">Completed Trips by Month</h3>
          </div>
          <div className="flex-1 w-full -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.tripsTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-base)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--bg-surface-hover)' }} />
                <Bar dataKey="count" fill="var(--color-brand-500)" radius={[4, 4, 0, 0]} name="Trips" maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Fleet Status */}
        <Card className="p-6 flex flex-col h-[380px]">
          <h3 className="mb-2 text-base font-bold tracking-wide text-[var(--text-primary)]">Fleet Status</h3>
          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.fleetStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {charts.fleetStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend 
                  iconType="circle" 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  wrapperStyle={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', paddingTop: '20px' }} 
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -mt-8">
              <span className="text-3xl font-bold text-[var(--text-primary)]">{kpis.vehicles.total}</span>
              <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Total</span>
            </div>
          </div>
        </Card>

        {/* Fuel Consumption */}
        <Card className="p-6 flex flex-col h-[380px]">
          <h3 className="mb-6 text-base font-bold tracking-wide text-[var(--text-primary)]">Fuel Cost Trend</h3>
          <div className="flex-1 w-full -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.fuelTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-base)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`$${value}`, 'Cost']} />
                <Line type="monotone" dataKey="cost" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: 'var(--bg-surface)' }} activeDot={{ r: 6, strokeWidth: 0, fill: '#8b5cf6' }} name="Fuel Cost" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Maintenance Trend */}
        <Card className="p-6 flex flex-col h-[380px]">
          <h3 className="mb-6 text-base font-bold tracking-wide text-[var(--text-primary)]">Maintenance Cost Trend</h3>
          <div className="flex-1 w-full -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.maintenanceTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-base)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`$${value}`, 'Cost']} />
                <Line type="monotone" dataKey="cost" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: 'var(--bg-surface)' }} activeDot={{ r: 6, strokeWidth: 0, fill: '#f59e0b' }} name="Maintenance Cost" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>
    </div>
  );
};

export default DashboardPage;
