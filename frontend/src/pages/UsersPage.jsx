import { useState, useEffect, useCallback } from 'react';
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
  driver:        'success',
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input id="name" label="Full Name" placeholder="Jane Smith" value={form.name} onChange={set('name')} required />
        <Input id="email" type="email" label="Email Address" placeholder="jane@company.com" value={form.email} onChange={set('email')} required />
      </div>

      {!isEdit ? (
        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Password</label>
          <div className="relative">
            <input
              id="password"
              type={showPass ? 'text' : 'password'}
              className="w-full rounded-[10px] border border-[var(--border-base)] bg-[var(--bg-base)] px-3 py-2 pr-10 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-1 focus:ring-[var(--color-brand-500)]"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={set('password')}
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute inset-y-0 right-3 flex items-center text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            >
              {showPass
                ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22" /></svg>
                : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
              }
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Reset Password</label>
          <div className="flex items-center gap-3">
            <Button variant="outline" type="button" onClick={() => setForm((p) => ({ ...p, password: 'TransitOps2026!' }))}>
              Set to Default (TransitOps2026!)
            </Button>
            {form.password === 'TransitOps2026!' && (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">✓ Password will be reset on save</span>
            )}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="roleId" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Role</label>
        <div className="relative">
          <select id="roleId" className="w-full appearance-none rounded-[10px] border border-[var(--border-base)] bg-[var(--bg-base)] px-3 py-2 pr-8 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-1 focus:ring-[var(--color-brand-500)]" value={form.roleId} onChange={set('roleId')} required>
            <option value="">— Select a role —</option>
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
        <label className="flex cursor-pointer items-center gap-3">
          <div className="relative">
            <input type="checkbox" className="peer sr-only" checked={form.isActive} onChange={set('isActive')} />
            <div className="h-5 w-9 rounded-full bg-[var(--border-base)] transition-colors peer-checked:bg-[var(--color-brand-500)]" />
            <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
          </div>
          <span className="text-sm font-medium text-[var(--text-secondary)]">Account active</span>
        </label>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-base)]">
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
        <svg className="h-5 w-5 text-red-600 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6M9 6V4h6v2" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-[var(--text-primary)]">Delete {user.name}?</p>
        <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
      </div>
    </div>
    <p className="text-sm text-[var(--text-secondary)]">
      This action <span className="font-semibold text-red-600 dark:text-red-400">cannot be undone</span>. The user will lose all access immediately.
    </p>
    <div className="flex justify-end gap-3 pt-2">
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
    <div className="space-y-6 pb-10">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">User Management</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Manage system accounts and role assignments
          </p>
        </div>
        <Button onClick={() => { setFormError(''); setModal('create'); }}>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Users',  value: users.length,                          color: 'text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)]' },
          { label: 'Active',       value: users.filter((u) => u.isActive).length, color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Inactive',     value: users.filter((u) => !u.isActive).length, color: 'text-red-600 dark:text-red-400' },
          { label: 'Roles',        value: roles.length,                           color: 'text-purple-600 dark:text-purple-400' },
        ].map(({ label, value, color }) => (
          <Card key={label} className="p-4 flex flex-col justify-center">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">{label}</p>
            <p className={`mt-2 text-2xl font-bold tracking-tight ${color}`}>{value}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[var(--text-muted)]">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-[10px] border border-[var(--border-base)] bg-[var(--bg-surface)] py-2.5 pl-9 pr-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-1 focus:ring-[var(--color-brand-500)]"
          />
        </div>
        <div className="relative w-full sm:w-48">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full appearance-none rounded-[10px] border border-[var(--border-base)] bg-[var(--bg-surface)] px-3 py-2.5 pr-8 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-1 focus:ring-[var(--color-brand-500)]"
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

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[var(--border-base)] bg-[var(--bg-surface)]">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-brand-500)] border-t-transparent"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-base)] border border-[var(--border-base)]">
              <svg className="h-6 w-6 text-[var(--text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <p className="text-sm font-medium text-[var(--text-secondary)]">No users found</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableHeader>User</TableHeader>
                <TableHeader>Role</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Last Login</TableHeader>
                <TableHeader>Pwd Updated</TableHeader>
                <TableHeader className="text-right">Actions</TableHeader>
              </TableHead>
              <tbody className="divide-y divide-[var(--border-base)]">
                {filtered.map((user) => {
                  const initials = user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
                  return (
                    <TableRow key={user._id}>
                      {/* User */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)] text-xs font-bold text-white shadow-sm shadow-[var(--color-brand-500)]/20">
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
                        <Badge variant={STATUS_BADGE[user.isActive]}>{user.isActive ? 'Active' : 'Inactive'}</Badge>
                      </TableCell>
                      {/* Last Login */}
                      <TableCell className="text-xs text-[var(--text-muted)]">
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                          : 'Never'}
                      </TableCell>
                      {/* Password Updated */}
                      <TableCell className="text-xs text-[var(--text-muted)]">
                        {user.passwordUpdatedAt
                          ? new Date(user.passwordUpdatedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                          : 'Never'}
                      </TableCell>
                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={() => openEdit(user)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"
                            title="Edit user"
                          >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openDelete(user)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
                            title="Delete user"
                          >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2" />
                            </svg>
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
