import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { Table, TableHead, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import { Download, BarChart3, TrendingUp, Droplet, DollarSign, FileX } from 'lucide-react';

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

  const handleDownloadPDF = async () => {
    try {
      const response = await api.get('/reports/roi/download-pdf', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'vehicle-roi-report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('Failed to download PDF');
    }
  };

  if (loading) {
    return (
      <div className="app-page-stack">
        <PageHeader icon={BarChart3} title="Reports & analytics" subtitle="Vehicle ROI, operational costs, and fleet utilization" />
        <SkeletonTable rows={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-page-stack">
        <PageHeader icon={BarChart3} title="Reports & analytics" subtitle="Vehicle ROI, operational costs, and fleet utilization" />
        <Card className="flex flex-col items-center py-12 text-center">
          <p className="text-body-lg font-medium text-[var(--color-error-text)]">{error}</p>
          <Button onClick={fetchReportData} variant="outline" className="mt-6">Try again</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="app-page-stack">
      <PageHeader
        icon={BarChart3}
        title="Reports & analytics"
        subtitle="Vehicle ROI, operational costs, and fleet utilization"
        action={(
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleDownloadCSV} icon={Download} variant="outline">
              Export CSV
            </Button>
            <Button onClick={handleDownloadPDF} icon={Download}>
              Export PDF
            </Button>
          </div>
        )}
      />

      {metrics && (
        <div className="app-stat-grid app-stat-grid--3">
          <Card noPadding className="app-stat-card app-stat-card--metric group">
            <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-transparent via-[var(--color-brand-500)] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="app-stat-card-metric-head">
              <TrendingUp className="h-5 w-5 shrink-0" />
              <p className="app-stat-card-label">Fleet Utilization</p>
            </div>
            <p className="app-stat-card-value text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)]">{metrics.fleetUtilization}%</p>
          </Card>
          <Card noPadding className="app-stat-card app-stat-card--metric group">
            <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-transparent via-emerald-500 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="app-stat-card-metric-head">
              <Droplet className="h-5 w-5 shrink-0 text-emerald-500/70" />
              <p className="app-stat-card-label">Fuel Efficiency</p>
            </div>
            <p className="app-stat-card-value text-emerald-600 dark:text-emerald-400">
              {metrics.fuelEfficiency} <span className="text-sm font-medium text-emerald-600/70 dark:text-emerald-400/70">km/L</span>
            </p>
          </Card>
          <Card noPadding className="app-stat-card app-stat-card--metric group">
            <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-transparent via-amber-500 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="app-stat-card-metric-head">
              <DollarSign className="h-5 w-5 shrink-0 text-amber-500/70" />
              <p className="app-stat-card-label">Operational Cost</p>
            </div>
            <p className="app-stat-card-value text-amber-600 dark:text-amber-400">
              <span className="text-xl font-bold opacity-75 mr-1">$</span>{metrics.operationalCost.toLocaleString()}
            </p>
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
            <Table comfortable>
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
                    <TableCell className="font-medium text-[var(--text-secondary)]">${((row.expenses || 0) + (row.maintenance || 0)).toLocaleString()}</TableCell>
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
