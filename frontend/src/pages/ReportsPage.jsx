import { useState, useEffect } from 'react';
import api from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Table, TableHead, TableRow, TableHeader, TableCell } from '../components/ui/Table';
import { Download, BarChart3, TrendingUp, Droplet, DollarSign, AlertCircle, FileX } from 'lucide-react';

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
    } catch {
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
      <div className="flex flex-col items-center justify-center rounded-xl border border-red-500/20 bg-red-50 p-8 text-center dark:bg-red-900/10 dark:border-red-900/30">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-red-700 dark:text-red-400">Failed to load reports</h3>
        <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-6 max-w-md">{error}</p>
        <Button onClick={fetchReportData} variant="outline" className="border-red-200 text-red-700 hover:bg-red-100 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/40">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-brand-500)]/10 text-[var(--color-brand-600)] dark:bg-[var(--color-brand-500)]/20 dark:text-[var(--color-brand-400)]">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Reports & Analytics</h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Vehicle ROI, operational costs, and fleet utilization
            </p>
          </div>
        </div>
        <Button onClick={handleDownloadCSV} variant="primary" className="shadow-sm">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {metrics && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="p-5 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-transparent via-[var(--color-brand-500)] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="flex items-center gap-2 mb-2 text-[var(--text-muted)]">
              <TrendingUp className="h-4 w-4" />
              <p className="text-[11px] font-bold uppercase tracking-wider">Fleet Utilization</p>
            </div>
            <p className="text-3xl font-extrabold tracking-tight text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)]">{metrics.fleetUtilization}%</p>
          </Card>
          <Card className="p-5 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-transparent via-emerald-500 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="flex items-center gap-2 mb-2 text-[var(--text-muted)]">
              <Droplet className="h-4 w-4 text-emerald-500/70" />
              <p className="text-[11px] font-bold uppercase tracking-wider">Fuel Efficiency</p>
            </div>
            <p className="text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">{metrics.fuelEfficiency} <span className="text-sm font-medium text-emerald-600/70 dark:text-emerald-400/70">km/L</span></p>
          </Card>
          <Card className="p-5 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-transparent via-amber-500 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="flex items-center gap-2 mb-2 text-[var(--text-muted)]">
              <DollarSign className="h-4 w-4 text-amber-500/70" />
              <p className="text-[11px] font-bold uppercase tracking-wider">Operational Cost</p>
            </div>
            <p className="text-3xl font-extrabold tracking-tight text-amber-600 dark:text-amber-400"><span className="text-xl font-bold opacity-75 mr-1">$</span>{metrics.operationalCost.toLocaleString()}</p>
          </Card>
        </div>
      )}

      <Card className="overflow-hidden border border-[var(--border-base)] shadow-sm">
        <div className="overflow-x-auto">
          {data.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-16 text-center">
               <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-base)] border border-[var(--border-base)]">
                 <FileX className="h-8 w-8 text-[var(--text-muted)]" />
               </div>
               <h3 className="text-lg font-semibold text-[var(--text-primary)]">No data available</h3>
               <p className="mt-1 text-sm text-[var(--text-secondary)] max-w-sm mx-auto">There is currently no report data generated for this period.</p>
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
                      <div className="text-xs font-medium mt-0.5 text-[var(--text-muted)]">{row.registrationNumber}</div>
                    </TableCell>
                    <TableCell className="font-medium text-[var(--text-secondary)]">${row.revenue.toLocaleString()}</TableCell>
                    <TableCell className="font-medium text-[var(--text-secondary)]">${row.fuel.toLocaleString()}</TableCell>
                    <TableCell className="font-medium text-[var(--text-secondary)]">${row.expenses.toLocaleString()}</TableCell>
                    <TableCell className={`text-right font-bold ${row.roi >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {row.roi >= 0 ? '+' : '-'}${Math.abs(row.roi).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ReportsPage;
