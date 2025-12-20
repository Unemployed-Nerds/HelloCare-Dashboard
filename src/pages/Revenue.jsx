import React, { useEffect, useState } from 'react';
import { Search, DollarSign, Calendar, TrendingUp, Download } from 'lucide-react';
import api from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';

const Revenue = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [totalRevenue, setTotalRevenue] = useState(0);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Standard consultation fee assumption since backend doesn't provide it yet
    const CONSULTATION_FEE = 50;

    useEffect(() => {
        const fetchRevenueData = async () => {
            try {
                setError(null);
                const response = await api.get('/admin/appointments');
                const appointments = response.data.data.appointments || [];

                const revenueItems = appointments
                    .filter(app => app.status === 'completed' || app.status === 'confirmed')
                    .map(app => ({
                        id: app.appointmentId,
                        patientName: app.patientName,
                        date: app.date,
                        time: app.time,
                        amount: CONSULTATION_FEE,
                        status: (app.paymentStatus === 'paid' || app.status === 'completed') ? 'Paid' : 'Pending',
                        paymentMethod: app.paymentMethod || 'Cash'
                    }));

                setTransactions(revenueItems);
                setTotalRevenue(revenueItems.reduce((acc, curr) => acc + curr.amount, 0));

                // Set default date range (centered on latest payment)
                if (revenueItems.length > 0) {
                    // Find latest payment date
                    const dates = revenueItems.map(item => new Date(item.date).getTime());
                    const latestDateMs = Math.max(...dates);
                    const latestDate = new Date(latestDateMs);

                    // Center view: 3 days before and 3 days after latest date
                    const start = new Date(latestDate);
                    start.setDate(start.getDate() - 3);

                    const end = new Date(latestDate);
                    end.setDate(end.getDate() + 3);

                    setStartDate(start.toISOString().split('T')[0]);
                    setEndDate(end.toISOString().split('T')[0]);
                } else {
                    // Default to current week if no data
                    const end = new Date();
                    const start = new Date();
                    start.setDate(start.getDate() - 6);
                    setStartDate(start.toISOString().split('T')[0]);
                    setEndDate(end.toISOString().split('T')[0]);
                }

            } catch (error) {
                console.error('Error fetching revenue data:', error);
                setError('Failed to load revenue data. Please check your connection.');
            } finally {
                setLoading(false);
            }
        };

        fetchRevenueData();
    }, []);

    const filteredTransactions = transactions.filter(t =>
        t.patientName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleExport = () => {
        try {
            const dataToExport = transactions.map(t => ({
                'Transaction ID': t.id,
                'Patient Name': t.patientName,
                'Date': new Date(t.date).toLocaleDateString(),
                'Amount': t.amount,
                'Status': t.status
            }));

            const ws = XLSX.utils.json_to_sheet(dataToExport);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Revenue");
            XLSX.writeFile(wb, "revenue_report.xlsx");
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export data');
        }
    };

    // Prepare data for chart (group by date and fill gaps)
    const processChartData = () => {
        if (!startDate || !endDate) return [];

        const start = new Date(startDate);
        const end = new Date(endDate);

        // 1. Group by date
        const grouped = transactions.reduce((acc, curr) => {
            const date = new Date(curr.date).toLocaleDateString();
            acc[date] = (acc[date] || 0) + curr.amount;
            return acc;
        }, {});

        // 2. Fill gaps in range
        const filledData = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toLocaleDateString();
            filledData.push({
                date: dateStr,
                amount: grouped[dateStr] || 0
            });
        }

        return filledData;
    };

    const chartData = processChartData();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Revenue</h1>
                    <p className="text-slate-500 dark:text-slate-400">Financial overview and transactions</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-transparent border-none text-sm text-slate-600 dark:text-slate-400 focus:ring-0"
                        />
                        <span className="text-slate-400">-</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-transparent border-none text-sm text-slate-600 dark:text-slate-400 focus:ring-0"
                        />
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg border border-green-100 dark:border-green-900/30 flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full text-green-600 dark:text-green-400">
                            <DollarSign size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-green-600 dark:text-green-400 font-medium">Total Revenue</p>
                            <p className="text-lg font-bold text-green-700 dark:text-green-300">${totalRevenue.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart Section */}
            {!loading && !error && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                    <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Revenue Trend</h3>
                    <div className="w-full" style={{ height: 400 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => [`$${value}`, 'Revenue']}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#10B981" fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                    />
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                    <Download size={18} />
                    <span>Export</span>
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">Loading revenue data...</div>
            ) : error ? (
                <div className="text-center py-12 text-red-500 dark:text-red-400">{error}</div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Transaction ID</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Patient</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Date</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Amount</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {filteredTransactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-sm text-slate-500 dark:text-slate-400">
                                            #{t.id.slice(0, 8)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-slate-900 dark:text-white">{t.patientName}</span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                            {new Date(t.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                            ${t.amount}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${t.status === 'Paid'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                }`}>
                                                {t.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredTransactions.length === 0 && (
                        <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                            No transactions found.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Revenue;
