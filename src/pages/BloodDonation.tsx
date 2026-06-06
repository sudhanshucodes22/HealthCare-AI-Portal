import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Search, UserPlus, Phone, MapPin, Droplet, AlertCircle, Loader2, Activity, Syringe } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Donor {
  id: number;
  bloodType: string;
  location: string;
  city: string;
  User: {
    name: string;
    phone: string;
    email: string;
  };
  lastDonation: string;
}

export default function BloodDonation() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'find' | 'donate'>('find');
  const [searchBloodGroup, setSearchBloodGroup] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [searchResults, setSearchResults] = useState<Donor[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    bloodType: '',
    location: '',
    city: '',
    state: '',
    lastDonation: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const cities = ['Agra', 'Jaipur', 'Udaipur', 'Jodhpur', 'Haryana', 'Delhi', 'Mumbai', 'Bangalore'];

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/blood/donors', {
        params: {
          bloodType: searchBloodGroup,
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
      setError('Please login to register as a donor.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.post('/blood/register-donor', formData);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ bloodType: '', location: '', city: '', state: '', lastDonation: '' });
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 relative overflow-hidden pt-20 pb-12 px-4">
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-blob"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>

      {/* Subtle Background Decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        <div className="absolute top-[25%] left-[5%] opacity-[0.16] text-red-500">
          <Droplet className="w-24 h-24 filter blur-[0.5px] fill-red-500/20" />
        </div>
        <div className="absolute bottom-[20%] right-[6%] opacity-[0.15] text-rose-500">
          <Heart className="w-36 h-36 filter blur-[0.5px] fill-rose-500/10" />
        </div>
        <div className="absolute top-[60%] left-[8%] opacity-[0.13] text-red-400">
          <Syringe className="w-20 h-20 rotate-45" />
        </div>
        <div className="absolute top-[18%] right-[10%] opacity-[0.14] text-pink-400">
          <Activity className="w-24 h-24" />
        </div>
        <div className="absolute bottom-[40%] left-[4%] opacity-[0.11] text-rose-400">
          <Droplet className="w-16 h-16 fill-rose-400/20" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-rose-600 rounded-full mb-4 animate-float animate-pulse-glow">
            <Heart className="w-10 h-10 text-white" fill="white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-3">
            <span className="bg-gradient-to-r from-red-400 via-rose-400 to-pink-400 bg-clip-text text-transparent animate-text-shimmer">
              Blood Donation Platform
            </span>
          </h1>
          <p className="text-xl text-gray-300 font-light">Save lives by donating blood or finding donors in your area</p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="inline-flex glass-effect rounded-full p-1 border border-red-400/50">
            <button
              onClick={() => setActiveTab('find')}
              className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 group relative overflow-hidden ${activeTab === 'find'
                ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/50'
                : 'text-gray-400 hover:text-red-400'
                }`}
            >
              {activeTab === 'find' && (
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 group-hover:translate-x-full"></span>
              )}
              <div className="flex items-center space-x-2 relative z-10">
                <Search className="w-5 h-5" />
                <span>Find Donor</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('donate')}
              className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 group relative overflow-hidden ${activeTab === 'donate'
                ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/50'
                : 'text-gray-400 hover:text-red-400'
                }`}
            >
              {activeTab === 'donate' && (
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 group-hover:translate-x-full"></span>
              )}
              <div className="flex items-center space-x-2 relative z-10">
                <UserPlus className="w-5 h-5" />
                <span>Become Donor</span>
              </div>
            </button>
          </div>
        </div>

        {activeTab === 'find' ? (
          <div className="glass-effect rounded-3xl shadow-2xl p-8 animate-fade-in border border-red-500/30">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Search className="w-6 h-6 mr-3 text-red-400" />
              Find Blood Donors
            </h2>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Blood Group
                </label>
                <select
                  value={searchBloodGroup}
                  onChange={(e) => setSearchBloodGroup(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">All Blood Groups</option>
                  {bloodGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City
                </label>
                <select
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">All Cities</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
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
              className="w-full py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
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
                  Found {searchResults.length} Donor(s)
                </h3>
                {searchResults.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">
                    No donors found matching your criteria. Try adjusting your search.
                  </p>
                ) : (
                  searchResults.map((donor, index) => (
                    <div
                      key={index}
                      className="glass-effect rounded-2xl p-6 border-2 border-red-500/20 hover:border-red-500/50 transition-all duration-300 hover:shadow-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <Droplet className="w-6 h-6 text-white" fill="white" />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-white">{donor.User.name}</h4>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2 text-sm text-gray-300">
                              <span className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1 text-red-400" />
                                {donor.city}, {donor.location}
                              </span>
                              <span className="flex items-center mt-1 sm:mt-0">
                                <Phone className="w-4 h-4 mr-1 text-red-400" />
                                {donor.User.phone}
                              </span>
                            </div>
                            {donor.lastDonation && (
                              <p className="text-xs text-gray-500 mt-2">
                                Last Donation: {new Date(donor.lastDonation).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="px-4 py-2 bg-white/10 rounded-full font-bold text-red-400 text-lg border border-red-400/30">
                          {donor.bloodType}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="glass-effect rounded-3xl shadow-2xl p-8 animate-fade-in border border-red-500/30">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <UserPlus className="w-6 h-6 mr-3 text-red-400" />
              Register as Blood Donor
            </h2>

            {!user ? (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Login Required</h3>
                <p className="text-gray-400 mb-6">You must be logged in to register as a blood donor help others.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link to="/login" className="px-8 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors">
                    Login
                  </Link>
                  <Link to="/register" className="px-8 py-3 border border-red-500 text-white rounded-xl font-semibold hover:bg-red-500/10 transition-colors">
                    Register
                  </Link>
                </div>
              </div>
            ) : submitted ? (
              <div className="text-center py-12 animate-fade-in">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-10 h-10 text-white" fill="white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Thank You, {user.name}!</h3>
                <p className="text-gray-300">
                  Your registration has been submitted successfully. You're now a potential lifesaver!
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
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                    placeholder="E.g. Apartment building, Neighborhood"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Blood Group *
                    </label>
                    <select
                      required
                      value={formData.bloodType}
                      onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-white select-custom"
                    >
                      <option value="" className="bg-slate-900">Select Blood Group</option>
                      {bloodGroups.map((group) => (
                        <option key={group} value={group} className="bg-slate-900">
                          {group}
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
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-white select-custom"
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

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      State / Region
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                      placeholder="Enter state"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Last Donation Date
                    </label>
                    <input
                      type="date"
                      value={formData.lastDonation}
                      onChange={(e) => setFormData({ ...formData, lastDonation: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Heart className="w-5 h-5" />
                  )}
                  <span>{loading ? 'Registering...' : 'Register as Donor'}</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
