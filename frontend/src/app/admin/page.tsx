'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle, XCircle } from 'lucide-react';

export default function AdminDashboard() {
    const { user } = useAuth();
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Hardcoded for demonstration. In real app, fetch from /api/v1/statuses.
    const STATUS = {
        PENDING: 1,
        APPROVED: 2,
        REJECTED: 3,
        ACTIVE: 4
    }

    const [statusId, setStatusId] = useState(STATUS.PENDING);

    useEffect(() => {
        if (user?.roles?.some(r => r.name === 'ADMIN')) {
            fetchProfiles();
        }
    }, [user, statusId]);

    const fetchProfiles = async () => {
        setLoading(true);
        try {
            // Add default pagination args
            const { data } = await api.get(`/admin/profiles?statusId=${statusId}&page=0&size=50`);
            setProfiles(data.data.content);
        } catch (err) {
            console.error("Failed to load profiles", err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (profileId: number, newStatusId: number) => {
        try {
            await api.put(`/admin/profiles/${profileId}/status/${newStatusId}`);
            fetchProfiles(); // Refresh list
        } catch (err) {
            alert("Failed to update status");
        }
    };

    if (loading) return <div className="p-8 text-gray-900 dark:text-gray-100">Loading admin panel...</div>;

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Management</h1>

                <select
                    value={statusId}
                    onChange={e => setStatusId(Number(e.target.value))}
                    className="border border-gray-300 dark:border-slate-700 rounded-lg px-4 py-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 shadow-sm"
                >
                    <option value={STATUS.PENDING}>Pending</option>
                    <option value={STATUS.APPROVED}>Approved</option>
                    <option value={STATUS.REJECTED}>Rejected</option>
                    <option value={STATUS.ACTIVE}>Payment Verified (Active)</option>
                </select>
            </div>

            <div className="bg-white dark:bg-slate-900 shadow-sm border border-gray-100 dark:border-slate-800 rounded-2xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
                    <thead className="bg-gray-50 dark:bg-slate-800/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Gotra</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-800">
                        {profiles.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">#{p.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{p.fullName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{p.gotra}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                    <div className="flex justify-center gap-3">
                                        <button
                                            onClick={() => updateStatus(p.id, STATUS.APPROVED)}
                                            className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 border border-green-200 dark:border-green-900/50 hover:bg-green-50 dark:hover:bg-green-900/20 px-3 py-1 rounded-md flex items-center gap-1 transition-colors"
                                        >
                                            <CheckCircle className="w-4 h-4" /> Approve
                                        </button>
                                        <button
                                            onClick={() => updateStatus(p.id, STATUS.REJECTED)}
                                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1 rounded-md flex items-center gap-1 transition-colors"
                                        >
                                            <XCircle className="w-4 h-4" /> Reject
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {profiles.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                    No profiles found for this status.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
