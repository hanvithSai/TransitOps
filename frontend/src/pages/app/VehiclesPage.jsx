import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Filter, AlertCircle, Edit2, Trash2, Archive, CarFront, Activity, Map, Wrench, ShieldAlert } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { StatCard } from '../../components/ui/StatCard';
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
import { vehicleFormSchema } from '../../schemas/vehicle';
import { useDebounce } from '../../hooks/useDebounce';
import { cn } from '../../lib/utils';

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
  const isEdit = !!initial;
  const statusLocked = isEdit && (initial.status === 'In Shop' || initial.status === 'On Trip');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: initial || EMPTY_FORM,
  });

  const onValidSubmit = (data) => {
    onSubmit({
      ...data,
      registrationNumber: data.registrationNumber.toUpperCase(),
    });
  };

  return (
    <form onSubmit={handleSubmit(onValidSubmit)} className="app-form-stack">
      {error && (
        <div className="app-form-alert animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="app-form-grid app-form-grid--2">
        <Input label="Registration No." id="registrationNumber" className="uppercase" placeholder="AB12CD3456" error={errors.registrationNumber?.message} {...register('registrationNumber')} required />
        <Input label="Vehicle Name" id="vehicleName" placeholder="Truck 1" error={errors.vehicleName?.message} {...register('vehicleName')} required />
      </div>

      <div className="app-form-grid app-form-grid--2">
        <Input label="Model" id="model" placeholder="Volvo FH16" error={errors.model?.message} {...register('model')} required />
        <Input label="Type" id="type" placeholder="Heavy Duty" error={errors.type?.message} {...register('type')} required />
      </div>

      <div className="app-form-grid app-form-grid--2">
        <Input label="Capacity (kg)" id="capacity" type="number" step="0.1" min="0.1" placeholder="10.5" error={errors.capacity?.message} {...register('capacity')} required />
        <Input label="Odometer (km)" id="odometer" type="number" step="0.1" min="0" placeholder="50000" error={errors.odometer?.message} {...register('odometer')} required />
      </div>

      <div className="app-form-grid app-form-grid--2">
        <Input label="Acquisition Cost" id="acquisitionCost" type="number" min="0" placeholder="1500000" error={errors.acquisitionCost?.message} {...register('acquisitionCost')} />
        <div>
          <SelectField label="Status" id="status" error={errors.status?.message} disabled={statusLocked} required {...register('status')}>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="In Shop">In Shop</option>
            <option value="Retired">Retired</option>
          </SelectField>
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

      <div className="app-modal-footer">
        <Button type="submit" loading={loading} className="w-full sm:w-auto min-w-[120px]">
          {isEdit ? 'Save Changes' : 'Add Vehicle'}
        </Button>
      </div>
    </form>
  );
};

/* ─── ConfirmModal ─────────────────────────────────────────── */
const ConfirmModal = ({ vehicle, onConfirm, onCancel, onRetire, loading, deleteError }) => (
  <div className="app-form-stack">
    <div className="flex items-start gap-4 rounded-xl border border-[var(--color-error)]/20 bg-[var(--color-error)]/10 p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-error)]/20">
        <ShieldAlert className="h-5 w-5 text-[var(--color-error)]" />
      </div>
      <div>
        <p className="text-base font-semibold text-[var(--text-primary)]">Delete {vehicle.registrationNumber}?</p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">{vehicle.vehicleName} - {vehicle.model}</p>
        <p className="mt-3 text-sm text-[var(--text-muted)]">
          This action <span className="font-semibold text-[var(--color-error)]">cannot be undone</span>. Vehicles with trip, maintenance, fuel, or expense history cannot be deleted.
        </p>
      </div>
    </div>
    {deleteError && (
      <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-4 text-sm text-amber-800 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-900/30">
        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">{deleteError}</p>
          {vehicle.status !== 'Retired' && vehicle.status !== 'On Trip' && vehicle.status !== 'In Shop' && (
            <p className="mt-2 text-xs">Use Retire to keep historical records while removing the vehicle from active dispatch.</p>
          )}
        </div>
      </div>
    )}
    <div className="app-modal-footer">
      <Button variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
      {deleteError && vehicle.status === 'Available' && (
        <Button variant="outline" onClick={onRetire} loading={loading} icon={Archive}>Retire Instead</Button>
      )}
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
  const debouncedSearch = useDebounce(search);
  const [statusFilter, setStatusFilter] = useState('');

  const [modal, setModal] = useState(null); // null | 'create' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const [toast, setToast] = useState(null);

  const canManage = user?.role?.name === 'admin' || user?.role?.name === 'fleet_manager';

  const showToast = (message, type = 'success') => setToast({ message, type });

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/vehicles?limit=100&search=${debouncedSearch}&status=${statusFilter}`);
      setVehicles(data.data.vehicles);
    } catch {
      showToast('Failed to load vehicles', 'error');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter]);

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
    setDeleteError('');
    try {
      await api.delete(`/vehicles/${selected._id}`);
      showToast(`Vehicle "${selected.registrationNumber}" deleted`);
      setModal(null);
      fetchVehicles();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete vehicle';
      if (err.response?.status === 409) {
        setDeleteError(message);
      } else {
        showToast(message, 'error');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleRetire = async (vehicle = selected) => {
    if (!vehicle || vehicle.status === 'Retired') return;
    setFormLoading(true);
    try {
      await api.put(`/vehicles/${vehicle._id}`, { status: 'Retired' });
      showToast(`Vehicle "${vehicle.registrationNumber}" retired`);
      setModal(null);
      fetchVehicles();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to retire vehicle', 'error');
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
    setDeleteError('');
    setModal('delete');
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setFormError('');
    setDeleteError('');
  };

  return (
    <div className="app-page-stack">
      <PageHeader
        icon={CarFront}
        title="Vehicle registry"
        subtitle="Manage your fleet, track capacity and status"
        action={canManage ? (
          <Button onClick={() => { setFormError(''); setModal('create'); }} icon={Plus}>
            Add vehicle
          </Button>
        ) : null}
      />

      {/* Stats */}
      <div className="app-stat-grid">
        {[
          { label: 'Total Fleet', value: vehicles.length, icon: CarFront, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Available', value: vehicles.filter((v) => v.status === 'Available').length, icon: Activity, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'On Trip', value: vehicles.filter((v) => v.status === 'On Trip').length, icon: Map, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'In Shop/Retired', value: vehicles.filter((v) => v.status === 'In Shop' || v.status === 'Retired').length, icon: Wrench, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        ].map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            iconBg={stat.bg}
            iconColor={stat.color}
            valueClassName={stat.color}
          />
        ))}
      </div>

      {/* Actions Bar */}
      <div className="app-toolbar-card">
        <SearchInput
          containerClassName="app-toolbar-search flex-1"
          placeholder="Search by registration, name, model…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <SelectField
          icon={Filter}
          className="app-toolbar-filter w-full sm:w-52"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="Available">Available</option>
          <option value="On Trip">On Trip</option>
          <option value="In Shop">In Shop</option>
          <option value="Retired">Retired</option>
        </SelectField>
      </div>

      {/* Table Area */}
      <div className="app-table-results">
        {loading ? (
          <div className="app-table-results-loading">
            <SkeletonTable rows={6} />
          </div>
        ) : vehicles.length === 0 ? (
          <EmptyState
            icon={CarFront}
            title="No vehicles found"
            description={search || statusFilter ? 'Try adjusting your search query or filters to find what you are looking for.' : 'Get started by adding your first vehicle to the fleet.'}
            action={!search && !statusFilter && canManage ? (
              <Button onClick={() => setModal('create')} className="shadow-sm" variant="outline">
                <Plus className="mr-2 h-4 w-4" /> Add Vehicle
              </Button>
            ) : null}
          />
        ) : (
          <>
          <div className="hidden md:block overflow-x-auto">
            <Table comfortable>
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
                    <TableCell mono>{vehicle.registrationNumber}</TableCell>
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
                        <div className="app-row-actions">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(vehicle)} aria-label="Edit vehicle">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          {vehicle.status === 'Available' && (
                            <Button variant="ghost" size="icon" onClick={() => handleRetire(vehicle)} aria-label="Retire vehicle" title="Retire vehicle">
                              <Archive className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => openDelete(vehicle)} aria-label="Delete vehicle">
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
          <div className="md:hidden divide-y divide-[var(--border-base)]">
            {vehicles.map((vehicle) => (
              <div key={vehicle._id} className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-sm font-semibold text-[var(--text-primary)]">{vehicle.registrationNumber}</p>
                  <Badge variant={STATUS_VARIANT[vehicle.status] || 'default'}>{vehicle.status}</Badge>
                </div>
                <p className="text-sm font-medium text-[var(--text-primary)]">{vehicle.vehicleName}</p>
                <p className="text-xs text-[var(--text-muted)]">{vehicle.capacity} kg · {vehicle.odometer} km</p>
                {canManage && (
                  <div className="flex gap-2 pt-1">
                    <Button variant="outline" size="sm" onClick={() => openEdit(vehicle)}>Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => openDelete(vehicle)}>Delete</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
          </>
        )}
      </div>

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
        <Modal title="Confirm Deletion" onClose={closeModal} maxWidth="max-w-sm">
          <ConfirmModal vehicle={selected} onConfirm={handleDelete} onCancel={closeModal} onRetire={() => handleRetire()} loading={formLoading} deleteError={deleteError} />
        </Modal>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
};

export default VehiclesPage;
