import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, AlertCircle, Edit2, Trash2, Users, Shield, Map, XCircle, ShieldAlert } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Table, TableHead, TableRow, TableHeader, TableCell } from '../components/ui/Table';
import { Toast } from '../components/ui/Toast';
import { cn } from '../lib/utils';

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
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-center gap-3 rounded-lg bg-[var(--color-error)]/10 p-4 text-sm text-[var(--color-error)] animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <Input label="Full Name" id="name" placeholder="John Doe" value={form.name} onChange={set('name')} required />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="License No." id="licenseNumber" className="uppercase" placeholder="DL-12345678" value={form.licenseNumber} onChange={set('licenseNumber')} required />
        <Input label="License Category" id="licenseCategory" placeholder="Class A CDL" value={form.licenseCategory} onChange={set('licenseCategory')} required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="License Expiry" id="expiryDate" type="date" value={form.expiryDate} onChange={set('expiryDate')} required />
        <Input label="Contact" id="contact" placeholder="+1 (555) 019-2834" value={form.contact} onChange={set('contact')} required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Safety Score (0-100)" id="safetyScore" type="number" min="0" max="100" value={form.safetyScore} onChange={set('safetyScore')} required />
        <div className="space-y-1.5">
          <label htmlFor="status" className="block text-sm font-medium text-[var(--text-secondary)]">Status</label>
          <div className="relative">
            <select 
              id="status" 
              className={cn(
                "w-full appearance-none rounded-[10px] border border-[var(--border-base)] bg-[var(--bg-surface)] px-4 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-1 focus:ring-[var(--color-brand-500)]",
                "hover:bg-[var(--bg-surface-hover)]"
              )}
              value={form.status} 
              onChange={set('status')} 
              required
            >
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

      <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-base)] mt-6">
        <Button type="submit" loading={loading} className="w-full sm:w-auto min-w-[120px]">
          {isEdit ? 'Save Changes' : 'Add Driver'}
        </Button>
      </div>
    </form>
  );
};

/* ─── ConfirmModal ─────────────────────────────────────────── */
const ConfirmModal = ({ driver, onConfirm, onCancel, loading }) => (
  <div className="space-y-5">
    <div className="flex items-start gap-4 rounded-xl border border-[var(--color-error)]/20 bg-[var(--color-error)]/10 p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-error)]/20">
        <ShieldAlert className="h-5 w-5 text-[var(--color-error)]" />
      </div>
      <div>
        <p className="text-base font-semibold text-[var(--text-primary)]">Delete {driver.name}?</p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">License: {driver.licenseNumber} • {driver.licenseCategory}</p>
        <p className="mt-3 text-sm text-[var(--text-muted)]">
          This action <span className="font-semibold text-[var(--color-error)]">cannot be undone</span>. Associated trip history will remain but the driver profile will be removed.
        </p>
      </div>
    </div>
    <div className="flex justify-end gap-3 pt-2">
      <Button variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
      <Button variant="danger" onClick={onConfirm} loading={loading}>Delete Driver</Button>
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
    <div className="space-y-8 pb-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Driver Registry</h1>
          <p className="mt-1 text-sm font-medium text-[var(--text-secondary)]">
            Manage drivers, license expirations, and safety scores
          </p>
        </div>
        {canManage && (
          <Button onClick={() => { setFormError(''); setModal('create'); }} className="shadow-sm sm:w-auto w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Driver
          </Button>
        )}
      </div>

      {/* Alert */}
      {expiringSoonDrivers.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-900/10 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-500" />
          <div>
            <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-500">Action Required: Upcoming License Expirations</h3>
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-500/80">
              {expiringSoonDrivers.length} driver(s) have licenses expiring in 7 days or less.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
        {[
          { label: 'Total Drivers', value: drivers.length, icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Available', value: drivers.filter((d) => d.status === 'Available').length, icon: Shield, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'On Trip', value: drivers.filter((d) => d.status === 'On Trip').length, icon: Map, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Off Duty/Susp.', value: drivers.filter((d) => d.status === 'Off Duty' || d.status === 'Suspended').length, icon: XCircle, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        ].map((stat) => (
          <Card key={stat.label} className="p-5 flex flex-col justify-center transition-smooth hover:shadow-md hover:-translate-y-0.5 hover:border-[var(--color-brand-200)] dark:hover:border-[var(--color-brand-800)]">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{stat.label}</p>
              <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", stat.bg, stat.color)}>
                <stat.icon className="h-4 w-4" />
              </div>
            </div>
            <p className={cn("text-2xl font-bold tracking-tight", stat.color)}>{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[var(--text-muted)]">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search by name, license number, category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-[10px] border border-[var(--border-base)] bg-[var(--bg-surface)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none shadow-sm transition-colors focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20 hover:border-[var(--color-brand-300)]"
          />
        </div>
        <div className="relative min-w-[180px]">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[var(--text-muted)]">
            <Filter className="h-4 w-4" />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full appearance-none rounded-[10px] border border-[var(--border-base)] bg-[var(--bg-surface)] py-2.5 pl-10 pr-10 text-sm font-medium text-[var(--text-primary)] outline-none shadow-sm transition-colors focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20 hover:border-[var(--color-brand-300)] cursor-pointer"
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

      {/* Table Area */}
      <Card className="overflow-hidden border border-[var(--border-base)] shadow-sm">
        {loading ? (
          <div className="flex h-64 items-center justify-center bg-[var(--bg-surface)]">
            <div className="flex flex-col items-center gap-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-brand-200)] border-t-[var(--color-brand-600)] dark:border-[var(--color-brand-800)] dark:border-t-[var(--color-brand-400)]"></div>
              <p className="text-sm font-medium text-[var(--text-muted)]">Loading drivers...</p>
            </div>
          </div>
        ) : drivers.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center bg-[var(--bg-surface)] text-center px-4">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--bg-base)] border border-[var(--border-base)] shadow-sm">
              <Users className="h-6 w-6 text-[var(--text-muted)]" />
            </div>
            <p className="text-base font-semibold text-[var(--text-primary)]">No drivers found</p>
            <p className="mt-1.5 text-sm text-[var(--text-secondary)] max-w-sm">
              {search || statusFilter ? 'Try adjusting your search query or filters to find what you are looking for.' : 'Get started by adding your first driver to the team.'}
            </p>
            {!search && !statusFilter && canManage && (
              <Button onClick={() => setModal('create')} className="mt-6 shadow-sm" variant="outline">
                <Plus className="mr-2 h-4 w-4" /> Add Driver
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableHeader>Driver</TableHeader>
                <TableHeader>License Details</TableHeader>
                <TableHeader>Contact</TableHeader>
                <TableHeader>Safety Score</TableHeader>
                <TableHeader>Status</TableHeader>
                {canManage && <TableHeader className="text-right">Actions</TableHeader>}
              </TableHead>
              <tbody className="divide-y divide-[var(--border-base)] bg-[var(--bg-surface)]">
                {drivers.map((driver) => {
                  const initials = driver.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'D';
                  const expiryCheck = isNearExpiryOrExpired(driver.expiryDate);
                  return (
                    <TableRow key={driver._id} className="hover:bg-[var(--bg-surface-hover)] transition-colors group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-brand-500)] to-purple-600 text-xs font-bold text-white shadow-sm ring-2 ring-white dark:ring-[var(--bg-surface)]">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-[var(--text-primary)]">{driver.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-[var(--text-primary)]">{driver.licenseNumber}</p>
                          <p className="text-xs font-medium text-[var(--text-muted)] flex items-center flex-wrap gap-1">
                            {driver.licenseCategory} <span className="mx-1 opacity-50">•</span> Exp: {' '}
                            <span className={cn(expiryCheck.expired ? 'text-red-600 dark:text-red-500 font-bold' : expiryCheck.near ? 'text-amber-600 dark:text-amber-500 font-bold' : '')}>
                              {formatDate(driver.expiryDate)}
                            </span>
                            {expiryCheck.expired && <span className="ml-1 text-[9px] uppercase font-bold text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30 px-1.5 py-0.5 rounded-sm font-sans tracking-wide">Expired</span>}
                            {expiryCheck.near && <span className="ml-1 text-[9px] uppercase font-bold text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30 px-1.5 py-0.5 rounded-sm font-sans tracking-wide">Expiring</span>}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-[var(--text-secondary)]">{driver.contact}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSafetyScoreVariant(driver.safetyScore)} className="shadow-sm">{driver.safetyScore}/100</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[driver.status] || 'default'} className="shadow-sm">{driver.status}</Badge>
                      </TableCell>
                      {canManage && (
                        <TableCell className="text-right align-middle">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEdit(driver)}
                              className="h-8 w-8 text-[var(--text-muted)] hover:text-[var(--color-brand-600)] hover:bg-[var(--color-brand-50)] dark:hover:bg-[var(--color-brand-900)]/20"
                              title="Edit driver"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDelete(driver)}
                              className="h-8 w-8 text-[var(--text-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/10"
                              title="Delete driver"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </Card>

      {/* Modals */}
      {modal === 'create' && (
        <Modal title="Add New Driver" onClose={closeModal}>
          <DriverForm onSubmit={handleCreate} loading={formLoading} error={formError} />
        </Modal>
      )}

      {modal === 'edit' && selected && (
        <Modal title="Edit Driver Details" onClose={closeModal}>
          <DriverForm
            initial={selected}
            onSubmit={handleEdit}
            loading={formLoading}
            error={formError}
          />
        </Modal>
      )}

      {modal === 'delete' && selected && (
        <Modal title="Confirm Deletion" onClose={closeModal} maxWidth="sm">
          <ConfirmModal driver={selected} onConfirm={handleDelete} onCancel={closeModal} loading={formLoading} />
        </Modal>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
};

export default DriversPage;
