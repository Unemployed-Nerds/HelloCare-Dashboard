import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, DollarSign, Activity, TrendingUp } from 'lucide-react';
import api from '../services/api';

const StatCard = ({ icon: Icon, label, value, trend, color }) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
                <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-500 font-medium">{trend}</span>
            <span className="text-slate-400 ml-1">vs last month</span>
        </div>
    </div>
);

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        doctors: 0,
        patients: 0,
        appointments: 0,
        revenue: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setError(null);

                // Fetch stats
                try {
                    const statsRes = await api.get('/admin/stats');
                    const statsData = statsRes.data.data.stats;
                    setStats(prev => ({
                        ...prev,
                        doctors: statsData.doctors,
                        patients: statsData.patients,
                        appointments: statsData.appointments,
                        revenue: statsData.revenue
                    }));
                } catch (statsError) {
                    console.error('Error fetching stats:', statsError);
                }

                // Fetch recent appointments
                try {
                    const appointmentsRes = await api.get('/admin/appointments?limit=5');
                    const appointments = appointmentsRes.data.data.appointments || [];
                    setRecentActivity(appointments.slice(0, 3));
                } catch (appointmentsError) {
                    console.error('Error fetching appointments:', appointmentsError);
                }

            } catch (error) {
                console.error('Error loading dashboard:', error);
                setError('Failed to load some dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading dashboard...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500 dark:text-red-400">{error}</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
                <p className="text-slate-500 dark:text-slate-400">Welcome back, here's what's happening today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div onClick={() => navigate('/doctors')} className="cursor-pointer">
                    <StatCard
                        icon={Users}
                        label="Total Doctors"
                        value={stats.doctors}
                        trend="+0%"
                        color="bg-blue-500"
                    />
                </div>
                <div onClick={() => navigate('/patients')} className="cursor-pointer">
                    <StatCard
                        icon={Activity}
                        label="Total Patients"
                        value={stats.patients}
                        trend="+0%"
                        color="bg-emerald-500"
                    />
                </div>
                <div onClick={() => navigate('/appointments')} className="cursor-pointer">
                    <StatCard
                        icon={Calendar}
                        label="Total Appointments"
                        value={stats.appointments}
                        trend="+0%"
                        color="bg-violet-500"
                    />
                </div>
                <div onClick={() => navigate('/revenue')} className="cursor-pointer">
                    <StatCard
                        icon={DollarSign}
                        label="Total Revenue"
                        value={`$${stats.revenue.toLocaleString()}`}
                        trend="+0%"
                        color="bg-amber-500"
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 transition-colors">
                <h2 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Recent Activity</h2>
                <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-full">
                                <Calendar className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                    Appointment with {activity.patientName}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {new Date(activity.date).toLocaleDateString()} at {activity.time}
                                </p>
                            </div>
                        </div>
                    ))}
                    {recentActivity.length === 0 && (
                        <p className="text-sm text-slate-500 dark:text-slate-400">No recent activity found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
