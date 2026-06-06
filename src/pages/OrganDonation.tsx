import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, Search, UserPlus, Phone, MapPin, Activity, AlertCircle, Loader2, Network, Share2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface OrganDonor {
    id: number;
    organType: string;
    location: string;
    city: string;
    User: {
        name: string;
        phone: string;
        email: string;
    };
    pledgeDate: string;
}

export default function OrganDonation() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'find' | 'donate'>('find');
    const [searchOrganType, setSearchOrganType] = useState('');
    const [searchCity, setSearchCity] = useState('');
    const [searchResults, setSearchResults] = useState<OrganDonor[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        organType: '',
        location: '',
        city: '',
        state: '',
    });
    const [submitted, setSubmitted] = useState(false);

    const organTypes = ['Kidney', 'Liver', 'Heart', 'Lungs', 'Pancreas', 'Intestines', 'Corneas', 'Bone Marrow', 'Skin'];
    const cities = ['Agra', 'Jaipur', 'Udaipur', 'Jodhpur', 'Haryana', 'Delhi', 'Mumbai', 'Bangalore'];

    const handleSearch = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/organ/donors', {
                params: {
                    organType: searchOrganType,
                    city: searchCity
                }
            });
            setSearchResults(response.data);
            setShowResults(true);
        } catch (err: any) {
            setError('Failed to fetch donors. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDonorSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setError('Please login to register as an organ donor.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await api.post('/organ/register-donor', formData);
            setSubmitted(true);
            setTimeout(() => {
                setSubmitted(false);
                setFormData({ organType: '', location: '', city: '', state: '' });
            }, 3000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to register. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden pt-20 pb-12 px-4">
            <div className="absolute top-0 right-1/3 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-blob"></div>
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>

            {/* Subtle Background Decorations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
              <div className="absolute top-[22%] left-[4%] opacity-[0.15] text-indigo-400">
                <HeartPulse className="w-36 h-36 filter blur-[0.5px] fill-indigo-500/5" />
              </div>
              <div className="absolute bottom-[20%] right-[5%] opacity-[0.14] text-purple-400">
                <Network className="w-40 h-40 filter blur-[0.5px]" />
              </div>
              <div className="absolute top-[55%] left-[8%] opacity-[0.13] text-indigo-300">
                <Share2 className="w-24 h-24" />
              </div>
              <div className="absolute top-[18%] right-[10%] opacity-[0.15] text-purple-300">
                <Activity className="w-28 h-28" />
              </div>
              <div className="absolute bottom-[42%] left-[3%] opacity-[0.11] text-indigo-500">
                <Network className="w-20 h-20" />
              </div>
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-4 animate-float animate-pulse-glow">
                        <HeartPulse className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black mb-3">
                        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-text-shimmer">
                            Organ Donation Platform
                        </span>
                    </h1>
                    <p className="text-xl text-gray-300 font-light">Give the gift of life. Pledge to donate or find a match.</p>
                </div>

                <div className="flex justify-center mb-8">
                    <div className="inline-flex glass-effect rounded-full p-1 border border-indigo-400/50">
                        <button
                            onClick={() => setActiveTab('find')}
                            className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 group relative overflow-hidden ${activeTab === 'find'
                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/50'
                                    : 'text-gray-400 hover:text-indigo-400'
                                }`}
                        >
                            {activeTab === 'find' && (
                                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 group-hover:translate-x-full"></span>
                            )}
                            <div className="flex items-center space-x-2 relative z-10">
                                <Search className="w-5 h-5" />
                                <span>Find Organ</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('donate')}
                            className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 group relative overflow-hidden ${activeTab === 'donate'
                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/50'
                                    : 'text-gray-400 hover:text-indigo-400'
                                }`}
                        >
                            {activeTab === 'donate' && (
                                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 group-hover:translate-x-full"></span>
                            )}
                            <div className="flex items-center space-x-2 relative z-10">
                                <UserPlus className="w-5 h-5" />
                                <span>Pledge Organ</span>
                            </div>
                        </button>
                    </div>
                </div>

                {activeTab === 'find' ? (
                    <div className="glass-effect rounded-3xl shadow-2xl p-8 animate-fade-in border border-indigo-500/30">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <Search className="w-6 h-6 mr-3 text-indigo-400" />
                            Find Organ Matches
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Organ Type
                                </label>
                                <select
                                    value={searchOrganType}
                                    onChange={(e) => setSearchOrganType(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white select-custom"
                                >
                                    <option value="" className="bg-slate-900">All Organs</option>
                                    {organTypes.map((type) => (
                                        <option key={type} value={type} className="bg-slate-900">
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    City
                                </label>
                                <select
                                    value={searchCity}
                                    onChange={(e) => setSearchCity(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white select-custom"
                                >
                                    <option value="" className="bg-slate-900">All Cities</option>
                                    {cities.map((city) => (
                                        <option key={city} value={city} className="bg-slate-900">
                                            {city}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center space-x-2">
                                <AlertCircle className="w-5 h-5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Search className="w-5 h-5" />
                            )}
                            <span>{loading ? 'Searching...' : 'Search Donors'}</span>
                        </button>

                        {showResults && (
                            <div className="mt-8 space-y-4 animate-slide-in">
                                <h3 className="text-xl font-bold text-white">
                                    Found {searchResults.length} Match(es)
                                </h3>
                                {searchResults.length === 0 ? (
                                    <p className="text-gray-400 text-center py-8">
                                        No matching donors found in your area. Check back later.
                                    </p>
                                ) : (
                                    searchResults.map((donor, index) => (
                                        <div
                                            key={index}
                                            className="glass-effect rounded-2xl p-6 border-2 border-indigo-500/20 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-lg"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start space-x-4">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <Activity className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-bold text-white">{donor.User.name}</h4>
                                                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2 text-sm text-gray-300">
                                                            <span className="flex items-center">
                                                                <MapPin className="w-4 h-4 mr-1 text-indigo-400" />
                                                                {donor.city}, {donor.location}
                                                            </span>
                                                            <span className="flex items-center mt-1 sm:mt-0">
                                                                <Phone className="w-4 h-4 mr-1 text-indigo-400" />
                                                                {donor.User.phone}
                                                            </span>
                                                        </div>
                                                        {donor.pledgeDate && (
                                                            <p className="text-xs text-gray-500 mt-2">
                                                                Pledged On: {new Date(donor.pledgeDate).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="px-4 py-2 bg-white/10 rounded-full font-bold text-indigo-400 text-sm border border-indigo-400/30">
                                                    {donor.organType}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="glass-effect rounded-3xl shadow-2xl p-8 animate-fade-in border border-indigo-500/30">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <UserPlus className="w-6 h-6 mr-3 text-indigo-400" />
                            Pledge to Donate Organ
                        </h2>

                        {!user ? (
                            <div className="text-center py-12">
                                <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">Login Required</h3>
                                <p className="text-gray-400 mb-6">You must be logged in to pledge an organ.</p>
                                <div className="flex flex-col sm:flex-row justify-center gap-4">
                                    <Link to="/login" className="px-8 py-3 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 transition-colors">
                                        Login
                                    </Link>
                                    <Link to="/register" className="px-8 py-3 border border-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-500/10 transition-colors">
                                        Register
                                    </Link>
                                </div>
                            </div>
                        ) : submitted ? (
                            <div className="text-center py-12 animate-fade-in">
                                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <HeartPulse className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Thank You, {user.name}!</h3>
                                <p className="text-gray-300">
                                    Your pledge to donate has been registered. You are a true hero!
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleDonorSubmit} className="space-y-6">
                                {error && (
                                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center space-x-2">
                                        <AlertCircle className="w-5 h-5" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                                        Exact Location / Address *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                                        placeholder="E.g. Apartment building, Neighborhood, Hospital Name"
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                                            Organ to Pledge *
                                        </label>
                                        <select
                                            required
                                            value={formData.organType}
                                            onChange={(e) => setFormData({ ...formData, organType: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white select-custom"
                                        >
                                            <option value="" className="bg-slate-900">Select Organ</option>
                                            {organTypes.map((type) => (
                                                <option key={type} value={type} className="bg-slate-900">
                                                    {type}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                                            City *
                                        </label>
                                        <select
                                            required
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white select-custom"
                                        >
                                            <option value="" className="bg-slate-900">Select City</option>
                                            {cities.map((city) => (
                                                <option key={city} value={city} className="bg-slate-900">
                                                    {city}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                                        State / Region
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.state}
                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                                        placeholder="Enter state"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <HeartPulse className="w-5 h-5" />
                                    )}
                                    <span>{loading ? 'Pledging...' : 'Pledge Organ'}</span>
                                </button>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
