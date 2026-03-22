'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { 
    Users, 
    Shield, 
    Mail, 
    Calendar,
    Search,
    ChevronLeft,
    ChevronRight,
    UserPlus,
    X,
    Pencil,
    Trash2,
    CheckCircle,
    Slash
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
    const [editModal, setEditModal] = useState<{isOpen: boolean, user: User | null}>({isOpen: false, user: null});
    const [createModal, setCreateModal] = useState({isOpen: false, user: {email: '', fullName: '', roles: ['USER'], password: ''}});
    const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, title: string, message: string, action: () => void}>({
        isOpen: false, title: '', message: '', action: () => {}
    });

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
            title: currentEnabled ? 'Inactivate User' : 'Activate User',
            message: `Are you sure you want to ${currentEnabled ? 'inactivate' : 'activate'} this user account?`,
            action: async () => {
                try {
                    const res = await api.put(`/admin/users/${userId}/status/${!currentEnabled}`);
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
            title: 'Permanent Delete',
            message: 'Are you sure you want to PERMANENTLY delete this user? This action cannot be undone.',
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
                setCreateModal({isOpen: false, user: {email: '', fullName: '', roles: ['USER'], password: ''}});
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
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage system users, roles and access status</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setCreateModal(prev => ({...prev, isOpen: true}))}
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:scale-105 transition-all"
                    >
                        <UserPlus className="w-5 h-5" />
                        Create User
                    </button>

                    <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                        <button 
                            onClick={() => { setActiveTab('active'); setPage(0); }}
                            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'active' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                        >
                            Active
                        </button>
                        <button 
                            onClick={() => { setActiveTab('inactive'); setPage(0); }}
                            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'inactive' ? 'bg-rose-600 text-white shadow-lg shadow-rose-200 dark:shadow-none' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                        >
                            Inactive
                        </button>
                    </div>
                </div>
            </header>

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search by name or email..." 
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-slate-800/30">
                                <th className="px-8 py-5 text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">User</th>
                                <th className="px-8 py-5 text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Email</th>
                                <th className="px-8 py-5 text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Roles</th>
                                <th className="px-8 py-5 text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800/50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-8 py-6"><div className="h-4 w-48 bg-gray-200 dark:bg-slate-800 rounded"></div></td>
                                        <td className="px-8 py-6"><div className="h-4 w-60 bg-gray-200 dark:bg-slate-800 rounded"></div></td>
                                        <td className="px-8 py-6"><div className="h-6 w-32 bg-gray-200 dark:bg-slate-800 rounded-full"></div></td>
                                        <td className="px-8 py-6"><div className="h-8 w-24 bg-gray-200 dark:bg-slate-800 rounded ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <Users className="w-16 h-16 text-gray-200 dark:text-slate-800 mb-4" />
                                            <p className="text-gray-500 dark:text-gray-400 font-medium">No {activeTab} users found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                users.map((userItem) => (
                                    <tr key={userItem.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                {userItem.fullName}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 font-medium text-gray-600 dark:text-gray-300">
                                            {userItem.email}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-wrap gap-1.5">
                                                {userItem.roles.map((role) => (
                                                    <span 
                                                        key={role} 
                                                        className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-current ${role === 'ADMIN' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}
                                                    >
                                                        {role}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">


                                                <button 
                                                    onClick={() => setEditModal({isOpen: true, user: userItem})}
                                                    className="p-2 transition-all rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-indigo-600"
                                                    title="Edit User"
                                                >
                                                    <Pencil className="w-5 h-5" />
                                                </button>
                                                
                                                <button 
                                                    onClick={() => handleToggleStatus(userItem.id, userItem.enabled)}
                                                    className={`p-2 transition-all rounded-lg ${userItem.enabled ? 'hover:bg-amber-50 text-amber-600' : 'hover:bg-emerald-50 text-emerald-600'}`}
                                                    title={userItem.enabled ? 'Inactivate' : 'Activate'}
                                                >
                                                    {userItem.enabled ? <Slash className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                                                </button>

                                                {activeTab === 'inactive' && (
                                                    <button 
                                                        onClick={() => handleDelete(userItem.id)}
                                                        className="p-2 transition-all rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-600"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
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

                <div className="p-8 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        Showing <span className="text-gray-900 dark:text-white">{users.length}</span> users this page
                    </p>
                    <div className="flex items-center gap-2">
                        <button 
                            disabled={page === 0}
                            onClick={() => setPage(page - 1)}
                            className="p-2 rounded-xl border border-gray-100 dark:border-slate-800 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all font-bold"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button 
                            disabled={page >= totalPages - 1 || totalPages === 0}
                            onClick={() => setPage(page + 1)}
                            className="p-2 rounded-xl border border-gray-100 dark:border-slate-800 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all font-bold"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            <Modal 
                isOpen={confirmModal.isOpen} 
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                title={confirmModal.title}
                footer={
                    <>
                        <button 
                            onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                            className="px-6 py-2.5 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={() => confirmModal.action()}
                            className={`px-6 py-2.5 rounded-2xl text-sm font-bold text-white transition-all ${confirmModal.title.includes('Delete') ? 'bg-rose-600 shadow-lg shadow-rose-200' : 'bg-indigo-600 shadow-lg shadow-indigo-200'}`}
                        >
                            Confirm
                        </button>
                    </>
                }
            >
                <div className="flex items-start gap-4 text-gray-600 dark:text-gray-300">
                    <div className={`p-3 rounded-2xl ${confirmModal.title.includes('Delete') ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                        {confirmModal.title.includes('Delete') ? <Trash2 className="w-6 h-6" /> : <Slash className="w-6 h-6" />}
                    </div>
                    <div>
                        <p>{confirmModal.message}</p>
                    </div>
                </div>
            </Modal>

            {/* Edit User Modal */}
            <Modal
                isOpen={editModal.isOpen}
                onClose={() => setEditModal({isOpen: false, user: null})}
                title="Edit User Access"
                footer={
                    <>
                        <button 
                            onClick={() => setEditModal({isOpen: false, user: null})}
                            className="px-6 py-2.5 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            form="edit-user-form"
                            className="px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-200 transition-all hover:scale-105"
                        >
                            Save Changes
                        </button>
                    </>
                }
            >
                <form id="edit-user-form" onSubmit={handleUpdateUser} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                type="email"
                                value={editModal.user?.email || ''}
                                onChange={(e) => setEditModal(prev => ({...prev, user: prev.user ? {...prev.user, email: e.target.value} : null}))}
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Name</label>
                        <div className="relative">
                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                type="text"
                                value={editModal.user?.fullName || ''}
                                onChange={(e) => setEditModal(prev => ({...prev, user: prev.user ? {...prev.user, fullName: e.target.value} : null}))}
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Assigned Roles</label>
                        <div className="flex flex-wrap gap-2">
                            {['ADMIN', 'USER'].map(role => (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => {
                                        if (!editModal.user) return;
                                        const roles = [...editModal.user.roles];
                                        const idx = roles.indexOf(role);
                                        if (idx > -1) {
                                            if (roles.length > 1) roles.splice(idx, 1);
                                        } else {
                                            roles.push(role);
                                        }
                                        setEditModal(prev => ({...prev, user: prev.user ? {...prev.user, roles} : null}));
                                    }}
                                    className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                                        editModal.user?.roles.includes(role)
                                        ? 'bg-indigo-600 border-indigo-600 text-white'
                                        : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 text-gray-500'
                                    }`}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-gray-400 italic font-medium px-1">Tip: Click to toggle roles. At least one role must be assigned.</p>
                    </div>
                </form>
            </Modal>

            {/* Create User Modal */}
            <Modal
                isOpen={createModal.isOpen}
                onClose={() => setCreateModal({isOpen: false, user: {email: '', fullName: '', roles: ['USER'], password: ''}})}
                title="Create New User"
                footer={
                    <>
                        <button 
                            onClick={() => setCreateModal({isOpen: false, user: {email: '', fullName: '', roles: ['USER'], password: ''}})}
                            className="px-6 py-2.5 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            form="create-user-form"
                            className="px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-200 transition-all hover:scale-105"
                        >
                            Create Account
                        </button>
                    </>
                }
            >
                <form id="create-user-form" onSubmit={handleCreateUser} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Full Name</label>
                        <div className="relative">
                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                type="text"
                                placeholder="Enter full name"
                                value={createModal.user.fullName}
                                onChange={(e) => setCreateModal(prev => ({...prev, user: {...prev.user, fullName: e.target.value}}))}
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                type="email"
                                placeholder="name@example.com"
                                value={createModal.user.email}
                                onChange={(e) => setCreateModal(prev => ({...prev, user: {...prev.user, email: e.target.value}}))}
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Password</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                type="password"
                                placeholder="Minimum 6 characters"
                                value={createModal.user.password}
                                onChange={(e) => setCreateModal(prev => ({...prev, user: {...prev.user, password: e.target.value}}))}
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Assigned Roles</label>
                        <div className="flex flex-wrap gap-2">
                            {['ADMIN', 'USER'].map(role => (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => {
                                        const roles = [...createModal.user.roles];
                                        const idx = roles.indexOf(role);
                                        if (idx > -1) {
                                            if (roles.length > 1) roles.splice(idx, 1);
                                        } else {
                                            roles.push(role);
                                        }
                                        setCreateModal(prev => ({...prev, user: {...prev.user, roles}}));
                                    }}
                                    className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                                        createModal.user.roles.includes(role)
                                        ? 'bg-indigo-600 border-indigo-600 text-white'
                                        : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 text-gray-500'
                                    }`}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
