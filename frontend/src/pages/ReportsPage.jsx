import { useState, useEffect } from 'react';
import api from '../services/api';

const ReportsPage = () => {
  const [data, setData] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports/roi');
      setData(response.data.data);
      setMetrics(response.data.metrics);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const response = await api.get('/reports/roi/download', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'vehicle-roi-report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download CSV');
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
        <button onClick={fetchReportData} className="mt-4 rounded bg-red-500/20 px-4 py-2 hover:bg-red-500/30">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Vehicle ROI, operational costs, and fleet utilization
          </p>
        </div>
        <button
          onClick={handleDownloadCSV}
          className="flex items-center justify-center gap-2 rounded-lg bg-[var(--color-brand-600)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-brand-500)]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-800)] p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">Fleet Utilization</p>
            <p className="mt-3 text-3xl font-bold text-[var(--color-text-primary)]">{metrics.fleetUtilization}%</p>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-800)] p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">Fuel Efficiency</p>
            <p className="mt-3 text-3xl font-bold text-[var(--color-text-primary)]">{metrics.fuelEfficiency} km/L</p>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-800)] p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">Operational Cost</p>
            <p className="mt-3 text-3xl font-bold text-[var(--color-text-primary)]">₹{metrics.operationalCost.toLocaleString()}</p>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-800)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[var(--color-text-secondary)]">
            <thead className="bg-[var(--color-surface-900)] text-xs uppercase text-[var(--color-text-muted)]">
              <tr>
                <th className="px-6 py-4 font-medium">Vehicle</th>
                <th className="px-6 py-4 font-medium">Revenue</th>
                <th className="px-6 py-4 font-medium">Fuel Cost</th>
                <th className="px-6 py-4 font-medium">Maintenance & Ops</th>
                <th className="px-6 py-4 font-medium text-right">Net ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {data.map((row) => (
                <tr key={row.vehicleId} className="transition-colors hover:bg-[var(--color-surface-700)]">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="font-medium text-[var(--color-text-primary)]">{row.vehicleName}</div>
                    <div className="text-xs">{row.registrationNumber}</div>
                  </td>
                  <td className="px-6 py-4">₹{row.revenue.toLocaleString()}</td>
                  <td className="px-6 py-4">₹{row.fuel.toLocaleString()}</td>
                  <td className="px-6 py-4">₹{row.expenses.toLocaleString()}</td>
                  <td className={`px-6 py-4 text-right font-medium ${row.roi >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ₹{row.roi.toLocaleString()}
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-[var(--color-text-muted)]">
                    No reports data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
