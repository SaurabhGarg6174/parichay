'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import {
    Users,
    ChevronLeft,
    ChevronRight,
    UserPlus,
    Pencil,
    Trash2,
    CheckCircle,
    Slash,
    Eye,
    EyeOff,
    AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/Modal';
import { useToast } from '@/context/ToastContext';

interface User {
    id: number;
    email: string;
    fullName: string;
    roles: string[];
    enabled: boolean;
}

const inputCls = 'w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-[13.5px] text-foreground placeholder:text-faint focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';
const labelCls = 'block text-[12.5px] font-semibold text-foreground mb-1.5';

export default function AdminUsersPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { showToast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [availableActions, setAvailableActions] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');

    // Modal states
    const [editModal, setEditModal] = useState<{ isOpen: boolean, user: User | null }>({ isOpen: false, user: null });
    const [createModal, setCreateModal] = useState({ isOpen: false, user: { email: '', fullName: '', roles: ['USER'], password: '' } });
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, title: string, message: string, action: () => void }>({
        isOpen: false, title: '', message: '', action: () => { }
    });
    const [showCreatePassword, setShowCreatePassword] = useState(false);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const enabled = activeTab === 'active';
            const res = await api.get(`/admin/users?enabled=${enabled}&page=${page}&size=10`);
            if (res.data?.success) {
                setUsers(res.data.data.content);
                setTotalPages(res.data.data.totalPages);
                setAvailableActions(res.data.data.actions || []);
            }
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to fetch users', 'error');
        } finally {
            setLoading(false);
        }
    }, [page, activeTab]);

    useEffect(() => {
        if (!authLoading && (!user || !user.roles.includes('ADMIN'))) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user && user.roles.includes('ADMIN')) {
            fetchUsers();
        }
    }, [fetchUsers, user]);

    const handleToggleStatus = async (userId: number, currentEnabled: boolean) => {
        setConfirmModal({
            isOpen: true,
            title: currentEnabled ? 'Deactivate user' : 'Activate user',
            message: `Are you sure you want to ${currentEnabled ? 'deactivate' : 'activate'} this user account?`,
            action: async () => {
                try {
                    const res = await api.patch(`/admin/users/${userId}/status`, { enabled: !currentEnabled });
                    if (res.data?.success) {
                        setUsers(prev => prev.filter(u => u.id !== userId));
                        setConfirmModal(prev => ({ ...prev, isOpen: false }));
                        showToast(`User ${currentEnabled ? 'deactivated' : 'activated'} successfully`, 'success');
                    }
                } catch (error: any) {
                    showToast(error.response?.data?.message || 'Failed to update status', 'error');
                }
            }
        });
    };

    const handleDelete = async (userId: number) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete user permanently',
            message: 'Are you sure you want to permanently delete this user? This action cannot be undone.',
            action: async () => {
                try {
                    const res = await api.delete(`/admin/users/${userId}`);
                    if (res.data?.success) {
                        setUsers(prev => prev.filter(u => u.id !== userId));
                        setConfirmModal(prev => ({ ...prev, isOpen: false }));
                        showToast('User deleted permanently', 'success');
                    }
                } catch (error: any) {
                    showToast(error.response?.data?.message || 'Failed to delete user', 'error');
                }
            }
        });
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/admin/users', createModal.user);
            if (res.data?.success) {
                if (activeTab === 'active') {
                    setUsers(prev => [res.data.data, ...prev]);
                }
                setCreateModal({ isOpen: false, user: { email: '', fullName: '', roles: ['USER'], password: '' } });
                showToast('User created successfully', 'success');
            }
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to create user', 'error');
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editModal.user) return;
        try {
            const res = await api.put(`/admin/users/${editModal.user.id}`, editModal.user);
            if (res.data?.success) {
                setUsers(prev => prev.map(u => u.id === editModal.user?.id ? res.data.data : u));
                setEditModal({ isOpen: false, user: null });
                showToast('User updated successfully', 'success');
            }
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to update user', 'error');
        }
    };

    if (authLoading || (user && !user.roles.includes('ADMIN'))) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
            </div>
        );
    }

    const RoleToggle = ({ roles, onToggle }: { roles: string[]; onToggle: (role: string) => void }) => (
        <div className="flex flex-wrap gap-2">
            {['ADMIN', 'USER'].map(role => (
                <button
                    key={role}
                    type="button"
                    onClick={() => onToggle(role)}
                    className={`rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition-colors ${roles.includes(role)
                        ? 'border-primary bg-primary-subtle text-primary'
                        : 'border-border-strong bg-surface text-muted-foreground hover:bg-surface-hover hover:text-foreground'
                        }`}
                >
                    {role}
                </button>
            ))}
        </div>
    );

    const toggleRole = (roles: string[], role: string) => {
        const next = [...roles];
        const idx = next.indexOf(role);
        if (idx > -1) {
            if (next.length > 1) next.splice(idx, 1);
        } else {
            next.push(role);
        }
        return next;
    };

    return (
        <div className="space-y-5">
            <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <p className="text-xs text-faint">Admin / <span className="font-medium text-muted-foreground">Users</span></p>
                    <h1 className="mt-1 text-[21px] font-semibold tracking-tight text-foreground">User management</h1>
                    <p className="mt-0.5 text-[13px] text-muted-foreground">Manage system users, roles and access status.</p>
                </div>

                <div className="flex items-center gap-2">
                    {/* Active / Inactive tabs */}
                    <div className="flex items-center gap-0.5 rounded-lg border border-border bg-surface-muted p-0.5">
                        <button
                            onClick={() => { setActiveTab('active'); setPage(0); }}
                            className={`rounded-md px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${activeTab === 'active' ? 'bg-surface text-foreground shadow-card' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Active
                        </button>
                        <button
                            onClick={() => { setActiveTab('inactive'); setPage(0); }}
                            className={`rounded-md px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${activeTab === 'inactive' ? 'bg-surface text-foreground shadow-card' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Inactive
                        </button>
                    </div>
                    <button
                        onClick={() => setCreateModal(prev => ({ ...prev, isOpen: true }))}
                        className="flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover"
                    >
                        <UserPlus className="h-4 w-4" aria-hidden />
                        Create user
                    </button>
                </div>
            </header>

            <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-[13px]">
                        <thead>
                            <tr className="bg-surface-muted">
                                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.07em] text-faint">User</th>
                                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.07em] text-faint">Email</th>
                                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.07em] text-faint">Roles</th>
                                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.07em] text-faint">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-5 py-4"><div className="h-4 w-40 rounded bg-surface-muted" /></td>
                                        <td className="px-5 py-4"><div className="h-4 w-52 rounded bg-surface-muted" /></td>
                                        <td className="px-5 py-4"><div className="h-5 w-28 rounded-full bg-surface-muted" /></td>
                                        <td className="px-5 py-4"><div className="ml-auto h-7 w-24 rounded bg-surface-muted" /></td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-5 py-16 text-center">
                                        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted">
                                            <Users className="h-6 w-6 text-faint" aria-hidden />
                                        </span>
                                        <p className="mt-3 text-[13px] font-medium text-muted-foreground">No {activeTab} users found</p>
                                    </td>
                                </tr>
                            ) : (
                                users.map((userItem) => (
                                    <tr key={userItem.id} className="transition-colors hover:bg-surface-hover">
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-[11px] font-semibold text-primary">
                                                    {(userItem.fullName || userItem.email).slice(0, 2).toUpperCase()}
                                                </span>
                                                <span className="font-semibold text-foreground">{userItem.fullName}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-muted-foreground">
                                            {userItem.email}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex flex-wrap gap-1.5">
                                                {userItem.roles.map((role) => (
                                                    <span
                                                        key={role}
                                                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${role === 'ADMIN' ? 'bg-primary-subtle text-primary' : 'bg-surface-muted text-muted-foreground'}`}
                                                    >
                                                        {role.charAt(0) + role.slice(1).toLowerCase()}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => setEditModal({ isOpen: true, user: userItem })}
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
                                                    title="Edit user"
                                                    aria-label={`Edit ${userItem.fullName}`}
                                                >
                                                    <Pencil className="h-4 w-4" aria-hidden />
                                                </button>

                                                <button
                                                    onClick={() => handleToggleStatus(userItem.id, userItem.enabled)}
                                                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${userItem.enabled ? 'text-warning hover:bg-warning-subtle' : 'text-success hover:bg-success-subtle'}`}
                                                    title={userItem.enabled ? 'Deactivate' : 'Activate'}
                                                    aria-label={`${userItem.enabled ? 'Deactivate' : 'Activate'} ${userItem.fullName}`}
                                                >
                                                    {userItem.enabled ? <Slash className="h-4 w-4" aria-hidden /> : <CheckCircle className="h-4 w-4" aria-hidden />}
                                                </button>

                                                {activeTab === 'inactive' && (
                                                    <button
                                                        onClick={() => handleDelete(userItem.id)}
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-danger transition-colors hover:bg-danger-subtle"
                                                        title="Delete user"
                                                        aria-label={`Delete ${userItem.fullName}`}
                                                    >
                                                        <Trash2 className="h-4 w-4" aria-hidden />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between border-t border-border px-5 py-3">
                    <p className="text-[12.5px] text-muted-foreground tabular-nums">
                        Page {page + 1} of {totalPages || 1}
                    </p>
                    <div className="flex items-center gap-1.5">
                        <button
                            disabled={page === 0}
                            onClick={() => setPage(page - 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-strong text-muted-foreground transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Previous page"
                        >
                            <ChevronLeft className="h-4 w-4" aria-hidden />
                        </button>
                        <button
                            disabled={page >= totalPages - 1 || totalPages === 0}
                            onClick={() => setPage(page + 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-strong text-muted-foreground transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Next page"
                        >
                            <ChevronRight className="h-4 w-4" aria-hidden />
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirmation modal */}
            <Modal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                title={confirmModal.title}
                footer={
                    <>
                        <button
                            onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                            className="rounded-lg px-3.5 py-2 text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => confirmModal.action()}
                            className={`rounded-lg px-4 py-2 text-[13px] font-semibold text-white transition-colors ${confirmModal.title.toLowerCase().includes('delete') ? 'bg-danger hover:opacity-90' : 'bg-primary hover:bg-primary-hover'}`}
                        >
                            Confirm
                        </button>
                    </>
                }
            >
                <div className="flex items-start gap-3">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${confirmModal.title.toLowerCase().includes('delete') ? 'bg-danger-subtle' : 'bg-warning-subtle'}`}>
                        {confirmModal.title.toLowerCase().includes('delete')
                            ? <Trash2 className="h-4.5 w-4.5 text-danger" aria-hidden />
                            : <AlertCircle className="h-4.5 w-4.5 text-warning" aria-hidden />}
                    </span>
                    <p className="text-[13.5px] text-muted-foreground">{confirmModal.message}</p>
                </div>
            </Modal>

            {/* Edit user modal */}
            <Modal
                isOpen={editModal.isOpen}
                onClose={() => setEditModal({ isOpen: false, user: null })}
                title="Edit user"
                footer={
                    <>
                        <button
                            onClick={() => setEditModal({ isOpen: false, user: null })}
                            className="rounded-lg px-3.5 py-2 text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="edit-user-form"
                            className="rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover"
                        >
                            Save changes
                        </button>
                    </>
                }
            >
                <form id="edit-user-form" onSubmit={handleUpdateUser} className="space-y-4">
                    <div>
                        <label className={labelCls}>Email address</label>
                        <input
                            type="email"
                            value={editModal.user?.email || ''}
                            onChange={(e) => setEditModal(prev => ({ ...prev, user: prev.user ? { ...prev.user, email: e.target.value } : null }))}
                            className={inputCls}
                            required
                        />
                    </div>

                    <div>
                        <label className={labelCls}>Full name</label>
                        <input
                            type="text"
                            value={editModal.user?.fullName || ''}
                            onChange={(e) => setEditModal(prev => ({ ...prev, user: prev.user ? { ...prev.user, fullName: e.target.value } : null }))}
                            className={inputCls}
                            required
                        />
                    </div>

                    <div>
                        <label className={labelCls}>Roles</label>
                        <RoleToggle
                            roles={editModal.user?.roles || []}
                            onToggle={(role) => {
                                if (!editModal.user) return;
                                setEditModal(prev => ({ ...prev, user: prev.user ? { ...prev.user, roles: toggleRole(prev.user.roles, role) } : null }));
                            }}
                        />
                        <p className="mt-1.5 text-[11.5px] text-faint">Click to toggle. At least one role must stay assigned.</p>
                    </div>
                </form>
            </Modal>

            {/* Create user modal */}
            <Modal
                isOpen={createModal.isOpen}
                onClose={() => setCreateModal({ isOpen: false, user: { email: '', fullName: '', roles: ['USER'], password: '' } })}
                title="Create user"
                footer={
                    <>
                        <button
                            onClick={() => setCreateModal({ isOpen: false, user: { email: '', fullName: '', roles: ['USER'], password: '' } })}
                            className="rounded-lg px-3.5 py-2 text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="create-user-form"
                            className="rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover"
                        >
                            Create account
                        </button>
                    </>
                }
            >
                <form id="create-user-form" onSubmit={handleCreateUser} className="space-y-4">
                    <div>
                        <label className={labelCls}>Full name</label>
                        <input
                            type="text"
                            placeholder="Enter full name"
                            value={createModal.user.fullName}
                            onChange={(e) => setCreateModal(prev => ({ ...prev, user: { ...prev.user, fullName: e.target.value } }))}
                            className={inputCls}
                            required
                        />
                    </div>

                    <div>
                        <label className={labelCls}>Email address</label>
                        <input
                            type="email"
                            placeholder="name@example.com"
                            value={createModal.user.email}
                            onChange={(e) => setCreateModal(prev => ({ ...prev, user: { ...prev.user, email: e.target.value } }))}
                            className={inputCls}
                            required
                        />
                    </div>

                    <div>
                        <label className={labelCls}>Password</label>
                        <div className="relative">
                            <input
                                type={showCreatePassword ? 'text' : 'password'}
                                placeholder="Minimum 6 characters"
                                value={createModal.user.password}
                                onChange={(e) => setCreateModal(prev => ({ ...prev, user: { ...prev.user, password: e.target.value } }))}
                                className={`${inputCls} pr-11`}
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowCreatePassword(prev => !prev)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-faint transition-colors hover:text-foreground"
                                tabIndex={-1}
                                aria-label={showCreatePassword ? 'Hide password' : 'Show password'}
                            >
                                {showCreatePassword ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className={labelCls}>Roles</label>
                        <RoleToggle
                            roles={createModal.user.roles}
                            onToggle={(role) => setCreateModal(prev => ({ ...prev, user: { ...prev.user, roles: toggleRole(prev.user.roles, role) } }))}
                        />
                    </div>
                </form>
            </Modal>
        </div>
    );
}
