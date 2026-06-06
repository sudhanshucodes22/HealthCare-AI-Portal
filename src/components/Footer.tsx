import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles, Heart, Shield, Quote as QuoteIcon } from 'lucide-react';

const CATEGORIZED_QUOTES: Record<string, string[]> = {
    '/mental-health': [
        "Your mental health is a priority. Your happiness is essential. Your self-care is a necessity.",
        "Self-care is how you take your power back.",
        "You are not alone in this journey. Every step forward counts.",
        "Healing takes time, and asking for help is a courageous act of strength."
    ],
    '/blood-donation': [
        "Every drop counts. You are a silent hero in someone's life story.",
        "Be the reason for someone's heartbeat today. Donate with love.",
        "Donating blood is the greatest gift of life you can give to a stranger.",
        "A single pint can save three lives. Be a lifesaver, be a donor."
    ],
    '/emergency-locator': [
        "Minutes matter in an emergency. We're here to help you find care fast.",
        "Your safety is our priority. Accurate directions to help, anytime.",
        "Stay calm, stay informed, and let us guide you to the right care.",
        "Ready for the unexpected — because your life is absolutely priceless."
    ],
    '/disease-predictor': [
        "Knowledge is the first step toward lasting wellness.",
        "Empower yourself with data-driven insights for a healthier tomorrow.",
        "Understanding your symptoms is the beginning of better healthcare.",
        "Stay proactive, not just reactive, when it comes to your well-being."
    ],
    'default': [
        "Your health is an investment, not an expense. Invest in yourself.",
        "Health is not valued till sickness comes. Take care of yourself today.",
        "Healing is a matter of time, but it is also a matter of opportunity.",
        "Small steps lead to big changes. Keep moving forward with confidence.",
        "Happiness is the highest form of health. Smile, you're alive.",
        "Invest in your rest. Your body will thank you for the peace."
    ]
};

const THEMES: Record<string, any> = {
    '/mental-health': {
        bg: 'from-emerald-950/80 to-slate-900/90',
        border: 'border-emerald-500/30',
        accent: 'text-emerald-400',
        glow: 'bg-emerald-500/20',
        quoteGradient: 'from-emerald-400 via-emerald-100 to-emerald-400'
    },
    '/blood-donation': {
        bg: 'from-rose-950/80 to-slate-900/90',
        border: 'border-rose-500/30',
        accent: 'text-rose-400',
        glow: 'bg-rose-500/20',
        quoteGradient: 'from-rose-400 via-rose-100 to-rose-400'
    },
    '/emergency-locator': {
        bg: 'from-orange-950/80 to-slate-900/90',
        border: 'border-orange-500/30',
        accent: 'text-orange-400',
        glow: 'bg-orange-500/20',
        quoteGradient: 'from-orange-400 via-orange-100 to-orange-400'
    },
    '/disease-predictor': {
        bg: 'from-purple-950/80 to-slate-900/90',
        border: 'border-purple-500/30',
        accent: 'text-purple-400',
        glow: 'bg-purple-500/20',
        quoteGradient: 'from-purple-400 via-purple-100 to-purple-400'
    },
    'default': {
        bg: 'from-slate-950/80 to-slate-900/90',
        border: 'border-white/10',
        accent: 'text-teal-400',
        glow: 'bg-teal-500/20',
        quoteGradient: 'from-teal-600 via-indigo-700 to-blue-600'
    }
};

export default function Footer() {
    const [quote, setQuote] = useState('');
    const location = useLocation();
    const theme = THEMES[location.pathname] || THEMES['default'];

    useEffect(() => {
        const list = CATEGORIZED_QUOTES[location.pathname] || CATEGORIZED_QUOTES['default'];
        const randomQuote = list[Math.floor(Math.random() * list.length)];
        setQuote(randomQuote);
    }, [location.pathname]);

    return (
        <footer className="w-full pt-16 pb-12 px-4 relative z-10">
            <div className="max-w-7xl mx-auto">
                <div className={`bg-gradient-to-br ${theme.bg} rounded-3xl p-8 md:p-10 border ${theme.border} shadow-2xl relative overflow-hidden backdrop-blur-xl`}>
                    {/* Subtle background glow */}
                    <div className={`absolute top-0 right-0 w-48 h-48 ${theme.glow} rounded-full blur-3xl -mr-24 -mt-24 animate-pulse`}></div>
                    <div className={`absolute bottom-0 left-0 w-48 h-48 ${theme.glow} rounded-full blur-3xl -ml-24 -mb-24 animate-pulse`} style={{ animationDelay: '1s' }}></div>

                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="flex items-center space-x-2 mb-6">
                            <Sparkles className={`w-5 h-5 ${theme.accent}`} />
                            <span className={`text-sm font-black tracking-[0.3em] ${theme.accent} uppercase`}>Daily Inspiration</span>
                            <Sparkles className={`w-5 h-5 ${theme.accent}`} />
                        </div>

                        <div className="relative mb-10 max-w-4xl px-4">
                            <QuoteIcon className={`absolute -top-8 -left-4 w-12 h-12 ${theme.accent} opacity-10`} />
                            <h2 className={`text-2xl md:text-5xl font-black italic mb-2 leading-tight bg-gradient-to-r ${theme.quoteGradient} bg-clip-text text-transparent drop-shadow-md`}>
                                "{quote}"
                            </h2>
                            <QuoteIcon className={`absolute -bottom-8 -right-4 w-12 h-12 ${theme.accent} opacity-10 transform rotate-180`} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full pt-8 border-t border-white/10">
                            <div className="flex flex-col items-center md:items-start space-y-2">
                                <div className="flex items-center space-x-2 text-white font-bold mb-1">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theme.accent.replace('text-', 'from-').replace('400', '500')} to-slate-900 flex items-center justify-center shadow-lg shadow-black/50`}>
                                        <Heart className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-xl tracking-tight">HealthCare AI</span>
                                </div>
                                <p className="text-[11px] text-gray-400 text-center md:text-left leading-relaxed font-medium">
                                    Revolutionizing wellness with AI intelligence.<br />Your life, protected and empowered.
                                </p>
                            </div>

                            <div className="flex flex-col items-center justify-center space-y-3">
                                <div className="flex items-center space-x-2 text-white/50 font-bold text-[10px] uppercase tracking-widest">
                                    <Shield className={`w-3 h-3 ${theme.accent}`} />
                                    <span>Verified Platform Security</span>
                                </div>
                                <div className="px-4 py-1.5 rounded-full border border-white/5 bg-white/5 backdrop-blur-sm">
                                    <p className="text-[9px] text-gray-400 text-center uppercase tracking-[0.25em] font-black">
                                        © 2024 HEALTHCARE AI · GLOBAL SYSTEM
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col items-center md:items-end space-y-1">
                                <p className={`text-[10px] ${theme.accent} opacity-80 uppercase font-black tracking-widest mb-1 text-center md:text-right`}>
                                    Medical Intelligence
                                </p>
                                <p className="text-[9px] text-gray-500 leading-snug max-w-[220px] text-center md:text-right italic font-medium">
                                    Our AI insights are for informational purposes. Please consult dedicated healthcare professionals for critical medical decisions.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
