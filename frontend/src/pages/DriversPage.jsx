import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

/* ─── helpers ──────────────────────────────────────────────── */
const STATUS_BADGE = {
  'Available': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'On Trip':   'bg-blue-500/20   text-blue-300   border-blue-500/30',
  'Off Duty':  'bg-gray-500/20   text-gray-300   border-gray-500/30',
  'Suspended': 'bg-red-500/20    text-red-300    border-red-500/30',
};

const getSafetyScoreColor = (score) => {
  if (score >= 90) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  if (score >= 70) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  return 'text-red-400 bg-red-500/10 border-red-500/20';
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const isNearExpiryOrExpired = (dateStr) => {
  if (!dateStr) return { expired: false, near: false };
  const expiry = new Date(dateStr);
  const now = new Date();
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) {
    return { expired: true, near: false };
  } else if (diffDays <= 30) {
    return { expired: false, near: true, days: diffDays };
  }
  return { expired: false, near: false };
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

/* ─── DriverForm ─────────────────────────────────────────────── */
const EMPTY_FORM = {
  name: '',
  licenseNumber: '',
  licenseCategory: '',
  expiryDate: '',
  contact: '',
  safetyScore: 100,
  status: 'Available'
};

const DriverForm = ({ initial, onSubmit, loading, error }) => {
  const isEdit = !!initial;
  
  // Format expiryDate to YYYY-MM-DD for input value
  const getInitialForm = () => {
    if (!initial) return EMPTY_FORM;
    const formatted = { ...initial };
    if (formatted.expiryDate) {
      formatted.expiryDate = formatted.expiryDate.split('T')[0];
    }
    return formatted;
  };

  const [form, setForm] = useState(getInitialForm());

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

      <FormField label="Full Name" id="name">
        <input id="name" className={inputCls} placeholder="John Doe" value={form.name} onChange={set('name')} required />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="License No." id="licenseNumber">
          <input id="licenseNumber" className={`${inputCls} uppercase`} placeholder="DL-12345678" value={form.licenseNumber} onChange={set('licenseNumber')} required />
        </FormField>
        <FormField label="License Category" id="licenseCategory">
          <input id="licenseCategory" className={inputCls} placeholder="Class A CDL" value={form.licenseCategory} onChange={set('licenseCategory')} required />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="License Expiry" id="expiryDate">
          <input id="expiryDate" type="date" className={inputCls} value={form.expiryDate} onChange={set('expiryDate')} required />
        </FormField>
        <FormField label="Contact" id="contact">
          <input id="contact" className={inputCls} placeholder="+1 (555) 019-2834" value={form.contact} onChange={set('contact')} required />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Safety Score (0-100)" id="safetyScore">
          <input id="safetyScore" type="number" min="0" max="100" className={inputCls} value={form.safetyScore} onChange={set('safetyScore')} required />
        </FormField>
        <FormField label="Status" id="status">
          <select id="status" className={inputCls} value={form.status} onChange={set('status')} required>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="Off Duty">Off Duty</option>
            <option value="Suspended">Suspended</option>
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
          {isEdit ? 'Save Changes' : 'Add Driver'}
        </button>
      </div>
    </form>
  );
};

/* ─── ConfirmModal ─────────────────────────────────────────── */
const ConfirmModal = ({ driver, onConfirm, onCancel, loading }) => (
  <Modal title="Delete Driver" onClose={onCancel}>
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/20">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6M9 6V4h6v2" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">Delete {driver.name}?</p>
          <p className="text-xs text-[var(--color-text-muted)]">License: {driver.licenseNumber} • {driver.licenseCategory}</p>
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
          Delete Driver
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

/* ─── DriversPage ────────────────────────────────────────────── */
const DriversPage = () => {
  const { user } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [modal, setModal] = useState(null); // null | 'create' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const [toast, setToast] = useState(null);

  // Authorization check for actions
  const canManage = user?.role?.name === 'admin' || user?.role?.name === 'safety_officer';

  const showToast = (message, type = 'success') => setToast({ message, type });

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/drivers?limit=100&search=${search}&status=${statusFilter}`);
      setDrivers(data.data.drivers);
    } catch {
      showToast('Failed to load drivers', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  /* create */
  const handleCreate = async (form) => {
    setFormLoading(true);
    setFormError('');
    try {
      await api.post('/drivers', form);
      showToast(`Driver "${form.name}" added`);
      setModal(null);
      fetchDrivers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add driver');
    } finally {
      setFormLoading(false);
    }
  };

  /* edit */
  const handleEdit = async (form) => {
    setFormLoading(true);
    setFormError('');
    try {
      await api.put(`/drivers/${selected._id}`, form);
      showToast(`Driver "${form.name}" updated`);
      setModal(null);
      fetchDrivers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update driver');
    } finally {
      setFormLoading(false);
    }
  };

  /* delete */
  const handleDelete = async () => {
    setFormLoading(true);
    try {
      await api.delete(`/drivers/${selected._id}`);
      showToast(`Driver "${selected.name}" deleted`);
      setModal(null);
      fetchDrivers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete driver', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const openEdit = (driver) => {
    setSelected(driver);
    setFormError('');
    setModal('edit');
  };

  const openDelete = (driver) => {
    setSelected(driver);
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
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Driver Registry</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Manage drivers, license expirations, and safety scores
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
            Add Driver
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total Drivers',   value: drivers.length,                                      color: 'text-[var(--color-brand-400)]' },
          { label: 'Available',       value: drivers.filter((d) => d.status === 'Available').length, color: 'text-emerald-400' },
          { label: 'On Trip',         value: drivers.filter((d) => d.status === 'On Trip').length,   color: 'text-blue-400' },
          { label: 'Off Duty/Susp.',  value: drivers.filter((d) => d.status === 'Off Duty' || d.status === 'Suspended').length, color: 'text-amber-400' },
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
            placeholder="Search by name, license number, category…"
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
          <option value="Off Duty">Off Duty</option>
          <option value="Suspended">Suspended</option>
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
        ) : drivers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-700)]">
              <svg className="h-6 w-6 text-[var(--color-text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </div>
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">No drivers found</p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-900)]/50">
                  {['Driver', 'License Details', 'Contact', 'Safety Score', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {drivers.map((driver) => {
                  const initials = driver.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'D';
                  const expiryCheck = isNearExpiryOrExpired(driver.expiryDate);
                  return (
                    <tr key={driver._id} className="group transition-colors hover:bg-[var(--color-surface-700)]/40">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-brand-600)] to-[var(--color-brand-700)] text-xs font-bold text-white shadow-sm">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-[var(--color-text-primary)]">{driver.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <p className="font-medium text-[var(--color-text-primary)]">{driver.licenseNumber}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">
                            {driver.licenseCategory} • Exp: {' '}
                            <span className={expiryCheck.expired ? 'text-red-400 font-semibold' : expiryCheck.near ? 'text-amber-400 font-semibold' : ''}>
                              {formatDate(driver.expiryDate)}
                            </span>
                            {expiryCheck.expired && <span className="ml-1 text-[10px] uppercase font-bold text-red-500 bg-red-500/10 border border-red-500/20 px-1 rounded font-sans">Expired</span>}
                            {expiryCheck.near && <span className="ml-1 text-[10px] uppercase font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1 rounded font-sans">Expiring</span>}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-[var(--color-text-secondary)]">
                        {driver.contact}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-bold ${getSafetyScoreColor(driver.safetyScore)}`}>
                          {driver.safetyScore}/100
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE[driver.status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'}`}>
                          {driver.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {canManage && (
                          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              onClick={() => openEdit(driver)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-brand-600)]/15 hover:text-[var(--color-brand-400)]"
                              title="Edit driver"
                            >
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => openDelete(driver)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-400"
                              title="Delete driver"
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal === 'create' && (
        <Modal title="Add New Driver" onClose={closeModal}>
          <DriverForm onSubmit={handleCreate} loading={formLoading} error={formError} />
        </Modal>
      )}

      {modal === 'edit' && selected && (
        <Modal title="Edit Driver" onClose={closeModal}>
          <DriverForm
            initial={selected}
            onSubmit={handleEdit}
            loading={formLoading}
            error={formError}
          />
        </Modal>
      )}

      {modal === 'delete' && selected && (
        <ConfirmModal driver={selected} onConfirm={handleDelete} onCancel={closeModal} loading={formLoading} />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
};

export default DriversPage;
