import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Toast } from '../components/ui/Toast';

/* ─── helpers ──────────────────────────────────────────────── */
const STATUS_VARIANT = {
  Draft:      'default',
  Dispatched: 'success',
  Completed:  'info',
  Cancelled:  'danger',
};

const STATUS_TEXT_COLOR = {
  Draft:      'text-gray-500 dark:text-gray-400',
  Dispatched: 'text-emerald-600 dark:text-emerald-400',
  Completed:  'text-blue-600 dark:text-blue-400',
  Cancelled:  'text-red-600 dark:text-red-400',
};

/* ─── TripsPage ────────────────────────────────────────────── */
const TripsPage = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [search, setSearch] = useState('');
  
  // Detail panel state
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Data for create form
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  
  // Modals & form state
  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState(null);
  
  const [modalType, setModalType] = useState(null); // 'complete' | 'cancel'
  const [completeForm, setCompleteForm] = useState({ actualDistance: '', fuelUsed: '' });
  const [createForm, setCreateForm] = useState({
    source: '', destination: '', vehicle: '', driver: '', cargoWeight: '', plannedDistance: '', revenue: '', notes: ''
  });

  const showToast = (message, type = 'success') => setToast({ message, type });

  const fetchTrips = useCallback(async () => {
    try {
      let url = '/trips?limit=100';
      if (activeTab) url += `&status=${activeTab}`;
      if (search) url += `&search=${search}`;
      const { data } = await api.get(url);
      setTrips(data.data.trips);
      
      // Update selected trip data if it exists in the new list
      setSelectedTrip(prev => {
        if (!prev) return prev;
        const updated = data.data.trips.find(t => t._id === prev._id);
        return updated || prev;
      });
    } catch {
      showToast('Failed to load trips', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab, search]);

  useEffect(() => {
    setLoading(true);
    fetchTrips();
  }, [fetchTrips]);

  const loadCreateData = async () => {
    try {
      const [vehRes, drvRes] = await Promise.all([
        api.get('/vehicles?status=Available&limit=100'),
        api.get('/drivers?status=Available&limit=100')
      ]);
      setAvailableVehicles(vehRes.data.data.vehicles);
      setAvailableDrivers(drvRes.data.data.drivers);
    } catch {
      showToast('Failed to load available vehicles/drivers', 'error');
    }
  };

  const handleNewTripClick = () => {
    setSelectedTrip(null);
    setFormError('');
    setCreateForm({ source: '', destination: '', vehicle: '', driver: '', cargoWeight: '', plannedDistance: '', revenue: '', notes: '' });
    setIsCreating(true);
    loadCreateData();
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setFormError('');
    try {
      const payload = { ...createForm, revenue: createForm.revenue || undefined };
      await api.post('/trips', payload);
      showToast('Trip created successfully');
      setIsCreating(false);
      fetchTrips();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create trip');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDispatch = async () => {
    setActionLoading(true);
    try {
      await api.put(`/trips/${selectedTrip._id}/dispatch`);
      showToast('Trip dispatched successfully');
      fetchTrips();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to dispatch trip', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.put(`/trips/${selectedTrip._id}/complete`, completeForm);
      showToast('Trip marked as completed');
      setModalType(null);
      fetchTrips();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to complete trip', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      await api.put(`/trips/${selectedTrip._id}/cancel`);
      showToast('Trip cancelled');
      setModalType(null);
      fetchTrips();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel trip', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // derived stats
  const total = trips.length;
  const dispatched = trips.filter(t => t.status === 'Dispatched').length;
  const draft = trips.filter(t => t.status === 'Draft').length;

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-6">
      
      {/* ─── Header & Stats ─────────────────────────────────── */}
      <div>
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Trip Dispatcher</h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Manage dispatch workflow and monitor active trips</p>
          </div>
          {(user?.role?.name === 'admin' || user?.role?.name === 'driver') && (
            <Button onClick={handleNewTripClick}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              New Trip
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
          {[
            { label: 'Total Trips', value: total, color: 'text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)]' },
            { label: 'Dispatched', value: dispatched, color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Draft', value: draft, color: 'text-gray-500 dark:text-gray-400' },
            { label: 'Completed', value: trips.filter(t => t.status === 'Completed').length, color: 'text-blue-600 dark:text-blue-400' },
            { label: 'Cancelled', value: trips.filter(t => t.status === 'Cancelled').length, color: 'text-red-600 dark:text-red-400' },
          ].map((s) => (
            <Card key={s.label} className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">{s.label}</p>
              <p className={`mt-2 text-2xl font-bold tracking-tight ${s.color}`}>{s.value}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* ─── Split Layout ───────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 gap-6">
        
        {/* LEFT PANEL: Trip List */}
        <div className="flex w-1/2 min-w-[320px] max-w-md flex-col overflow-hidden rounded-xl border border-[var(--border-base)] bg-[var(--bg-surface)]">
          <div className="border-b border-[var(--border-base)] bg-[var(--bg-base)] p-4">
            <div className="mb-4 flex gap-1 overflow-x-auto pb-1 no-scrollbar">
              {['', 'Draft', 'Dispatched', 'Completed', 'Cancelled'].map(t => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${activeTab === t ? 'bg-[var(--color-brand-500)] text-white' : 'bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:bg-[var(--border-base)]'}`}>
                  {t || 'All Trips'}
                </button>
              ))}
            </div>
            <div className="relative">
              <svg className="absolute left-3 top-2.5 h-4 w-4 text-[var(--text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input type="text" placeholder="Search route..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full rounded-[10px] border border-[var(--border-base)] bg-[var(--bg-surface)] py-2 pl-9 pr-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-1 focus:ring-[var(--color-brand-500)]"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex h-32 items-center justify-center"><svg className="h-6 w-6 animate-spin text-[var(--color-brand-500)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><circle cx="12" cy="12" r="10" strokeOpacity="0.2" /><path d="M12 2a10 10 0 0 1 10 10" /></svg></div>
            ) : trips.length === 0 ? (
              <div className="p-8 text-center text-sm text-[var(--text-muted)]">No trips found.</div>
            ) : (
              <div className="divide-y divide-[var(--border-base)]">
                {trips.map(trip => (
                  <button key={trip._id} onClick={() => { setSelectedTrip(trip); setIsCreating(false); }}
                    className={`w-full p-4 text-left transition-colors hover:bg-[var(--bg-surface-hover)] ${selectedTrip?._id === trip._id && !isCreating ? 'bg-[var(--bg-surface-hover)] ring-1 ring-inset ring-[var(--color-brand-500)]/50' : ''}`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <Badge variant={STATUS_VARIANT[trip.status]}>{trip.status}</Badge>
                      <span className="text-xs text-[var(--text-muted)]">{new Date(trip.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="font-semibold text-[var(--text-primary)] truncate">{trip.source} <span className="text-[var(--text-muted)]">→</span> {trip.destination}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                      <span className="flex items-center gap-1"><svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>{trip.vehicle?.registrationNumber || 'Unknown'}</span>
                      <span className="flex items-center gap-1"><svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>{trip.driver?.name?.split(' ')[0] || 'Unknown'}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Detail / Form */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-[var(--border-base)] bg-[var(--bg-surface)]">
          {!selectedTrip && !isCreating ? (
            <div className="flex h-full flex-col items-center justify-center text-center p-8">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--bg-base)] text-[var(--text-muted)] border border-[var(--border-base)]">
                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              </div>
              <p className="text-sm font-medium text-[var(--text-secondary)]">Select a trip to view details</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">Or click "New Trip" to plan a dispatch</p>
            </div>
          ) : isCreating ? (
            // ─── CREATE FORM ─────────────────────────────────────────
            <div className="flex h-full flex-col">
              <div className="border-b border-[var(--border-base)] px-6 py-4 bg-[var(--bg-base)]">
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Plan New Trip</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <form id="create-trip-form" onSubmit={handleCreateSubmit} className="space-y-5 max-w-2xl">
                  {formError && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">{formError}</div>}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Input required label="Source" className="w-full" value={createForm.source} onChange={e => setCreateForm({...createForm, source: e.target.value})} placeholder="e.g. Warehouse A" />
                    <Input required label="Destination" className="w-full" value={createForm.destination} onChange={e => setCreateForm({...createForm, destination: e.target.value})} placeholder="e.g. City Hub" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-[var(--text-secondary)]">Assign Vehicle</label>
                      <div className="relative">
                        <select required className="w-full appearance-none rounded-[10px] border border-[var(--border-base)] bg-[var(--bg-base)] px-3 py-2 pr-8 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-1 focus:ring-[var(--color-brand-500)]" value={createForm.vehicle} onChange={e => setCreateForm({...createForm, vehicle: e.target.value})}>
                          <option value="">— Select Available Vehicle —</option>
                          {availableVehicles.map(v => <option key={v._id} value={v._id}>{v.registrationNumber} ({v.vehicleName} - {v.capacity}t)</option>)}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--text-muted)]">
                          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-[var(--text-secondary)]">Assign Driver</label>
                      <div className="relative">
                        <select required className="w-full appearance-none rounded-[10px] border border-[var(--border-base)] bg-[var(--bg-base)] px-3 py-2 pr-8 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-1 focus:ring-[var(--color-brand-500)]" value={createForm.driver} onChange={e => setCreateForm({...createForm, driver: e.target.value})}>
                          <option value="">— Select Available Driver —</option>
                          {availableDrivers.map(d => <option key={d._id} value={d._id}>{d.name} ({d.licenseCategory})</option>)}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--text-muted)]">
                          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <Input required label="Cargo (kg)" type="number" min="0" step="0.1" value={createForm.cargoWeight} onChange={e => setCreateForm({...createForm, cargoWeight: e.target.value})} />
                    <Input required label="Distance (km)" type="number" min="0" value={createForm.plannedDistance} onChange={e => setCreateForm({...createForm, plannedDistance: e.target.value})} />
                    <Input label="Revenue (opt)" type="number" min="0" value={createForm.revenue} onChange={e => setCreateForm({...createForm, revenue: e.target.value})} />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Notes (optional)</label>
                    <textarea rows="3" className="w-full rounded-[10px] border border-[var(--border-base)] bg-[var(--bg-base)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-1 focus:ring-[var(--color-brand-500)]" value={createForm.notes} onChange={e => setCreateForm({...createForm, notes: e.target.value})} />
                  </div>
                </form>
              </div>
              <div className="border-t border-[var(--border-base)] p-4 flex justify-end gap-3 bg-[var(--bg-base)]">
                <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                <Button form="create-trip-form" type="submit" loading={actionLoading}>
                  Create Draft
                </Button>
              </div>
            </div>
          ) : (
            // ─── TRIP DETAIL VIEW ────────────────────────────────────
            <div className="flex h-full flex-col">
              <div className="border-b border-[var(--border-base)] bg-[var(--bg-base)] px-6 py-5 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">Trip Details</h2>
                    <Badge variant={STATUS_VARIANT[selectedTrip.status]}>{selectedTrip.status}</Badge>
                  </div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">ID: {selectedTrip._id}</p>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2">
                  {selectedTrip.status === 'Draft' && (user?.role?.name === 'admin' || user?.role?.name === 'driver') && (
                    <>
                      <Button variant="outline" onClick={() => setModalType('cancel')} disabled={actionLoading}>Cancel</Button>
                      <Button onClick={handleDispatch} loading={actionLoading}>Dispatch Trip</Button>
                    </>
                  )}
                  {selectedTrip.status === 'Dispatched' && (user?.role?.name === 'admin' || user?.role?.name === 'driver' || user?.role?.name === 'fleet_manager') && (
                    <Button onClick={() => { setCompleteForm({ actualDistance: selectedTrip.plannedDistance, fuelUsed: '' }); setModalType('complete'); }} disabled={actionLoading}>Complete Trip</Button>
                  )}
                  <button onClick={() => setSelectedTrip(null)} className="ml-2 flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-base)] text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]" title="Close Details">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                
                {/* Route */}
                <div>
                  <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Route Information</h3>
                  <div className="flex items-center gap-4 rounded-xl border border-[var(--border-base)] bg-[var(--bg-base)] p-4">
                    <div className="flex-1 text-right">
                      <p className="text-xs text-[var(--text-muted)]">Source</p>
                      <p className="text-base font-semibold text-[var(--text-primary)]">{selectedTrip.source}</p>
                    </div>
                    <div className="flex flex-col items-center px-4">
                      <span className="mb-1 text-xs font-semibold text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)]">{selectedTrip.plannedDistance} km</span>
                      <div className="flex w-32 items-center">
                        <div className="h-2 w-2 rounded-full bg-[var(--color-brand-500)]" />
                        <div className="h-0.5 flex-1 border-t-2 border-dashed border-[var(--color-brand-500)]/50" />
                        <svg className="h-4 w-4 text-[var(--color-brand-500)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-[var(--text-muted)]">Destination</p>
                      <p className="text-base font-semibold text-[var(--text-primary)]">{selectedTrip.destination}</p>
                    </div>
                  </div>
                </div>

                {/* Assignments */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Assigned Vehicle</h3>
                    <div className="rounded-xl border border-[var(--border-base)] bg-[var(--bg-base)] p-4">
                      <p className="text-lg font-bold text-[var(--text-primary)]">{selectedTrip.vehicle?.registrationNumber}</p>
                      <p className="text-sm text-[var(--text-secondary)]">{selectedTrip.vehicle?.vehicleName} ({selectedTrip.vehicle?.type})</p>
                      <div className="mt-3 flex items-center justify-between border-t border-[var(--border-base)] pt-3">
                        <span className="text-xs text-[var(--text-muted)]">Capacity: {selectedTrip.vehicle?.capacity}t</span>
                        <span className="text-xs text-[var(--text-muted)]">Status: {selectedTrip.vehicle?.status}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Assigned Driver</h3>
                    <div className="rounded-xl border border-[var(--border-base)] bg-[var(--bg-base)] p-4">
                      <p className="text-lg font-bold text-[var(--text-primary)]">{selectedTrip.driver?.name}</p>
                      <p className="text-sm text-[var(--text-secondary)]">License: {selectedTrip.driver?.licenseNumber}</p>
                      <div className="mt-3 flex items-center justify-between border-t border-[var(--border-base)] pt-3">
                        <span className="text-xs text-[var(--text-muted)]">Cat: {selectedTrip.driver?.licenseCategory}</span>
                        <span className="text-xs text-[var(--text-muted)]">Score: {selectedTrip.driver?.safetyScore}/100</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div>
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Payload & Data</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="rounded-xl bg-[var(--bg-base)] p-3 border border-[var(--border-base)]">
                      <p className="text-xs text-[var(--text-muted)]">Cargo</p>
                      <p className="mt-1 font-semibold text-[var(--text-primary)]">{selectedTrip.cargoWeight} tons</p>
                    </div>
                    <div className="rounded-xl bg-[var(--bg-base)] p-3 border border-[var(--border-base)]">
                      <p className="text-xs text-[var(--text-muted)]">Revenue</p>
                      <p className="mt-1 font-semibold text-[var(--text-primary)]">{selectedTrip.revenue ? `$${selectedTrip.revenue}` : '—'}</p>
                    </div>
                    <div className="rounded-xl bg-[var(--bg-base)] p-3 border border-[var(--border-base)]">
                      <p className="text-xs text-[var(--text-muted)]">Actual Dist.</p>
                      <p className="mt-1 font-semibold text-[var(--text-primary)]">{selectedTrip.actualDistance ? `${selectedTrip.actualDistance} km` : '—'}</p>
                    </div>
                    <div className="rounded-xl bg-[var(--bg-base)] p-3 border border-[var(--border-base)]">
                      <p className="text-xs text-[var(--text-muted)]">Fuel Used</p>
                      <p className="mt-1 font-semibold text-[var(--text-primary)]">{selectedTrip.fuelUsed ? `${selectedTrip.fuelUsed} L` : '—'}</p>
                    </div>
                  </div>
                </div>

                {selectedTrip.notes && (
                  <div>
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Notes</h3>
                    <p className="text-sm text-[var(--text-secondary)] rounded-xl bg-[var(--bg-base)] p-4 border border-[var(--border-base)]">{selectedTrip.notes}</p>
                  </div>
                )}
                
                {/* Timestamps */}
                <div className="text-xs text-[var(--text-muted)] flex flex-wrap gap-4 border-t border-[var(--border-base)] pt-4">
                  <span>Created: {new Date(selectedTrip.createdAt).toLocaleString()}</span>
                  {selectedTrip.dispatchedAt && <span>Dispatched: {new Date(selectedTrip.dispatchedAt).toLocaleString()}</span>}
                  {selectedTrip.completedAt && <span>Completed: {new Date(selectedTrip.completedAt).toLocaleString()}</span>}
                  {selectedTrip.cancelledAt && <span>Cancelled: {new Date(selectedTrip.cancelledAt).toLocaleString()}</span>}
                </div>

              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Modals ───────────────────────────────────────────── */}
      {modalType === 'complete' && (
        <Modal title="Complete Trip" onClose={() => setModalType(null)}>
          <form onSubmit={handleComplete} className="space-y-4">
            <Input required label="Actual Distance (km)" type="number" min="0" step="0.1" value={completeForm.actualDistance} onChange={e => setCompleteForm({...completeForm, actualDistance: e.target.value})} />
            <p className="text-xs text-[var(--text-muted)] mt-1">Planned distance was {selectedTrip?.plannedDistance} km.</p>
            <Input required label="Fuel Used (Liters)" type="number" min="0" step="0.1" value={completeForm.fuelUsed} onChange={e => setCompleteForm({...completeForm, fuelUsed: e.target.value})} />
            
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" type="button" onClick={() => setModalType(null)}>Cancel</Button>
              <Button type="submit" loading={actionLoading}>Confirm Complete</Button>
            </div>
          </form>
        </Modal>
      )}

      {modalType === 'cancel' && (
        <Modal title="Cancel Trip" onClose={() => setModalType(null)}>
          <div className="space-y-4">
            <p className="text-sm text-[var(--text-primary)]">Are you sure you want to cancel this trip? This action cannot be undone.</p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setModalType(null)}>Go Back</Button>
              <Button variant="danger" onClick={handleCancel} loading={actionLoading}>Cancel Trip</Button>
            </div>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
};

export default TripsPage;
