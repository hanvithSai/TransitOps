import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
    } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
      showToast('Failed to delete entry', 'error');
    }
  };

  // Filter trips in the dropdown based on selected vehicle
  const filteredTrips = trips.filter(t => !formData.vehicle || t.vehicle?._id === formData.vehicle);

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-6">
      
      {/* ─── Header ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Finance Management</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Track fleet operational costs and fuel logs</p>
        </div>
        {(user?.role?.name === 'admin' || user?.role?.name === 'fleet_manager') && (
          <Button onClick={handleOpenModal}>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Log {isFuelTab ? 'Fuel' : 'Expense'}
          </Button>
        )}
      </div>

      {/* ─── Tabs ───────────────────────────────────────────── */}
      <div className="flex gap-2 border-b border-[var(--border-base)] pb-4">
        <button
          onClick={() => navigate('/fuel')}
          className={`rounded-[10px] px-4 py-2 text-sm font-semibold transition-colors ${
            isFuelTab 
              ? 'bg-[var(--color-brand-500)] text-white' 
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]'
          }`}
        >
          Fuel Logs
        </button>
        <button
          onClick={() => navigate('/expenses')}
          className={`rounded-[10px] px-4 py-2 text-sm font-semibold transition-colors ${
            !isFuelTab 
              ? 'bg-[var(--color-brand-500)] text-white' 
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]'
          }`}
        >
          Expenses
        </button>
      </div>

      {/* ─── Data Table ─────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden rounded-xl border border-[var(--border-base)] bg-[var(--bg-surface)]">
        <div className="h-full overflow-x-auto overflow-y-auto">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-brand-500)] border-t-transparent"></div>
            </div>
          ) : dataList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-base)] border border-[var(--border-base)]">
                <svg className="h-6 w-6 text-[var(--text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-[var(--text-secondary)]">No {isFuelTab ? 'fuel logs' : 'expenses'} recorded yet.</p>
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
                    <TableHeader>Total Cost</TableHeader>
                    <TableHeader>Odometer</TableHeader>
                  </>
                ) : (
                  <>
                    <TableHeader>Category</TableHeader>
                    <TableHeader>Amount</TableHeader>
                    <TableHeader>Notes</TableHeader>
                  </>
                )}
                <TableHeader className="text-right">Actions</TableHeader>
              </TableHead>
              <tbody className="divide-y divide-[var(--border-base)]">
                {dataList.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{item.vehicle?.registrationNumber || 'Unknown'}</TableCell>
                    <TableCell className="text-[var(--text-muted)] text-xs">
                      {item.trip ? `${item.trip.source} → ${item.trip.destination}` : '—'}
                    </TableCell>
                    
                    {isFuelTab ? (
                      <>
                        <TableCell>{item.liters} L</TableCell>
                        <TableCell className="font-semibold text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)]">${item.cost}</TableCell>
                        <TableCell className="text-xs text-[var(--text-secondary)]">{item.odometer} km</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>
                          <Badge variant={CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Miscellaneous}>{item.category}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)]">${item.amount}</TableCell>
                        <TableCell className="text-xs text-[var(--text-muted)] truncate max-w-[200px]">{item.notes || '—'}</TableCell>
                      </>
                    )}

                    <TableCell className="text-right">
                      {(user?.role?.name === 'admin' || user?.role?.name === 'fleet_manager') && (
                        <button onClick={() => handleDelete(item._id)} className="p-1.5 text-[var(--text-muted)] transition-colors hover:text-red-600">
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
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
            {errorMsg && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">{errorMsg}</div>}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-secondary)]">Vehicle <span className="text-red-600">*</span></label>
                <div className="relative">
                  <select required className="w-full appearance-none rounded-[10px] border border-[var(--border-base)] bg-[var(--bg-base)] px-3 py-2 pr-8 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-1 focus:ring-[var(--color-brand-500)]" value={formData.vehicle} onChange={e => setFormData({...formData, vehicle: e.target.value, trip: ''})}>
                    <option value="">— Select Vehicle —</option>
                    {vehicles.map(v => <option key={v._id} value={v._id}>{v.registrationNumber}</option>)}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--text-muted)]">
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-secondary)]">Trip (Optional)</label>
                <div className="relative">
                  <select className="w-full appearance-none rounded-[10px] border border-[var(--border-base)] bg-[var(--bg-base)] px-3 py-2 pr-8 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-1 focus:ring-[var(--color-brand-500)]" value={formData.trip} onChange={e => setFormData({...formData, trip: e.target.value})}>
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
              <div className="grid grid-cols-3 gap-4">
                <Input required label="Liters" type="number" step="0.1" min="0" value={formData.liters} onChange={e => setFormData({...formData, liters: e.target.value})} />
                <Input required label="Total Cost" type="number" min="0" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} />
                <Input required label="Odometer" type="number" min="0" value={formData.odometer} onChange={e => setFormData({...formData, odometer: e.target.value})} />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-secondary)]">Category <span className="text-red-600">*</span></label>
                  <div className="relative">
                    <select required className="w-full appearance-none rounded-[10px] border border-[var(--border-base)] bg-[var(--bg-base)] px-3 py-2 pr-8 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-1 focus:ring-[var(--color-brand-500)]" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
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
                <Input required label="Amount ($)" type="number" min="0" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input required label="Date" type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              {!isFuelTab && (
                <Input label="Notes" placeholder="Optional details..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-base)]">
              <Button variant="outline" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" loading={modalLoading}>Save Entry</Button>
            </div>
          </form>
        </Modal>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
};

export default FinancePage;
