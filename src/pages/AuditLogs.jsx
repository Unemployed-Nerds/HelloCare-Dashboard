import React, { useState, useEffect } from 'react';
import { Search, FileText, User, UserCog, Shield, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

const AuditLogs = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('patient');
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        fetchLogs();
    }, [activeTab]);

    const fetchLogs = async () => {
        setLoading(true);
        setError(null);
        try {
            // Using unified endpoint with role filtering
            const params = { limit: 50 };

            // Map activeTab to role filter, but 'admin' tab stays 'admin' role
            if (activeTab) {
                params.role = activeTab;
            }

            if (filter) {
                // Ideally backend would support search, but for now we rely on simple role filtering
                // We could implement client-side filtering if needed, but backend search is better
            }

            const response = await api.get('/admin/logs', { params });
            setLogs(response.data.data.logs);
        } catch (err) {
            console.error("Error fetching logs:", err);
            setError('Failed to fetch logs. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Debounce search/filter
    useEffect(() => {
        const timer = setTimeout(() => {
            if (filter) fetchLogs();
        }, 500);
        return () => clearTimeout(timer);
    }, [filter]);

    const tabs = [
        { id: 'patient', label: 'Patient Logs', icon: User },
        { id: 'doctor', label: 'Doctor Logs', icon: UserCog },
        { id: 'admin', label: 'Admin Logs', icon: Shield },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Audit Logs</h1>
                    <p className="text-slate-500 dark:text-slate-400">View and track system activities by role</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setFilter(''); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                            ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                            }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder={`Search logs...`}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading logs...</div>
                ) : error ? (
                    <div className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-900/10 flex flex-col items-center gap-2">
                        <AlertCircle size={24} />
                        {error}
                    </div>
                ) : logs.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center gap-2">
                        <FileText size={32} className="opacity-20" />
                        No logs found for this section.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                                    <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Timestamp</th>
                                    <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">User</th>
                                    <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Action</th>
                                    <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Details</th>
                                    <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">IP</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {logs.map((log, index) => (
                                    <tr key={log.id || index} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </td>
                                        <td className="p-4 text-sm font-medium text-slate-900 dark:text-white">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${activeTab === 'patient' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' :
                                                        activeTab === 'doctor' ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400' :
                                                            'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400'
                                                    }`}>
                                                    <User size={14} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span>{log.userName || log.adminName || 'Unknown'}</span>
                                                    <span className="text-xs text-slate-500 font-normal">{log.role || activeTab}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400 max-w-sm">
                                            <div className="truncate" title={JSON.stringify(log.details, null, 2)}>
                                                {/* Try to format common details nicely */}
                                                {log.details ? (
                                                    Object.entries(log.details).map(([key, value]) => (
                                                        <span key={key} className="mr-2 inline-block">
                                                            <span className="font-semibold text-slate-500">{key}:</span> {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                        </span>
                                                    ))
                                                ) : '-'}
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-500 font-mono">
                                            {log.ip || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditLogs;
