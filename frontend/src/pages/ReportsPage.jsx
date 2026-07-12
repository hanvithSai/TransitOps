import { useState, useEffect } from 'react';
import api from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Table, TableHead, TableRow, TableHeader, TableCell } from '../components/ui/Table';

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
      <div className="rounded-[10px] border border-red-500/20 bg-red-50 p-6 text-center text-red-600 dark:bg-red-900/10 dark:text-red-400">
        <p>{error}</p>
        <button onClick={fetchReportData} className="mt-4 rounded-[10px] bg-red-100 px-4 py-2 text-sm font-medium hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Vehicle ROI, operational costs, and fleet utilization
          </p>
        </div>
        <Button onClick={handleDownloadCSV}>
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </Button>
      </div>

      {metrics && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="p-5 flex flex-col justify-center">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Fleet Utilization</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)]">{metrics.fleetUtilization}%</p>
          </Card>
          <Card className="p-5 flex flex-col justify-center">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Fuel Efficiency</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">{metrics.fuelEfficiency} km/L</p>
          </Card>
          <Card className="p-5 flex flex-col justify-center">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Operational Cost</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">${metrics.operationalCost.toLocaleString()}</p>
          </Card>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-[var(--border-base)] bg-[var(--bg-surface)]">
        <div className="overflow-x-auto">
          {data.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-16 text-center">
               <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-base)] border border-[var(--border-base)]">
                 <svg className="h-6 w-6 text-[var(--text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                   <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                 </svg>
               </div>
               <p className="text-sm font-medium text-[var(--text-secondary)]">No report data available</p>
             </div>
          ) : (
            <Table>
              <TableHead>
                <TableHeader>Vehicle</TableHeader>
                <TableHeader>Revenue</TableHeader>
                <TableHeader>Fuel Cost</TableHeader>
                <TableHeader>Maintenance & Ops</TableHeader>
                <TableHeader className="text-right">Net ROI</TableHeader>
              </TableHead>
              <tbody className="divide-y divide-[var(--border-base)]">
                {data.map((row) => (
                  <TableRow key={row.vehicleId}>
                    <TableCell>
                      <div className="font-medium text-[var(--text-primary)]">{row.vehicleName}</div>
                      <div className="text-xs text-[var(--text-muted)]">{row.registrationNumber}</div>
                    </TableCell>
                    <TableCell className="font-medium text-[var(--text-secondary)]">${row.revenue.toLocaleString()}</TableCell>
                    <TableCell className="font-medium text-[var(--text-secondary)]">${row.fuel.toLocaleString()}</TableCell>
                    <TableCell className="font-medium text-[var(--text-secondary)]">${row.expenses.toLocaleString()}</TableCell>
                    <TableCell className={`text-right font-bold ${row.roi >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      ${row.roi.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
