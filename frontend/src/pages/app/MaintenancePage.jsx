import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Wrench, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  AlertCircle,
  CarFront,
  Calendar,
  History,
} from 'lucide-react';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/common/Modal';
import { SelectField } from '../../components/common/SelectField';
import { SearchInput } from '../../components/common/SearchInput';
import { Table, TableHead, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import { Toast } from '../../components/common/Toast';
import { PageHeader } from '../../components/ui/PageHeader';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { maintenanceFormSchema } from '../../schemas/maintenance';
import { useDebounce } from '../../hooks/useDebounce';

/* ─── helpers ──────────────────────────────────────────────── */
const STATUS_VARIANT = {
  'Active':    'warning',
  'Completed': 'success',
};

const getStatusLabel = (status) => {
  return status === 'Active' ? 'In Shop' : 'Completed';
};

const formatCost = (cost) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cost);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'numeric', day: 'numeric' });
};

const formatDateForInput = (dateStr) => {
  if (!dateStr) return '';
  return dateStr.split('T')[0];
};

/* ─── ConfirmDeleteModal ─────────────────────────────────────── */
const ConfirmDeleteModal = ({ log, onConfirm, onCancel, loading }) => (
  <div className="app-form-stack">
    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-900/10">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[var(--text-primary)]">Delete this record?</p>
        <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
          {log?.vehicle?.registrationNumber} — {log?.serviceType} ({formatCost(log?.cost)})
        </p>
      </div>
    </div>
    <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
      This will delete the maintenance log permanently. If the status is currently <span className="font-semibold text-amber-600 dark:text-amber-500">Active</span>, the vehicle status may automatically return to <span className="font-semibold text-emerald-600 dark:text-emerald-500">Available</span> if no other active logs exist.
    </p>
    <div className="app-modal-footer">
      <Button variant="outline" onClick={onCancel}>Cancel</Button>
      <Button variant="danger" onClick={onConfirm} loading={loading}>Delete Record</Button>
    </div>
  </div>
);


/* ─── MaintenancePage ────────────────────────────────────────────── */
const MaintenancePage = () => {
  // Data States
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  
  // Form States
  const getTodayDateStr = () => new Date().toISOString().split('T')[0];
  
  const EMPTY_FORM = {
    vehicle: '',
    serviceType: '',
    cost: '',
    date: getTodayDateStr(),
    status: 'Active',
  };

  const [editingLog, setEditingLog] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: EMPTY_FORM,
  });

  // Delete State
  const [deletingLog, setDeletingLog] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [scheduleForm, setScheduleForm] = useState({ vehicle: '', serviceType: '', intervalDays: '90', intervalKm: '5000' });

  // Notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  // Fetch Vehicles & Maintenance Logs
  const fetchVehicles = useCallback(async () => {
    try {
      const { data } = await api.get('/vehicles?limit=200');
      setVehicles(data.data.vehicles.filter(v => v.status !== 'Retired'));
    } catch {
      showToast('Failed to load vehicle list', 'error');
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/maintenance?limit=100&search=${debouncedSearch}`);
      setLogs(data.data.logs);
    } catch {
      showToast('Failed to load maintenance logs', 'error');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  const fetchSchedules = useCallback(async () => {
    try {
      const { data } = await api.get('/maintenance-schedules?limit=50');
      setSchedules(data.data.schedules || []);
    } catch {
      setSchedules([]);
    }
  }, []);

  const handleScheduleCreate = async (e) => {
    e.preventDefault();
    if (!scheduleForm.vehicle || !scheduleForm.serviceType) return;
    try {
      await api.post('/maintenance-schedules', {
        vehicle: scheduleForm.vehicle,
        serviceType: scheduleForm.serviceType,
        intervalDays: Number(scheduleForm.intervalDays) || 0,
        intervalKm: Number(scheduleForm.intervalKm) || 0,
      });
      showToast('Recurring schedule created');
      setScheduleForm({ vehicle: '', serviceType: '', intervalDays: '90', intervalKm: '5000' });
      fetchSchedules();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create schedule', 'error');
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchLogs();
    fetchSchedules();
  }, [fetchVehicles, fetchLogs, fetchSchedules]);

  // Submit Handler: Create or Update
  const handleSave = async (form) => {
    setFormLoading(true);
    setFormError('');

    try {
      if (editingLog) {
        await api.put(`/maintenance/${editingLog._id}`, form);
        showToast('Service record updated successfully');
        resetForm();
      } else {
        await api.post('/maintenance', form);
        showToast('Service record created successfully');
        resetForm();
      }
      fetchLogs();
      fetchVehicles();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save service record');
    } finally {
      setFormLoading(false);
    }
  };

  // Select Log for Editing
  const handleRowClick = (log) => {
    setEditingLog(log);
    setFormError('');
    reset({
      vehicle: log.vehicle?._id || '',
      serviceType: log.serviceType || '',
      cost: log.cost || '',
      date: formatDateForInput(log.date),
      status: log.status || 'Active',
    });
  };

  // Reset Form
  const resetForm = () => {
    setEditingLog(null);
    setFormError('');
    reset({
      vehicle: '',
      serviceType: '',
      cost: '',
      date: getTodayDateStr(),
      status: 'Active',
    });
  };

  // Delete Handler
  const handleDeleteConfirm = async () => {
    setFormLoading(true);
    try {
      await api.delete(`/maintenance/${deletingLog._id}`);
      showToast('Service record deleted successfully');
      setDeletingLog(null);
      if (editingLog && editingLog._id === deletingLog._id) {
        resetForm();
      }
      fetchLogs();
      fetchVehicles();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete record', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="app-page-stack">
      <PageHeader
        icon={Wrench}
        title="Maintenance logs"
        subtitle="Manage repairs, maintenance records, and costs to keep your fleet running"
      />

      <nav className="app-maintenance-section-nav" aria-label="Maintenance page sections">
        <a href="#maintenance-log-service" className="app-maintenance-section-link">
          <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
          Log service
        </a>
        <a href="#maintenance-schedules" className="app-maintenance-section-link">
          <Calendar className="h-4 w-4 shrink-0" aria-hidden="true" />
          Recurring schedules
        </a>
        <a href="#maintenance-history" className="app-maintenance-section-link">
          <History className="h-4 w-4 shrink-0" aria-hidden="true" />
          Service history
        </a>
      </nav>

      <div className="app-maintenance-workspace">
        {/* Sidebar: form + schedules — always above the fold on desktop */}
        <aside className="app-maintenance-sidebar" aria-label="Log service and recurring schedules">
          <section id="maintenance-log-service" className="app-maintenance-section" aria-labelledby="maintenance-log-service-heading">
            <Card noPadding className="app-maintenance-form-card">
              <div className="app-maintenance-panel-head">
                <div className="app-maintenance-panel-head-icon" aria-hidden="true">
                  {editingLog ? <Wrench className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                </div>
                <h2 id="maintenance-log-service-heading" className="app-maintenance-panel-head-title">
                  {editingLog ? 'Edit Service Record' : 'Log Service Record'}
                </h2>
              </div>

              <form onSubmit={handleSubmit(handleSave)} className="app-maintenance-form-body app-form-stack">
                {formError && (
                  <div className="app-form-alert" role="alert">
                    <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <span>{formError}</span>
                  </div>
                )}

                <SelectField
                  label="Vehicle"
                  id="vehicle"
                  error={errors.vehicle?.message}
                  disabled={!!editingLog}
                  required
                  {...register('vehicle')}
                >
                  <option value="" disabled>Select vehicle…</option>
                  {vehicles.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.registrationNumber} ({v.vehicleName}) — {v.status}
                    </option>
                  ))}
                  {editingLog && editingLog.vehicle && !vehicles.find(v => v._id === editingLog.vehicle._id) && (
                    <option value={editingLog.vehicle._id}>
                      {editingLog.vehicle.registrationNumber} ({editingLog.vehicle.vehicleName})
                    </option>
                  )}
                </SelectField>

                <Input
                  label="Service type"
                  id="serviceType"
                  placeholder="e.g., Oil change, tire rotation"
                  error={errors.serviceType?.message}
                  {...register('serviceType')}
                  required
                />

                <div className="app-form-grid app-form-grid--2">
                  <Input
                    label="Cost"
                    id="cost"
                    type="number"
                    min="0"
                    step="0.01"
                    prefix="$"
                    placeholder="0.00"
                    error={errors.cost?.message}
                    {...register('cost')}
                    required
                  />
                  <Input
                    label="Date"
                    id="date"
                    type="date"
                    error={errors.date?.message}
                    {...register('date')}
                    required
                  />
                </div>

                <SelectField label="Status" id="status" error={errors.status?.message} required {...register('status')}>
                  <option value="Active">Active (In shop)</option>
                  <option value="Completed">Completed</option>
                </SelectField>

                <div className="app-maintenance-form-actions">
                  <Button type="submit" loading={formLoading} className="w-full">
                    {editingLog ? 'Update Record' : 'Save Record'}
                  </Button>
                  {editingLog && (
                    <Button variant="outline" type="button" onClick={resetForm} className="w-full">
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Card>
          </section>

          <section id="maintenance-schedules" className="app-maintenance-section" aria-labelledby="maintenance-schedules-heading">
            <Card noPadding className="app-maintenance-schedules-card">
              <div className="app-maintenance-panel-head">
                <div className="app-maintenance-panel-head-icon" aria-hidden="true">
                  <Calendar className="h-5 w-5" />
                </div>
                <h2 id="maintenance-schedules-heading" className="app-maintenance-panel-head-title">
                  Recurring schedules
                </h2>
              </div>

              <div className="app-maintenance-schedules-body">
                {schedules.length === 0 ? (
                  <p className="mb-4 text-sm leading-relaxed text-[var(--text-muted)]">
                    No schedules yet. Add one below.
                  </p>
                ) : (
                  <div className="app-maintenance-schedules-list-wrap">
                    <ul className="app-maintenance-schedules-list" aria-label="Existing recurring schedules">
                      {schedules.map((s) => (
                        <li key={s._id}>
                          <span className="font-medium text-[var(--text-primary)]">{s.vehicle?.registrationNumber}</span>
                          {' — '}
                          {s.serviceType}
                          <span className="text-[var(--text-muted)]">
                            {' '}(every {s.intervalDays || '—'} days / {s.intervalKm || '—'} km)
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <form onSubmit={handleScheduleCreate} className="app-maintenance-schedule-form" aria-label="Add recurring schedule">
                  <SelectField
                    label="Vehicle"
                    value={scheduleForm.vehicle}
                    onChange={(e) => setScheduleForm((p) => ({ ...p, vehicle: e.target.value }))}
                    required
                  >
                    <option value="">Select vehicle</option>
                    {vehicles.map((v) => (
                      <option key={v._id} value={v._id}>{v.registrationNumber}</option>
                    ))}
                  </SelectField>
                  <Input
                    label="Service type"
                    value={scheduleForm.serviceType}
                    onChange={(e) => setScheduleForm((p) => ({ ...p, serviceType: e.target.value }))}
                    required
                  />
                  <Input
                    label="Interval (days)"
                    type="number"
                    value={scheduleForm.intervalDays}
                    onChange={(e) => setScheduleForm((p) => ({ ...p, intervalDays: e.target.value }))}
                  />
                  <Input
                    label="Interval (km)"
                    type="number"
                    value={scheduleForm.intervalKm}
                    onChange={(e) => setScheduleForm((p) => ({ ...p, intervalKm: e.target.value }))}
                  />
                  <div className="app-maintenance-schedule-form-submit">
                    <Button type="submit" className="w-full">Add schedule</Button>
                  </div>
                </form>
              </div>
            </Card>
          </section>
        </aside>

        {/* Main: searchable service history */}
        <div className="app-maintenance-main">
          <section id="maintenance-history" className="app-maintenance-section" aria-labelledby="maintenance-history-heading">
            <div className="app-toolbar-card">
              <SearchInput
                containerClassName="app-toolbar-search w-full"
                placeholder="Search by vehicle, service type…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search service history"
              />
            </div>

            <div className="app-table-panel app-maintenance-history-panel">
              <div className="app-table-panel-head">
                <h2 id="maintenance-history-heading" className="app-table-panel-title">
                  <History className="h-4 w-4" aria-hidden="true" /> Service History
                </h2>
                <Badge variant="outline" className="text-xs font-medium">
                  {logs.length} {logs.length === 1 ? 'Record' : 'Records'}
                </Badge>
              </div>

              <div className="app-maintenance-history-body">
                {loading ? (
                  <div className="app-table-panel-body-loading">
                    <SkeletonTable rows={6} />
                  </div>
                ) : logs.length === 0 ? (
                  <EmptyState
                    icon={Wrench}
                    title="No service logs found"
                    description={search ? 'Try adjusting your search criteria.' : 'Service records will appear here when you log maintenance using the form.'}
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <Table comfortable>
                      <TableHead>
                        <TableHeader>Vehicle</TableHeader>
                        <TableHeader>Service Details</TableHeader>
                        <TableHeader align="right">Cost</TableHeader>
                        <TableHeader>Status</TableHeader>
                        <TableHeader align="right" className="w-16" />
                      </TableHead>
                      <tbody className="divide-y divide-[var(--border-base)]">
                        {logs.map((log) => {
                          const isSelected = editingLog && editingLog._id === log._id;
                          return (
                            <TableRow
                              key={log._id}
                              onClick={() => handleRowClick(log)}
                              className={`cursor-pointer transition-colors group ${
                                isSelected ? 'bg-[var(--color-brand-50)] dark:bg-[var(--color-brand-900)]/10' : 'hover:bg-[var(--bg-surface-hover)]'
                              }`}
                              aria-selected={isSelected || undefined}
                            >
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border-base)] bg-[var(--bg-base)] transition-colors group-hover:border-[var(--color-brand-200)] dark:group-hover:border-[var(--color-brand-800)]">
                                    <CarFront className={`h-4 w-4 ${isSelected ? 'text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)]' : 'text-[var(--text-muted)]'}`} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-semibold text-[var(--text-primary)]">
                                      {log.vehicle?.registrationNumber || 'Unknown'}
                                    </p>
                                    <p className="truncate text-xs text-[var(--text-muted)]">
                                      {log.vehicle?.vehicleName || 'N/A'}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>

                              <TableCell>
                                <p className="line-clamp-2 font-medium text-[var(--text-primary)]">
                                  {log.serviceType}
                                </p>
                                <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                                  <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                  {formatDate(log.date)}
                                </div>
                              </TableCell>

                              <TableCell align="right">
                                <span className="font-medium text-[var(--text-secondary)]">
                                  {formatCost(log.cost)}
                                </span>
                              </TableCell>

                              <TableCell>
                                <Badge variant={STATUS_VARIANT[log.status] || 'default'}>
                                  {getStatusLabel(log.status)}
                                </Badge>
                              </TableCell>

                              <TableCell align="right">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeletingLog(log);
                                  }}
                                  className="rounded-lg p-2 text-[var(--text-muted)] opacity-0 transition-colors hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-500)] dark:hover:bg-red-900/20"
                                  title="Delete log record"
                                  aria-label={`Delete service record for ${log.vehicle?.registrationNumber || 'vehicle'}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {deletingLog && (
        <Modal title="Delete Service Record" onClose={() => setDeletingLog(null)}>
          <ConfirmDeleteModal
            log={deletingLog}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeletingLog(null)}
            loading={formLoading}
          />
        </Modal>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
};

export default MaintenancePage;
