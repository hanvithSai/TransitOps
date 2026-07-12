import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Table, TableHead, TableRow, TableHeader, TableCell } from '../components/ui/Table';
import { Toast } from '../components/ui/Toast';

/* ─── helpers ──────────────────────────────────────────────── */
const STATUS_VARIANT = {
  'Available': 'success',
  'On Trip':   'info',
  'Off Duty':  'default',
  'Suspended': 'danger',
};

const getSafetyScoreVariant = (score) => {
  if (score >= 90) return 'success';
  if (score >= 70) return 'warning';
  return 'danger';
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const isNearExpiryOrExpired = (dateStr) => {
  if (!dateStr) return { expired: false, near: false, days: Infinity };
  const expiry = new Date(dateStr);
  const now = new Date();
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) {
    return { expired: true, near: false, days: diffDays };
  } else if (diffDays <= 30) {
    return { expired: false, near: true, days: diffDays };
  }
  return { expired: false, near: false, days: diffDays };
};

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
        <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      <Input label="Full Name" id="name" placeholder="John Doe" value={form.name} onChange={set('name')} required />

      <div className="grid grid-cols-2 gap-4">
        <Input label="License No." id="licenseNumber" className="uppercase" placeholder="DL-12345678" value={form.licenseNumber} onChange={set('licenseNumber')} required />
        <Input label="License Category" id="licenseCategory" placeholder="Class A CDL" value={form.licenseCategory} onChange={set('licenseCategory')} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="License Expiry" id="expiryDate" type="date" value={form.expiryDate} onChange={set('expiryDate')} required />
        <Input label="Contact" id="contact" placeholder="+1 (555) 019-2834" value={form.contact} onChange={set('contact')} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Safety Score (0-100)" id="safetyScore" type="number" min="0" max="100" value={form.safetyScore} onChange={set('safetyScore')} required />
        <div className="space-y-1.5">
          <label htmlFor="status" className="block text-sm font-medium text-[var(--text-secondary)]">Status</label>
          <div className="relative">
            <select id="status" className="w-full appearance-none rounded-[10px] border border-[var(--border-base)] bg-[var(--bg-base)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-1 focus:ring-[var(--color-brand-500)]" value={form.status} onChange={set('status')} required>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="Off Duty">Off Duty</option>
              <option value="Suspended">Suspended</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--text-muted)]">
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="submit" loading={loading}>
          {isEdit ? 'Save Changes' : 'Add Driver'}
        </Button>
      </div>
    </form>
  );
};

/* ─── ConfirmModal ─────────────────────────────────────────── */
const ConfirmModal = ({ driver, onConfirm, onCancel, loading }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-900/10">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
        <svg className="h-5 w-5 text-red-600 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6M9 6V4h6v2" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-[var(--text-primary)]">Delete {driver.name}?</p>
        <p className="text-xs text-[var(--text-muted)]">License: {driver.licenseNumber} • {driver.licenseCategory}</p>
      </div>
    </div>
    <p className="text-sm text-[var(--text-secondary)]">
      This action <span className="font-semibold text-red-600">cannot be undone</span>.
    </p>
    <div className="flex justify-end gap-3 pt-2">
      <Button variant="outline" onClick={onCancel}>Cancel</Button>
      <Button variant="danger" onClick={onConfirm} loading={loading}>Delete</Button>
    </div>
  </div>
);

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

  const expiringSoonDrivers = drivers.filter((d) => {
    const check = isNearExpiryOrExpired(d.expiryDate);
    return !check.expired && check.days <= 7;
  });

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
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Driver Registry</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Manage drivers, license expirations, and safety scores
          </p>
        </div>
        {canManage && (
          <Button onClick={() => { setFormError(''); setModal('create'); }}>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Driver
          </Button>
        )}
      </div>

      {/* Alert */}
      {expiringSoonDrivers.length > 0 && (
        <div className="flex items-start gap-3 rounded-[10px] border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-900/10">
          <svg className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-500">Action Required: Upcoming License Expirations</h3>
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-500/80">
              {expiringSoonDrivers.length} driver(s) have licenses expiring in 7 days or less.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Drivers', value: drivers.length, color: 'text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)]' },
          { label: 'Available', value: drivers.filter((d) => d.status === 'Available').length, color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'On Trip', value: drivers.filter((d) => d.status === 'On Trip').length, color: 'text-blue-600 dark:text-blue-400' },
          { label: 'Off Duty/Susp.', value: drivers.filter((d) => d.status === 'Off Duty' || d.status === 'Suspended').length, color: 'text-amber-600 dark:text-amber-400' },
        ].map(({ label, value, color }) => (
          <Card key={label} className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">{label}</p>
            <p className={`mt-2 text-2xl font-bold tracking-tight ${color}`}>{value}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[var(--text-muted)]">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by name, license number, category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-[10px] border border-[var(--border-base)] bg-[var(--bg-surface)] py-2.5 pl-9 pr-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-1 focus:ring-[var(--color-brand-500)]"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-40 appearance-none rounded-[10px] border border-[var(--border-base)] bg-[var(--bg-surface)] px-4 py-2.5 pr-8 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-1 focus:ring-[var(--color-brand-500)]"
          >
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="Off Duty">Off Duty</option>
            <option value="Suspended">Suspended</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--text-muted)]">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-[10px] border border-[var(--border-base)] bg-[var(--bg-surface)]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-brand-500)] border-t-transparent"></div>
        </div>
      ) : drivers.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-[10px] border border-[var(--border-base)] bg-[var(--bg-surface)] text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-base)]">
            <svg className="h-6 w-6 text-[var(--text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[var(--text-secondary)]">No drivers found</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Try adjusting your search or filters</p>
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableHeader>Driver</TableHeader>
            <TableHeader>License Details</TableHeader>
            <TableHeader>Contact</TableHeader>
            <TableHeader>Safety Score</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader className="text-right">Actions</TableHeader>
          </TableHead>
          <tbody className="divide-y divide-[var(--border-base)]">
            {drivers.map((driver) => {
              const initials = driver.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'D';
              const expiryCheck = isNearExpiryOrExpired(driver.expiryDate);
              return (
                <TableRow key={driver._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-brand-500)] to-purple-600 text-xs font-bold text-white shadow-sm">
                        {initials}
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--text-primary)]">{driver.name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="font-medium text-[var(--text-primary)]">{driver.licenseNumber}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {driver.licenseCategory} • Exp: {' '}
                        <span className={expiryCheck.expired ? 'text-red-500 font-semibold' : expiryCheck.near ? 'text-amber-500 font-semibold' : ''}>
                          {formatDate(driver.expiryDate)}
                        </span>
                        {expiryCheck.expired && <span className="ml-1 text-[10px] uppercase font-bold text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30 px-1 rounded font-sans">Expired</span>}
                        {expiryCheck.near && <span className="ml-1 text-[10px] uppercase font-bold text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30 px-1 rounded font-sans">Expiring</span>}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-[var(--text-secondary)]">{driver.contact}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getSafetyScoreVariant(driver.safetyScore)}>{driver.safetyScore}/100</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[driver.status] || 'default'}>{driver.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {canManage && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(driver)}
                          className="p-1.5 text-[var(--text-muted)] hover:text-[var(--color-brand-600)] transition-colors"
                          title="Edit"
                        >
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openDelete(driver)}
                          className="p-1.5 text-[var(--text-muted)] hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </tbody>
        </Table>
      )}

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
        <Modal title="Delete Driver" onClose={closeModal}>
          <ConfirmModal driver={selected} onConfirm={handleDelete} onCancel={closeModal} loading={formLoading} />
        </Modal>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
};

export default DriversPage;
