import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

/* ─── helpers ──────────────────────────────────────────────── */
const STATUS_BADGE = {
  'Available': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'On Trip':   'bg-blue-500/20   text-blue-300   border-blue-500/30',
  'In Shop':   'bg-amber-500/20  text-amber-300  border-amber-500/30',
  'Retired':   'bg-red-500/20    text-red-300    border-red-500/30',
};

/* ─── Modal ────────────────────────────────────────────────── */
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
    <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-surface-800)] shadow-2xl shadow-black/60">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)]">{title}</h2>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-700)] hover:text-[var(--color-text-primary)]"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div className="px-6 py-5 max-h-[80vh] overflow-y-auto">{children}</div>
    </div>
  </div>
);

/* ─── FormField ────────────────────────────────────────────── */
const FormField = ({ label, id, error, children }) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-sm font-medium text-[var(--color-text-secondary)]">
      {label}
    </label>
    {children}
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
);

const inputCls =
  'w-full rounded-lg border border-[var(--color-border-light)] bg-[var(--color-surface-900)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] outline-none transition-all focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20';

/* ─── VehicleForm ─────────────────────────────────────────────── */
const EMPTY_FORM = {
  registrationNumber: '',
  vehicleName: '',
  model: '',
  type: '',
  capacity: '',
  odometer: '',
  acquisitionCost: '',
  status: 'Available'
};

const VehicleForm = ({ initial, onSubmit, loading, error }) => {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const isEdit = !!initial;

  const set = (k) => (e) => {
    setForm((p) => ({ ...p, [k]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Registration No." id="registrationNumber">
          <input id="registrationNumber" className={`${inputCls} uppercase`} placeholder="AB12CD3456" value={form.registrationNumber} onChange={set('registrationNumber')} required />
        </FormField>
        <FormField label="Vehicle Name" id="vehicleName">
          <input id="vehicleName" className={inputCls} placeholder="Truck 1" value={form.vehicleName} onChange={set('vehicleName')} required />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Model" id="model">
          <input id="model" className={inputCls} placeholder="Volvo FH16" value={form.model} onChange={set('model')} required />
        </FormField>
        <FormField label="Type" id="type">
          <input id="type" className={inputCls} placeholder="Heavy Duty" value={form.type} onChange={set('type')} required />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Capacity (kg)" id="capacity">
          <input id="capacity" type="number" step="0.1" min="0.1" className={inputCls} placeholder="10.5" value={form.capacity} onChange={set('capacity')} required />
        </FormField>
        <FormField label="Odometer (km)" id="odometer">
          <input id="odometer" type="number" step="0.1" min="0" className={inputCls} placeholder="50000" value={form.odometer} onChange={set('odometer')} required />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Acquisition Cost" id="acquisitionCost">
          <input id="acquisitionCost" type="number" min="0" className={inputCls} placeholder="1500000" value={form.acquisitionCost} onChange={set('acquisitionCost')} />
        </FormField>
        <FormField label="Status" id="status">
          <select id="status" className={inputCls} value={form.status} onChange={set('status')} required>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="In Shop">In Shop</option>
            <option value="Retired">Retired</option>
          </select>
        </FormField>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[var(--color-brand-600)] to-[var(--color-brand-700)] px-5 py-2 text-sm font-semibold text-white shadow-md shadow-blue-900/30 transition-all hover:from-[var(--color-brand-500)] hover:to-[var(--color-brand-600)] disabled:opacity-60"
        >
          {loading && (
            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
          )}
          {isEdit ? 'Save Changes' : 'Add Vehicle'}
        </button>
      </div>
    </form>
  );
};

/* ─── ConfirmModal ─────────────────────────────────────────── */
const ConfirmModal = ({ vehicle, onConfirm, onCancel, loading }) => (
  <Modal title="Delete Vehicle" onClose={onCancel}>
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/20">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6M9 6V4h6v2" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">Delete {vehicle.registrationNumber}?</p>
          <p className="text-xs text-[var(--color-text-muted)]">{vehicle.vehicleName} - {vehicle.model}</p>
        </div>
      </div>
      <p className="text-sm text-[var(--color-text-secondary)]">
        This action <span className="font-semibold text-red-400">cannot be undone</span>.
      </p>
      <div className="flex justify-end gap-3">
        <button onClick={onCancel} className="rounded-lg border border-[var(--color-border-light)] px-4 py-2 text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-700)]">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:opacity-60"
        >
          {loading && <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" /></svg>}
          Delete Vehicle
        </button>
      </div>
    </div>
  </Modal>
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

/* ─── VehiclesPage ────────────────────────────────────────────── */
const VehiclesPage = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [modal, setModal] = useState(null); // null | 'create' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const [toast, setToast] = useState(null);

  // Authorization check for actions
  const canManage = user?.role?.name === 'admin' || user?.role?.name === 'fleet_manager';

  const showToast = (message, type = 'success') => setToast({ message, type });

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/vehicles?limit=100&search=${search}&status=${statusFilter}`);
      setVehicles(data.data.vehicles);
    } catch {
      showToast('Failed to load vehicles', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  /* create */
  const handleCreate = async (form) => {
    setFormLoading(true);
    setFormError('');
    try {
      await api.post('/vehicles', form);
      showToast(`Vehicle "${form.registrationNumber}" added`);
      setModal(null);
      fetchVehicles();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add vehicle');
    } finally {
      setFormLoading(false);
    }
  };

  /* edit */
  const handleEdit = async (form) => {
    setFormLoading(true);
    setFormError('');
    try {
      await api.put(`/vehicles/${selected._id}`, form);
      showToast(`Vehicle "${form.registrationNumber}" updated`);
      setModal(null);
      fetchVehicles();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update vehicle');
    } finally {
      setFormLoading(false);
    }
  };

  /* delete */
  const handleDelete = async () => {
    setFormLoading(true);
    try {
      await api.delete(`/vehicles/${selected._id}`);
      showToast(`Vehicle "${selected.registrationNumber}" deleted`);
      setModal(null);
      fetchVehicles();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete vehicle', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const openEdit = (vehicle) => {
    setSelected(vehicle);
    setFormError('');
    setModal('edit');
  };

  const openDelete = (vehicle) => {
    setSelected(vehicle);
    setModal('delete');
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setFormError('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Vehicle Registry</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Manage your fleet, track capacity and status
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => { setFormError(''); setModal('create'); }}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-brand-600)] to-[var(--color-brand-700)] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition-all hover:from-[var(--color-brand-500)] hover:to-[var(--color-brand-600)] hover:shadow-blue-700/40"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Vehicle
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total Fleet',    value: vehicles.length,                                      color: 'text-[var(--color-brand-400)]' },
          { label: 'Available',      value: vehicles.filter((v) => v.status === 'Available').length, color: 'text-emerald-400' },
          { label: 'On Trip',        value: vehicles.filter((v) => v.status === 'On Trip').length,   color: 'text-blue-400' },
          { label: 'In Shop/Retired', value: vehicles.filter((v) => v.status === 'In Shop' || v.status === 'Retired').length, color: 'text-amber-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-800)] px-4 py-3">
            <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
            <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[var(--color-text-muted)]">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by reg, name, model…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border-light)] bg-[var(--color-surface-800)] py-2.5 pl-9 pr-4 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-[var(--color-border-light)] bg-[var(--color-surface-800)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20"
        >
          <option value="">All Statuses</option>
          <option value="Available">Available</option>
          <option value="On Trip">On Trip</option>
          <option value="In Shop">In Shop</option>
          <option value="Retired">Retired</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-800)]">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="h-8 w-8 animate-spin text-[var(--color-brand-500)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <circle cx="12" cy="12" r="10" strokeOpacity="0.2" /><path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-700)]">
              <svg className="h-6 w-6 text-[var(--color-text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
            </div>
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">No vehicles found</p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-900)]/50">
                  {['Registration', 'Details', 'Capacity/Odo', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {vehicles.map((vehicle) => (
                  <tr key={vehicle._id} className="group transition-colors hover:bg-[var(--color-surface-700)]/40">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-12 shrink-0 items-center justify-center rounded border border-[var(--color-border-light)] bg-[var(--color-surface-900)] text-xs font-bold text-[var(--color-text-primary)]">
                          {vehicle.registrationNumber}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-[var(--color-text-primary)]">{vehicle.vehicleName}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{vehicle.model} • {vehicle.type}</p>
                    </td>
                    <td className="px-5 py-4 text-xs text-[var(--color-text-secondary)]">
                      <p>{vehicle.capacity} kg</p>
                      <p className="text-[var(--color-text-muted)]">{vehicle.odometer} km</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE[vehicle.status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'}`}>
                        {vehicle.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {canManage && (
                        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={() => openEdit(vehicle)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-brand-600)]/15 hover:text-[var(--color-brand-400)]"
                            title="Edit vehicle"
                          >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openDelete(vehicle)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-400"
                            title="Delete vehicle"
                          >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal === 'create' && (
        <Modal title="Add New Vehicle" onClose={closeModal}>
          <VehicleForm onSubmit={handleCreate} loading={formLoading} error={formError} />
        </Modal>
      )}

      {modal === 'edit' && selected && (
        <Modal title="Edit Vehicle" onClose={closeModal}>
          <VehicleForm
            initial={selected}
            onSubmit={handleEdit}
            loading={formLoading}
            error={formError}
          />
        </Modal>
      )}

      {modal === 'delete' && selected && (
        <ConfirmModal vehicle={selected} onConfirm={handleDelete} onCancel={closeModal} loading={formLoading} />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
};

export default VehiclesPage;
