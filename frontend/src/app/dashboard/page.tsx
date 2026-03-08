'use client';

import { useAuth } from '@/context/AuthContext';

export default function Dashboard() {
    const { user } = useAuth();

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">Welcome back!</h1>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-8">
                <h2 className="text-xl font-semibold mb-4 text-indigo-700 dark:text-indigo-400">Quick Start Guide</h2>
                <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-300">
                        Hello <span className="font-semibold text-gray-900 dark:text-gray-100">{user?.email || 'User'}</span>, welcome to your custom dashboard. You can navigate through the platform using the menu on the left.
                    </p>
                    <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-2">
                        <li>Go to <strong className="text-gray-800 dark:text-gray-200">Profile Management &gt; My Bio-Data</strong> to complete your profile.</li>
                        <li>Check your match preferences and settings in their respective menus.</li>
                        <li>Update your bio-data to make your platform experience more personalized.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
