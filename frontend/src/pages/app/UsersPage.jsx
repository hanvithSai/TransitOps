import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Users, 
  Shield, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  XCircle, 
  UserPlus, 
  AlertTriangle,
  UserCheck,
  UserX,
  ShieldCheck,
  Clock,
  KeyRound,
  AlertCircle,
  ScrollText,
  Activity
} from 'lucide-react';
import api from '../../services/api';
import { getApiErrorMessage } from '../../lib/apiErrors';
import { validatePasswordStrength, generateSecurePassword } from '../../lib/passwordPolicy';
import PasswordChecklist from '../../components/auth/PasswordChecklist';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SelectField } from '../../components/common/SelectField';
import { SearchableSelectField } from '../../components/common/SearchableSelectField';
import { driverOptions, withPlaceholder } from '../../lib/selectOptions';
import { SearchInput } from '../../components/common/SearchInput';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Table, TableHead, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import { Toast } from '../../components/ui/Toast';
import { PageHeader } from '../../components/ui/PageHeader';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

/* ─── helpers ──────────────────────────────────────────────── */
const ROLE_BADGE = {
  admin:             'danger',
  fleet_manager:     'info',
  driver:            'success',
  safety_officer:    'warning',
  financial_analyst: 'default',
};


/* ─── UserForm ─────────────────────────────────────────────── */
const EMPTY_FORM = { name: '', email: '', password: '', roleId: '', driverId: '', isActive: true };

const UserForm = ({ initial, roles, drivers = [], onSubmit, loading, error }) => {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [localError, setLocalError] = useState('');
  const isEdit = !!initial;

  const set = (k) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((p) => ({ ...p, [k]: val }));
    if (localError) setLocalError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');

    if (form.password) {
      const { valid, errors } = validatePasswordStrength(form.password);
      if (!valid) {
        setLocalError(errors[0]);
        return;
      }
    } else if (!isEdit) {
      setLocalError('Password is required.');
      return;
    }

    onSubmit(form);
  };

  const displayError = localError || error;
  const selectedRole = roles.find((r) => r._id === form.roleId);
  const isDriverRole = selectedRole?.name === 'driver';

  const linkedDriverOptions = useMemo(
    () => withPlaceholder(driverOptions(drivers), '— None —', { disabled: false }),
    [drivers],
  );

  return (
    <form onSubmit={handleSubmit} className="app-form-stack">
      {displayError && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{displayError}</span>
        </div>
      )}

      <div className="app-form-grid app-form-grid--2">
        <Input id="name" label="Full Name" placeholder="Jane Smith" value={form.name} onChange={set('name')} required />
        <Input id="email" type="email" label="Email Address" placeholder="jane@company.com" value={form.email} onChange={set('email')} required />
      </div>

      {!isEdit ? (
        <div className="space-y-2">
          <Input
            id="password"
            label="Password"
            type="password"
            showPasswordToggle
            placeholder="Min 6 chars, upper, lower, number, special"
            value={form.password}
            onChange={set('password')}
            required
            minLength={6}
          />
          <PasswordChecklist password={form.password} className="mt-1" />
        </div>
      ) : (
        <div className="space-y-3 rounded-xl border border-[var(--border-base)] bg-[var(--bg-surface)] p-4">
          <p className="text-sm font-medium text-[var(--text-primary)]">Password reset</p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => setForm((p) => ({ ...p, password: generateSecurePassword() }))}
              className="text-xs shrink-0"
            >
              Generate secure password
            </Button>
            {form.password && validatePasswordStrength(form.password).valid && (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Will be reset on save
              </span>
            )}
          </div>
          {form.password && <PasswordChecklist password={form.password} className="mt-1" />}
        </div>
      )}

      <SelectField label="Role" id="roleId" value={form.roleId} onChange={set('roleId')} required>
        <option value="" disabled>— Select a role —</option>
        {roles.map((r) => (
          <option key={r._id} value={r._id}>{r.displayName}</option>
        ))}
      </SelectField>

      {isDriverRole && (
        <SearchableSelectField
          label="Linked driver profile"
          id="driverId"
          value={form.driverId || ''}
          onChange={set('driverId')}
          options={linkedDriverOptions}
          placeholder="Search drivers…"
        />
      )}

      <div className="rounded-xl border border-[var(--border-base)] bg-[var(--bg-surface)] p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">Account Status</p>
          <p className="text-xs text-[var(--text-muted)]">
            {isEdit ? 'Determines if the user can log in.' : 'Inactive users require admin approval before login.'}
          </p>
        </div>
        <label className="flex cursor-pointer items-center gap-3">
          <div className="relative">
            <input type="checkbox" className="peer sr-only" checked={form.isActive} onChange={set('isActive')} />
            <div className="h-6 w-11 rounded-full bg-[var(--border-base)] transition-colors peer-checked:bg-[var(--color-brand-500)]" />
            <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
          </div>
        </label>
      </div>

      <div className="app-modal-footer">
        <Button type="submit" loading={loading} className="w-full sm:w-auto">
          {isEdit ? 'Save Changes' : 'Create User'}
        </Button>
      </div>
    </form>
  );
};

/* ─── ConfirmModal ─────────────────────────────────────────── */
const ConfirmModal = ({ user, onConfirm, onCancel, loading }) => (
  <div className="app-form-stack">
    <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-900/10">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
      </div>
      <div>
        <p className="text-sm font-semibold text-[var(--text-primary)]">Delete {user.name}?</p>
        <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
      </div>
    </div>
    <p className="text-sm text-[var(--text-secondary)]">
      This action <span className="font-semibold text-red-600 dark:text-red-400">cannot be undone</span>. The user will lose all access to the system immediately.
    </p>
    <div className="flex justify-end gap-3 pt-4">
      <Button variant="outline" onClick={onCancel}>Cancel</Button>
      <Button variant="danger" onClick={onConfirm} loading={loading}>Delete User</Button>
    </div>
  </div>
);


/* ─── UsersPage ────────────────────────────────────────────── */
const UsersPage = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers]     = useState([]);
  const [roles, setRoles]     = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditAction, setAuditAction] = useState('');
  const [auditResource, setAuditResource] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const [modal, setModal]       = useState(null); // null | 'create' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError]     = useState('');

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  /* fetch users + roles */
  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await api.get('/users?limit=100');
      setUsers(data.data.users);
    } catch {
      showToast('Failed to load users', 'error');
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [usersRes, rolesRes, driversRes] = await Promise.all([
          api.get('/users?limit=100'),
          api.get('/roles'),
          api.get('/drivers?limit=100'),
        ]);
        setUsers(usersRes.data.data.users);
        setRoles(rolesRes.data.data.roles);
        setDrivers(driversRes.data.data.drivers);
      } catch {
        showToast('Failed to load data', 'error');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const fetchAuditLogs = useCallback(async () => {
    setAuditLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (auditAction) params.set('action', auditAction);
      if (auditResource) params.set('resource', auditResource);
      const { data } = await api.get(`/audit-logs?${params}`);
      setAuditLogs(data.data.logs);
    } catch {
      showToast('Failed to load audit logs', 'error');
    } finally {
      setAuditLoading(false);
    }
  }, [auditAction, auditResource]);

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchAuditLogs();
    }
  }, [activeTab, fetchAuditLogs]);

  /* filtered list */
  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchesRole = roleFilter ? u.role?.name === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  /* create */
  const handleCreate = async (form) => {
    setFormLoading(true);
    setFormError('');
    try {
      await api.post('/users', {
        name: form.name,
        email: form.email,
        password: form.password,
        roleId: form.roleId,
        isActive: form.isActive,
        driverId: form.driverId || null,
      });
      showToast(`User "${form.name}" created successfully`);
      setModal(null);
      fetchUsers();
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Failed to create user'));
    } finally {
      setFormLoading(false);
    }
  };

  /* edit */
  const handleEdit = async (form) => {
    setFormLoading(true);
    setFormError('');
    try {
      const payload = { name: form.name, email: form.email, roleId: form.roleId, isActive: form.isActive, driverId: form.driverId || null };
      if (form.password) payload.password = form.password;
      await api.put(`/users/${selected._id}`, payload);
      showToast(`User "${form.name}" updated`);
      setModal(null);
      fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update user');
    } finally {
      setFormLoading(false);
    }
  };

  /* delete */
  const handleDelete = async () => {
    setFormLoading(true);
    try {
      await api.delete(`/users/${selected._id}`);
      showToast(`User "${selected.name}" deleted`);
      setModal(null);
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete user', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const openEdit = (user) => {
    setSelected(user);
    setFormError('');
    setModal('edit');
  };

  const openDelete = (user) => {
    setSelected(user);
    setModal('delete');
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setFormError('');
  };

  /* ── render ── */
  return (
    <div className="app-page-stack">

      <PageHeader
        icon={ShieldCheck}
        title="User management"
        subtitle="Manage system accounts, roles, and audit trail"
        action={activeTab === 'users' ? (
          <Button onClick={() => { setFormError(''); setModal('create'); }} icon={UserPlus}>
            Add user
          </Button>
        ) : (
          <Button variant="outline" onClick={fetchAuditLogs} icon={Activity}>
            Refresh logs
          </Button>
        )}
      />

      <div className="flex gap-2 border-b border-[var(--border-base)] pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`app-tab-btn rounded-t-lg rounded-b-none px-5 py-2.5 ${
            activeTab === 'users'
              ? 'text-[var(--color-brand-600)] border-b-2 border-[var(--color-brand-600)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <span className="inline-flex items-center gap-2.5"><Users className="h-4 w-4 shrink-0" /> Users</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`app-tab-btn rounded-t-lg rounded-b-none px-5 py-2.5 ${
            activeTab === 'audit'
              ? 'text-[var(--color-brand-600)] border-b-2 border-[var(--color-brand-600)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <span className="inline-flex items-center gap-2.5"><ScrollText className="h-4 w-4 shrink-0" /> Audit log</span>
        </button>
      </div>

      {activeTab === 'audit' ? (
        <>
          <div className="app-filter-bar">
            <SelectField
              label="Action"
              className="app-filter-bar-field"
              value={auditAction}
              onChange={(e) => setAuditAction(e.target.value)}
            >
              <option value="">All actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
            </SelectField>
            <SelectField
              label="Resource"
              className="app-filter-bar-field"
              value={auditResource}
              onChange={(e) => setAuditResource(e.target.value)}
            >
              <option value="">All resources</option>
              <option value="vehicles">Vehicles</option>
              <option value="drivers">Drivers</option>
              <option value="trips">Trips</option>
              <option value="maintenance">Maintenance</option>
              <option value="fuel">Fuel</option>
              <option value="expenses">Expenses</option>
              <option value="users">Users</option>
            </SelectField>
            <div className="app-filter-bar-action">
              <Button variant="outline" onClick={fetchAuditLogs}>Apply filters</Button>
            </div>
          </div>

          <div className="app-table-results">
            {auditLoading ? (
              <div className="app-table-results-loading"><SkeletonTable rows={8} /></div>
            ) : auditLogs.length === 0 ? (
              <EmptyState title="No audit entries found." description="Try adjusting the filters above." icon={ScrollText} />
            ) : (
              <div className="overflow-x-auto">
                <Table comfortable>
                  <TableHead>
                    <TableHeader>When</TableHeader>
                    <TableHeader>User</TableHeader>
                    <TableHeader>Action</TableHeader>
                    <TableHeader>Resource</TableHeader>
                    <TableHeader>Details</TableHeader>
                  </TableHead>
                  <tbody className="divide-y divide-[var(--border-base)]">
                    {auditLogs.map((log) => (
                      <TableRow key={log._id}>
                        <TableCell className="text-xs text-[var(--text-muted)] whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium text-[var(--text-primary)]">{log.user?.name || '—'}</div>
                          <div className="text-xs text-[var(--text-muted)]">{log.user?.email || ''}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={log.action === 'DELETE' ? 'danger' : log.action === 'CREATE' ? 'success' : 'info'}>
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize text-sm">{log.resource}</TableCell>
                        <TableCell className="text-xs text-[var(--text-muted)] max-w-xs truncate">
                          {log.details?.path || '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
      {/* Stats */}
      <div className="app-stat-grid">
        <StatCard
          layout="row"
          label="Total Users"
          value={users.length}
          icon={Users}
          iconBg="bg-[var(--color-brand-50)] dark:bg-[var(--color-brand-900)]/20"
          iconColor="text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)]"
        />
        <StatCard
          layout="row"
          label="Active"
          value={users.filter(u => u.isActive).length}
          icon={UserCheck}
          iconBg="bg-emerald-50 dark:bg-emerald-900/20"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          layout="row"
          label="Inactive"
          value={users.filter(u => !u.isActive).length}
          icon={UserX}
          iconBg="bg-red-50 dark:bg-red-900/20"
          iconColor="text-red-600 dark:text-red-400"
        />
        <StatCard
          layout="row"
          label="Roles"
          value={roles.length}
          icon={ShieldCheck}
          iconBg="bg-purple-50 dark:bg-purple-900/20"
          iconColor="text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* Filters */}
      <div className="app-toolbar-card">
        <SearchInput
          containerClassName="app-toolbar-search flex-1"
          placeholder="Search users by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <SelectField
          icon={Shield}
          className="app-toolbar-filter w-full sm:w-64"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All roles</option>
          {roles.map((r) => (
            <option key={r._id} value={r.name}>{r.displayName}</option>
          ))}
        </SelectField>
      </div>

      {/* Table Container */}
      <div className="app-table-results">
        {loading ? (
          <div className="app-table-results-loading flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-brand-500)] border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No users found"
            description={search || roleFilter ? 'Try adjusting your search or role filters.' : 'Add a user to get started.'}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table comfortable>
              <TableHead>
                <TableHeader>User</TableHeader>
                <TableHeader>Role</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Security & Access</TableHeader>
                <TableHeader className="text-right w-24"></TableHeader>
              </TableHead>
              <tbody className="divide-y divide-[var(--border-base)]">
                {filtered.map((user) => {
                  const initials = user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
                  return (
                    <TableRow key={user._id} className="group hover:bg-[var(--bg-surface-hover)] transition-colors">
                      {/* User */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)] text-sm font-bold text-white shadow-sm shadow-[var(--color-brand-500)]/20">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-[var(--text-primary)]">{user.name}</p>
                            <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      
                      {/* Role */}
                      <TableCell>
                        <Badge variant={ROLE_BADGE[user.role?.name] || 'default'}>{user.role?.displayName || '—'}</Badge>
                      </TableCell>
                      
                      {/* Status */}
                      <TableCell>
                        {user.isActive ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                            <XCircle className="h-3.5 w-3.5" /> Inactive
                          </span>
                        )}
                      </TableCell>
                      
                      {/* Security & Access */}
                      <TableCell>
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                            <Clock className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                            {user.lastLogin ? `Last login: ${new Date(user.lastLogin).toLocaleDateString()}` : 'Never logged in'}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                            <KeyRound className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                            {user.passwordUpdatedAt ? `Pwd updated: ${new Date(user.passwordUpdatedAt).toLocaleDateString()}` : 'Pwd never updated'}
                          </div>
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={() => openEdit(user)}
                            className="p-2 text-[var(--text-muted)] hover:text-[var(--color-brand-600)] hover:bg-[var(--color-brand-50)] dark:hover:bg-[var(--color-brand-900)]/20 rounded-lg transition-colors"
                            title="Edit user"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openDelete(user)}
                            className="p-2 text-[var(--text-muted)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </div>
        </>
      )}

      {/* Modals */}
      {modal === 'create' && (
        <Modal title="Add New User" onClose={closeModal}>
          <UserForm roles={roles} drivers={drivers} onSubmit={handleCreate} loading={formLoading} error={formError} />
        </Modal>
      )}

      {modal === 'edit' && selected && (
        <Modal title="Edit User" onClose={closeModal}>
          <UserForm
            initial={{ name: selected.name, email: selected.email, password: '', roleId: selected.role?._id || '', driverId: selected.driver?._id || '', isActive: selected.isActive }}
            roles={roles}
            drivers={drivers}
            onSubmit={handleEdit}
            loading={formLoading}
            error={formError}
          />
        </Modal>
      )}

      {modal === 'delete' && selected && (
        <Modal title="Delete User" onClose={closeModal}>
          <ConfirmModal user={selected} onConfirm={handleDelete} onCancel={closeModal} loading={formLoading} />
        </Modal>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
};

export default UsersPage;
