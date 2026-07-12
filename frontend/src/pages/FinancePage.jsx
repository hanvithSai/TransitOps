import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Wallet, 
  Fuel, 
  Receipt, 
  Plus, 
  Trash2, 
  CarFront, 
  Map, 
  Calendar, 
  DollarSign, 
  Hash, 
  FileText,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Table, TableHead, TableRow, TableHeader, TableCell } from '../components/ui/Table';
import { Toast } from '../components/ui/Toast';

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
  
  // Dropdown data for forms
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]); // Draft or Dispatched trips for selection
  
  // Form State
  const [formData, setFormData] = useState({
    vehicle: '', trip: '', amount: '', category: 'Toll', notes: '',
    liters: '', cost: '', odometer: '', date: new Date().toISOString().substring(0, 10)
  });

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
    setFormData({
      vehicle: '', trip: '', amount: '', category: 'Toll', notes: '',
      liters: '', cost: '', odometer: '', date: new Date().toISOString().substring(0, 10)
    });
    
    try {
      const [vehRes, tripRes] = await Promise.all([
        api.get('/vehicles?limit=100'),
        api.get('/trips?limit=100')
      ]);
      setVehicles(vehRes.data.data.vehicles);
      setTrips(tripRes.data.data.trips);
      setShowModal(true);
    } catch {
      showToast('Failed to load selection data', 'error');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setErrorMsg('');
    
    try {
      const endpoint = isFuelTab ? '/fuel' : '/expenses';
      const payload = {
        vehicle: formData.vehicle,
        trip: formData.trip || undefined,
        date: new Date(formData.date).toISOString()
      };
      
      if (isFuelTab) {
        payload.liters = Number(formData.liters);
        payload.cost = Number(formData.cost);
        payload.odometer = Number(formData.odometer);
      } else {
        payload.amount = Number(formData.amount);
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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    try {
      const endpoint = isFuelTab ? '/fuel' : '/expenses';
      await api.delete(`${endpoint}/${id}`);
      showToast('Entry deleted successfully');
      fetchData();
    } catch {
      showToast('Failed to delete entry', 'error');
    }
  };

  // Filter trips in the dropdown based on selected vehicle
  const filteredTrips = trips.filter(t => !formData.vehicle || t.vehicle?._id === formData.vehicle);

  // Compute total for the current view
  const currentTotal = dataList.reduce((sum, item) => sum + (isFuelTab ? (item.cost || 0) : (item.amount || 0)), 0);

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-6 max-w-7xl mx-auto">
      
      {/* ─── Header ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
            <Wallet className="h-6 w-6 text-[var(--color-brand-600)]" />
            Finance Management
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Track fleet operational costs, fuel logs, and expenses</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end mr-4">
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Total {isFuelTab ? 'Fuel Cost' : 'Expenses'}
            </span>
            <span className="text-lg font-bold text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)]">
              {formatCurrency(currentTotal)}
            </span>
          </div>
          {(user?.role?.name === 'admin' || user?.role?.name === 'fleet_manager') && (
            <Button onClick={handleOpenModal} className="shrink-0">
              <Plus className="mr-2 h-4 w-4" />
              Log {isFuelTab ? 'Fuel' : 'Expense'}
            </Button>
          )}
        </div>
      </div>

      {/* ─── Tabs ───────────────────────────────────────────── */}
      <div className="flex gap-2 border-b border-[var(--border-base)] pb-4">
        <button
          onClick={() => navigate('/fuel')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
            isFuelTab 
              ? 'bg-[var(--color-brand-500)] text-white shadow-md shadow-[var(--color-brand-500)]/20' 
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Fuel className="h-4 w-4" />
          Fuel Logs
        </button>
        <button
          onClick={() => navigate('/expenses')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
            !isFuelTab 
              ? 'bg-[var(--color-brand-500)] text-white shadow-md shadow-[var(--color-brand-500)]/20' 
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Receipt className="h-4 w-4" />
          General Expenses
        </button>
      </div>

      {/* ─── Data Table ─────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden rounded-xl border border-[var(--border-base)] bg-[var(--bg-surface)] shadow-sm flex flex-col">
        <div className="flex items-center justify-between bg-[var(--bg-base)] px-5 py-4 border-b border-[var(--border-base)]">
          <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-2">
            {isFuelTab ? <Fuel className="h-3.5 w-3.5" /> : <Receipt className="h-3.5 w-3.5" />}
            {isFuelTab ? 'Recent Fuel Records' : 'Recent Expenses'}
          </h3>
          <Badge variant="outline" className="text-xs font-medium">
            {dataList.length} {dataList.length === 1 ? 'Entry' : 'Entries'}
          </Badge>
        </div>

        <div className="flex-1 overflow-x-auto overflow-y-auto">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-brand-500)] border-t-transparent"></div>
            </div>
          ) : dataList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center h-full">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg-base)] border border-[var(--border-base)] shadow-sm">
                {isFuelTab ? (
                  <Fuel className="h-7 w-7 text-[var(--text-muted)]" />
                ) : (
                  <Receipt className="h-7 w-7 text-[var(--text-muted)]" />
                )}
              </div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">No {isFuelTab ? 'fuel logs' : 'expenses'} recorded yet.</p>
              <p className="mt-1 text-xs text-[var(--text-muted)] max-w-[250px]">
                Click the button above to log your first {isFuelTab ? 'fuel entry' : 'expense'}.
              </p>
            </div>
          ) : (
            <Table>
              <TableHead>
                <TableHeader>Date</TableHeader>
                <TableHeader>Vehicle</TableHeader>
                <TableHeader>Trip</TableHeader>
                {isFuelTab ? (
                  <>
                    <TableHeader>Liters</TableHeader>
                    <TableHeader>Odometer</TableHeader>
                    <TableHeader>Total Cost</TableHeader>
                  </>
                ) : (
                  <>
                    <TableHeader>Category</TableHeader>
                    <TableHeader>Notes</TableHeader>
                    <TableHeader>Amount</TableHeader>
                  </>
                )}
                <TableHeader className="text-right w-16"></TableHeader>
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
                            {item.liters} L
                          </span>
                        </TableCell>

                        {/* ODOMETER */}
                        <TableCell>
                          <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
                            <Hash className="h-3 w-3" />
                            {item.odometer.toLocaleString()} km
                          </span>
                        </TableCell>

                        {/* COST */}
                        <TableCell>
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
                        <TableCell>
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
                          onClick={() => handleDelete(item._id)} 
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
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {errorMsg && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                  <CarFront className="h-3.5 w-3.5" /> Vehicle <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select 
                    required 
                    className="w-full appearance-none rounded-xl border border-[var(--border-base)] bg-[var(--bg-base)] px-3 py-2 pr-8 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-1 focus:ring-[var(--color-brand-500)] hover:border-[var(--color-brand-300)] dark:hover:border-[var(--color-brand-700)]" 
                    value={formData.vehicle} 
                    onChange={e => setFormData({...formData, vehicle: e.target.value, trip: ''})}
                  >
                    <option value="" disabled>— Select Vehicle —</option>
                    {vehicles.map(v => <option key={v._id} value={v._id}>{v.registrationNumber}</option>)}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--text-muted)]">
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                  <Map className="h-3.5 w-3.5" /> Trip (Optional)
                </label>
                <div className="relative">
                  <select 
                    className="w-full appearance-none rounded-xl border border-[var(--border-base)] bg-[var(--bg-base)] px-3 py-2 pr-8 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-1 focus:ring-[var(--color-brand-500)] hover:border-[var(--color-brand-300)] dark:hover:border-[var(--color-brand-700)] disabled:opacity-60 disabled:cursor-not-allowed" 
                    value={formData.trip} 
                    onChange={e => setFormData({...formData, trip: e.target.value})}
                    disabled={!formData.vehicle}
                  >
                    <option value="">— Select Associated Trip —</option>
                    {filteredTrips.map(t => <option key={t._id} value={t._id}>{t.source} → {t.destination}</option>)}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--text-muted)]">
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  </div>
                </div>
              </div>
            </div>

            {isFuelTab ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                    <Fuel className="h-3.5 w-3.5" /> Liters <span className="text-red-500">*</span>
                  </label>
                  <Input required type="number" step="0.1" min="0" placeholder="0.0" value={formData.liters} onChange={e => setFormData({...formData, liters: e.target.value})} />
                </div>
                
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5" /> Total Cost <span className="text-red-500">*</span>
                  </label>
                  <Input required type="number" step="0.01" min="0" placeholder="0.00" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} />
                </div>
                
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                    <Hash className="h-3.5 w-3.5" /> Odometer <span className="text-red-500">*</span>
                  </label>
                  <Input required type="number" min="0" placeholder="e.g. 15000" value={formData.odometer} onChange={e => setFormData({...formData, odometer: e.target.value})} />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                    <Receipt className="h-3.5 w-3.5" /> Category <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select 
                      required 
                      className="w-full appearance-none rounded-xl border border-[var(--border-base)] bg-[var(--bg-base)] px-3 py-2 pr-8 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-1 focus:ring-[var(--color-brand-500)] hover:border-[var(--color-brand-300)] dark:hover:border-[var(--color-brand-700)]" 
                      value={formData.category} 
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="Toll">Toll</option>
                      <option value="Repair">Repair</option>
                      <option value="Parking">Parking</option>
                      <option value="Insurance">Insurance</option>
                      <option value="Miscellaneous">Miscellaneous</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--text-muted)]">
                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5" /> Amount <span className="text-red-500">*</span>
                  </label>
                  <Input required type="number" step="0.01" min="0" placeholder="0.00" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Date <span className="text-red-500">*</span>
                </label>
                <Input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              
              {!isFuelTab && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" /> Notes
                  </label>
                  <Input placeholder="Optional details about this expense..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-[var(--border-base)]">
              <Button variant="outline" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" loading={modalLoading}>
                {isFuelTab ? 'Save Fuel Log' : 'Save Expense'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
};

export default FinancePage;
