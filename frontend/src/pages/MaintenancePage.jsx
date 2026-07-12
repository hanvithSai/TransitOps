import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Table, TableHead, TableRow, TableHeader, TableCell } from '../components/ui/Table';
import { Toast } from '../components/ui/Toast';

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
        <svg className="h-5 w-5 text-red-600 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        </svg>
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
    <div className="flex justify-end gap-3 pt-2">
      <Button variant="outline" onClick={onCancel}>Cancel</Button>
      <Button variant="danger" onClick={onConfirm} loading={loading}>Delete</Button>
    </div>
  </div>
);


/* ─── MaintenancePage ────────────────────────────────────────────── */
const MaintenancePage = () => {
  // user not needed here
  
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
    status: 'Active'
  };

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingLog, setEditingLog] = useState(null); // null when creating
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

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

  // Form Field Binder
  const set = (k) => (e) => {
    setForm((p) => ({ ...p, [k]: e.target.value }));
  };

  // Submit Handler: Create or Update
  const handleSave = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      if (editingLog) {
        // Edit flow
        await api.put(`/maintenance/${editingLog._id}`, form);
        showToast('Service record updated successfully');
        resetForm();
      } else {
        // Create flow
        await api.post('/maintenance', form);
        showToast('Service record created successfully');
        resetForm();
      }
      fetchLogs();
      fetchVehicles(); // Refresh statuses
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
    setForm({
      vehicle: log.vehicle?._id || '',
      serviceType: log.serviceType || '',
      cost: log.cost || '',
      date: formatDateForInput(log.date),
      status: log.status || 'Active'
    });
  };

  // Reset Form
  const resetForm = () => {
    setEditingLog(null);
    setFormError('');
    setForm({
      vehicle: '',
      serviceType: '',
      cost: '',
      date: getTodayDateStr(),
      status: 'Active'
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
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Maintenance Logs</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Manage repairs, maintenance records, and costs
        </p>
      </div>

      {/* Main Grid: Split Pane */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* Left Pane: LOG SERVICE RECORD Form */}
        <div className="lg:col-span-4">
          <Card className="p-6">
            <h2 className="text-md font-bold text-[var(--text-primary)] border-b border-[var(--border-base)] pb-4 mb-5">
              {editingLog ? 'Edit Service Record' : 'Log Service Record'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              {formError && (
                <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {formError}
                </div>
              )}

              {/* VEHICLE dropdown */}
              <div className="space-y-1.5">
                <label htmlFor="vehicle" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Vehicle</label>
                <div className="relative">
                  <select id="vehicle" className="w-full appearance-none rounded-[10px] border border-[var(--border-base)] bg-[var(--bg-base)] px-3 py-2 pr-8 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-1 focus:ring-[var(--color-brand-500)] disabled:opacity-60 disabled:cursor-not-allowed" value={form.vehicle} onChange={set('vehicle')} required disabled={!!editingLog}>
                    <option value="">Select Vehicle</option>
                    {vehicles.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.registrationNumber} ({v.vehicleName}) - {v.status}
                      </option>
                    ))}
                    {editingLog && editingLog.vehicle && (
                      <option value={editingLog.vehicle._id}>
                        {editingLog.vehicle.registrationNumber} ({editingLog.vehicle.vehicleName})
                      </option>
                    )}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--text-muted)]">
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  </div>
                </div>
              </div>

              {/* SERVICE TYPE */}
              <div className="space-y-1.5">
                <label htmlFor="serviceType" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Service Type</label>
                <Input id="serviceType" placeholder="Oil Change, Engine Repair, etc." value={form.serviceType} onChange={set('serviceType')} required />
              </div>

              {/* COST */}
              <div className="space-y-1.5">
                <label htmlFor="cost" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Cost</label>
                <Input id="cost" type="number" min="0" placeholder="Cost" value={form.cost} onChange={set('cost')} required />
              </div>

              {/* DATE */}
              <div className="space-y-1.5">
                <label htmlFor="date" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Date</label>
                <Input id="date" type="date" value={form.date} onChange={set('date')} required />
              </div>

              {/* STATUS */}
              <div className="space-y-1.5">
                <label htmlFor="status" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Status</label>
                <div className="relative">
                  <select id="status" className="w-full appearance-none rounded-[10px] border border-[var(--border-base)] bg-[var(--bg-base)] px-3 py-2 pr-8 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-1 focus:ring-[var(--color-brand-500)]" value={form.status} onChange={set('status')} required>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--text-muted)]">
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-4">
                <Button type="submit" loading={formLoading} className="w-full">
                  Save
                </Button>
                {editingLog && (
                  <Button variant="outline" type="button" onClick={resetForm} className="w-full">
                    Cancel Edit
                  </Button>
                )}
              </div>
            </form>
          </Card>
        </div>

        {/* Right Pane: SERVICE LOGS Table */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Search bar at the top */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[var(--text-muted)]">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-[10px] border border-[var(--border-base)] bg-[var(--bg-surface)] py-2.5 pl-9 pr-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-1 focus:ring-[var(--color-brand-500)]"
            />
          </div>

          {/* Logs Table Container */}
          <div className="overflow-hidden rounded-xl border border-[var(--border-base)] bg-[var(--bg-surface)]">
            <h3 className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider bg-[var(--bg-base)] px-5 py-4 border-b border-[var(--border-base)]">
              Service Logs
            </h3>
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-brand-500)] border-t-transparent"></div>
              </div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-base)] border border-[var(--border-base)]">
                  <svg className="h-6 w-6 text-[var(--text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-[var(--text-secondary)]">No service logs found</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">Try adjusting your search criteria</p>
              </div>
            ) : (
              <Table>
                <TableHead>
                  <TableHeader>Vehicle</TableHeader>
                  <TableHeader>Service</TableHeader>
                  <TableHeader>Cost</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader className="text-right"></TableHeader>
                </TableHead>
                <tbody className="divide-y divide-[var(--border-base)]">
                  {logs.map((log) => {
                    const isSelected = editingLog && editingLog._id === log._id;
                    return (
                      <TableRow
                        key={log._id}
                        onClick={() => handleRowClick(log)}
                        className={`cursor-pointer ${
                          isSelected ? 'bg-[var(--bg-surface-hover)]' : ''
                        }`}
                      >
                        {/* VEHICLE */}
                        <TableCell>
                          <p className="font-semibold text-[var(--text-primary)]">
                            {log.vehicle?.registrationNumber || 'Unknown Vehicle'}
                          </p>
                          <p className="text-xs text-[var(--text-muted)]">
                            {log.vehicle?.vehicleName}
                          </p>
                        </TableCell>
                        
                        {/* SERVICE */}
                        <TableCell>
                          <p className="font-medium text-[var(--text-primary)]">
                            {log.serviceType}
                          </p>
                          <p className="text-xs text-[var(--text-muted)]">
                            Logged on {formatDate(log.date)}
                          </p>
                        </TableCell>

                        {/* COST */}
                        <TableCell className="font-semibold text-[var(--text-secondary)]">
                          {formatCost(log.cost)}
                        </TableCell>

                        {/* STATUS */}
                        <TableCell>
                          <Badge variant={STATUS_VARIANT[log.status] || 'default'}>{getStatusLabel(log.status)}</Badge>
                        </TableCell>

                        {/* ACTIONS */}
                        <TableCell className="text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingLog(log);
                            }}
                            className="p-1.5 text-[var(--text-muted)] hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete log record"
                          >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2" />
                            </svg>
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </tbody>
              </Table>
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
