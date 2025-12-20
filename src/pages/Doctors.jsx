import React, { useEffect, useState } from 'react';
import { Search, MapPin, Star, Phone, Mail, Clock, X } from 'lucide-react';
import api from '../services/api';

const Doctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                setError(null);
                const response = await api.get('/doctors');
                setDoctors(response.data.data.doctors || []);
            } catch (error) {
                console.error('Error fetching doctors:', error);
                setError('Failed to load doctors. Please check your connection.');
            } finally {
                setLoading(false);
            }
        };

        fetchDoctors();
    }, []);

    const filteredDoctors = doctors.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const [selectedDoctor, setSelectedDoctor] = useState(null);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Doctors</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage and view all registered doctors</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search doctors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-64 transition-colors"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">Loading doctors...</div>
            ) : error ? (
                <div className="text-center py-12 text-red-500 dark:text-red-400">{error}</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDoctors.map((doctor) => (
                        <div key={doctor.doctorId} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-all">
                            <div className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-2xl font-bold text-slate-400 dark:text-slate-500">
                                            {doctor.profileImageUrl ? (
                                                <img src={doctor.profileImageUrl} alt={doctor.name} className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                doctor.name.charAt(0)
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{doctor.name}</h3>
                                            <p className="text-primary-600 dark:text-primary-400 text-sm font-medium">{doctor.specialization}</p>
                                        </div>
                                    </div>
                                    {doctor.rating > 0 && (
                                        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded text-amber-600 dark:text-amber-400 text-sm font-medium">
                                            <Star size={14} fill="currentColor" />
                                            {doctor.rating}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 space-y-3">
                                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
                                        <Mail size={16} />
                                        {doctor.email}
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
                                        <Phone size={16} />
                                        {doctor.phone || 'No phone provided'}
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
                                        <Clock size={16} />
                                        {doctor.yearsOfExperience} years exp.
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                                    <button
                                        onClick={() => setSelectedDoctor(doctor)}
                                        className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        View Profile
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Doctor Profile Modal */}
            {selectedDoctor && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Doctor Profile</h2>
                            <button
                                onClick={() => setSelectedDoctor(null)}
                                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-8">
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-4xl font-bold text-slate-400 dark:text-slate-500">
                                    {selectedDoctor.profileImageUrl ? (
                                        <img src={selectedDoctor.profileImageUrl} alt={selectedDoctor.name} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        selectedDoctor.name.charAt(0)
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedDoctor.name}</h3>
                                    <p className="text-primary-600 dark:text-primary-400 font-medium text-lg">{selectedDoctor.specialization}</p>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                                        <span>{selectedDoctor.yearsOfExperience} years experience</span>
                                        <span>•</span>
                                        <div className="flex items-center gap-1 text-amber-500">
                                            <Star size={14} fill="currentColor" />
                                            {selectedDoctor.rating || 'New'} ({selectedDoctor.reviewCount || 0} reviews)
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-slate-900 dark:text-white">Contact Information</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                            <Mail size={18} />
                                            {selectedDoctor.email}
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                            <Phone size={18} />
                                            {selectedDoctor.phone || 'Not provided'}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-semibold text-slate-900 dark:text-white">About</h4>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                        {selectedDoctor.bio || 'No biography available.'}
                                    </p>
                                </div>
                            </div>

                            {selectedDoctor.availability && (
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-slate-900 dark:text-white">Availability</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                        {Object.entries(selectedDoctor.availability).map(([day, schedule]) => (
                                            <div key={day} className={`p-3 rounded-lg border ${schedule.available ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900' : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700'}`}>
                                                <p className="capitalize font-medium text-sm mb-1 text-slate-900 dark:text-white">{day}</p>
                                                {schedule.available ? (
                                                    <p className="text-xs text-green-700 dark:text-green-400">{schedule.start} - {schedule.end}</p>
                                                ) : (
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Unavailable</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Doctors;
