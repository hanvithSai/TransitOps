import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

/* ─── helpers ──────────────────────────────────────────────── */
const STATUS_BADGE = {
  'Active':    'bg-amber-500/20  text-amber-300  border-amber-500/30',
  'Completed': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
};

const getStatusLabel = (status) => {
  return status === 'Active' ? 'In Shop' : 'Completed';
};

const formatCost = (cost) => {
  return new Intl.NumberFormat().format(cost);
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

/* ─── FormField ────────────────────────────────────────────── */
const FormField = ({ label, id, error, children }) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
      {label}
    </label>
    {children}
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
);

const inputCls =
  'w-full rounded-lg border border-[var(--color-border-light)] bg-[var(--color-surface-900)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20';

/* ─── ConfirmDeleteModal ─────────────────────────────────────── */
const ConfirmDeleteModal = ({ log, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
    <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-surface-800)] shadow-2xl shadow-black/60">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Delete Service Record</h2>
        <button onClick={onCancel} className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-700)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div className="px-6 py-5 space-y-4">
        <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/20">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">Delete this record?</p>
            <p className="text-xs text-[var(--color-text-muted)]">
              {log?.vehicle?.registrationNumber} - {log?.serviceType} (${formatCost(log?.cost)})
            </p>
          </div>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)]">
          This will delete the maintenance log permanently. If the status is currently <span className="text-amber-300 font-semibold">Active</span>, the vehicle status may automatically return to <span className="text-emerald-300 font-semibold">Available</span> if no other active logs exist.
        </p>
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onCancel} className="rounded-lg border border-[var(--color-border-light)] px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-700)]">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60"
          >
            {loading && <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" /></svg>}
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
);

/* ─── Toast ────────────────────────────────────────────────── */
const Toast = ({ message, type, onDismiss }) => {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-xl backdrop-blur-sm transition-all ${
      type === 'success'
        ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300'
        : 'border-red-500/30 bg-red-500/15 text-red-300'
    }`}>
      {type === 'success'
        ? <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="20 6 9 17 4 12" /></svg>
        : <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
      }
      {message}
    </div>
  );
};

/* ─── MaintenancePage ────────────────────────────────────────────── */
const MaintenancePage = () => {
  const { user } = useAuth();
  
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
  const fetchVehicles = async () => {
    try {
      const { data } = await api.get('/vehicles?limit=200');
      // We want to list all non-retired vehicles for scheduling
      setVehicles(data.data.vehicles.filter(v => v.status !== 'Retired'));
    } catch {
      showToast('Failed to load vehicle list', 'error');
    }
  };

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
  }, [fetchLogs]);

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
        const { data } = await api.put(`/maintenance/${editingLog._id}`, form);
        showToast('Service record updated successfully');
        resetForm();
      } else {
        // Create flow
        const { data } = await api.post('/maintenance', form);
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Maintenance logs</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Manage repairs, maintenance records, and costs
        </p>
      </div>

      {/* Main Grid: Split Pane */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* Left Pane: LOG SERVICE RECORD Form */}
        <div className="lg:col-span-4">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-800)] p-5">
            <h2 className="text-md font-bold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-3 mb-4">
              {editingLog ? 'Edit Service Record' : 'Log Service Record'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              {formError && (
                <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {formError}
                </div>
              )}

              {/* VEHICLE dropdown */}
              <FormField label="Vehicle" id="vehicle">
                <select id="vehicle" className={inputCls} value={form.vehicle} onChange={set('vehicle')} required disabled={!!editingLog}>
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
              </FormField>

              {/* SERVICE TYPE */}
              <FormField label="Service Type" id="serviceType">
                <input id="serviceType" className={inputCls} placeholder="Oil Change, Engine Repair, etc." value={form.serviceType} onChange={set('serviceType')} required />
              </FormField>

              {/* COST */}
              <FormField label="Cost" id="cost">
                <input id="cost" type="number" min="0" className={inputCls} placeholder="Cost" value={form.cost} onChange={set('cost')} required />
              </FormField>

              {/* DATE */}
              <FormField label="Date" id="date">
                <input id="date" type="date" className={inputCls} value={form.date} onChange={set('date')} required />
              </FormField>

              {/* STATUS */}
              <FormField label="Status" id="status">
                <select id="status" className={inputCls} value={form.status} onChange={set('status')} required>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                </select>
              </FormField>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-amber-700 hover:bg-amber-600 py-2.5 text-sm font-semibold text-white shadow-md transition-all cursor-pointer disabled:opacity-60"
                >
                  {formLoading && (
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" />
                    </svg>
                  )}
                  Save
                </button>
                {editingLog && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="w-full rounded-lg border border-[var(--color-border-light)] py-2 text-sm font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-700)] transition-colors"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Pane: SERVICE LOGS Table */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Search bar at the top */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[var(--color-text-muted)]">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border-light)] bg-[var(--color-surface-800)] py-2.5 pl-9 pr-4 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {/* Logs Table Container */}
          <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-800)]">
            <h3 className="text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-wider bg-[var(--color-surface-900)]/40 px-5 py-3 border-b border-[var(--color-border)]">
              Service Logs
            </h3>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <svg className="h-8 w-8 animate-spin text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.2" /><path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
              </div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-700)]">
                  <svg className="h-6 w-6 text-[var(--color-text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-[var(--color-text-secondary)]">No service logs found</p>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-900)]/50">
                      {['Vehicle', 'Service', 'Cost', 'Status', ''].map((h) => (
                        <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {logs.map((log) => {
                      const isSelected = editingLog && editingLog._id === log._id;
                      return (
                        <tr
                          key={log._id}
                          onClick={() => handleRowClick(log)}
                          className={`group transition-colors hover:bg-[var(--color-surface-700)]/40 cursor-pointer ${
                            isSelected ? 'bg-amber-500/10 hover:bg-amber-500/15' : ''
                          }`}
                        >
                          {/* VEHICLE */}
                          <td className="px-5 py-4">
                            <p className="font-semibold text-[var(--color-text-primary)]">
                              {log.vehicle?.registrationNumber || 'Unknown Vehicle'}
                            </p>
                            <p className="text-xs text-[var(--color-text-muted)]">
                              {log.vehicle?.vehicleName}
                            </p>
                          </td>
                          
                          {/* SERVICE */}
                          <td className="px-5 py-4">
                            <p className="font-medium text-[var(--color-text-primary)]">
                              {log.serviceType}
                            </p>
                            <p className="text-xs text-[var(--color-text-muted)]">
                              Logged on {formatDate(log.date)}
                            </p>
                          </td>

                          {/* COST */}
                          <td className="px-5 py-4 font-semibold text-[var(--color-text-secondary)]">
                            {formatCost(log.cost)}
                          </td>

                          {/* STATUS */}
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[log.status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'}`}>
                              {getStatusLabel(log.status)}
                            </span>
                          </td>

                          {/* ACTIONS */}
                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingLog(log);
                              }}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-400 opacity-0 group-hover:opacity-100"
                              title="Delete log record"
                            >
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {deletingLog && (
        <ConfirmDeleteModal
          log={deletingLog}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingLog(null)}
          loading={formLoading}
        />
      )}

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
};

export default MaintenancePage;
