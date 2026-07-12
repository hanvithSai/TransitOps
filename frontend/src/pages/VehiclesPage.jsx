import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, AlertCircle, Edit2, Trash2, CarFront, Activity, Map, Wrench, ShieldAlert } from 'lucide-react';
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
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-center gap-3 rounded-lg bg-[var(--color-error)]/10 p-4 text-sm text-[var(--color-error)] animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Registration No." id="registrationNumber" className="uppercase" placeholder="AB12CD3456" value={form.registrationNumber} onChange={set('registrationNumber')} required />
        <Input label="Vehicle Name" id="vehicleName" placeholder="Truck 1" value={form.vehicleName} onChange={set('vehicleName')} required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Model" id="model" placeholder="Volvo FH16" value={form.model} onChange={set('model')} required />
        <Input label="Type" id="type" placeholder="Heavy Duty" value={form.type} onChange={set('type')} required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Capacity (kg)" id="capacity" type="number" step="0.1" min="0.1" placeholder="10.5" value={form.capacity} onChange={set('capacity')} required />
        <Input label="Odometer (km)" id="odometer" type="number" step="0.1" min="0" placeholder="50000" value={form.odometer} onChange={set('odometer')} required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Acquisition Cost" id="acquisitionCost" type="number" min="0" placeholder="1500000" value={form.acquisitionCost} onChange={set('acquisitionCost')} />
        <div className="space-y-1.5">
          <label htmlFor="status" className="block text-sm font-medium text-[var(--text-secondary)]">Status</label>
          <div className="relative">
            <select 
              id="status" 
              className={cn(
                "w-full appearance-none rounded-[10px] border border-[var(--border-base)] bg-[var(--bg-surface)] px-4 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-1 focus:ring-[var(--color-brand-500)]",
                isEdit && (initial.status === 'In Shop' || initial.status === 'On Trip') ? 'opacity-60 cursor-not-allowed bg-[var(--bg-base)]' : 'hover:bg-[var(--bg-surface-hover)]'
              )}
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
            <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-500">
              <Wrench className="h-3.5 w-3.5" /> Vehicle is currently in maintenance.
            </p>
          )}
          {isEdit && initial.status === 'On Trip' && (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-500">
              <Map className="h-3.5 w-3.5" /> Vehicle is currently dispatched on a trip.
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-base)] mt-6">
        <Button type="submit" loading={loading} className="w-full sm:w-auto min-w-[120px]">
          {isEdit ? 'Save Changes' : 'Add Vehicle'}
        </Button>
      </div>
    </form>
  );
};

/* ─── ConfirmModal ─────────────────────────────────────────── */
const ConfirmModal = ({ vehicle, onConfirm, onCancel, loading }) => (
  <div className="space-y-5">
    <div className="flex items-start gap-4 rounded-xl border border-[var(--color-error)]/20 bg-[var(--color-error)]/10 p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-error)]/20">
        <ShieldAlert className="h-5 w-5 text-[var(--color-error)]" />
      </div>
      <div>
        <p className="text-base font-semibold text-[var(--text-primary)]">Delete {vehicle.registrationNumber}?</p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">{vehicle.vehicleName} - {vehicle.model}</p>
        <p className="mt-3 text-sm text-[var(--text-muted)]">
          This action <span className="font-semibold text-[var(--color-error)]">cannot be undone</span>. All data associated with this vehicle will be permanently removed or marked inactive depending on system rules.
        </p>
      </div>
    </div>
    <div className="flex justify-end gap-3 pt-2">
      <Button variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
      <Button variant="danger" onClick={onConfirm} loading={loading}>Delete Vehicle</Button>
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
    <div className="space-y-8 pb-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Vehicle Registry</h1>
          <p className="mt-1 text-sm font-medium text-[var(--text-secondary)]">
            Manage your fleet, track capacity and status
          </p>
        </div>
        {canManage && (
          <Button onClick={() => { setFormError(''); setModal('create'); }} className="shadow-sm sm:w-auto w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Vehicle
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
        {[
          { label: 'Total Fleet', value: vehicles.length, icon: CarFront, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Available', value: vehicles.filter((v) => v.status === 'Available').length, icon: Activity, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'On Trip', value: vehicles.filter((v) => v.status === 'On Trip').length, icon: Map, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'In Shop/Retired', value: vehicles.filter((v) => v.status === 'In Shop' || v.status === 'Retired').length, icon: Wrench, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
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
            placeholder="Search by registration, name, model…"
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

      {/* Table Area */}
      <Card className="overflow-hidden border border-[var(--border-base)] shadow-sm">
        {loading ? (
          <div className="flex h-64 items-center justify-center bg-[var(--bg-surface)]">
            <div className="flex flex-col items-center gap-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-brand-200)] border-t-[var(--color-brand-600)] dark:border-[var(--color-brand-800)] dark:border-t-[var(--color-brand-400)]"></div>
              <p className="text-sm font-medium text-[var(--text-muted)]">Loading vehicles...</p>
            </div>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center bg-[var(--bg-surface)] text-center px-4">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--bg-base)] border border-[var(--border-base)] shadow-sm">
              <CarFront className="h-6 w-6 text-[var(--text-muted)]" />
            </div>
            <p className="text-base font-semibold text-[var(--text-primary)]">No vehicles found</p>
            <p className="mt-1.5 text-sm text-[var(--text-secondary)] max-w-sm">
              {search || statusFilter ? 'Try adjusting your search query or filters to find what you are looking for.' : 'Get started by adding your first vehicle to the fleet.'}
            </p>
            {!search && !statusFilter && canManage && (
              <Button onClick={() => setModal('create')} className="mt-6 shadow-sm" variant="outline">
                <Plus className="mr-2 h-4 w-4" /> Add Vehicle
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableHeader>Registration</TableHeader>
                <TableHeader>Details</TableHeader>
                <TableHeader>Capacity/Odo</TableHeader>
                <TableHeader>Status</TableHeader>
                {canManage && <TableHeader className="text-right">Actions</TableHeader>}
              </TableHead>
              <tbody className="divide-y divide-[var(--border-base)] bg-[var(--bg-surface)]">
                {vehicles.map((vehicle) => (
                  <TableRow key={vehicle._id} className="hover:bg-[var(--bg-surface-hover)] transition-colors group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 min-w-[5rem] max-w-max items-center justify-center rounded-md border border-[var(--border-base)] bg-[var(--bg-base)] px-3 text-[13px] font-bold text-[var(--text-primary)] uppercase tracking-wider shadow-sm">
                          {vehicle.registrationNumber}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-semibold text-[var(--text-primary)]">{vehicle.vehicleName}</p>
                      <p className="mt-0.5 text-xs font-medium text-[var(--text-muted)]">{vehicle.model} <span className="mx-1.5 opacity-50">•</span> {vehicle.type}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium text-[var(--text-secondary)]">{vehicle.capacity} kg</p>
                      <p className="mt-0.5 text-xs text-[var(--text-muted)]">{vehicle.odometer} km</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[vehicle.status] || 'default'}>{vehicle.status}</Badge>
                    </TableCell>
                    {canManage && (
                      <TableCell className="text-right align-middle">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(vehicle)}
                            className="h-8 w-8 text-[var(--text-muted)] hover:text-[var(--color-brand-600)] hover:bg-[var(--color-brand-50)] dark:hover:bg-[var(--color-brand-900)]/20"
                            title="Edit vehicle"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDelete(vehicle)}
                            className="h-8 w-8 text-[var(--text-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/10"
                            title="Delete vehicle"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card>

      {/* Modals */}
      {modal === 'create' && (
        <Modal title="Add New Vehicle" onClose={closeModal}>
          <VehicleForm onSubmit={handleCreate} loading={formLoading} error={formError} />
        </Modal>
      )}

      {modal === 'edit' && selected && (
        <Modal title="Edit Vehicle Details" onClose={closeModal}>
          <VehicleForm
            initial={selected}
            onSubmit={handleEdit}
            loading={formLoading}
            error={formError}
          />
        </Modal>
      )}

      {modal === 'delete' && selected && (
        <Modal title="Confirm Deletion" onClose={closeModal} maxWidth="sm">
          <ConfirmModal vehicle={selected} onConfirm={handleDelete} onCancel={closeModal} loading={formLoading} />
        </Modal>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
};

export default VehiclesPage;
