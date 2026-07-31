import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Wallet, 
  Fuel, 
  Receipt, 
  Plus, 
  Trash2, 
  AlertCircle,
  CarFront,
  Calendar,
  Hash,
  FileText,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/common/Modal';
import { SelectField } from '../../components/common/SelectField';
import { Table, TableHead, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import { Toast } from '../../components/common/Toast';
import { PageHeader } from '../../components/ui/PageHeader';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { fuelFormSchema, expenseFormSchema } from '../../schemas/finance';
import { formatFuelLitersDisplay } from '../../lib/utils';

/* ─── helpers ──────────────────────────────────────────────── */
const CATEGORY_COLORS = {
  Toll: 'info',
  Repair: 'danger',
  Parking: 'warning',
  Insurance: 'success',
  Miscellaneous: 'default',
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
};

/* ─── FinancePage Component ───────────────────────────────── */
const FinancePage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Decide which tab is active based on URL path
  const isFuelTab = location.pathname.includes('/fuel');
  
  // State
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  // Create Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Dropdown data for forms
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);

  const defaultFormValues = {
    vehicle: '',
    trip: '',
    amount: '',
    category: 'Toll',
    notes: '',
    liters: '',
    cost: '',
    odometer: '',
    date: new Date().toISOString().substring(0, 10),
  };

  const fuelForm = useForm({
    resolver: zodResolver(fuelFormSchema),
    defaultValues: defaultFormValues,
  });
  const expenseForm = useForm({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: defaultFormValues,
  });
  const activeForm = isFuelTab ? fuelForm : expenseForm;
  const { register, handleSubmit, watch, setValue, formState: { errors } } = activeForm;

  const selectedVehicle = watch('vehicle');

  const showToast = (message, type = 'success') => setToast({ message, type });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = isFuelTab ? '/fuel' : '/expenses';
      const { data } = await api.get(endpoint);
      setDataList(isFuelTab ? data.data.logs : data.data.expenses);
    } catch {
      showToast(`Failed to load ${isFuelTab ? 'fuel logs' : 'expenses'}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [isFuelTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Load vehicles and trips when opening modal
  const handleOpenModal = async () => {
    setErrorMsg('');
    fuelForm.reset(defaultFormValues);
    expenseForm.reset(defaultFormValues);

    try {
      const [vehRes, tripRes] = await Promise.all([
        api.get('/vehicles?limit=100'),
        api.get('/trips?limit=100'),
      ]);
      setVehicles(vehRes.data.data.vehicles);
      setTrips(tripRes.data.data.trips);
      setShowModal(true);
    } catch {
      showToast('Failed to load selection data', 'error');
    }
  };

  const onFormSubmit = async (formData) => {
    setModalLoading(true);
    setErrorMsg('');

    try {
      const endpoint = isFuelTab ? '/fuel' : '/expenses';
      const payload = {
        vehicle: formData.vehicle,
        trip: formData.trip || undefined,
        date: new Date(formData.date).toISOString(),
      };

      if (isFuelTab) {
        payload.liters = formData.liters;
        payload.cost = formData.cost;
        payload.odometer = formData.odometer;
      } else {
        payload.amount = formData.amount;
        payload.category = formData.category;
        payload.notes = formData.notes;
      }

      await api.post(endpoint, payload);
      showToast(`${isFuelTab ? 'Fuel log' : 'Expense'} added successfully`);
      setShowModal(false);
      fetchData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save entry');
    } finally {
      setModalLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const endpoint = isFuelTab ? '/fuel' : '/expenses';
      await api.delete(`${endpoint}/${deleteTarget}`);
      showToast('Entry deleted successfully');
      setDeleteTarget(null);
      fetchData();
    } catch {
      showToast('Failed to delete entry', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filter trips in the dropdown based on selected vehicle
  const filteredTrips = trips.filter((t) => !selectedVehicle || t.vehicle?._id === selectedVehicle);

  // Compute total for the current view
  const currentTotal = dataList.reduce((sum, item) => sum + (isFuelTab ? (item.cost || 0) : (item.amount || 0)), 0);

  return (
    <div className="app-page-stack">
      <PageHeader
        icon={Wallet}
        title="Finance management"
        subtitle="Track fleet operational costs, fuel logs, and expenses"
        action={(
          <div className="flex flex-wrap items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-label">Total {isFuelTab ? 'fuel cost' : 'expenses'}</span>
              <span className="text-h3 text-[var(--color-brand-600)]">{formatCurrency(currentTotal)}</span>
            </div>
            {(user?.role?.name === 'admin' || user?.role?.name === 'fleet_manager') && (
              <Button onClick={handleOpenModal} icon={Plus}>
                Log {isFuelTab ? 'fuel' : 'expense'}
              </Button>
            )}
          </div>
        )}
      />

      {/* ─── Tabs ───────────────────────────────────────────── */}
      <div className="app-tab-bar">
        <button
          onClick={() => navigate('/fuel')}
          className={`app-tab-btn ${
            isFuelTab 
              ? 'bg-[var(--color-brand-500)] text-white shadow-md shadow-[var(--color-brand-500)]/20' 
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Fuel className="h-4 w-4 shrink-0" />
          Fuel Logs
        </button>
        <button
          onClick={() => navigate('/expenses')}
          className={`app-tab-btn ${
            !isFuelTab 
              ? 'bg-[var(--color-brand-500)] text-white shadow-md shadow-[var(--color-brand-500)]/20' 
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Receipt className="h-4 w-4 shrink-0" />
          General Expenses
        </button>
      </div>

      {/* ─── Data Table ─────────────────────────────────────── */}
      <div className="app-table-panel">
        <div className="app-table-panel-head">
          <h3 className="app-table-panel-title">
            {isFuelTab ? <Fuel className="h-4 w-4" aria-hidden="true" /> : <Receipt className="h-4 w-4" aria-hidden="true" />}
            {isFuelTab ? 'Recent Fuel Records' : 'Recent Expenses'}
          </h3>
          <Badge variant="outline" className="text-xs font-medium">
            {dataList.length} {dataList.length === 1 ? 'Entry' : 'Entries'}
          </Badge>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6">
              <SkeletonTable rows={5} />
            </div>
          ) : dataList.length === 0 ? (
            <EmptyState
              icon={isFuelTab ? Fuel : Receipt}
              title={`No ${isFuelTab ? 'fuel logs' : 'expenses'} recorded yet.`}
              description={`Click the button above to log your first ${isFuelTab ? 'fuel entry' : 'expense'}.`}
            />
          ) : (
            <Table comfortable>
              <TableHead>
                <TableHeader>Date</TableHeader>
                <TableHeader>Vehicle</TableHeader>
                <TableHeader>Trip</TableHeader>
                {isFuelTab ? (
                  <>
                    <TableHeader>Liters</TableHeader>
                    <TableHeader>Odometer</TableHeader>
                    <TableHeader align="right">Total Cost</TableHeader>
                  </>
                ) : (
                  <>
                    <TableHeader>Category</TableHeader>
                    <TableHeader>Notes</TableHeader>
                    <TableHeader align="right">Amount</TableHeader>
                  </>
                )}
                <TableHeader align="right" className="w-16"></TableHeader>
              </TableHead>
              <tbody className="divide-y divide-[var(--border-base)]">
                {dataList.map((item) => (
                  <TableRow key={item._id} className="group hover:bg-[var(--bg-surface-hover)] transition-colors">
                    {/* DATE */}
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-primary)]">
                        <Calendar className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                        {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </TableCell>

                    {/* VEHICLE */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--bg-base)] border border-[var(--border-base)] text-[var(--text-muted)]">
                          <CarFront className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-semibold text-[var(--text-primary)]">
                          {item.vehicle?.registrationNumber || 'Unknown'}
                        </span>
                      </div>
                    </TableCell>

                    {/* TRIP */}
                    <TableCell>
                      {item.trip ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-medium text-[var(--text-primary)] truncate max-w-[150px]">
                            {item.trip.source}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                            <span className="inline-block w-3 border-t border-[var(--border-base)]"></span>
                            {item.trip.destination}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--text-muted)] italic">No trip</span>
                      )}
                    </TableCell>
                    
                    {isFuelTab ? (
                      <>
                        {/* LITERS */}
                        <TableCell>
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--text-secondary)]">
                            <Fuel className="h-3 w-3 text-[var(--text-muted)]" />
                            {formatFuelLitersDisplay(item.liters)}
                          </span>
                        </TableCell>

                        {/* ODOMETER */}
                        <TableCell>
                          <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
                            <Hash className="h-3 w-3" />
                            {item.odometer != null ? `${Number(item.odometer).toLocaleString()} km` : '—'}
                          </span>
                        </TableCell>

                        {/* COST */}
                        <TableCell align="right">
                          <span className="font-bold text-[var(--text-primary)]">
                            {formatCurrency(item.cost)}
                          </span>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        {/* CATEGORY */}
                        <TableCell>
                          <Badge variant={CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Miscellaneous}>
                            {item.category}
                          </Badge>
                        </TableCell>

                        {/* NOTES */}
                        <TableCell>
                          <div className="flex items-start gap-1.5 max-w-[200px]">
                            {item.notes && <FileText className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0 mt-0.5" />}
                            <span className="text-xs text-[var(--text-muted)] line-clamp-2" title={item.notes}>
                              {item.notes || '—'}
                            </span>
                          </div>
                        </TableCell>

                        {/* AMOUNT */}
                        <TableCell align="right">
                          <span className="font-bold text-[var(--text-primary)]">
                            {formatCurrency(item.amount)}
                          </span>
                        </TableCell>
                      </>
                    )}

                    {/* ACTIONS */}
                    <TableCell className="text-right">
                      {(user?.role?.name === 'admin' || user?.role?.name === 'fleet_manager') && (
                        <button 
                          onClick={() => setDeleteTarget(item._id)} 
                          className="p-2 text-[var(--text-muted)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete entry"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      </div>

      {/* ─── Log Modal ────────────────────────────────────────── */}
      {showModal && (
        <Modal title={`Log ${isFuelTab ? 'Fuel Entry' : 'Expense'}`} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit(onFormSubmit)} className="app-form-stack">
            {errorMsg && (
              <div className="app-form-alert">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            
            <div className="app-form-grid app-form-grid--2">
              <SelectField
                label="Vehicle"
                error={errors.vehicle?.message}
                required
                {...register('vehicle', { onChange: () => setValue('trip', '') })}
              >
                <option value="" disabled>— Select vehicle —</option>
                {vehicles.map(v => <option key={v._id} value={v._id}>{v.registrationNumber}</option>)}
              </SelectField>
              
              <SelectField label="Trip (optional)" disabled={!selectedVehicle} {...register('trip')}>
                <option value="">— Select associated trip —</option>
                {filteredTrips.map(t => <option key={t._id} value={t._id}>{t.source} → {t.destination}</option>)}
              </SelectField>
            </div>

            {isFuelTab ? (
              <div className="app-form-grid app-form-grid--3">
                <Input label="Liters" required type="number" step="0.1" min="0" placeholder="0.0" error={errors.liters?.message} {...register('liters')} />
                <Input label="Total cost" required type="number" step="0.01" min="0" prefix="$" placeholder="0.00" error={errors.cost?.message} {...register('cost')} />
                <Input label="Odometer" required type="number" min="0" placeholder="e.g. 15000" error={errors.odometer?.message} {...register('odometer')} />
              </div>
            ) : (
              <div className="app-form-grid app-form-grid--2">
                <SelectField label="Category" error={errors.category?.message} required {...register('category')}>
                  <option value="Toll">Toll</option>
                  <option value="Repair">Repair</option>
                  <option value="Parking">Parking</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </SelectField>
                <Input label="Amount" required type="number" step="0.01" min="0" prefix="$" placeholder="0.00" error={errors.amount?.message} {...register('amount')} />
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              <Input label="Date" required type="date" error={errors.date?.message} {...register('date')} />
              
              {!isFuelTab && (
                <Input label="Notes" placeholder="Optional details about this expense…" {...register('notes')} />
              )}
            </div>

            <div className="app-modal-footer">
              <Button variant="outline" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" loading={modalLoading}>
                {isFuelTab ? 'Save Fuel Log' : 'Save Expense'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Delete entry" onClose={() => setDeleteTarget(null)} maxWidth="max-w-sm">
          <div className="app-form-stack">
            <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
              Are you sure you want to delete this {isFuelTab ? 'fuel log' : 'expense'}? This action cannot be undone.
            </p>
            <div className="app-modal-footer">
              <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleteLoading}>Cancel</Button>
              <Button variant="danger" onClick={confirmDelete} loading={deleteLoading}>Delete</Button>
            </div>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
};

export default FinancePage;
