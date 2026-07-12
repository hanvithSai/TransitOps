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
  'In Shop':   'warning',
  'Retired':   'danger',
};

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

/* ─── VehicleForm ─────────────────────────────────────────────── */
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
        <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input label="Registration No." id="registrationNumber" className="uppercase" placeholder="AB12CD3456" value={form.registrationNumber} onChange={set('registrationNumber')} required />
        <Input label="Vehicle Name" id="vehicleName" placeholder="Truck 1" value={form.vehicleName} onChange={set('vehicleName')} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Model" id="model" placeholder="Volvo FH16" value={form.model} onChange={set('model')} required />
        <Input label="Type" id="type" placeholder="Heavy Duty" value={form.type} onChange={set('type')} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Capacity (kg)" id="capacity" type="number" step="0.1" min="0.1" placeholder="10.5" value={form.capacity} onChange={set('capacity')} required />
        <Input label="Odometer (km)" id="odometer" type="number" step="0.1" min="0" placeholder="50000" value={form.odometer} onChange={set('odometer')} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Acquisition Cost" id="acquisitionCost" type="number" min="0" placeholder="1500000" value={form.acquisitionCost} onChange={set('acquisitionCost')} />
        <div className="space-y-1.5">
          <label htmlFor="status" className="block text-sm font-medium text-[var(--text-secondary)]">Status</label>
          <div className="relative">
            <select 
              id="status" 
              className={`w-full appearance-none rounded-[10px] border border-[var(--border-base)] bg-[var(--bg-base)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-1 focus:ring-[var(--color-brand-500)] ${isEdit && (initial.status === 'In Shop' || initial.status === 'On Trip') ? 'opacity-60 cursor-not-allowed' : ''}`}
              value={form.status} 
              onChange={set('status')} 
              required
              disabled={isEdit && (initial.status === 'In Shop' || initial.status === 'On Trip')}
            >
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="In Shop">In Shop</option>
              <option value="Retired">Retired</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--text-muted)]">
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          {isEdit && initial.status === 'In Shop' && (
            <p className="mt-1 text-xs text-amber-600">Vehicle is in maintenance.</p>
          )}
          {isEdit && initial.status === 'On Trip' && (
            <p className="mt-1 text-xs text-blue-600">Vehicle is on a dispatched trip.</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="submit" loading={loading}>
          {isEdit ? 'Save Changes' : 'Add Vehicle'}
        </Button>
      </div>
    </form>
  );
};

/* ─── ConfirmModal ─────────────────────────────────────────── */
const ConfirmModal = ({ vehicle, onConfirm, onCancel, loading }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-900/10">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
        <svg className="h-5 w-5 text-red-600 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6M9 6V4h6v2" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-[var(--text-primary)]">Delete {vehicle.registrationNumber}?</p>
        <p className="text-xs text-[var(--text-muted)]">{vehicle.vehicleName} - {vehicle.model}</p>
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
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Vehicle Registry</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Manage your fleet, track capacity and status
          </p>
        </div>
        {canManage && (
          <Button onClick={() => { setFormError(''); setModal('create'); }}>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Vehicle
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Fleet', value: vehicles.length, color: 'text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)]' },
          { label: 'Available', value: vehicles.filter((v) => v.status === 'Available').length, color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'On Trip', value: vehicles.filter((v) => v.status === 'On Trip').length, color: 'text-blue-600 dark:text-blue-400' },
          { label: 'In Shop/Retired', value: vehicles.filter((v) => v.status === 'In Shop' || v.status === 'Retired').length, color: 'text-amber-600 dark:text-amber-400' },
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
            placeholder="Search by reg, name, model…"
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
            <option value="In Shop">In Shop</option>
            <option value="Retired">Retired</option>
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
      ) : vehicles.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-[10px] border border-[var(--border-base)] bg-[var(--bg-surface)] text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-base)]">
            <svg className="h-6 w-6 text-[var(--text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
          </div>
          <p className="text-sm font-medium text-[var(--text-secondary)]">No vehicles found</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Try adjusting your search or filters</p>
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableHeader>Registration</TableHeader>
            <TableHeader>Details</TableHeader>
            <TableHeader>Capacity/Odo</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader className="text-right">Actions</TableHeader>
          </TableHead>
          <tbody className="divide-y divide-[var(--border-base)]">
            {vehicles.map((vehicle) => (
              <TableRow key={vehicle._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 min-w-[3rem] items-center justify-center rounded-md border border-[var(--border-base)] bg-[var(--bg-base)] px-2 text-xs font-bold text-[var(--text-primary)] uppercase tracking-wide">
                      {vehicle.registrationNumber}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-[var(--text-primary)]">{vehicle.vehicleName}</p>
                  <p className="text-xs text-[var(--text-muted)]">{vehicle.model} • {vehicle.type}</p>
                </TableCell>
                <TableCell>
                  <p className="text-sm text-[var(--text-secondary)]">{vehicle.capacity} kg</p>
                  <p className="text-xs text-[var(--text-muted)]">{vehicle.odometer} km</p>
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[vehicle.status] || 'default'}>{vehicle.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  {canManage && (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(vehicle)}
                        className="p-1.5 text-[var(--text-muted)] hover:text-[var(--color-brand-600)] transition-colors"
                        title="Edit"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => openDelete(vehicle)}
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
            ))}
          </tbody>
        </Table>
      )}

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
        <Modal title="Delete Vehicle" onClose={closeModal}>
          <ConfirmModal vehicle={selected} onConfirm={handleDelete} onCancel={closeModal} loading={formLoading} />
        </Modal>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
};

export default VehiclesPage;
