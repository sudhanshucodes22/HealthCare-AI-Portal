import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, Menu, X, Zap, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Disease Predictor', path: '/disease-predictor' },
    { name: 'Blood Donation', path: '/blood-donation' },
    { name: 'Organ Donation', path: '/organ-donation' },
    { name: 'Mental Health', path: '/mental-health' },
    { name: 'Medicine Reminder', path: '/medicine-reminder' },
    { name: 'Emergency Locator', path: '/emergency-locator' },
    { name: 'Health Insurance', path: '/health-insurance' },
    { name: 'Online Appointments', path: '/online-appointments' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
        ? 'bg-gradient-to-r from-white/95 to-white/90 backdrop-blur-2xl shadow-2xl border-b border-white/20'
        : 'bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="flex items-center space-x-3 group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl blur-lg opacity-0 group-hover:opacity-75 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-br from-teal-500 to-cyan-600 p-2 rounded-xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Heart className="w-6 h-6 text-white" fill="white" />
              </div>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-black bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent animate-gradient-shift whitespace-nowrap tracking-tight">
                HealthCare AI
              </span>
              <span className="text-[10px] text-teal-600/80 font-bold uppercase tracking-widest whitespace-nowrap">
                Smart Health Platform
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link, index) => (
              <Link
                key={link.path}
                to={link.path}
                className={`group px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative overflow-hidden ${location.pathname === link.path
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/50'
                  : isScrolled
                    ? 'text-gray-700 hover:text-teal-600'
                    : 'text-gray-300 hover:text-teal-400'
                  }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {location.pathname !== link.path && (
                  <span className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-lg"></span>
                )}
                <span className="relative flex items-center space-x-1">
                  <span>{link.name}</span>
                  {location.pathname === link.path && (
                    <Zap className="w-4 h-4 group-hover:animate-pulse-glow" />
                  )}
                </span>
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-600">
                  <User className="w-4 h-4" />
                  <span className="text-sm font-semibold">{user.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all duration-300"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${isScrolled ? 'text-gray-700 hover:text-teal-600' : 'text-gray-300 hover:text-teal-400'
                    }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gradient-to-r hover:from-teal-500/20 hover:to-cyan-600/20 transition-all duration-300 group"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700 group-hover:rotate-90 transition-transform duration-300" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700 group-hover:scale-110 transition-transform duration-300" />
            )}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-gradient-to-b from-white/98 to-white/95 backdrop-blur-2xl shadow-2xl border-b border-white/20 animate-slide-in">
          <div className="px-4 py-2 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 relative overflow-hidden group ${location.pathname === link.path
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg'
                  : 'text-gray-700 hover:text-teal-600'
                  }`}
              >
                {location.pathname !== link.path && (
                  <span className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                )}
                <span className="relative">{link.name}</span>
              </Link>
            ))}
            {!user ? (
              <div className="pt-2 space-y-1">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-lg text-sm font-medium bg-gradient-to-r from-teal-500 to-cyan-600 text-white"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="pt-2">
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
