import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/* ─── helpers ──────────────────────────────────────────────── */
const ROLE_BADGE = {
  admin:             'bg-purple-500/20 text-purple-300 border-purple-500/30',
  fleet_manager:     'bg-blue-500/20   text-blue-300   border-blue-500/30',
  driver:        'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  safety_officer:    'bg-amber-500/20  text-amber-300  border-amber-500/30',
  financial_analyst: 'bg-rose-500/20   text-rose-300   border-rose-500/30',
};

const STATUS_BADGE = {
  true:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  false: 'bg-red-500/15     text-red-400     border-red-500/30',
};

/* ─── Modal ────────────────────────────────────────────────── */
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    />
    {/* Panel */}
    <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-surface-800)] shadow-2xl shadow-black/60">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)]">{title}</h2>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-700)] hover:text-[var(--color-text-primary)]"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  </div>
);

/* ─── FormField ────────────────────────────────────────────── */
const FormField = ({ label, id, error, children }) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-sm font-medium text-[var(--color-text-secondary)]">
      {label}
    </label>
    {children}
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
);

const inputCls =
  'w-full rounded-lg border border-[var(--color-border-light)] bg-[var(--color-surface-900)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] outline-none transition-all focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20';

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
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Full Name" id="name">
          <input id="name" className={inputCls} placeholder="Jane Smith" value={form.name} onChange={set('name')} required />
        </FormField>
        <FormField label="Email Address" id="email">
          <input id="email" type="email" className={inputCls} placeholder="jane@company.com" value={form.email} onChange={set('email')} required />
        </FormField>
      </div>

      {!isEdit ? (
        <FormField label="Password" id="password">
          <div className="relative">
            <input
              id="password"
              type={showPass ? 'text' : 'password'}
              className={inputCls + ' pr-10'}
              placeholder="Min 6 characters"
              value={form.password}
              onChange={set('password')}
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute inset-y-0 right-3 flex items-center text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
            >
              {showPass
                ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22" /></svg>
                : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
              }
            </button>
          </div>
        </FormField>
      ) : (
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--color-text-secondary)]">Reset Password</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, password: 'TransitOps2026!' }))}
              className="rounded-lg bg-[var(--color-surface-700)] px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-600)] transition-colors border border-[var(--color-border-light)]"
            >
              Set to Default (TransitOps2026!)
            </button>
            {form.password === 'TransitOps2026!' && (
              <span className="text-xs text-emerald-400">✓ Password will be reset on save</span>
            )}
          </div>
        </div>
      )}

      <FormField label="Role" id="roleId">
        <select id="roleId" className={inputCls} value={form.roleId} onChange={set('roleId')} required>
          <option value="">— Select a role —</option>
          {roles.map((r) => (
            <option key={r._id} value={r._id}>{r.displayName}</option>
          ))}
        </select>
      </FormField>

      {isEdit && (
        <label className="flex cursor-pointer items-center gap-3">
          <div className="relative">
            <input type="checkbox" className="peer sr-only" checked={form.isActive} onChange={set('isActive')} />
            <div className="h-5 w-9 rounded-full bg-[var(--color-surface-600)] transition-colors peer-checked:bg-[var(--color-brand-600)]" />
            <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
          </div>
          <span className="text-sm text-[var(--color-text-secondary)]">Account active</span>
        </label>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          id={isEdit ? 'user-update-btn' : 'user-create-btn'}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[var(--color-brand-600)] to-[var(--color-brand-700)] px-5 py-2 text-sm font-semibold text-white shadow-md shadow-blue-900/30 transition-all hover:from-[var(--color-brand-500)] hover:to-[var(--color-brand-600)] disabled:opacity-60"
        >
          {loading && (
            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
          )}
          {isEdit ? 'Save Changes' : 'Create User'}
        </button>
      </div>
    </form>
  );
};

/* ─── ConfirmModal ─────────────────────────────────────────── */
const ConfirmModal = ({ user, onConfirm, onCancel, loading }) => (
  <Modal title="Delete User" onClose={onCancel}>
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/20">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6M9 6V4h6v2" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">Delete {user.name}?</p>
          <p className="text-xs text-[var(--color-text-muted)]">{user.email}</p>
        </div>
      </div>
      <p className="text-sm text-[var(--color-text-secondary)]">
        This action <span className="font-semibold text-red-400">cannot be undone</span>. The user will lose all access immediately.
      </p>
      <div className="flex justify-end gap-3">
        <button onClick={onCancel} className="rounded-lg border border-[var(--color-border-light)] px-4 py-2 text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-700)]">
          Cancel
        </button>
        <button
          id="user-delete-confirm-btn"
          onClick={onConfirm}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:opacity-60"
        >
          {loading && <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" /></svg>}
          Delete User
        </button>
      </div>
    </div>
  </Modal>
);

/* ─── Toast ────────────────────────────────────────────────── */
const Toast = ({ message, type, onDismiss }) => {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-xl backdrop-blur-sm transition-all ${
      type === 'success'
        ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300'
        : 'border-red-500/30 bg-red-500/15 text-red-300'
    }`}>
      {type === 'success'
        ? <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="20 6 9 17 4 12" /></svg>
        : <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
      }
      {message}
    </div>
  );
};

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
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">User Management</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Manage system accounts and role assignments
          </p>
        </div>
        <button
          id="open-create-user-btn"
          onClick={() => { setFormError(''); setModal('create'); }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-brand-600)] to-[var(--color-brand-700)] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition-all hover:from-[var(--color-brand-500)] hover:to-[var(--color-brand-600)] hover:shadow-blue-700/40"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total Users',  value: users.length,                          color: 'text-[var(--color-brand-400)]' },
          { label: 'Active',       value: users.filter((u) => u.isActive).length, color: 'text-emerald-400' },
          { label: 'Inactive',     value: users.filter((u) => !u.isActive).length, color: 'text-red-400' },
          { label: 'Roles',        value: roles.length,                           color: 'text-purple-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-800)] px-4 py-3">
            <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
            <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[var(--color-text-muted)]">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            id="user-search"
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border-light)] bg-[var(--color-surface-800)] py-2.5 pl-9 pr-4 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20"
          />
        </div>
        <select
          id="role-filter"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-[var(--color-border-light)] bg-[var(--color-surface-800)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20"
        >
          <option value="">All Roles</option>
          {roles.map((r) => (
            <option key={r._id} value={r.name}>{r.displayName}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-800)]">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="h-8 w-8 animate-spin text-[var(--color-brand-500)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <circle cx="12" cy="12" r="10" strokeOpacity="0.2" /><path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-700)]">
              <svg className="h-6 w-6 text-[var(--color-text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">No users found</p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-900)]/50">
                  {['User', 'Role', 'Status', 'Last Login', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filtered.map((user) => {
                  const initials = user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
                  return (
                    <tr key={user._id} className="group transition-colors hover:bg-[var(--color-surface-700)]/40">
                      {/* User */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-brand-500)] to-purple-600 text-xs font-bold text-white">
                            {initials}
                          </div>
                          <div>
                            <p className="font-medium text-[var(--color-text-primary)]">{user.name}</p>
                            <p className="text-xs text-[var(--color-text-muted)]">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      {/* Role */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${ROLE_BADGE[user.role?.name] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'}`}>
                          {user.role?.displayName || '—'}
                        </span>
                      </td>
                      {/* Status */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE[user.isActive]}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${user.isActive ? 'bg-emerald-400' : 'bg-red-400'}`} />
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      {/* Last Login */}
                      <td className="px-5 py-4 text-xs text-[var(--color-text-muted)]">
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                          : 'Never'}
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={() => openEdit(user)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-brand-600)]/15 hover:text-[var(--color-brand-400)]"
                            title="Edit user"
                          >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openDelete(user)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-400"
                            title="Delete user"
                          >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
        <ConfirmModal user={selected} onConfirm={handleDelete} onCancel={closeModal} loading={formLoading} />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
};

export default UsersPage;
