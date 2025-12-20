import React, { useEffect, useState } from 'react';
import { Search, Calendar, Clock, User, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';
import clsx from 'clsx';

const Appointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await api.get('/admin/appointments');
                setAppointments(response.data.data.appointments || []);
            } catch (error) {
                console.error('Error fetching appointments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'completed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
        }
    };

    const filteredAppointments = appointments.filter(app =>
        app.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showNotesModal, setShowNotesModal] = useState(false);

    const handleStatusUpdate = async (appointmentId, newStatus) => {
        try {
            await api.put(`/admin/appointments/${appointmentId}/status`, { status: newStatus });
            // Update local state
            setAppointments(prev => prev.map(app =>
                app.appointmentId === appointmentId ? { ...app, status: newStatus } : app
            ));
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const handleViewNotes = (appointment) => {
        setSelectedAppointment(appointment);
        setShowNotesModal(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Appointments</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage your schedule and patient visits</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search appointments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-64 transition-colors"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">Loading appointments...</div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Patient</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Date & Time</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Notes</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {filteredAppointments.map((appointment) => (
                                    <tr key={appointment.appointmentId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold">
                                                    {appointment.patientName.charAt(0)}
                                                </div>
                                                <span className="font-medium text-slate-900 dark:text-white">{appointment.patientName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                                                    <Calendar size={16} className="text-slate-400" />
                                                    <span>{new Date(appointment.date).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                                    <Clock size={16} />
                                                    <span>{appointment.time}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={clsx('px-3 py-1 rounded-full text-xs font-medium capitalize', getStatusColor(appointment.status))}>
                                                {appointment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-xs">
                                                {appointment.notes || 'No notes'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleViewNotes(appointment)}
                                                    className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <FileText size={18} />
                                                </button>
                                                {appointment.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusUpdate(appointment.appointmentId, 'confirmed')}
                                                            className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(appointment.appointmentId, 'cancelled')}
                                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                            title="Cancel"
                                                        >
                                                            <XCircle size={18} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredAppointments.length === 0 && (
                        <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                            No appointments found matching your search.
                        </div>
                    )}
                </div>
            )}

            {/* Notes Modal */}
            {showNotesModal && selectedAppointment && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Appointment Details</h3>
                            <button
                                onClick={() => setShowNotesModal(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-medium text-slate-500 uppercase">Patient</label>
                                <p className="text-slate-900 dark:text-white font-medium">{selectedAppointment.patientName}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 uppercase">Date & Time</label>
                                <p className="text-slate-900 dark:text-white">
                                    {new Date(selectedAppointment.date).toLocaleDateString()} at {selectedAppointment.time}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 uppercase">Patient Notes</label>
                                <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg mt-1">
                                    {selectedAppointment.notes || 'No notes provided.'}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 uppercase">Doctor Notes</label>
                                <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg mt-1">
                                    {selectedAppointment.doctorNotes || 'No doctor notes yet.'}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                onClick={() => setShowNotesModal(false)}
                                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Appointments;
