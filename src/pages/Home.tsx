import { Link } from 'react-router-dom';
import { Brain, Heart, Bell, MapPin, MessageCircle, ArrowRight, Sparkles, Zap, Shield, Calendar, HeartPulse } from 'lucide-react';
import AnimatedButton from '../components/AnimatedButton';

export default function Home() {
  const features = [
    {
      icon: Brain,
      title: 'AI Disease Prediction',
      description: 'Get instant disease predictions based on your symptoms using advanced AI technology.',
      path: '/disease-predictor',
      gradient: 'from-purple-500 to-pink-600',
    },
    {
      icon: Heart,
      title: 'Blood Donation Platform',
      description: 'Connect donors with those in need. Save lives by donating or finding blood donors.',
      path: '/blood-donation',
      gradient: 'from-red-500 to-rose-600',
    },
    {
      icon: MessageCircle,
      title: 'Mental Health Support',
      description: 'Chat with our AI companion for emotional support and play interactive mood-boosting games.',
      path: '/mental-health',
      gradient: 'from-green-500 to-emerald-600',
    },
    {
      icon: Bell,
      title: 'Medicine Reminder',
      description: 'Never miss a dose. Track your medications and vaccination schedules.',
      path: '/medicine-reminder',
      gradient: 'from-blue-500 to-cyan-600',
    },
    {
      icon: MapPin,
      title: 'Emergency Locator',
      description: 'Find nearby hospitals and emergency services when you need them most.',
      path: '/emergency-locator',
      gradient: 'from-orange-500 to-amber-600',
    },
    {
      icon: Shield,
      title: 'Health Insurance',
      description: 'Compare health insurance plans and find the best coverage for you and your family.',
      path: '/health-insurance',
      gradient: 'from-indigo-500 to-violet-600',
    },
    {
      icon: HeartPulse,
      title: 'Organ Donation Platform',
      description: 'Give the gift of life limitlessly. Pledge to donate or find an organ match.',
      path: '/organ-donation',
      gradient: 'from-purple-500 to-fuchsia-600',
    },
    {
      icon: Calendar,
      title: 'Online Appointments',
      description: 'Book video consultations or in-person visits with top healthcare professionals globally.',
      path: '/online-appointments',
      gradient: 'from-sky-500 to-blue-600',
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Hospital Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}hospital-bg.png)`,
          filter: 'brightness(0.7)',
        }}
      ></div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-slate-900/40 to-blue-950/40"></div>

      {/* Animated Blobs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-teal-500/30 rounded-full blur-[120px] animate-blob"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/30 rounded-full blur-[120px] animate-blob" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-blue-500/30 rounded-full blur-[120px] animate-blob" style={{ animationDelay: '4s' }}></div>


      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center space-x-2 mb-4 px-4 py-2 rounded-full glass-effect">
              <Sparkles className="w-5 h-5 text-teal-400 animate-spin-slow" />
              <span className="text-sm font-semibold text-white">Next-Gen Healthcare Platform</span>
              <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>

            <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent animate-text-shimmer">
                Your Health,
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent animate-text-shimmer" style={{ animationDelay: '0.5s' }}>
                Reimagined
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto font-light leading-relaxed">
              Experience the revolution in healthcare with AI-powered diagnostics,
              <span className="text-teal-400 font-semibold"> real-time support</span>, and
              <span className="text-cyan-400 font-semibold"> emergency-ready tools</span> all in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/disease-predictor">
                <AnimatedButton size="lg" icon={Zap}>
                  Get Started Now
                </AnimatedButton>
              </Link>
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="group px-8 py-4 rounded-xl font-semibold text-white border-2 border-cyan-400/50 hover:border-cyan-400 transition-all duration-300 hover:bg-cyan-400/10 flex items-center space-x-2"
              >
                <span>Explore Features</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div id="features" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {features.map((feature, index) => (
              <Link
                key={index}
                to={feature.path}
                className="group relative rounded-3xl overflow-hidden animate-slide-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-700/50 to-slate-900/50 backdrop-blur-lg rounded-3xl"></div>
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-all duration-500 rounded-3xl`}></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>

                <div className="relative p-8 h-full flex flex-col">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-4 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 w-fit`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-teal-400 group-hover:to-cyan-400 transition-all duration-300">
                    {feature.title}
                  </h3>

                  <p className="text-gray-400 mb-4 leading-relaxed flex-1">
                    {feature.description}
                  </p>

                  <div className="flex items-center text-teal-400 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                    <span>Explore</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="relative rounded-3xl overflow-hidden backdrop-blur-lg border border-cyan-500/30 p-8 md:p-12 glass-effect">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 text-center">
              <h2 className="text-3xl md:text-5xl font-black mb-4 bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Ready to Transform Your Health?
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto font-light">
                Join thousands of users revolutionizing their healthcare with our AI-powered platform.
              </p>
              <Link to="/disease-predictor">
                <AnimatedButton size="lg" variant="primary" icon={Zap}>
                  Start Your Journey
                </AnimatedButton>
              </Link>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}
