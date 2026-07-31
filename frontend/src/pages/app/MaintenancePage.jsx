import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Wrench, 
  Search, 
  Plus, 
  Calendar, 
  DollarSign, 
  Trash2, 
  AlertTriangle, 
  CarFront,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/common/Modal';
import { SelectField } from '../../components/common/SelectField';
import { Table, TableHead, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import { Toast } from '../../components/common/Toast';
import { PageHeader } from '../../components/ui/PageHeader';
import { maintenanceFormSchema } from '../../schemas/maintenance';

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
  <div className="space-y-4">
    <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-900/10">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
      </div>
      <div>
        <p className="text-sm font-semibold text-[var(--text-primary)]">Delete this record?</p>
        <p className="text-xs text-[var(--text-muted)]">
          {log?.vehicle?.registrationNumber} - {log?.serviceType} ({formatCost(log?.cost)})
        </p>
      </div>
    </div>
    <p className="text-sm text-[var(--text-secondary)]">
      This will delete the maintenance log permanently. If the status is currently <span className="font-semibold text-amber-600 dark:text-amber-500">Active</span>, the vehicle status may automatically return to <span className="font-semibold text-emerald-600 dark:text-emerald-500">Available</span> if no other active logs exist.
    </p>
    <div className="flex justify-end gap-3 pt-4">
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
      const { data } = await api.get(`/maintenance?limit=100&search=${search}`);
      setLogs(data.data.logs);
    } catch {
      showToast('Failed to load maintenance logs', 'error');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchVehicles();
    fetchLogs();
  }, [fetchVehicles, fetchLogs]);

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
      fetchVehicles(); // Refresh vehicle availability status
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete record', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="app-page-stack max-w-7xl mx-auto">
      <PageHeader
        icon={Wrench}
        title="Maintenance logs"
        subtitle="Manage repairs, maintenance records, and costs to keep your fleet running"
      />

      {/* Main Grid: Split Pane */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* Left Pane: LOG SERVICE RECORD Form */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card className="p-5 flex flex-col h-full border-[var(--border-base)] shadow-sm">
            <div className="flex items-center gap-2 border-b border-[var(--border-base)] pb-4 mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-brand-50)] text-[var(--color-brand-600)] dark:bg-[var(--color-brand-900)]/20 dark:text-[var(--color-brand-400)]">
                {editingLog ? <Wrench className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                {editingLog ? 'Edit Service Record' : 'Log Service Record'}
              </h2>
            </div>

            <form onSubmit={handleSubmit(handleSave)} className="space-y-4 flex-1 flex flex-col">
              {formError && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label htmlFor="vehicle" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5 mb-1.5">
                  <CarFront className="h-3.5 w-3.5" /> Vehicle
                </label>
                <SelectField id="vehicle" error={errors.vehicle?.message} disabled={!!editingLog} required {...register('vehicle')}>
                  <option value="" disabled>Select Vehicle...</option>
                  {vehicles.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.registrationNumber} ({v.vehicleName}) - {v.status}
                    </option>
                  ))}
                  {editingLog && editingLog.vehicle && !vehicles.find(v => v._id === editingLog.vehicle._id) && (
                    <option value={editingLog.vehicle._id}>
                      {editingLog.vehicle.registrationNumber} ({editingLog.vehicle.vehicleName})
                    </option>
                  )}
                </SelectField>
              </div>

              <div>
                <label htmlFor="serviceType" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5 mb-1.5">
                  <Wrench className="h-3.5 w-3.5" /> Service Type
                </label>
                <Input 
                  id="serviceType" 
                  placeholder="e.g., Oil Change, Tire Rotation" 
                  error={errors.serviceType?.message}
                  {...register('serviceType')}
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cost" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5 mb-1.5">
                    <DollarSign className="h-3.5 w-3.5" /> Cost
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 z-10">
                      <span className="text-[var(--text-muted)] sm:text-sm">$</span>
                    </div>
                    <Input 
                      id="cost" 
                      type="number" 
                      min="0" 
                      step="0.01"
                      className="pl-7"
                      placeholder="0.00" 
                      error={errors.cost?.message}
                      {...register('cost')}
                      required 
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="date" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5 mb-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Date
                  </label>
                  <Input 
                    id="date" 
                    type="date" 
                    error={errors.date?.message}
                    {...register('date')}
                    required 
                  />
                </div>
              </div>

              <SelectField label="Status" id="status" error={errors.status?.message} required {...register('status')}>
                <option value="Active">Active (In Shop)</option>
                <option value="Completed">Completed</option>
              </SelectField>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-6 mt-auto">
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
        </div>

        {/* Right Pane: SERVICE LOGS Table */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          {/* Search bar */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[var(--text-muted)]">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Search by vehicle, service type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-base)] bg-[var(--bg-surface)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none transition-all focus:border-[var(--color-brand-500)] focus:ring-1 focus:ring-[var(--color-brand-500)] shadow-sm hover:border-[var(--border-hover)]"
            />
          </div>

          {/* Logs Table Container */}
          <div className="overflow-hidden rounded-xl border border-[var(--border-base)] bg-[var(--bg-surface)] shadow-sm flex-1 flex flex-col">
            <div className="flex items-center justify-between bg-[var(--bg-base)] px-5 py-4 border-b border-[var(--border-base)]">
              <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-2">
                <Wrench className="h-3.5 w-3.5" /> Service History
              </h3>
              <Badge variant="outline" className="text-xs font-medium">
                {logs.length} {logs.length === 1 ? 'Record' : 'Records'}
              </Badge>
            </div>
            
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-brand-500)] border-t-transparent"></div>
              </div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg-base)] border border-[var(--border-base)] shadow-sm">
                  <Wrench className="h-7 w-7 text-[var(--text-muted)]" />
                </div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">No service logs found</p>
                <p className="mt-1 text-xs text-[var(--text-muted)] max-w-[250px]">
                  {search ? 'Try adjusting your search criteria.' : 'Service records will appear here when you log maintenance.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto flex-1">
                <Table>
                  <TableHead>
                    <TableHeader>Vehicle</TableHeader>
                    <TableHeader>Service Details</TableHeader>
                    <TableHeader>Cost</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader className="text-right w-12"></TableHeader>
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
                        >
                          {/* VEHICLE */}
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-base)] border border-[var(--border-base)] group-hover:border-[var(--color-brand-200)] dark:group-hover:border-[var(--color-brand-800)] transition-colors">
                                <CarFront className={`h-4 w-4 ${isSelected ? 'text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)]' : 'text-[var(--text-muted)]'}`} />
                              </div>
                              <div>
                                <p className="font-semibold text-[var(--text-primary)]">
                                  {log.vehicle?.registrationNumber || 'Unknown'}
                                </p>
                                <p className="text-xs text-[var(--text-muted)] truncate max-w-[120px]">
                                  {log.vehicle?.vehicleName || 'N/A'}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          
                          {/* SERVICE */}
                          <TableCell>
                            <p className="font-medium text-[var(--text-primary)] line-clamp-1">
                              {log.serviceType}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-[var(--text-muted)]">
                              <Calendar className="h-3 w-3" />
                              {formatDate(log.date)}
                            </div>
                          </TableCell>

                          {/* COST */}
                          <TableCell>
                            <span className="font-medium text-[var(--text-secondary)]">
                              {formatCost(log.cost)}
                            </span>
                          </TableCell>

                          {/* STATUS */}
                          <TableCell>
                            <Badge variant={STATUS_VARIANT[log.status] || 'default'}>
                              {getStatusLabel(log.status)}
                            </Badge>
                          </TableCell>

                          {/* ACTIONS */}
                          <TableCell className="text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingLog(log);
                              }}
                              className="p-2 text-[var(--text-muted)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              title="Delete log record"
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

      </div>

      {/* Delete Confirmation Modal */}
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

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
};

export default MaintenancePage;
