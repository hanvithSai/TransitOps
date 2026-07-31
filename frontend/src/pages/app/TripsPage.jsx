import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, MapPin, Navigation, Map, ShieldAlert, CheckCircle2, Clock, Truck, User, Calendar, FileText, XCircle, AlertCircle, Play, Package, DollarSign, Fuel, Activity } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/common/Modal';
import { SearchableSelectField } from '../../components/common/SearchableSelectField';
import { driverOptions, vehicleOptions, withPlaceholder } from '../../lib/selectOptions';
import { SearchInput } from '../../components/common/SearchInput';
import { Toast } from '../../components/common/Toast';
import { PageHeader } from '../../components/ui/PageHeader';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { createTripSchema, completeTripSchema } from '../../schemas/trip';
import { useDebounce } from '../../hooks/useDebounce';
import { ClampedText } from '../../components/ui/ClampedText';
import { cn, formatFuelLitersDisplay } from '../../lib/utils';

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
  const debouncedSearch = useDebounce(search);
  
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

  const {
    register: registerCreate,
    handleSubmit: handleCreateFormSubmit,
    reset: resetCreateForm,
    formState: { errors: createErrors },
  } = useForm({
    resolver: zodResolver(createTripSchema),
    defaultValues: {
      source: '', destination: '', vehicle: '', driver: '', cargoWeight: '', plannedDistance: '', revenue: '', notes: '',
    },
  });

  const {
    register: registerComplete,
    handleSubmit: handleCompleteFormSubmit,
    reset: resetCompleteForm,
    formState: { errors: completeErrors },
  } = useForm({
    resolver: zodResolver(completeTripSchema),
    defaultValues: { actualDistance: '', fuelUsed: '', revenue: '' },
  });

  const showToast = (message, type = 'success') => setToast({ message, type });

  const fetchTrips = useCallback(async () => {
    try {
      let url = '/trips?limit=100';
      if (activeTab) url += `&status=${activeTab}`;
      if (debouncedSearch) url += `&search=${debouncedSearch}`;
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
  }, [activeTab, debouncedSearch]);

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
    resetCreateForm({
      source: '', destination: '', vehicle: '', driver: '', cargoWeight: '', plannedDistance: '', revenue: '', notes: '',
    });
    setIsCreating(true);
    loadCreateData();
  };

  const handleCreateSubmit = async (formData) => {
    setActionLoading(true);
    setFormError('');
    try {
      await api.post('/trips', formData);
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

  const handleComplete = async (formData) => {
    setActionLoading(true);
    try {
      await api.put(`/trips/${selectedTrip._id}/complete`, formData);
      showToast('Trip marked as completed');
      setModalType(null);
      fetchTrips();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to complete trip', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const openCompleteModal = () => {
    resetCompleteForm({
      actualDistance: selectedTrip.plannedDistance,
      fuelUsed: '',
      revenue: selectedTrip?.revenue ?? '',
    });
    setModalType('complete');
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

  const tripVehicleOptions = useMemo(
    () => withPlaceholder(vehicleOptions(availableVehicles, { assignable: true }), '— Select Available Vehicle —'),
    [availableVehicles],
  );

  const tripDriverOptions = useMemo(
    () => withPlaceholder(driverOptions(availableDrivers), '— Select Available Driver —'),
    [availableDrivers],
  );

  return (
    <div className="app-trips-page app-trips-page--fixed h-[calc(100dvh-9rem)] max-h-[calc(100dvh-9rem)] overflow-hidden">

      {/* ─── Header & Stats — same vertical rhythm as app-page-stack ─── */}
      <div className="app-trips-page-intro shrink-0">
        <PageHeader
          icon={Map}
          title="Trip dispatcher"
          subtitle="Manage dispatch workflow and monitor active trips"
          action={(user?.role?.name === 'admin' || user?.role?.name === 'driver') ? (
            <Button onClick={handleNewTripClick} icon={Plus}>New trip</Button>
          ) : null}
        />

        <div className="app-stat-grid app-stat-grid--5">
          {[
            { label: 'Total Trips', value: total, icon: Map, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
            { label: 'Dispatched', value: dispatched, icon: Navigation, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            { label: 'Draft', value: draft, icon: Clock, color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800' },
            { label: 'Completed', value: trips.filter(t => t.status === 'Completed').length, icon: CheckCircle2, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { label: 'Cancelled', value: trips.filter(t => t.status === 'Cancelled').length, icon: XCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
          ].map((s) => (
            <StatCard
              key={s.label}
              label={s.label}
              value={s.value}
              icon={s.icon}
              iconBg={s.bg}
              iconColor={s.color}
              valueClassName={s.color}
            />
          ))}
        </div>
      </div>

      {/* ─── Master / Detail — equal split, always visible ─── */}
      <div className="app-trips-master-detail app-trips-master-detail--equal min-h-0 flex-1">
        
        {/* LEFT PANEL: Trip List */}
        <Card noPadding className="flex min-h-0 flex-col overflow-hidden border border-[var(--border-base)] shadow-sm">
          <div className="app-trips-list-toolbar shrink-0">
            <div className="app-trips-list-toolbar-head">
              <h2 className="app-trips-list-title">Trips</h2>
              {!loading && (
                <span className="app-trips-list-count">{trips.length} shown</span>
              )}
            </div>
            <div className="app-trips-filter-row no-scrollbar mask-linear-x">
              {['', 'Draft', 'Dispatched', 'Completed', 'Cancelled'].map(t => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className={cn(
                    "app-tab-btn app-tab-btn--pill transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-500)]",
                    activeTab === t 
                      ? "bg-[var(--color-brand-500)] text-white shadow-sm" 
                      : "bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:bg-[var(--border-base)] hover:text-[var(--text-primary)]"
                  )}>
                  {t || 'All Trips'}
                </button>
              ))}
            </div>
            <SearchInput
              placeholder="Search route, ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto bg-[var(--bg-surface)]">
            {loading ? (
              <div className="p-5 sm:p-6">
                <SkeletonTable rows={5} />
              </div>
            ) : trips.length === 0 ? (
              <EmptyState
                icon={Map}
                title="No trips found"
                description="Adjust your filters or create a new trip to get started."
                className="py-16 px-6"
              />
            ) : (
              <div className="flex w-full flex-col" role="list">
                {trips.map(trip => {
                  const StatusIcon = STATUS_ICON[trip.status] || Map;
                  const routeLabel = `${trip.source} → ${trip.destination}`;
                  const vehicleLabel = trip.vehicle?.registrationNumber || 'No vehicle';
                  const driverLabel = trip.driver?.name || 'No driver';
                  return (
                    <button
                      key={trip._id}
                      type="button"
                      role="listitem"
                      onClick={() => { setSelectedTrip(trip); setIsCreating(false); }}
                      className={cn(
                        'app-trip-list-item group flex w-full max-w-full flex-col items-stretch border-0 bg-transparent text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-brand-500)]',
                        selectedTrip?._id === trip._id && !isCreating
                          ? 'app-trip-list-item--selected'
                          : 'hover:bg-[var(--bg-surface-hover)]',
                      )}
                    >
                      <div className="app-trip-list-item-header">
                        <Badge variant={STATUS_VARIANT[trip.status]} className="gap-2 shadow-sm">
                          <StatusIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          {trip.status}
                        </Badge>
                        <span className="app-trip-list-item-date">
                          <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          {new Date(trip.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      <div className="app-trip-list-route">
                        <div className={cn(
                          'app-trip-list-route-icon',
                          selectedTrip?._id === trip._id && !isCreating
                            ? 'text-[var(--color-brand-600)] border-[var(--color-brand-200)] bg-white dark:bg-[var(--bg-surface)] dark:border-[var(--color-brand-800)] dark:text-[var(--color-brand-400)]'
                            : 'group-hover:text-[var(--color-brand-500)]',
                        )}>
                          <MapPin className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <div className="app-trip-list-route-text">
                          <ClampedText
                            as="p"
                            lines={2}
                            title={routeLabel}
                            className="app-trip-list-route-path"
                          >
                            {trip.source}
                            <span className="app-trip-list-route-path-muted"> → </span>
                            {trip.destination}
                          </ClampedText>
                        </div>
                      </div>

                      <div className="app-trip-list-meta">
                        <span className="app-trip-list-meta-item">
                          <Truck className="h-4 w-4 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
                          <ClampedText lines={2} text={vehicleLabel} />
                        </span>
                        <span className="app-trip-list-meta-item">
                          <User className="h-4 w-4 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
                          <ClampedText lines={2} text={driverLabel} />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        {/* RIGHT PANEL: Detail / Form / Placeholder */}
        <Card noPadding className="flex min-h-0 min-w-0 flex-col overflow-hidden border border-[var(--border-base)] bg-[var(--bg-surface)] shadow-sm">
          {!selectedTrip && !isCreating ? (
            <div className="flex h-full min-h-0 flex-col">
              <div className="app-trips-list-toolbar shrink-0 border-b border-[var(--border-base)]">
                <div className="app-trips-list-toolbar-head">
                  <h2 className="app-trips-list-title">Trip workspace</h2>
                </div>
              </div>
              <div className="flex flex-1 flex-col items-center justify-center p-6 text-center sm:p-8">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--bg-base)] to-[var(--bg-surface-hover)] text-[var(--text-muted)] border border-[var(--border-base)] shadow-sm sm:h-20 sm:w-20">
                  <Map className="h-8 w-8 opacity-50 sm:h-10 sm:w-10" />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Select a trip</h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--text-secondary)]">
                  Pick a trip from the list to view details, or create a new draft trip here.
                </p>
                {(user?.role?.name === 'admin' || user?.role?.name === 'driver') && (
                  <Button onClick={handleNewTripClick} className="mt-6 shadow-sm" icon={Plus}>
                    Create new trip
                  </Button>
                )}
              </div>
            </div>
          ) : isCreating ? (
            // ─── CREATE FORM ─────────────────────────────────────────
            <div className="flex h-full min-h-0 flex-col animate-in slide-in-from-right-4 duration-300">
              <div className="app-trips-panel-header shrink-0">
                <div className="app-trips-panel-header-inner">
                  <div className="app-trips-panel-header-icon">
                    <Plus className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">Plan New Trip</h2>
                </div>
              </div>
              <div className="app-trips-panel-body">
                <form id="create-trip-form" onSubmit={handleCreateFormSubmit(handleCreateSubmit)} className="app-form-stack--relaxed app-trips-panel-body--form">
                  {formError && (
                    <div className="app-form-alert animate-in fade-in slide-in-from-top-2">
                      <AlertCircle className="h-5 w-5 shrink-0" />
                      <p className="font-medium">{formError}</p>
                    </div>
                  )}
                  
                  <div className="app-form-section">
                    <h3 className="app-form-section-title"><MapPin className="h-4 w-4 shrink-0" /> Route Configuration</h3>
                    <div className="app-form-section-body app-form-section-body--2">
                      <Input required label="Source Location" className="w-full" error={createErrors.source?.message} {...registerCreate('source')} placeholder="e.g. Warehouse A" />
                      <Input required label="Destination" className="w-full" error={createErrors.destination?.message} {...registerCreate('destination')} placeholder="e.g. City Hub" />
                    </div>
                  </div>

                  <div className="app-form-section">
                    <h3 className="app-form-section-title"><Truck className="h-4 w-4 shrink-0" /> Assignments</h3>
                    <div className="app-form-section-body app-form-section-body--2">
                      <SearchableSelectField
                        label="Assign Vehicle"
                        error={createErrors.vehicle?.message}
                        required
                        options={tripVehicleOptions}
                        placeholder="Search vehicles…"
                        {...registerCreate('vehicle')}
                      />
                      <SearchableSelectField
                        label="Assign Driver"
                        error={createErrors.driver?.message}
                        required
                        options={tripDriverOptions}
                        placeholder="Search drivers…"
                        {...registerCreate('driver')}
                      />
                    </div>
                  </div>

                  <div className="app-form-section">
                    <h3 className="app-form-section-title"><Package className="h-4 w-4 shrink-0" /> Payload & Metrics</h3>
                    <div className="app-form-section-body app-form-section-body--3">
                      <Input required label="Cargo (kg)" type="number" min="0" step="0.1" error={createErrors.cargoWeight?.message} {...registerCreate('cargoWeight')} />
                      <Input required label="Distance (km)" type="number" min="0" error={createErrors.plannedDistance?.message} {...registerCreate('plannedDistance')} />
                      <Input label="Revenue (opt)" type="number" min="0" error={createErrors.revenue?.message} {...registerCreate('revenue')} />
                    </div>
                  </div>

                  <div className="app-form-field">
                    <label htmlFor="trip-notes" className="app-form-field-label">Notes (optional)</label>
                    <textarea id="trip-notes" rows="4" className="app-textarea-field" {...registerCreate('notes')} placeholder="Add any special instructions or notes..." />
                  </div>
                </form>
              </div>
              <div className="app-form-footer z-10">
                <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                <Button form="create-trip-form" type="submit" loading={actionLoading}>
                  Create Draft
                </Button>
              </div>
            </div>
          ) : (
            // ─── TRIP DETAIL VIEW ────────────────────────────────────
            <div className="flex h-full min-h-0 flex-col">
              <div className="app-trip-detail-header">
                <div className="app-trip-detail-header-top">
                  <div className="app-trip-detail-title-block">
                    <div className="app-trip-detail-title-row">
                      <h2 className="text-lg font-bold text-[var(--text-primary)] sm:text-xl">Trip details</h2>
                      <Badge variant={STATUS_VARIANT[selectedTrip.status]} className="gap-2 shadow-sm">
                        {selectedTrip.status === 'Draft' && <Clock className="h-3.5 w-3.5 shrink-0" />}
                        {selectedTrip.status === 'Dispatched' && <Navigation className="h-3.5 w-3.5 shrink-0" />}
                        {selectedTrip.status === 'Completed' && <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}
                        {selectedTrip.status === 'Cancelled' && <XCircle className="h-3.5 w-3.5 shrink-0" />}
                        {selectedTrip.status}
                      </Badge>
                    </div>
                    <ClampedText
                      as="p"
                      lines={2}
                      title={`${selectedTrip.source} → ${selectedTrip.destination}`}
                      className="app-trip-detail-route"
                    >
                      {selectedTrip.source} → {selectedTrip.destination}
                    </ClampedText>
                    <ClampedText
                      as="p"
                      lines={1}
                      title={selectedTrip._id}
                      className="app-trip-detail-id"
                    >
                      ID: {selectedTrip._id}
                    </ClampedText>
                  </div>

                  <div className="app-trip-detail-actions">
                    {selectedTrip.status === 'Draft' && (user?.role?.name === 'admin' || user?.role?.name === 'driver') && (
                      <>
                        <Button variant="outline" onClick={() => setModalType('cancel')} disabled={actionLoading} className="shadow-sm hover:bg-[var(--color-error)]/10 hover:text-[var(--color-error)] hover:border-[var(--color-error)]/30">
                          Cancel
                        </Button>
                        <Button onClick={handleDispatch} loading={actionLoading} className="shadow-sm" icon={Play}>
                          Dispatch trip
                        </Button>
                      </>
                    )}
                    {selectedTrip.status === 'Dispatched' && (user?.role?.name === 'admin' || user?.role?.name === 'driver' || user?.role?.name === 'fleet_manager') && (
                      <Button onClick={openCompleteModal} disabled={actionLoading} className="shadow-sm" icon={CheckCircle2}>
                        Complete trip
                      </Button>
                    )}
                    <button type="button" onClick={() => setSelectedTrip(null)} className="app-btn-icon flex items-center justify-center rounded-lg border border-[var(--border-base)] text-[var(--text-muted)] bg-[var(--bg-surface)] shadow-sm transition-all hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-500)]" title="Close details" aria-label="Close details">
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="app-trip-detail-body">
                <section className="app-trip-detail-section">
                  <h3 className="app-trip-detail-section-title"><MapPin className="h-4 w-4 shrink-0" /> Route</h3>
                  <div className="app-trip-detail-route-card">
                    <div className="app-trip-detail-route-end">
                      <p className="app-trip-detail-route-label">Source</p>
                      <ClampedText as="p" lines={3} text={selectedTrip.source} className="app-trip-detail-route-value" />
                    </div>
                    <div className="app-trip-detail-route-divider">
                      <span className="app-trip-detail-route-distance">{selectedTrip.plannedDistance} km</span>
                      <div className="app-trip-detail-route-line">
                        <div className="h-2 w-2 shrink-0 rounded-full bg-[var(--color-brand-500)] ring-4 ring-[var(--color-brand-100)] dark:ring-[var(--color-brand-900)]" />
                        <div className="h-px flex-1 border-t-2 border-dashed border-[var(--color-brand-400)]/50" />
                        <MapPin className="h-4 w-4 shrink-0 text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)]" />
                      </div>
                    </div>
                    <div className="app-trip-detail-route-end app-trip-detail-route-end--dest">
                      <p className="app-trip-detail-route-label">Destination</p>
                      <ClampedText as="p" lines={3} text={selectedTrip.destination} className="app-trip-detail-route-value" />
                    </div>
                  </div>
                </section>

                <section className="app-trip-detail-section">
                  <h3 className="app-trip-detail-section-title"><Truck className="h-4 w-4 shrink-0" /> Assignments</h3>
                  <div className="app-trip-detail-cards">
                    <div className="app-trip-detail-card">
                      <div className="app-trip-detail-card-head">
                        <div className="app-trip-detail-card-body">
                          <ClampedText
                            as="p"
                            lines={2}
                            text={selectedTrip.vehicle?.registrationNumber || 'Not assigned'}
                            className="app-trip-detail-card-title"
                          />
                          <ClampedText
                            as="p"
                            lines={2}
                            title={`${selectedTrip.vehicle?.vehicleName || '—'}${selectedTrip.vehicle?.type ? ` (${selectedTrip.vehicle.type})` : ''}`}
                            className="app-trip-detail-card-sub"
                          >
                            {selectedTrip.vehicle?.vehicleName || '—'}
                            {selectedTrip.vehicle?.type ? ` (${selectedTrip.vehicle.type})` : ''}
                          </ClampedText>
                        </div>
                        <div className="app-trip-detail-card-icon"><Truck className="h-5 w-5" /></div>
                      </div>
                      <div className="app-trip-detail-card-foot">
                        <span className="app-trip-detail-chip">
                          <ClampedText lines={1} text={`Cap: ${selectedTrip.vehicle?.capacity ? `${selectedTrip.vehicle.capacity}t` : '—'}`} />
                        </span>
                        <span className="app-trip-detail-chip">
                          <ClampedText lines={1} text={`Status: ${selectedTrip.vehicle?.status || '—'}`} />
                        </span>
                      </div>
                    </div>
                    <div className="app-trip-detail-card">
                      <div className="app-trip-detail-card-head">
                        <div className="app-trip-detail-card-body">
                          <ClampedText
                            as="p"
                            lines={2}
                            text={selectedTrip.driver?.name || 'Not assigned'}
                            className="app-trip-detail-card-title"
                          />
                          <ClampedText
                            as="p"
                            lines={2}
                            text={selectedTrip.driver?.licenseNumber || '—'}
                            className="app-trip-detail-card-sub font-mono"
                          />
                        </div>
                        <div className="app-trip-detail-card-icon"><User className="h-5 w-5" /></div>
                      </div>
                      <div className="app-trip-detail-card-foot">
                        <span className="app-trip-detail-chip">
                          <ClampedText lines={1} text={`Cat: ${selectedTrip.driver?.licenseCategory || '—'}`} />
                        </span>
                        <span className="app-trip-detail-chip">
                          <Activity className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <ClampedText
                            lines={1}
                            text={`Score: ${selectedTrip.driver?.safetyScore ? `${selectedTrip.driver.safetyScore}/100` : '—'}`}
                          />
                        </span>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="app-trip-detail-section">
                  <h3 className="app-trip-detail-section-title"><Package className="h-4 w-4 shrink-0" /> Payload & data</h3>
                  <div className="app-mini-stat-grid">
                    <div className="app-mini-stat">
                      <div className="app-mini-stat-head">
                        <Package className="h-4 w-4 shrink-0" />
                        <p className="app-mini-stat-label">Cargo</p>
                      </div>
                      <p className="app-mini-stat-value">{selectedTrip.cargoWeight} <span className="text-sm font-medium text-[var(--text-muted)]">kg</span></p>
                    </div>
                    <div className="app-mini-stat">
                      <div className="app-mini-stat-head">
                        <DollarSign className="h-4 w-4 shrink-0" />
                        <p className="app-mini-stat-label">Revenue</p>
                      </div>
                      <p className="app-mini-stat-value text-emerald-600 dark:text-emerald-400">{selectedTrip.revenue ? `$${selectedTrip.revenue.toLocaleString()}` : '—'}</p>
                    </div>
                    <div className="app-mini-stat">
                      <div className="app-mini-stat-head">
                        <Navigation className="h-4 w-4 shrink-0" />
                        <p className="app-mini-stat-label">Actual dist.</p>
                      </div>
                      <p className="app-mini-stat-value">{selectedTrip.actualDistance ? `${selectedTrip.actualDistance} km` : '—'}</p>
                    </div>
                    <div className="app-mini-stat">
                      <div className="app-mini-stat-head">
                        <Fuel className="h-4 w-4 shrink-0" />
                        <p className="app-mini-stat-label">Fuel used</p>
                      </div>
                      <p className="app-mini-stat-value">{formatFuelLitersDisplay(selectedTrip.fuelUsed)}</p>
                    </div>
                  </div>
                </section>

                {selectedTrip.notes && (
                  <section className="app-trip-detail-section">
                    <h3 className="app-trip-detail-section-title"><FileText className="h-4 w-4 shrink-0" /> Notes</h3>
                    <div className="app-trip-detail-notes">
                      <p className="whitespace-pre-wrap">{selectedTrip.notes}</p>
                    </div>
                  </section>
                )}

                <section className="app-trip-detail-section">
                  <h3 className="app-trip-detail-section-title"><Calendar className="h-4 w-4 shrink-0" /> Timeline</h3>
                  <div className="app-trip-detail-timeline">
                    <div className="app-trip-detail-timeline-list">
                      <span className="app-trip-detail-timeline-item">
                        <Calendar className="h-3.5 w-3.5" />
                        Created: {new Date(selectedTrip.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                      {selectedTrip.dispatchedAt && (
                        <span className="app-trip-detail-timeline-item">
                          <Play className="h-3.5 w-3.5" />
                          Dispatched: {new Date(selectedTrip.dispatchedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      )}
                      {selectedTrip.completedAt && (
                        <span className="app-trip-detail-timeline-item">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Completed: {new Date(selectedTrip.completedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      )}
                      {selectedTrip.cancelledAt && (
                        <span className="app-trip-detail-timeline-item">
                          <XCircle className="h-3.5 w-3.5" />
                          Cancelled: {new Date(selectedTrip.cancelledAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* ─── Modals ───────────────────────────────────────────── */}
      {modalType === 'complete' && (
        <Modal title="Complete Trip" onClose={() => setModalType(null)}>
          <form onSubmit={handleCompleteFormSubmit(handleComplete)} className="app-form-stack">
            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-100 dark:border-blue-800/30 mb-4">
              <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">Please verify the final metrics for this trip.</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Planned distance was <span className="font-bold">{selectedTrip?.plannedDistance} km</span>.</p>
            </div>
            
            <div className="app-form-grid app-form-grid--2">
              <Input required label="Actual Distance (km)" type="number" min="0" step="0.1" error={completeErrors.actualDistance?.message} {...registerComplete('actualDistance')} />
              <Input required label="Fuel Used (Liters)" type="number" min="0" step="0.1" error={completeErrors.fuelUsed?.message} {...registerComplete('fuelUsed')} />
              <Input label="Revenue (opt)" type="number" min="0" step="0.01" error={completeErrors.revenue?.message} {...registerComplete('revenue')} />
            </div>
            
            <div className="app-modal-footer">
              <Button variant="outline" type="button" onClick={() => setModalType(null)}>Cancel</Button>
              <Button type="submit" loading={actionLoading}><CheckCircle2 className="mr-2 h-4 w-4" /> Confirm Complete</Button>
            </div>
          </form>
        </Modal>
      )}

      {modalType === 'cancel' && (
        <Modal title="Cancel Trip" onClose={() => setModalType(null)} maxWidth="max-w-sm">
          <div className="app-form-stack">
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
            <div className="app-modal-footer">
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
