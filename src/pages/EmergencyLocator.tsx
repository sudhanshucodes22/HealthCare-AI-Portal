import { useState } from 'react';
import { MapPin, Phone, Search, Navigation, Building2, Ambulance, AlertCircle, Loader2, Crosshair, Heart, Eye, Activity, User, Clock, Stethoscope, Calendar, XCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import api from '../services/api';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React Leaflet
const customIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to dynamically change map center
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

interface HealthcareProvider {
  id: string | number;
  name: string;
  type: 'hospital' | 'clinic' | 'emergency';
  address: string;
  phone: string;
  distance: string;
  isOpen?: boolean;
  emergencyServices?: boolean;
  location?: { lat: number; lng: number };
  specialties?: string[];
  doctors?: Array<{ name: string; time: string }>;
}

export default function EmergencyLocator() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showResults, setShowResults] = useState(false);
  const [providers, setProviders] = useState<HealthcareProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [bookingProvider, setBookingProvider] = useState<HealthcareProvider | null>(null);
  const [bookingForm, setBookingForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '10:00 AM',
    doctor: '',
    reason: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Default map center (e.g., somewhere central or just anywhere until geolocation fires)
  const [mapCenter, setMapCenter] = useState<[number, number]>([39.8283, -98.5795]);

  const emergencyNumbers = [
    { service: 'Emergency Services', number: '911', description: 'Police, Fire, Ambulance' },
    { service: 'Ambulance Dispatch', number: '911', description: 'Immediate Medical Transport' },
    { service: 'Poison Control', number: '1-800-222-1222', description: 'Poisoning emergencies' },
    { service: 'Suicide Prevention', number: '988', description: 'Mental health crisis' },
    { service: 'Crisis Text Line', number: 'Text HOME to 741741', description: 'Text-based crisis support' },
  ];

  const fetchHospitals = async (lat: number, lng: number) => {
    try {
      const response = await api.post('/emergency/nearby', {
        latitude: lat,
        longitude: lng,
        radius: 15000
      });
      // Try to gracefully handle map differences from mock and regular DB
      setProviders(response.data);
      setShowResults(true);
    } catch (err: any) {
      console.error(err);
      setError('Failed to find nearby facilities. Please try again later.');
      // If we are getting a 404 from backend config, let's gracefully fail
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a location to search.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Geocode the text query using Nominatim (OpenStreetMap)
      const geocodeRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const geocodeData = await geocodeRes.json();

      if (geocodeData && geocodeData.length > 0) {
        const lat = parseFloat(geocodeData[0].lat);
        const lon = parseFloat(geocodeData[0].lon);

        setMapCenter([lat, lon]);

        // 2. Fetch hospitals based on coordinates
        await fetchHospitals(lat, lon);
      } else {
        setError('Could not find that location. Please try a different query.');
      }
    } catch (err: any) {
      setError('Failed to search for location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    setLoading(true);
    setError('');
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setMapCenter([lat, lng]);
          await fetchHospitals(lat, lng);
          setLoading(false);
          setSearchQuery('Current Location');
        },
        (error) => {
          console.error("Error getting location", error);
          setError("Failed to get your location. Please ensure location services are enabled, or search manually.");
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
      setLoading(false);
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingProvider) return;

    setBookingLoading(true);
    try {
      await api.post('/appointments', {
        hospitalId: bookingProvider.id.toString(),
        hospitalName: bookingProvider.name,
        doctorName: bookingForm.doctor || (bookingProvider.doctors?.[0]?.name || 'Unknown Doctor'),
        specialty: bookingProvider.specialties?.[0] || 'General',
        appointmentDate: bookingForm.date,
        appointmentTime: bookingForm.time,
        reason: bookingForm.reason
      });
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingProvider(null);
        setBookingSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError('Failed to book appointment. Please make sure you are logged in.');
    } finally {
      setBookingLoading(false);
    }
  };

  const filteredProviders = providers.filter((provider) => {
    // Type Filter
    const typeLabel = provider.type?.toLowerCase() || 'hospital';
    const matchesType = selectedType === 'all' || typeLabel.includes(selectedType) || (selectedType === 'hospital' && typeLabel.includes('emergency'));

    // Specialty Filter
    const matchesSpecialty = selectedSpecialty === 'all' ||
      provider.specialties?.some(s => s.toLowerCase().includes(selectedSpecialty.toLowerCase()));

    return matchesType && matchesSpecialty;
  });

  const getTypeIcon = (type: string) => {
    const t = type?.toLowerCase() || '';
    if (t.includes('hospital')) return Building2;
    if (t.includes('emergency')) return Ambulance;
    return MapPin;
  };

  const getTypeColor = (type: string) => {
    const t = type?.toLowerCase() || '';
    if (t.includes('hospital')) return 'from-blue-500 to-cyan-600';
    if (t.includes('emergency')) return 'from-red-500 to-rose-600';
    if (t.includes('ambulance')) return 'from-orange-500 to-amber-600';
    return 'from-green-500 to-emerald-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 relative overflow-hidden pt-20 pb-12 px-4">
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-blob"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>

      {/* Subtle Background Decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        <div className="absolute top-[25%] left-[5%] opacity-[0.14] text-orange-400">
          <MapPin className="w-24 h-24 filter blur-[0.5px]" />
        </div>
        <div className="absolute bottom-[22%] right-[5%] opacity-[0.15] text-amber-400">
          <Building2 className="w-32 h-32 filter blur-[0.5px]" />
        </div>
        <div className="absolute top-[58%] left-[7%] opacity-[0.13] text-orange-300">
          <Ambulance className="w-20 h-20 -rotate-12" />
        </div>
        <div className="absolute top-[18%] right-[10%] opacity-[0.14] text-yellow-400">
          <Navigation className="w-24 h-24 rotate-45" />
        </div>
        <div className="absolute bottom-[40%] left-[3%] opacity-[0.11] text-orange-500">
          <MapPin className="w-16 h-16" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full mb-4 animate-float animate-pulse-glow">
            <MapPin className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-3">
            <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent animate-text-shimmer">
              Emergency Healthcare Locator
            </span>
          </h1>
          <p className="text-xl text-gray-300 font-light">Find nearby medical facilities and emergency services</p>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center space-x-2 glass-effect">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <div className="glass-effect border-l-4 border-red-400 p-6 rounded-lg mb-8 flex items-start space-x-3 border border-red-500/30">
          <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5 animate-pulse" />
          <div>
            <h3 className="font-bold text-red-200 mb-2 text-lg">In Case of Emergency</h3>
            <p className="text-red-100 mb-2">
              If you are experiencing a medical emergency, call <strong>911</strong> immediately.
            </p>
            <p className="text-red-100/80 text-sm">
              Do not use this tool as a substitute for emergency services. Time is critical in emergencies.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
          {emergencyNumbers.map((item, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-full mb-3 mx-auto">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-800 text-center mb-1">{item.service}</h3>
              <p className="text-red-600 font-bold text-xl text-center mb-2">{item.number}</p>
              <p className="text-gray-600 text-xs text-center">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Search className="w-6 h-6 mr-3 text-orange-500" />
            Find Nearby Healthcare
          </h2>

          <div className="space-y-6">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Search Location or Facility
                </label>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Enter city, zip code..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800 bg-white"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                    <span className="hidden sm:inline">{loading ? 'Searching...' : 'Search'}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-end">
                <button
                  onClick={getUserLocation}
                  disabled={loading}
                  className="w-full md:w-auto px-6 py-3 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Crosshair className="w-5 h-5" />
                  <span>Use Current Location</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Filter by Specialty
              </label>
              <div className="flex flex-wrap gap-3">
                {[
                  { value: 'all', label: 'All Specialties', icon: Activity },
                  { value: 'heart', label: 'Heart Diseases', icon: Heart },
                  { value: 'back', label: 'Back & Bones', icon: Activity },
                  { value: 'blood', label: 'Blood Related', icon: Activity },
                  { value: 'eye', label: 'Eye Related', icon: Eye },
                  { value: 'skin', label: 'Skin Related', icon: Activity },
                ].map((spec) => (
                  <button
                    key={spec.value}
                    onClick={() => setSelectedSpecialty(spec.value)}
                    className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center space-x-2 ${selectedSpecialty === spec.value
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-400'
                      }`}
                  >
                    <spec.icon className="w-4 h-4" />
                    <span>{spec.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Filter by Type
              </label>
              <div className="flex flex-wrap gap-3">
                {[
                  { value: 'all', label: 'All Facilities', icon: MapPin },
                  { value: 'hospital', label: 'Hospitals', icon: Building2 },
                  { value: 'emergency', label: 'Emergency Centers', icon: AlertCircle },
                  { value: 'ambulance', label: 'Ambulances', icon: Ambulance },
                  { value: 'clinic', label: 'Clinics', icon: MapPin },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedType(option.value)}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${selectedType === option.value
                      ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-orange-500'
                      }`}
                  >
                    <option.icon className="w-5 h-5" />
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* MAP CONTAINER */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl mb-8 relative" style={{ height: '400px', zIndex: 1 }}>
          <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
            <ChangeView center={mapCenter} zoom={13} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredProviders.map((provider, i) => {
              if (provider.location?.lat && provider.location?.lng) {
                return (
                  <Marker key={provider.id || i} position={[provider.location.lat, provider.location.lng]} icon={customIcon}>
                    <Popup>
                      <div className="font-sans text-gray-800 p-1 min-w-[200px]">
                        <strong className="block text-lg mb-1 text-blue-800 border-b pb-1">{provider.name}</strong>
                        <p className="text-gray-600 text-sm mb-2 flex items-start">
                          <MapPin className="w-3 h-3 mr-1 mt-1 flex-shrink-0" />
                          {provider.address}
                        </p>

                        {provider.specialties && (
                          <div className="mb-2">
                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Specialties</p>
                            <div className="flex flex-wrap gap-1">
                              {provider.specialties.slice(0, 3).map((s, idx) => (
                                <span key={idx} className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[10px] font-medium">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {provider.doctors && (
                          <div className="mb-2 border-t pt-2">
                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center">
                              <User className="w-3 h-3 mr-1" /> Available Doctors
                            </p>
                            {provider.doctors.slice(0, 2).map((d, idx) => (
                              <div key={idx} className="mb-1">
                                <p className="text-xs font-bold text-gray-700 m-0">{d.name}</p>
                                <p className="text-[10px] text-gray-500 m-0 flex items-center">
                                  <Clock className="w-2.5 h-2.5 mr-0.5" /> {d.time}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="border-t pt-2 mt-2 flex justify-between items-center">
                          <a href={`tel:${provider.phone}`} className="text-blue-600 font-bold text-xs flex items-center">
                            <Phone className="w-3 h-3 mr-1" /> {provider.phone}
                          </a>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              }
              return null;
            })}
          </MapContainer>
        </div>

        {showResults && (
          <div className="space-y-4 animate-slide-in">
            <h3 className="text-2xl font-bold text-gray-200 mb-6">
              Found {filteredProviders.length} Nearby Facilities
            </h3>

            {filteredProviders.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center border border-white/10">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-gray-200 mb-2">No facilities found</h4>
                <p className="text-gray-400">Try adjusting your search criteria or location</p>
              </div>
            ) : (
              filteredProviders.map((provider, i) => {
                const typeToUse = provider.type || 'hospital';
                const Icon = getTypeIcon(typeToUse);
                const gradient = getTypeColor(typeToUse);

                return (
                  <div
                    key={provider.id || i}
                    className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-xl font-bold text-white">{provider.name}</h4>
                            {provider.emergencyServices && (
                              <span className="px-3 py-1 bg-red-500/20 border border-red-500/30 text-red-300 rounded-full text-xs font-semibold">
                                24/7 Emergency
                              </span>
                            )}
                            {provider.isOpen !== undefined && (
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${provider.isOpen
                                  ? 'bg-green-500/20 border border-green-500/30 text-green-300'
                                  : 'bg-gray-500/20 border border-gray-500/30 text-gray-300'
                                  }`}
                              >
                                {provider.isOpen ? 'Open Now' : 'Closed'}
                              </span>
                            )}
                          </div>
                          <div className="space-y-2 text-gray-300">
                            <p className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2 text-orange-400" />
                              {provider.address}
                            </p>
                            <p className="flex items-center">
                              <Phone className="w-4 h-4 mr-2 text-orange-400" />
                              {provider.phone}
                            </p>
                            {provider.distance && (
                              <p className="flex items-center">
                                <Navigation className="w-4 h-4 mr-2 text-orange-400" />
                                {provider.distance} away
                              </p>
                            )}
                          </div>

                          {provider.specialties && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {provider.specialties.map((s, idx) => (
                                <span key={idx} className="bg-white/10 px-3 py-1 rounded-full text-xs font-medium border border-white/5 flex items-center text-blue-300">
                                  <Stethoscope className="w-3 h-3 mr-1.5" />
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}

                          {provider.doctors && (
                            <div className="mt-4 grid sm:grid-cols-2 gap-3 bg-white/5 p-4 rounded-xl border border-white/5">
                              <p className="col-span-full text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center mb-1">
                                <User className="w-3.5 h-3.5 mr-2" /> Specialist Doctors & Availability
                              </p>
                              {provider.doctors.map((d, idx) => (
                                <div key={idx} className="bg-white/5 p-3 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                                  <p className="text-sm font-bold text-white mb-1">{d.name}</p>
                                  <p className="text-xs text-gray-400 flex items-center">
                                    <Clock className="w-3 h-3 mr-1.5 text-orange-400" />
                                    {d.time}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2 w-full sm:w-auto mt-4 sm:mt-0">
                        <button
                          onClick={() => {
                            setBookingProvider(provider);
                            setBookingForm({ ...bookingForm, doctor: provider.doctors?.[0]?.name || '' });
                          }}
                          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-bold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center space-x-2 whitespace-nowrap"
                        >
                          <Calendar className="w-4 h-4" />
                          <span>Book Online</span>
                        </button>
                        <a
                          href={`tel:${provider.phone}`}
                          className="w-full sm:w-auto px-6 py-3 bg-white/10 text-white border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center justify-center space-x-2 whitespace-nowrap text-sm"
                        >
                          <Phone className="w-4 h-4" />
                          <span>Call Now</span>
                        </a>
                        <button className="w-full sm:w-auto px-6 py-3 bg-white/5 text-gray-400 rounded-xl font-semibold hover:bg-white/10 transition-all flex items-center justify-center space-x-2 whitespace-nowrap text-sm">
                          <Navigation className="w-4 h-4" />
                          <span>Directions</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
        {/* BOOKING MODAL */}
        {bookingProvider && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl transform animate-scale-in">
              <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-6 text-white">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-black">Book Appointment</h3>
                  <button onClick={() => setBookingProvider(null)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-orange-50 font-bold">{bookingProvider.name}</p>
                <div className="flex items-center text-orange-100 text-sm mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  {bookingProvider.address}
                </div>
              </div>

              {bookingSuccess ? (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-800 mb-2">Booking Success!</h4>
                  <p className="text-gray-600">Your digital token has been generated. Redirecting to your dashboard...</p>
                </div>
              ) : (
                <form onSubmit={handleBookAppointment} className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Select Specialist Doctor</label>
                      <select
                        required
                        value={bookingForm.doctor}
                        onChange={(e) => setBookingForm({ ...bookingForm, doctor: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      >
                        {bookingProvider.doctors?.map((doc, idx) => (
                          <option key={idx} value={doc.name}>{doc.name} ({doc.time})</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Preferred Date</label>
                        <input
                          type="date"
                          required
                          value={bookingForm.date}
                          min={format(new Date(), 'yyyy-MM-dd')}
                          onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Preferred Time</label>
                        <select
                          required
                          value={bookingForm.time}
                          onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        >
                          {['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'].map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Reason for Visit (Optional)</label>
                      <textarea
                        value={bookingForm.reason}
                        onChange={(e) => setBookingForm({ ...bookingForm, reason: e.target.value })}
                        placeholder="e.g., Routine checkup, Heart pain..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none h-24"
                      ></textarea>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-2xl font-black text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all disabled:opacity-50"
                  >
                    {bookingLoading ? 'Booking...' : 'Confirm Appointment'}
                  </button>
                  <p className="text-center text-xs text-gray-400">Skip the Queue - Your priority token will be generated on confirmation.</p>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
