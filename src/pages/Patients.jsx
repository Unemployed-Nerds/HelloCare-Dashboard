import React, { useEffect, useState } from 'react';
import { Search, User, Calendar, Clock } from 'lucide-react';
import api from '../services/api';

const Patients = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch both patients and appointments
                const [patientsRes, appointmentsRes] = await Promise.all([
                    api.get('/admin/patients'),
                    api.get('/admin/appointments')
                ]);

                const patientsData = patientsRes.data.data.patients || [];
                const appointmentsData = appointmentsRes.data.data.appointments || [];

                // Calculate stats for each patient
                const formattedPatients = patientsData.map(p => {
                    const patientAppointments = appointmentsData.filter(app => app.patientId === (p.userId || p.id));

                    // Sort appointments by date descending to get the last one
                    const sortedAppointments = patientAppointments.sort((a, b) => new Date(b.date) - new Date(a.date));
                    const lastApp = sortedAppointments.length > 0 ? sortedAppointments[0] : null;

                    return {
                        id: p.userId || p.id,
                        name: p.name || 'Unknown',
                        email: p.email || 'N/A',
                        phone: p.phoneNumber || p.phone || 'N/A',
                        totalAppointments: patientAppointments.length,
                        lastAppointment: lastApp
                    };
                });

                console.log('Fetched patients with stats:', formattedPatients);
                setPatients(formattedPatients);
            } catch (error) {
                console.error('Error fetching data:', error);
                const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to load data.';
                setError(`${errorMessage} (Status: ${error.response?.status})`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Patients</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage and view all registered patients</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search patients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-64 transition-colors"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">Loading patients...</div>
            ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg text-center">
                    <p className="font-medium">Error loading patients</p>
                    <p className="text-sm mt-1">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-3 text-sm underline hover:text-red-700 dark:hover:text-red-300"
                    >
                        Retry
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPatients.map((patient) => (
                        <div key={patient.id} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-md transition-all">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-xl">
                                    {patient.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{patient.name}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">ID: {patient.id.slice(0, 8)}...</p>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">Email</span>
                                    <span className="font-medium text-slate-900 dark:text-white truncate max-w-[150px]" title={patient.email}>{patient.email}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">Phone</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{patient.phone}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">Total Visits</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{patient.totalAppointments}</span>
                                </div>
                                {patient.lastAppointment && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500 dark:text-slate-400">Last Visit</span>
                                        <span className="font-medium text-slate-900 dark:text-white">
                                            {new Date(patient.lastAppointment.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {filteredPatients.length === 0 && (
                        <div className="col-span-full text-center py-12 text-slate-500 dark:text-slate-400">
                            <div className="max-w-md mx-auto">
                                <User size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Patients Found</h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-4">
                                    This list displays patients who have booked appointments with you.
                                    Once you have your first appointment, the patient will appear here.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Patients;
