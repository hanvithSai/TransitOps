import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

/* ─── Modals and Toasts ───────────────────────────────────── */
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
    <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-surface-800)] shadow-2xl shadow-black/60">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)]">{title}</h2>
        <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-700)] hover:text-[var(--color-text-primary)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      </div>
      <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">{children}</div>
    </div>
  </div>
);

const Toast = ({ message, type, onDismiss }) => {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className={`fixed bottom-6 right-6 z-[120] flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-xl backdrop-blur-sm transition-all ${
      type === 'success' ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300' : 'border-red-500/30 bg-red-500/15 text-red-300'
    }`}>
      {message}
    </div>
  );
};

const CATEGORY_COLORS = {
  Toll: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  Repair: 'bg-red-500/15 text-red-400 border-red-500/30',
  Parking: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  Insurance: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Miscellaneous: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
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

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-6">
      
      {/* ─── Header ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Finance Management</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Track fleet operational costs and fuel logs</p>
        </div>
        {(user.role.name === 'admin' || user.role.name === 'fleet_manager') && (
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-brand-600)] to-[var(--color-brand-700)] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition-all hover:from-[var(--color-brand-500)] hover:to-[var(--color-brand-600)]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Log {isFuelTab ? 'Fuel' : 'Expense'}
          </button>
        )}
      </div>

      {/* ─── Tabs ───────────────────────────────────────────── */}
      <div className="flex gap-2 border-b border-[var(--color-border)] pb-4">
        <button
          onClick={() => navigate('/fuel')}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            isFuelTab 
              ? 'bg-[var(--color-brand-500)]/15 text-[var(--color-brand-400)]' 
              : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-700)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          Fuel Logs
        </button>
        <button
          onClick={() => navigate('/expenses')}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            !isFuelTab 
              ? 'bg-[var(--color-brand-500)]/15 text-[var(--color-brand-400)]' 
              : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-700)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          Expenses
        </button>
      </div>

      {/* ─── Data Table ─────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-800)]">
        <div className="h-full overflow-x-auto overflow-y-auto">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <svg className="h-6 w-6 animate-spin text-[var(--color-brand-500)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><circle cx="12" cy="12" r="10" strokeOpacity="0.2" /><path d="M12 2a10 10 0 0 1 10 10" /></svg>
            </div>
          ) : dataList.length === 0 ? (
            <div className="p-8 text-center text-sm text-[var(--color-text-muted)]">No {isFuelTab ? 'fuel logs' : 'expenses'} recorded yet.</div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-surface-900)] text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Vehicle</th>
                  <th className="px-6 py-4">Trip</th>
                  {isFuelTab ? (
                    <>
                      <th className="px-6 py-4">Liters</th>
                      <th className="px-6 py-4">Total Cost</th>
                      <th className="px-6 py-4">Odometer</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Notes</th>
                    </>
                  )}
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] text-[var(--color-text-primary)]">
                {dataList.map((item) => (
                  <tr key={item._id} className="transition-colors hover:bg-[var(--color-surface-700)]">
                    <td className="px-6 py-4">{new Date(item.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium">{item.vehicle?.registrationNumber || 'Unknown'}</td>
                    <td className="px-6 py-4 text-[var(--color-text-muted)] text-xs">
                      {item.trip ? `${item.trip.source} → ${item.trip.destination}` : '—'}
                    </td>
                    
                    {isFuelTab ? (
                      <>
                        <td className="px-6 py-4">{item.liters} L</td>
                        <td className="px-6 py-4 font-semibold text-[var(--color-brand-400)]">₹{item.cost}</td>
                        <td className="px-6 py-4 text-xs text-[var(--color-text-secondary)]">{item.odometer} km</td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Miscellaneous}`}>
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-[var(--color-brand-400)]">₹{item.amount}</td>
                        <td className="px-6 py-4 text-xs text-[var(--color-text-muted)] truncate max-w-[200px]">{item.notes || '—'}</td>
                      </>
                    )}

                    <td className="px-6 py-4 text-right">
                      {(user.role.name === 'admin' || user.role.name === 'fleet_manager') && (
                        <button onClick={() => handleDelete(item._id)} className="text-[var(--color-text-muted)] transition-colors hover:text-red-400">
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ─── Log Modal ────────────────────────────────────────── */}
      {showModal && (
        <Modal title={`Log ${isFuelTab ? 'Fuel Entry' : 'Expense'}`} onClose={() => setShowModal(false)}>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {errorMsg && <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{errorMsg}</div>}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--color-text-secondary)]">Vehicle <span className="text-red-400">*</span></label>
                <select required className="w-full rounded-lg border border-[var(--color-border-light)] bg-[var(--color-surface-900)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none" value={formData.vehicle} onChange={e => setFormData({...formData, vehicle: e.target.value, trip: ''})}>
                  <option value="">— Select Vehicle —</option>
                  {vehicles.map(v => <option key={v._id} value={v._id}>{v.registrationNumber}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--color-text-secondary)]">Trip (Optional)</label>
                <select className="w-full rounded-lg border border-[var(--color-border-light)] bg-[var(--color-surface-900)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none" value={formData.trip} onChange={e => setFormData({...formData, trip: e.target.value})}>
                  <option value="">— Select Associated Trip —</option>
                  {filteredTrips.map(t => <option key={t._id} value={t._id}>{t.source} → {t.destination}</option>)}
                </select>
              </div>
            </div>

            {isFuelTab ? (
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--color-text-secondary)]">Liters <span className="text-red-400">*</span></label>
                  <input required type="number" step="0.1" min="0" className="w-full rounded-lg border border-[var(--color-border-light)] bg-[var(--color-surface-900)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none" value={formData.liters} onChange={e => setFormData({...formData, liters: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--color-text-secondary)]">Total Cost <span className="text-red-400">*</span></label>
                  <input required type="number" min="0" className="w-full rounded-lg border border-[var(--color-border-light)] bg-[var(--color-surface-900)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--color-text-secondary)]">Odometer <span className="text-red-400">*</span></label>
                  <input required type="number" min="0" className="w-full rounded-lg border border-[var(--color-border-light)] bg-[var(--color-surface-900)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none" value={formData.odometer} onChange={e => setFormData({...formData, odometer: e.target.value})} />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--color-text-secondary)]">Category <span className="text-red-400">*</span></label>
                  <select required className="w-full rounded-lg border border-[var(--color-border-light)] bg-[var(--color-surface-900)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="Toll">Toll</option>
                    <option value="Repair">Repair</option>
                    <option value="Parking">Parking</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--color-text-secondary)]">Amount (₹) <span className="text-red-400">*</span></label>
                  <input required type="number" min="0" className="w-full rounded-lg border border-[var(--color-border-light)] bg-[var(--color-surface-900)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--color-text-secondary)]">Date <span className="text-red-400">*</span></label>
                <input required type="date" className="w-full rounded-lg border border-[var(--color-border-light)] bg-[var(--color-surface-900)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              {!isFuelTab && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--color-text-secondary)]">Notes</label>
                  <input type="text" placeholder="Optional details..." className="w-full rounded-lg border border-[var(--color-border-light)] bg-[var(--color-surface-900)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
              <button type="button" onClick={() => setShowModal(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-700)] hover:text-[var(--color-text-primary)] transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={modalLoading} className="rounded-lg bg-[var(--color-brand-600)] px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-[var(--color-brand-500)] disabled:opacity-50">
                {modalLoading ? 'Saving...' : 'Save Entry'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
};

export default FinancePage;
