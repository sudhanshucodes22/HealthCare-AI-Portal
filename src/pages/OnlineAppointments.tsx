import { useState, useEffect } from 'react';
import { Calendar, Clock, User, ChevronRight, CheckCircle2, XCircle, Printer, AlertTriangle, Loader2, Plus } from 'lucide-react';
import api from '../services/api';
import { Link } from 'react-router-dom';

interface Appointment {
    id: number;
    hospitalName: string;
    doctorName: string;
    specialty: string;
    appointmentDate: string;
    appointmentTime: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    tokenNumber: string;
    reason?: string;
    createdAt: string;
}

export default function OnlineAppointments() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const response = await api.get('/appointments');
            setAppointments(response.data);
        } catch (err: any) {
            setError('Failed to load appointments. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleCancel = async (id: number) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

        try {
            await api.put(`/appointments/${id}/cancel`);
            fetchAppointments();
            if (selectedAppointment?.id === id) {
                setSelectedAppointment(null);
            }
        } catch (err: any) {
            alert('Failed to cancel appointment. Please try again.');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-green-500/20 text-green-300 border-green-500/30';
            case 'pending': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
            case 'cancelled': return 'bg-red-500/20 text-red-300 border-red-500/30';
            case 'completed': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
            default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-24 pb-12 px-4 print:bg-white print:pt-0">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 print:hidden">
                    <div>
                        <h1 className="text-4xl font-black text-white mb-2">My Appointments</h1>
                        <p className="text-blue-300">Manage your medical bookings and skip the hospital queues.</p>
                    </div>
                    <Link
                        to="/emergency-locator"
                        className="mt-4 md:mt-0 flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all transform hover:-translate-y-1"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Book New Appointment</span>
                    </Link>
                </div>

                {error && (
                    <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Appointments List */}
                    <div className="lg:col-span-1 space-y-4 print:hidden">
                        {appointments.length === 0 ? (
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                                <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">No Appointments Yet</h3>
                                <p className="text-gray-400 mb-6">Start by finding a hospital near you.</p>
                                <Link to="/emergency-locator" className="text-blue-400 font-bold hover:underline">Find a Hospital</Link>
                            </div>
                        ) : (
                            appointments.map((apt) => (
                                <div
                                    key={apt.id}
                                    onClick={() => setSelectedAppointment(apt)}
                                    className={`group cursor-pointer p-5 rounded-2xl border transition-all duration-300 ${selectedAppointment?.id === apt.id
                                            ? 'bg-blue-600/20 border-blue-500 shadow-lg'
                                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${getStatusColor(apt.status)}`}>
                                            {apt.status}
                                        </div>
                                        <span className="text-[10px] text-gray-500 font-mono">#{apt.tokenNumber}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">{apt.hospitalName}</h3>
                                    <p className="text-gray-400 text-sm mb-3">{apt.doctorName} • {apt.specialty}</p>
                                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                                        <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {apt.appointmentDate}</span>
                                        <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {apt.appointmentTime}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Appointment Detail / Receipt */}
                    <div className="lg:col-span-2">
                        {selectedAppointment ? (
                            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl print:shadow-none">
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white print:from-white print:to-white print:text-black print:border-b print:p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center space-x-2 text-blue-200 mb-2 print:hidden">
                                                <CheckCircle2 className="w-5 h-5" />
                                                <span className="font-bold uppercase tracking-widest text-xs">Confirmed Booking</span>
                                            </div>
                                            <h2 className="text-3xl font-black mb-1">{selectedAppointment.hospitalName}</h2>
                                            <p className="text-blue-100 print:text-gray-600">Digital Queue Token: <span className="font-mono font-bold text-white bg-white/20 px-2 py-1 rounded print:text-black print:bg-gray-100">{selectedAppointment.tokenNumber}</span></p>
                                        </div>
                                        <div className="hidden md:block print:hidden">
                                            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20 text-center">
                                                <p className="text-[10px] uppercase font-bold text-blue-200 mb-1">Queue Ticket</p>
                                                <p className="text-2xl font-black">{selectedAppointment.tokenNumber}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 print:p-4">
                                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                                        <div className="space-y-6">
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center">
                                                    <User className="w-4 h-4 mr-2 text-blue-500" /> Specialist Doctor
                                                </p>
                                                <p className="text-xl font-bold text-gray-800">{selectedAppointment.doctorName}</p>
                                                <p className="text-blue-600 font-medium">{selectedAppointment.specialty}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center">
                                                    <Clock className="w-4 h-4 mr-2 text-blue-500" /> Appointment Slot
                                                </p>
                                                <p className="text-xl font-bold text-gray-800">{selectedAppointment.appointmentDate}</p>
                                                <p className="text-gray-600">{selectedAppointment.appointmentTime}</p>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 print:bg-white print:border">
                                            <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                                                <Printer className="w-5 h-5 mr-2 text-blue-500" /> Instructions
                                            </h4>
                                            <ul className="space-y-3 text-sm text-gray-600">
                                                <li className="flex items-start">
                                                    <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                                    <span>Present this token at the **Priority Queue** desk.</span>
                                                </li>
                                                <li className="flex items-start">
                                                    <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                                    <span>Arrive at least 15 minutes before your slot.</span>
                                                </li>
                                                <li className="flex items-start">
                                                    <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                                    <span>Keep your ID proof and digital receipt ready.</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-4 pt-8 border-t print:hidden">
                                        <button
                                            onClick={handlePrint}
                                            className="bg-slate-800 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-700 transition-all flex items-center justify-center space-x-2"
                                        >
                                            <Printer className="w-5 h-5" />
                                            <span>Print Receipt</span>
                                        </button>
                                        {selectedAppointment.status !== 'cancelled' && (
                                            <button
                                                onClick={() => handleCancel(selectedAppointment.id)}
                                                className="bg-white text-red-600 border-2 border-red-100 px-8 py-3 rounded-xl font-bold hover:bg-red-50 transition-all flex items-center justify-center space-x-2"
                                            >
                                                <XCircle className="w-5 h-5" />
                                                <span>Cancel Appointment</span>
                                            </button>
                                        )}
                                    </div>

                                    <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start space-x-3 print:hidden">
                                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-xs text-amber-800 leading-relaxed">
                                            This is an automated appointment confirmation. Please contact the hospital directly if you have clinical questions. Online appointments help reduce wait times but are subject to hospital emergency priorities.
                                        </p>
                                    </div>
                                </div>

                                <div className="hidden print:block fixed bottom-0 left-0 right-0 p-8 text-center text-gray-400 text-[10px]">
                                    Generated by Healthcare AI Smart Platform • Valid for {selectedAppointment.appointmentDate} only.
                                </div>
                            </div>
                        ) : (
                            <div className="h-full min-h-[400px] border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-center p-8 print:hidden">
                                <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                                    <Calendar className="w-10 h-10 text-blue-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Select an Appointment</h3>
                                <p className="text-gray-400 max-w-sm">Choose an appointment from the list to view the full details and queue token.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
