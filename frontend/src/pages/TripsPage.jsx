import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, MapPin, Navigation, Map, ShieldAlert, CheckCircle2, Clock, Truck, User, Calendar, FileText, XCircle, AlertCircle, Play, Package, DollarSign, Fuel, Activity } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Toast } from '../components/ui/Toast';
import { cn } from '../lib/utils';

/* ─── helpers ──────────────────────────────────────────────── */
const STATUS_VARIANT = {
  Draft:      'default',
  Dispatched: 'success',
  Completed:  'info',
  Cancelled:  'danger',
};

const STATUS_ICON = {
  Draft: Clock,
  Dispatched: Navigation,
  Completed: CheckCircle2,
  Cancelled: XCircle,
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
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-6 animate-in fade-in duration-500">
      
      {/* ─── Header & Stats ─────────────────────────────────── */}
      <div className="flex-none">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Trip Dispatcher</h1>
            <p className="mt-1 text-sm font-medium text-[var(--text-secondary)]">Manage dispatch workflow and monitor active trips</p>
          </div>
          {(user?.role?.name === 'admin' || user?.role?.name === 'driver') && (
            <Button onClick={handleNewTripClick} className="shadow-sm sm:w-auto w-full">
              <Plus className="mr-2 h-4 w-4" />
              New Trip
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-5">
          {[
            { label: 'Total Trips', value: total, icon: Map, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
            { label: 'Dispatched', value: dispatched, icon: Navigation, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            { label: 'Draft', value: draft, icon: Clock, color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800' },
            { label: 'Completed', value: trips.filter(t => t.status === 'Completed').length, icon: CheckCircle2, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { label: 'Cancelled', value: trips.filter(t => t.status === 'Cancelled').length, icon: XCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
          ].map((s) => (
            <Card key={s.label} className="p-4 flex flex-col justify-center transition-smooth hover:shadow-md hover:-translate-y-0.5 hover:border-[var(--color-brand-200)] dark:hover:border-[var(--color-brand-800)]">
              <div className="flex items-start justify-between mb-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">{s.label}</p>
                <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", s.bg, s.color)}>
                  <s.icon className="h-3.5 w-3.5" />
                </div>
              </div>
              <p className={cn("text-2xl font-bold tracking-tight", s.color)}>{s.value}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* ─── Split Layout ───────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 gap-6">
        
        {/* LEFT PANEL: Trip List */}
        <Card className="flex w-1/3 min-w-[320px] max-w-md flex-col overflow-hidden shadow-sm border border-[var(--border-base)]">
          <div className="border-b border-[var(--border-base)] bg-[var(--bg-base)] p-4 flex-none space-y-4">
            <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar -mx-2 px-2 mask-linear-x">
              {['', 'Draft', 'Dispatched', 'Completed', 'Cancelled'].map(t => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-500)]",
                    activeTab === t 
                      ? "bg-[var(--color-brand-500)] text-white shadow-sm" 
                      : "bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:bg-[var(--border-base)] hover:text-[var(--text-primary)]"
                  )}>
                  {t || 'All Trips'}
                </button>
              ))}
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[var(--text-muted)]">
                <Search className="h-4 w-4" />
              </div>
              <input type="text" placeholder="Search route, ID..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full rounded-[10px] border border-[var(--border-base)] bg-[var(--bg-surface)] py-2.5 pl-9 pr-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none shadow-sm transition-colors focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20 hover:border-[var(--color-brand-300)]"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto bg-[var(--bg-surface)]">
            {loading ? (
              <div className="flex h-32 flex-col items-center justify-center gap-3">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-brand-200)] border-t-[var(--color-brand-600)] dark:border-[var(--color-brand-800)] dark:border-t-[var(--color-brand-400)]"></div>
                <p className="text-xs font-medium text-[var(--text-muted)]">Loading trips...</p>
              </div>
            ) : trips.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                <Map className="h-10 w-10 text-[var(--text-muted)] opacity-50 mb-3" />
                <p className="text-sm font-semibold text-[var(--text-primary)]">No trips found</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Adjust your filters or create a new trip.</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-base)]">
                {trips.map(trip => {
                  const StatusIcon = STATUS_ICON[trip.status] || Map;
                  return (
                    <button key={trip._id} onClick={() => { setSelectedTrip(trip); setIsCreating(false); }}
                      className={cn(
                        "w-full p-4 text-left transition-all duration-200 group focus-visible:outline-none focus-visible:bg-[var(--bg-surface-hover)]",
                        selectedTrip?._id === trip._id && !isCreating 
                          ? 'bg-[var(--color-brand-50)] dark:bg-[var(--color-brand-900)]/10 ring-1 ring-inset ring-[var(--color-brand-500)]/50' 
                          : 'hover:bg-[var(--bg-surface-hover)]'
                      )}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <Badge variant={STATUS_VARIANT[trip.status]} className="flex items-center gap-1.5 shadow-sm">
                          <StatusIcon className="h-3 w-3" /> {trip.status}
                        </Badge>
                        <span className="text-[11px] font-medium text-[var(--text-muted)] flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(trip.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--border-base)] bg-[var(--bg-base)] text-[var(--text-muted)] transition-colors",
                          selectedTrip?._id === trip._id && !isCreating ? "text-[var(--color-brand-600)] border-[var(--color-brand-200)] bg-white dark:bg-[var(--bg-surface)] dark:border-[var(--color-brand-800)] dark:text-[var(--color-brand-400)]" : "group-hover:text-[var(--color-brand-500)]"
                        )}>
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[var(--text-primary)] truncate text-sm">
                            {trip.source}
                          </p>
                          <p className="font-semibold text-[var(--text-primary)] truncate text-sm mt-0.5">
                            <span className="text-[var(--text-muted)] font-normal mr-1">to</span> {trip.destination}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-xs font-medium text-[var(--text-secondary)] bg-[var(--bg-base)]/50 p-2 rounded-lg border border-[var(--border-base)]/50">
                        <span className="flex items-center gap-1.5 truncate"><Truck className="h-3.5 w-3.5 text-[var(--text-muted)]" />{trip.vehicle?.registrationNumber || 'No Vehicle'}</span>
                        <span className="flex items-center gap-1.5 truncate"><User className="h-3.5 w-3.5 text-[var(--text-muted)]" />{trip.driver?.name?.split(' ')[0] || 'No Driver'}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        {/* RIGHT PANEL: Detail / Form */}
        <Card className="flex flex-1 flex-col overflow-hidden shadow-sm border border-[var(--border-base)] bg-[var(--bg-surface)]">
          {!selectedTrip && !isCreating ? (
            <div className="flex h-full flex-col items-center justify-center text-center p-8 animate-in fade-in zoom-in-95 duration-300">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--bg-base)] to-[var(--bg-surface-hover)] text-[var(--text-muted)] border border-[var(--border-base)] shadow-sm">
                <Map className="h-10 w-10 opacity-50" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Select a Trip</h3>
              <p className="mt-2 text-sm text-[var(--text-secondary)] max-w-[250px]">Choose a trip from the list to view its complete details, payload information, and dispatch status.</p>
              {(user?.role?.name === 'admin' || user?.role?.name === 'driver') && (
                <Button onClick={handleNewTripClick} variant="outline" className="mt-6 shadow-sm">
                  <Plus className="mr-2 h-4 w-4" /> Create New Trip
                </Button>
              )}
            </div>
          ) : isCreating ? (
            // ─── CREATE FORM ─────────────────────────────────────────
            <div className="flex h-full flex-col animate-in slide-in-from-right-4 duration-300">
              <div className="border-b border-[var(--border-base)] px-6 py-5 bg-[var(--bg-base)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-brand-500)] text-white shadow-sm">
                    <Plus className="h-4 w-4" />
                  </div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">Plan New Trip</h2>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 bg-[var(--bg-surface)]">
                <form id="create-trip-form" onSubmit={handleCreateSubmit} className="space-y-6 max-w-2xl mx-auto">
                  {formError && (
                    <div className="flex items-center gap-3 rounded-lg bg-[var(--color-error)]/10 p-4 text-sm text-[var(--color-error)] animate-in fade-in slide-in-from-top-2">
                      <AlertCircle className="h-5 w-5 shrink-0" />
                      <p className="font-medium">{formError}</p>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2"><MapPin className="h-4 w-4" /> Route Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-xl border border-[var(--border-base)] bg-[var(--bg-base)] shadow-sm">
                      <Input required label="Source Location" className="w-full" value={createForm.source} onChange={e => setCreateForm({...createForm, source: e.target.value})} placeholder="e.g. Warehouse A" />
                      <Input required label="Destination" className="w-full" value={createForm.destination} onChange={e => setCreateForm({...createForm, destination: e.target.value})} placeholder="e.g. City Hub" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2"><Truck className="h-4 w-4" /> Assignments</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-xl border border-[var(--border-base)] bg-[var(--bg-base)] shadow-sm">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[var(--text-secondary)]">Assign Vehicle</label>
                        <div className="relative">
                          <select required className="w-full appearance-none rounded-[10px] border border-[var(--border-base)] bg-[var(--bg-surface)] px-4 py-2 pr-8 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-1 focus:ring-[var(--color-brand-500)] shadow-sm hover:border-[var(--color-brand-300)]" value={createForm.vehicle} onChange={e => setCreateForm({...createForm, vehicle: e.target.value})}>
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
                          <select required className="w-full appearance-none rounded-[10px] border border-[var(--border-base)] bg-[var(--bg-surface)] px-4 py-2 pr-8 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-1 focus:ring-[var(--color-brand-500)] shadow-sm hover:border-[var(--color-brand-300)]" value={createForm.driver} onChange={e => setCreateForm({...createForm, driver: e.target.value})}>
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
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2"><Package className="h-4 w-4" /> Payload & Metrics</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-xl border border-[var(--border-base)] bg-[var(--bg-base)] shadow-sm">
                      <Input required label="Cargo (kg)" type="number" min="0" step="0.1" value={createForm.cargoWeight} onChange={e => setCreateForm({...createForm, cargoWeight: e.target.value})} />
                      <Input required label="Distance (km)" type="number" min="0" value={createForm.plannedDistance} onChange={e => setCreateForm({...createForm, plannedDistance: e.target.value})} />
                      <Input label="Revenue (opt)" type="number" min="0" value={createForm.revenue} onChange={e => setCreateForm({...createForm, revenue: e.target.value})} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Notes (optional)</label>
                    <textarea rows="3" className="w-full rounded-[10px] border border-[var(--border-base)] bg-[var(--bg-base)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none shadow-sm transition-colors focus:border-[var(--color-brand-500)] focus:ring-1 focus:ring-[var(--color-brand-500)] hover:border-[var(--color-brand-300)] resize-none" value={createForm.notes} onChange={e => setCreateForm({...createForm, notes: e.target.value})} placeholder="Add any special instructions or notes..." />
                  </div>
                </form>
              </div>
              <div className="border-t border-[var(--border-base)] p-5 flex justify-end gap-3 bg-[var(--bg-base)] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
                <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                <Button form="create-trip-form" type="submit" loading={actionLoading}>
                  Create Draft
                </Button>
              </div>
            </div>
          ) : (
            // ─── TRIP DETAIL VIEW ────────────────────────────────────
            <div className="flex h-full flex-col animate-in slide-in-from-right-4 duration-300">
              <div className="border-b border-[var(--border-base)] bg-[var(--bg-base)] px-6 py-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">Trip Details</h2>
                    <Badge variant={STATUS_VARIANT[selectedTrip.status]} className="flex items-center gap-1.5 shadow-sm">
                      {selectedTrip.status === 'Draft' && <Clock className="h-3 w-3" />}
                      {selectedTrip.status === 'Dispatched' && <Navigation className="h-3 w-3" />}
                      {selectedTrip.status === 'Completed' && <CheckCircle2 className="h-3 w-3" />}
                      {selectedTrip.status === 'Cancelled' && <XCircle className="h-3 w-3" />}
                      {selectedTrip.status}
                    </Badge>
                  </div>
                  <p className="text-xs font-mono font-medium text-[var(--text-muted)] bg-[var(--bg-surface-hover)] inline-block px-2 py-1 rounded-md">ID: {selectedTrip._id}</p>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {selectedTrip.status === 'Draft' && (user?.role?.name === 'admin' || user?.role?.name === 'driver') && (
                    <>
                      <Button variant="outline" onClick={() => setModalType('cancel')} disabled={actionLoading} className="shadow-sm hover:bg-[var(--color-error)]/10 hover:text-[var(--color-error)] hover:border-[var(--color-error)]/30">Cancel</Button>
                      <Button onClick={handleDispatch} loading={actionLoading} className="shadow-sm"><Play className="h-4 w-4 mr-2" /> Dispatch Trip</Button>
                    </>
                  )}
                  {selectedTrip.status === 'Dispatched' && (user?.role?.name === 'admin' || user?.role?.name === 'driver' || user?.role?.name === 'fleet_manager') && (
                    <Button onClick={() => { setCompleteForm({ actualDistance: selectedTrip.plannedDistance, fuelUsed: '' }); setModalType('complete'); }} disabled={actionLoading} className="shadow-sm"><CheckCircle2 className="h-4 w-4 mr-2" /> Complete Trip</Button>
                  )}
                  <button onClick={() => setSelectedTrip(null)} className="ml-2 flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-base)] text-[var(--text-muted)] bg-[var(--bg-surface)] shadow-sm transition-all hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-500)]" title="Close Details">
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[var(--bg-surface)]">
                
                {/* Route */}
                <div>
                  <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2"><MapPin className="h-4 w-4" /> Route Information</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-[var(--border-base)] bg-gradient-to-br from-[var(--bg-base)] to-[var(--bg-surface)] p-5 shadow-sm">
                    <div className="flex-1 sm:text-right flex items-center gap-3 sm:block">
                      <div className="sm:hidden flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-brand-50)] text-[var(--color-brand-600)] dark:bg-[var(--color-brand-900)]/30"><MapPin className="h-4 w-4" /></div>
                      <div>
                        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Source</p>
                        <p className="text-base font-bold text-[var(--text-primary)] mt-1">{selectedTrip.source}</p>
                      </div>
                    </div>
                    
                    <div className="hidden sm:flex flex-col items-center px-6">
                      <span className="mb-1.5 px-2 py-0.5 rounded-full bg-[var(--color-brand-50)] text-xs font-bold text-[var(--color-brand-600)] dark:bg-[var(--color-brand-900)]/30 dark:text-[var(--color-brand-400)] border border-[var(--color-brand-200)] dark:border-[var(--color-brand-800)] shadow-sm">
                        {selectedTrip.plannedDistance} km
                      </span>
                      <div className="flex w-40 items-center">
                        <div className="h-2.5 w-2.5 rounded-full bg-[var(--color-brand-500)] ring-4 ring-[var(--color-brand-100)] dark:ring-[var(--color-brand-900)]" />
                        <div className="h-0.5 flex-1 border-t-2 border-dashed border-[var(--color-brand-400)]/50" />
                        <MapPin className="h-5 w-5 text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)] -ml-1" />
                      </div>
                    </div>

                    <div className="flex-1 flex items-center gap-3 sm:block">
                      <div className="sm:hidden flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-brand-50)] text-[var(--color-brand-600)] dark:bg-[var(--color-brand-900)]/30"><Navigation className="h-4 w-4" /></div>
                      <div>
                        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Destination</p>
                        <p className="text-base font-bold text-[var(--text-primary)] mt-1">{selectedTrip.destination}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assignments */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2"><Truck className="h-4 w-4" /> Assigned Vehicle</h3>
                    <div className="rounded-xl border border-[var(--border-base)] bg-[var(--bg-base)] p-5 shadow-sm transition-colors hover:border-[var(--color-brand-300)]">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xl font-bold text-[var(--text-primary)] tracking-tight">{selectedTrip.vehicle?.registrationNumber || 'Not Assigned'}</p>
                          <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">{selectedTrip.vehicle?.vehicleName || '—'} {selectedTrip.vehicle?.type ? `(${selectedTrip.vehicle.type})` : ''}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          <Truck className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-[var(--border-base)] pt-4">
                        <span className="text-xs font-medium text-[var(--text-muted)] bg-[var(--bg-surface)] px-2 py-1 rounded-md border border-[var(--border-base)]">Cap: {selectedTrip.vehicle?.capacity ? `${selectedTrip.vehicle.capacity}t` : '—'}</span>
                        <span className="text-xs font-medium text-[var(--text-muted)] bg-[var(--bg-surface)] px-2 py-1 rounded-md border border-[var(--border-base)]">Status: {selectedTrip.vehicle?.status || '—'}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2"><User className="h-4 w-4" /> Assigned Driver</h3>
                    <div className="rounded-xl border border-[var(--border-base)] bg-[var(--bg-base)] p-5 shadow-sm transition-colors hover:border-[var(--color-brand-300)]">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xl font-bold text-[var(--text-primary)] tracking-tight">{selectedTrip.driver?.name || 'Not Assigned'}</p>
                          <p className="text-sm font-medium text-[var(--text-secondary)] mt-1 font-mono">{selectedTrip.driver?.licenseNumber || '—'}</p>
                        </div>
                         <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          <User className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-[var(--border-base)] pt-4">
                        <span className="text-xs font-medium text-[var(--text-muted)] bg-[var(--bg-surface)] px-2 py-1 rounded-md border border-[var(--border-base)]">Cat: {selectedTrip.driver?.licenseCategory || '—'}</span>
                        <span className="text-xs font-medium text-[var(--text-muted)] bg-[var(--bg-surface)] px-2 py-1 rounded-md border border-[var(--border-base)] flex items-center gap-1">
                          <Activity className="h-3 w-3" /> Score: {selectedTrip.driver?.safetyScore ? `${selectedTrip.driver.safetyScore}/100` : '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div>
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2"><Package className="h-4 w-4" /> Payload & Data</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="rounded-xl bg-[var(--bg-base)] p-4 border border-[var(--border-base)] shadow-sm">
                      <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1">
                        <Package className="h-4 w-4" />
                        <p className="text-xs font-medium">Cargo</p>
                      </div>
                      <p className="mt-1 text-lg font-bold text-[var(--text-primary)]">{selectedTrip.cargoWeight} <span className="text-sm font-medium text-[var(--text-muted)]">kg</span></p>
                    </div>
                    <div className="rounded-xl bg-[var(--bg-base)] p-4 border border-[var(--border-base)] shadow-sm">
                      <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1">
                        <DollarSign className="h-4 w-4" />
                        <p className="text-xs font-medium">Revenue</p>
                      </div>
                      <p className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">{selectedTrip.revenue ? `$${selectedTrip.revenue.toLocaleString()}` : '—'}</p>
                    </div>
                    <div className="rounded-xl bg-[var(--bg-base)] p-4 border border-[var(--border-base)] shadow-sm">
                      <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1">
                        <Navigation className="h-4 w-4" />
                        <p className="text-xs font-medium">Actual Dist.</p>
                      </div>
                      <p className="mt-1 text-lg font-bold text-[var(--text-primary)]">{selectedTrip.actualDistance ? `${selectedTrip.actualDistance} km` : '—'}</p>
                    </div>
                    <div className="rounded-xl bg-[var(--bg-base)] p-4 border border-[var(--border-base)] shadow-sm">
                      <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1">
                        <Fuel className="h-4 w-4" />
                        <p className="text-xs font-medium">Fuel Used</p>
                      </div>
                      <p className="mt-1 text-lg font-bold text-[var(--text-primary)]">{selectedTrip.fuelUsed ? `${selectedTrip.fuelUsed} L` : '—'}</p>
                    </div>
                  </div>
                </div>

                {selectedTrip.notes && (
                  <div>
                    <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2"><FileText className="h-4 w-4" /> Notes</h3>
                    <div className="text-sm text-[var(--text-secondary)] rounded-xl bg-yellow-50/50 dark:bg-yellow-900/10 p-4 border border-yellow-200/50 dark:border-yellow-900/30">
                      <p className="whitespace-pre-wrap leading-relaxed">{selectedTrip.notes}</p>
                    </div>
                  </div>
                )}
                
                {/* Timestamps */}
                <div className="rounded-xl border border-[var(--border-base)] bg-[var(--bg-base)] p-4">
                  <div className="text-xs font-medium text-[var(--text-muted)] flex flex-wrap gap-x-6 gap-y-3">
                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Created: {new Date(selectedTrip.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    {selectedTrip.dispatchedAt && <span className="flex items-center gap-1.5"><Play className="h-3.5 w-3.5" /> Dispatched: {new Date(selectedTrip.dispatchedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>}
                    {selectedTrip.completedAt && <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> Completed: {new Date(selectedTrip.completedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>}
                    {selectedTrip.cancelledAt && <span className="flex items-center gap-1.5"><XCircle className="h-3.5 w-3.5" /> Cancelled: {new Date(selectedTrip.cancelledAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>}
                  </div>
                </div>

              </div>
            </div>
          )}
        </Card>
      </div>

      {/* ─── Modals ───────────────────────────────────────────── */}
      {modalType === 'complete' && (
        <Modal title="Complete Trip" onClose={() => setModalType(null)}>
          <form onSubmit={handleComplete} className="space-y-5">
            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-100 dark:border-blue-800/30 mb-4">
              <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">Please verify the final metrics for this trip.</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Planned distance was <span className="font-bold">{selectedTrip?.plannedDistance} km</span>.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input required label="Actual Distance (km)" type="number" min="0" step="0.1" value={completeForm.actualDistance} onChange={e => setCompleteForm({...completeForm, actualDistance: e.target.value})} />
              <Input required label="Fuel Used (Liters)" type="number" min="0" step="0.1" value={completeForm.fuelUsed} onChange={e => setCompleteForm({...completeForm, fuelUsed: e.target.value})} />
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-base)] mt-6">
              <Button variant="outline" type="button" onClick={() => setModalType(null)}>Cancel</Button>
              <Button type="submit" loading={actionLoading}><CheckCircle2 className="mr-2 h-4 w-4" /> Confirm Complete</Button>
            </div>
          </form>
        </Modal>
      )}

      {modalType === 'cancel' && (
        <Modal title="Cancel Trip" onClose={() => setModalType(null)} maxWidth="sm">
          <div className="space-y-5">
            <div className="flex items-start gap-4 rounded-xl border border-[var(--color-error)]/20 bg-[var(--color-error)]/10 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-error)]/20">
                <ShieldAlert className="h-5 w-5 text-[var(--color-error)]" />
              </div>
              <div>
                <p className="text-base font-semibold text-[var(--text-primary)]">Cancel this trip?</p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">Trip: {selectedTrip?.source} to {selectedTrip?.destination}</p>
                <p className="mt-3 text-sm text-[var(--text-muted)]">
                  This action <span className="font-semibold text-[var(--color-error)]">cannot be undone</span>. The assigned driver and vehicle will become available again.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setModalType(null)}>Keep Trip</Button>
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
