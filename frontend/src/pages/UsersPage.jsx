import { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Shield, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  XCircle, 
  UserPlus, 
  Eye, 
  EyeOff,
  AlertTriangle,
  UserCheck,
  UserX,
  ShieldCheck,
  Clock,
  KeyRound,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Table, TableHead, TableRow, TableHeader, TableCell } from '../components/ui/Table';
import { Toast } from '../components/ui/Toast';

/* ─── helpers ──────────────────────────────────────────────── */
const ROLE_BADGE = {
  admin:             'danger',
  fleet_manager:     'info',
  driver:            'success',
  safety_officer:    'warning',
  financial_analyst: 'default',
};

const STATUS_BADGE = {
  true:  'success',
  false: 'danger',
};

/* ─── UserForm ─────────────────────────────────────────────── */
const EMPTY_FORM = { name: '', email: '', password: '', roleId: '', isActive: true };

const UserForm = ({ initial, roles, onSubmit, loading, error }) => {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [showPass, setShowPass] = useState(false);
  const isEdit = !!initial;

  const set = (k) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((p) => ({ ...p, [k]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input id="name" label="Full Name" placeholder="Jane Smith" value={form.name} onChange={set('name')} required />
        <Input id="email" type="email" label="Email Address" placeholder="jane@company.com" value={form.email} onChange={set('email')} required />
      </div>

      {!isEdit ? (
        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
            <KeyRound className="h-3.5 w-3.5" /> Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPass ? 'text' : 'password'}
              className="w-full rounded-xl border border-[var(--border-base)] bg-[var(--bg-base)] px-3 py-2.5 pr-10 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none transition-all focus:border-[var(--color-brand-500)] focus:ring-1 focus:ring-[var(--color-brand-500)] hover:border-[var(--color-brand-300)] dark:hover:border-[var(--color-brand-700)]"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={set('password')}
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute inset-y-0 right-3 flex items-center text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            >
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2 rounded-xl border border-[var(--border-base)] bg-[var(--bg-surface)] p-4">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
            <KeyRound className="h-3.5 w-3.5" /> Password Reset
          </label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Button variant="outline" type="button" onClick={() => setForm((p) => ({ ...p, password: 'TransitOps2026!' }))} className="text-xs shrink-0">
              Set to Default Password
            </Button>
            {form.password === 'TransitOps2026!' && (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Will be reset on save
              </span>
            )}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="roleId" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5" /> Role
        </label>
        <div className="relative">
          <select 
            id="roleId" 
            className="w-full appearance-none rounded-xl border border-[var(--border-base)] bg-[var(--bg-base)] px-3 py-2.5 pr-8 text-sm text-[var(--text-primary)] outline-none transition-all focus:border-[var(--color-brand-500)] focus:ring-1 focus:ring-[var(--color-brand-500)] hover:border-[var(--color-brand-300)] dark:hover:border-[var(--color-brand-700)]" 
            value={form.roleId} 
            onChange={set('roleId')} 
            required
          >
            <option value="" disabled>— Select a role —</option>
            {roles.map((r) => (
              <option key={r._id} value={r._id}>{r.displayName}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--text-muted)]">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
          </div>
        </div>
      </div>

      {isEdit && (
        <div className="rounded-xl border border-[var(--border-base)] bg-[var(--bg-surface)] p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">Account Status</p>
            <p className="text-xs text-[var(--text-muted)]">Determines if the user can log in.</p>
          </div>
          <label className="flex cursor-pointer items-center gap-3">
            <div className="relative">
              <input type="checkbox" className="peer sr-only" checked={form.isActive} onChange={set('isActive')} />
              <div className="h-6 w-11 rounded-full bg-[var(--border-base)] transition-colors peer-checked:bg-[var(--color-brand-500)]" />
              <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
            </div>
          </label>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-[var(--border-base)]">
        <Button type="submit" loading={loading} className="w-full sm:w-auto">
          {isEdit ? 'Save Changes' : 'Create User'}
        </Button>
      </div>
    </form>
  );
};

/* ─── ConfirmModal ─────────────────────────────────────────── */
const ConfirmModal = ({ user, onConfirm, onCancel, loading }) => (
  <div className="space-y-4">
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
  const [users, setUsers]     = useState([]);
  const [roles, setRoles]     = useState([]);
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
        const [usersRes, rolesRes] = await Promise.all([
          api.get('/users?limit=100'),
          api.get('/roles'),
        ]);
        setUsers(usersRes.data.data.users);
        setRoles(rolesRes.data.data.roles);
      } catch {
        showToast('Failed to load data', 'error');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

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
      });
      showToast(`User "${form.name}" created successfully`);
      setModal(null);
      fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setFormLoading(false);
    }
  };

  /* edit */
  const handleEdit = async (form) => {
    setFormLoading(true);
    setFormError('');
    try {
      const payload = { name: form.name, email: form.email, roleId: form.roleId, isActive: form.isActive };
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
    <div className="space-y-6 pb-10 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
            <Users className="h-6 w-6 text-[var(--color-brand-600)]" />
            User Management
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Manage system accounts, roles, and access permissions
          </p>
        </div>
        <Button onClick={() => { setFormError(''); setModal('create'); }}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-brand-50)] text-[var(--color-brand-600)] dark:bg-[var(--color-brand-900)]/20 dark:text-[var(--color-brand-400)]">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Total Users</p>
            <p className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">{users.length}</p>
          </div>
        </Card>
        
        <Card className="p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Active</p>
            <p className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">{users.filter(u => u.isActive).length}</p>
          </div>
        </Card>
        
        <Card className="p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
            <UserX className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Inactive</p>
            <p className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">{users.filter(u => !u.isActive).length}</p>
          </div>
        </Card>
        
        <Card className="p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Roles</p>
            <p className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">{roles.length}</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[var(--text-muted)]">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search users by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[var(--border-base)] bg-[var(--bg-surface)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none transition-all focus:border-[var(--color-brand-500)] focus:ring-1 focus:ring-[var(--color-brand-500)] shadow-sm hover:border-[var(--border-hover)]"
          />
        </div>
        <div className="relative w-full sm:w-64">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[var(--text-muted)]">
            <Shield className="h-4 w-4" />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full appearance-none rounded-xl border border-[var(--border-base)] bg-[var(--bg-surface)] py-2.5 pl-10 pr-8 text-sm text-[var(--text-primary)] outline-none transition-all focus:border-[var(--color-brand-500)] focus:ring-1 focus:ring-[var(--color-brand-500)] shadow-sm hover:border-[var(--border-hover)]"
          >
            <option value="">All Roles</option>
            {roles.map((r) => (
              <option key={r._id} value={r.name}>{r.displayName}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--text-muted)]">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-[var(--border-base)] bg-[var(--bg-surface)] shadow-sm">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-brand-500)] border-t-transparent"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg-base)] border border-[var(--border-base)] shadow-sm">
              <Users className="h-7 w-7 text-[var(--text-muted)]" />
            </div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">No users found</p>
            <p className="mt-1 text-xs text-[var(--text-muted)] max-w-[250px]">
              {search || roleFilter ? 'Try adjusting your search or role filters.' : 'Add a user to get started.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
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

      {/* Modals */}
      {modal === 'create' && (
        <Modal title="Add New User" onClose={closeModal}>
          <UserForm roles={roles} onSubmit={handleCreate} loading={formLoading} error={formError} />
        </Modal>
      )}

      {modal === 'edit' && selected && (
        <Modal title="Edit User" onClose={closeModal}>
          <UserForm
            initial={{ name: selected.name, email: selected.email, password: '', roleId: selected.role?._id || '', isActive: selected.isActive }}
            roles={roles}
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
