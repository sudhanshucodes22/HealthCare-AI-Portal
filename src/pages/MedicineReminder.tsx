import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pill, Clock, Calendar, Trash2, CheckCircle, AlertCircle, Bell } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Medicine {
  id: number;
  name: string;
  dosage: string;
  time: string;
  frequency: string;
  active: boolean; // mapped from 'taken' in frontend terms, but 'active' in backend
  startDate: string;
  endDate?: string;
  notes?: string;
}

export default function MedicineReminder() {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    time: '',
    frequency: 'Once Daily',
    startDate: new Date().toISOString().split('T')[0],
  });

  const frequencies = ['Once Daily', 'Twice Daily', 'Three Times Daily', 'Weekly', 'As Needed'];

  useEffect(() => {
    if (user) {
      fetchMedicines();
    }
  }, [user]);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const response = await api.get('/medicine');
      setMedicines(response.data);
    } catch (err: any) {
      setError('Failed to load medications.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const response = await api.post('/medicine', formData);
      setMedicines([...medicines, response.data]);
      setFormData({
        name: '',
        dosage: '',
        time: '',
        frequency: 'Once Daily',
        startDate: new Date().toISOString().split('T')[0]
      });
      setShowForm(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add medication.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTaken = async (id: number, currentActive: boolean) => {
    try {
      const response = await api.put(`/medicine/${id}`, { active: !currentActive });
      setMedicines(
        medicines.map((med) => (med.id === id ? response.data : med))
      );
    } catch (err: any) {
      setError('Failed to update medication status.');
    }
  };

  const deleteMedicine = async (id: number) => {
    if (!confirm('Are you sure you want to delete this medication?')) return;
    try {
      await api.delete(`/medicine/${id}`);
      setMedicines(medicines.filter((med) => med.id !== id));
    } catch (err: any) {
      setError('Failed to delete medication.');
    }
  };

  const upcomingMeds = medicines.filter((med) => med.active);
  const takenMeds = medicines.filter((med) => !med.active);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden pt-20 pb-12 px-4">
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-blob"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>

      {/* Subtle Background Decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        <div className="absolute top-[24%] left-[5%] opacity-[0.14] text-blue-400">
          <Pill className="w-24 h-24 filter blur-[0.5px] rotate-45" />
        </div>
        <div className="absolute bottom-[22%] right-[5%] opacity-[0.15] text-cyan-400">
          <Clock className="w-32 h-32 filter blur-[0.5px]" />
        </div>
        <div className="absolute top-[56%] left-[7%] opacity-[0.12] text-blue-300">
          <Calendar className="w-20 h-20" />
        </div>
        <div className="absolute top-[18%] right-[10%] opacity-[0.13] text-cyan-300">
          <Bell className="w-24 h-24" />
        </div>
        <div className="absolute bottom-[40%] left-[3%] opacity-[0.11] text-blue-500">
          <Pill className="w-16 h-16 -rotate-12" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full mb-4 animate-float">
            <Pill className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-3">
            Medicine & Vaccination Reminder
          </h1>
          <p className="text-xl text-gray-600">Track your medications and never miss a dose</p>
        </div>

        {!user ? (
          <div className="glass-effect rounded-3xl shadow-2xl p-12 text-center animate-fade-in border border-blue-500/30">
            <Pill className="w-20 h-20 text-blue-400 mx-auto mb-6 animate-float" />
            <h2 className="text-3xl font-bold text-white mb-4">Medication Tracker</h2>
            <p className="text-xl text-gray-400 mb-8">Login to securely track your medications, dosages, and never miss a reminder.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/login" className="px-10 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-bold hover:shadow-xl transform hover:-translate-y-1 transition-all">
                Login Now
              </Link>
              <Link to="/register" className="px-10 py-4 border-2 border-blue-500 text-blue-400 rounded-xl font-bold hover:bg-blue-500/10 transition-all">
                Create Account
              </Link>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center space-x-2 glass-effect">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="glass-effect rounded-2xl p-6 border border-blue-500/20 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Total Medicines</p>
                    <p className="text-4xl font-black text-white mt-1">{medicines.length}</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center rotate-3 transform group-hover:rotate-6 transition-transform">
                    <Pill className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>

              <div className="glass-effect rounded-2xl p-6 border border-orange-500/20 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Active</p>
                    <p className="text-4xl font-black text-orange-400 mt-1">{upcomingMeds.length}</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center -rotate-3 transition-transform">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>

              <div className="glass-effect rounded-2xl p-6 border border-emerald-500/20 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Completed</p>
                    <p className="text-4xl font-black text-emerald-400 mt-1">{takenMeds.length}</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center rotate-12 transition-transform">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Your Medications</h2>
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add Medicine</span>
              </button>
            </div>
          </>
        )}

        {showForm && (
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-8 animate-slide-in">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Add New Medicine</h3>
            <form onSubmit={handleAddMedicine} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Medicine Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Aspirin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Dosage *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 1 tablet, 5ml"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Frequency *
                  </label>
                  <select
                    required
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {frequencies.map((freq) => (
                      <option key={freq} value={freq}>
                        {freq}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                >
                  Add Medicine
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {user && upcomingMeds.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Clock className="w-6 h-6 mr-2 text-orange-400" />
              Active Medications
            </h3>
            <div className="space-y-4">
              {upcomingMeds.map((medicine) => (
                <div
                  key={medicine.id}
                  className="glass-effect rounded-2xl p-6 border border-white/10 shadow-lg hover:border-blue-500/30 transition-all duration-300 animate-slide-in"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
                        <Pill className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-white">{medicine.name}</h4>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-400">
                          <span className="flex items-center">
                            <Pill className="w-4 h-4 mr-1 text-blue-400" />
                            {medicine.dosage}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1 text-blue-400" />
                            {medicine.time}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1 text-blue-400" />
                            {medicine.frequency}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleTaken(medicine.id, medicine.active)}
                        className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => deleteMedicine(medicine.id)}
                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-300"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {user && takenMeds.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <CheckCircle className="w-6 h-6 mr-2 text-emerald-400" />
              Completed History
            </h3>
            <div className="space-y-4">
              {takenMeds.map((medicine) => (
                <div
                  key={medicine.id}
                  className="glass-effect bg-emerald-500/5 rounded-2xl p-6 border border-emerald-500/20 shadow-lg animate-slide-in"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-300 line-through decoration-emerald-500/50">{medicine.name}</h4>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Pill className="w-4 h-4 mr-1" />
                            {medicine.dosage}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleTaken(medicine.id, medicine.active)}
                        className="px-6 py-2 bg-white/5 text-gray-400 rounded-lg font-semibold hover:bg-white/10 transition-all duration-300"
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => deleteMedicine(medicine.id)}
                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-300"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {user && medicines.length === 0 && !loading && (
          <div className="text-center py-20 glass-effect rounded-3xl border border-white/10">
            <Pill className="w-20 h-20 text-blue-500/30 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-3">No medications added yet</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">Start tracking your health journey by adding your first medicine or vaccination reminder.</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center space-x-3 px-10 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-bold hover:shadow-2xl shadow-blue-500/20 transform hover:-translate-y-1 transition-all duration-300"
            >
              <Plus className="w-6 h-6" />
              <span>Add Your First Entry</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
