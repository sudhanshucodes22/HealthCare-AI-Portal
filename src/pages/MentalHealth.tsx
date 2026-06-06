import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Heart, Sparkles, AlertCircle, Loader2, Gamepad2, Brain, Wind, Smile, RefreshCw, Trophy, Star, Zap, Award, Gift, Sun } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Message {
  role: 'bot' | 'user';
  content: string;
  timestamp: Date;
}

// ─── POINTS / REWARD SYSTEM ──────────────────────────────────────────────────
const BADGES = [
  { id: 'first_game', label: 'First Step', emoji: '🌱', pts: 0, desc: 'Play your first game' },
  { id: 'memory_win', label: 'Sharp Mind', emoji: '🧠', pts: 50, desc: 'Win Memory Match' },
  { id: 'breathing_5', label: 'Zen Master', emoji: '🧘', pts: 100, desc: 'Complete 5 breathing cycles' },
  { id: 'word_win', label: 'Word Wizard', emoji: '✨', pts: 75, desc: 'Guess the positive word' },
  { id: 'chat_5', label: 'Open Heart', emoji: '💬', pts: 80, desc: 'Send 5 messages' },
  { id: 'century', label: 'Century Club', emoji: '🎯', pts: 100, desc: 'Score 100+ points' },
  { id: 'champion', label: 'Mind Champion', emoji: '🏆', pts: 300, desc: 'Score 300+ points' },
];

const LEVELS = [
  { name: 'Newcomer', min: 0, color: 'from-gray-500 to-gray-600', emoji: '🌱' },
  { name: 'Explorer', min: 50, color: 'from-green-500 to-emerald-600', emoji: '🌿' },
  { name: 'Achiever', min: 150, color: 'from-blue-500 to-indigo-600', emoji: '⭐' },
  { name: 'Champion', min: 300, color: 'from-purple-500 to-violet-600', emoji: '🏆' },
  { name: 'Legend', min: 500, color: 'from-yellow-500 to-orange-500', emoji: '👑' },
];

function getLevel(pts: number) {
  return [...LEVELS].reverse().find(l => pts >= l.min) || LEVELS[0];
}

function getNextLevel(pts: number) {
  return LEVELS.find(l => l.min > pts);
}

// ─── FLOATING SCORE TOAST ─────────────────────────────────────────────────────
function ScoreToast({ amount, onDone }: { amount: number; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 1600); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="fixed top-24 right-8 z-50 animate-bounce pointer-events-none">
      <div className="bg-yellow-400 text-black font-black text-xl px-5 py-2 rounded-2xl shadow-2xl flex items-center gap-2">
        +{amount} <Star className="w-5 h-5 fill-black" />
      </div>
    </div>
  );
}

// ─── GAME 1: Memory Match ─────────────────────────────────────────────────────
const EMOJI_PAIRS = ['🌸', '🦋', '🌈', '⭐', '🍀', '🎵', '🌙', '❤️'];
function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

const WIN_LINERS = [
  "🤩 Incredible focus! Your mind is sharp as ever!",
  "🌟 You matched them all! Positivity looks great on you!",
  "💚 Memory champion! Keep up the wonderful spirit!",
  "✨ Brilliant! You are more capable than you think!",
  "🎈 Perfect match! Just like you — one of a kind!",
];

function MemoryGame({ onScore, onBadge }: { onScore: (n: number) => void; onBadge: (id: string) => void }) {
  const [cards, setCards] = useState(() =>
    shuffle([...EMOJI_PAIRS, ...EMOJI_PAIRS].map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false })))
  );
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [pairsMatched, setPairsMatched] = useState(0);
  const [won, setWon] = useState(false);
  const [started, setStarted] = useState(false);
  const [winLiner] = useState(() => WIN_LINERS[Math.floor(Math.random() * WIN_LINERS.length)]);

  const totalPairs = EMOJI_PAIRS.length;

  const reset = () => {
    setCards(shuffle([...EMOJI_PAIRS, ...EMOJI_PAIRS].map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }))));
    setSelected([]); setMoves(0); setPairsMatched(0); setWon(false);
  };

  const flip = (id: number) => {
    if (selected.length === 2) return;

    const cardToFlip = cards.find(c => c.id === id);
    if (!cardToFlip || cardToFlip.matched || cardToFlip.flipped) return;

    if (!started) { setStarted(true); onBadge('first_game'); }

    const newCards = cards.map(c => c.id === id ? { ...c, flipped: true } : c);
    const newSelected = [...selected, id];

    setCards(newCards);
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setMoves(m => m + 1);
      const [idA, idB] = newSelected;
      const cardA = newCards.find(c => c.id === idA);
      const cardB = newCards.find(c => c.id === idB);

      if (cardA && cardB && cardA.emoji === cardB.emoji) {
        const matchedCards = newCards.map(c =>
          (c.id === idA || c.id === idB) ? { ...c, matched: true } : c
        );
        setCards(matchedCards);
        setSelected([]);
        const newPairs = pairsMatched + 1;
        setPairsMatched(newPairs);
        onScore(10);
        if (matchedCards.every(c => c.matched)) {
          setWon(true);
          onScore(30);
          onBadge('memory_win');
        }
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            (c.id === idA || c.id === idB) ? { ...c, flipped: false } : c
          ));
          setSelected([]);
        }, 900);
      }
    }
  };

  return (
    <div className="text-center">
      {/* Score bar */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-purple-200">Moves: {moves}</span>
          <div className="flex items-center gap-1 bg-green-500/20 border border-green-400/30 px-2.5 py-1 rounded-lg">
            <Trophy className="w-3.5 h-3.5 text-green-400" />
            <span className="text-sm font-black text-green-300">{pairsMatched}/{totalPairs} pairs</span>
          </div>
        </div>
        <button onClick={reset} className="flex items-center gap-1 px-3 py-1 bg-purple-700/60 hover:bg-purple-600/60 text-white rounded-lg text-xs font-semibold transition-all">
          <RefreshCw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-white/10 rounded-full h-2 mb-4">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
          style={{ width: `${(pairsMatched / totalPairs) * 100}%` }}
        />
      </div>

      {/* Win reward */}
      {won && (
        <div className="mb-4 p-4 bg-gradient-to-r from-yellow-400/20 to-amber-400/20 border border-yellow-400/40 rounded-2xl">
          <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <p className="text-yellow-200 font-black text-base mb-1">🎉 All {totalPairs} pairs found!</p>
          <p className="text-yellow-100/80 text-sm italic">"{winLiner}"</p>
          <p className="text-yellow-400 font-bold text-sm mt-2">+30 bonus pts earned!</p>
          <button onClick={reset} className="mt-3 px-4 py-1.5 bg-yellow-400/30 hover:bg-yellow-400/50 text-yellow-200 rounded-xl text-xs font-bold transition-all">Play Again</button>
        </div>
      )}

      <div className="grid grid-cols-4 gap-3">
        {cards.map(card => (
          <button key={card.id} onClick={() => flip(card.id)}
            className={`aspect-square rounded-xl text-2xl font-bold flex items-center justify-center transition-all duration-500 transform
              ${card.matched
                ? 'bg-gradient-to-br from-green-400 to-emerald-500 shadow-[0_0_15px_rgba(52,211,153,0.7)] scale-95 cursor-default border-2 border-green-300'
                : card.flipped
                  ? 'bg-white/25 shadow-inner scale-105'
                  : 'bg-gradient-to-br from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 hover:scale-105'
              }`}
          >
            {card.matched ? (
              <span className="flex flex-col items-center leading-none">
                <span className="text-xl">{card.emoji}</span>
                <span className="text-green-100 text-xs font-black">✓</span>
              </span>
            ) : card.flipped ? card.emoji : '?'}
          </button>
        ))}
      </div>
      <p className="text-purple-300 text-xs mt-3">Each pair = +10 pts · All matched = +30 bonus pts</p>
    </div>
  );
}

// ─── GAME 2: Breathing Exercise ───────────────────────────────────────────────
function BreathingGame({ onScore, onBadge }: { onScore: (n: number) => void; onBadge: (id: string) => void }) {
  const [phase, setPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [count, setCount] = useState(0);
  const [cycles, setCycles] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cycleRef = useRef(0);

  const stop = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase('idle'); setCount(0);
  }, []);

  const runCycle = useCallback(() => {
    setPhase('inhale'); setCount(4);
    let c = 4;
    const tick = () => {
      c--;
      if (c > 0) { setCount(c); timerRef.current = setTimeout(tick, 1000); }
      else {
        setPhase('hold'); setCount(7); let h = 7;
        const holdTick = () => {
          h--;
          if (h > 0) { setCount(h); timerRef.current = setTimeout(holdTick, 1000); }
          else {
            setPhase('exhale'); setCount(8); let e = 8;
            const exTick = () => {
              e--;
              if (e > 0) { setCount(e); timerRef.current = setTimeout(exTick, 1000); }
              else {
                cycleRef.current += 1;
                setCycles(cycleRef.current);
                onScore(15);
                if (cycleRef.current >= 5) onBadge('breathing_5');
                timerRef.current = setTimeout(runCycle, 500);
              }
            };
            timerRef.current = setTimeout(exTick, 1000);
          }
        };
        timerRef.current = setTimeout(holdTick, 1000);
      }
    };
    timerRef.current = setTimeout(tick, 1000);
  }, [onScore, onBadge]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const colors: Record<string, string> = { idle: 'from-teal-600 to-cyan-700', inhale: 'from-green-500 to-emerald-600', hold: 'from-blue-500 to-indigo-600', exhale: 'from-purple-500 to-violet-600' };
  const labels: Record<string, string> = { idle: 'Press Start', inhale: 'Breathe In', hold: 'Hold', exhale: 'Breathe Out' };

  return (
    <div className="text-center flex flex-col items-center gap-4">
      <p className="text-teal-200 text-sm">4-7-8 Breathing · Each cycle = +15 pts</p>
      <div className={`relative w-36 h-36 rounded-full bg-gradient-to-br ${colors[phase]} flex items-center justify-center shadow-2xl transition-all duration-1000 ${phase === 'inhale' ? 'scale-125' : phase === 'exhale' ? 'scale-90' : 'scale-100'}`}>
        <div className="text-center">
          <div className="text-4xl font-black text-white">{phase !== 'idle' ? count : '∞'}</div>
          <div className="text-xs text-white/80 font-semibold">{labels[phase]}</div>
        </div>
      </div>
      <p className="text-white/60 text-xs">Cycles completed: <span className="font-black text-white">{cycles}</span> {cycles >= 5 && '🏅'}</p>
      {phase === 'idle'
        ? <button onClick={runCycle} className="px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold transition-all hover:shadow-lg">Start Breathing</button>
        : <button onClick={stop} className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-xl font-bold transition-all">Stop</button>
      }
    </div>
  );
}

// ─── GAME 3: Circle Word Game ───────────────────────────────────────────────
const POSITIVE_WORDS = ['JOY', 'CALM', 'HOPE', 'LOVE', 'BRAVE', 'PEACE', 'KIND', 'FREE', 'GLOW', 'ZEN'];

function WordGame({ onScore, onBadge }: { onScore: (n: number) => void; onBadge: (id: string) => void }) {
  const [wordIdx, setWordIdx] = useState(0);
  const targetWord = POSITIVE_WORDS[wordIdx % POSITIVE_WORDS.length];
  const [scrambled, setScrambled] = useState<string[]>([]);
  const [selection, setSelection] = useState<number[]>([]); // indices in scrambled
  const [won, setWon] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setScrambled(shuffle(targetWord.split('')));
    setSelection([]);
    setWon(false);
    setError(false);
  }, [targetWord]);

  const handleLetterClick = (idx: number) => {
    if (won || selection.includes(idx)) return;
    const newSelection = [...selection, idx];
    setSelection(newSelection);
    setError(false);

    const currentGuess = newSelection.map(i => scrambled[i]).join('');
    if (currentGuess.length === targetWord.length) {
      if (currentGuess === targetWord) {
        setWon(true);
        onScore(40);
        onBadge('word_win');
      } else {
        setError(true);
        setTimeout(() => {
          setSelection([]);
          setError(false);
        }, 800);
      }
    }
  };

  const reset = () => {
    setWordIdx(i => i + 1);
  };

  return (
    <div className="flex flex-col items-center">
      <p className="text-pink-200 text-sm mb-6 italic">Connect the letters to spell the positive word!</p>

      <div className="mb-12 flex gap-3">
        {targetWord.split('').map((_, i) => (
          <div key={i} className={`w-12 h-12 border-b-4 flex items-center justify-center text-2xl font-black transition-all duration-300 ${won ? 'border-green-400 text-green-400 scale-110' : error ? 'border-red-500 text-red-500 animate-shake' : 'border-pink-300/40 text-white'}`}>
            {selection[i] !== undefined ? scrambled[selection[i]] : ''}
          </div>
        ))}
      </div>

      <div className="relative w-56 h-56 mb-8 mt-4">
        <div className="absolute inset-0 border-4 border-dashed border-pink-400/20 rounded-full animate-spin-slow"></div>
        {scrambled.map((letter, i) => {
          const angle = (i / scrambled.length) * 2 * Math.PI - Math.PI / 2;
          const x = 50 + 40 * Math.cos(angle);
          const y = 50 + 40 * Math.sin(angle);
          const isSelected = selection.includes(i);
          return (
            <button
              key={i}
              onClick={() => handleLetterClick(i)}
              style={{ left: `${x}%`, top: `${y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full font-black text-xl flex items-center justify-center transition-all duration-300 shadow-xl ${isSelected ? 'bg-pink-500 text-white scale-90 opacity-40' : 'bg-white text-pink-600 hover:scale-110 active:scale-95 shadow-pink-500/20'}`}
            >
              {letter}
            </button>
          )
        })}
      </div>

      {won ? (
        <div className="text-center animate-bounce mt-4">
          <div className="flex items-center gap-2 justify-center mb-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <p className="text-green-300 font-black text-xl">✨ Excellent! +40 pts</p>
          </div>
          <button onClick={reset} className="px-8 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white rounded-2xl font-black transition-all shadow-lg">Next Word</button>
        </div>
      ) : error ? (
        <p className="text-red-400 font-bold animate-pulse mt-4">Try again! Resetting...</p>
      ) : (
        <div className="h-14"></div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const GAMES = [
  { id: 'memory', label: 'Memory Match', icon: Brain, component: MemoryGame, color: 'from-purple-600 to-indigo-700', desc: 'Train your focus & memory' },
  { id: 'breathing', label: 'Calm Breathing', icon: Wind, component: BreathingGame, color: 'from-teal-600 to-cyan-700', desc: '4-7-8 anxiety relief' },
  { id: 'word', label: 'Positive Words', icon: Smile, component: WordGame, color: 'from-pink-600 to-rose-700', desc: 'Guess uplifting words' },
];

export default function MentalHealth() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([{
    role: 'bot',
    content: '💚 Hello friend! I\'m here to listen and support you. How are you feeling today?',
    timestamp: new Date(),
  }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState('');
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'games'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Rewards State ───────────────────────────────────────────────────────────
  const [totalPoints, setTotalPoints] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState<Set<string>>(new Set());
  const [toastAmt, setToastAmt] = useState<number | null>(null);
  const [chatMsgCount, setChatMsgCount] = useState(0);

  const addPoints = useCallback((n: number) => {
    setTotalPoints(prev => {
      const next = prev + n;
      // milestone badges
      if (next >= 100) unlockBadge('century');
      if (next >= 300) unlockBadge('champion');
      return next;
    });
    setToastAmt(n);
  }, []);

  const unlockBadge = useCallback((id: string) => {
    setEarnedBadges(prev => { if (prev.has(id)) return prev; const s = new Set(prev); s.add(id); return s; });
  }, []);

  const currentLevel = getLevel(totalPoints);
  const nextLevel = getNextLevel(totalPoints);
  const progress = nextLevel ? Math.min(100, Math.round(((totalPoints - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100)) : 100;

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { if (user) loadHistory(); }, [user]);

  const loadHistory = async () => {
    try {
      const response = await api.get('/mental/history');
      if (response.data.length > 0) {
        const historyMessages = response.data.map((chat: any) => ([
          { role: 'user', content: chat.message, timestamp: new Date(chat.createdAt) },
          { role: 'bot', content: chat.response, timestamp: new Date(chat.createdAt) }
        ])).flat();
        setMessages(prev => [...prev, ...historyMessages]);
      }
    } catch (err) { console.error('Failed to load chat history:', err); }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    if (!user) {
      setMessages(prev => [...prev,
      { role: 'user', content: input, timestamp: new Date() },
      { role: 'bot', content: 'Please login to use the AI Mental Health Support and save your journey.', timestamp: new Date() }
      ]);
      setInput(''); return;
    }
    const userMessage: Message = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput(''); setIsTyping(true); setError('');
    // Award points for chatting
    const newCount = chatMsgCount + 1;
    setChatMsgCount(newCount);
    addPoints(5);
    if (newCount === 1) unlockBadge('first_game');
    if (newCount >= 5) unlockBadge('chat_5');
    try {
      const response = await api.post('/mental/chat', { message: currentInput });
      setMessages(prev => [...prev, { role: 'bot', content: response.data.response, timestamp: new Date() }]);
    } catch {
      setError('I encountered an error. Please try again.');
      setMessages(prev => [...prev, { role: 'bot', content: "I'm sorry, having trouble connecting. Please try again.", timestamp: new Date() }]);
    } finally { setIsTyping(false); }
  };

  const ActiveGameComponent = activeGame ? GAMES.find(g => g.id === activeGame)?.component : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 relative overflow-hidden pt-20 pb-12 px-4">
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }} />

      {/* Subtle Background Decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        <div className="absolute top-[26%] left-[4%] opacity-[0.15] text-green-400">
          <Smile className="w-24 h-24 filter blur-[0.5px]" />
        </div>
        <div className="absolute bottom-[22%] right-[5%] opacity-[0.15] text-purple-400">
          <Heart className="w-32 h-32 filter blur-[0.5px] fill-purple-500/10" />
        </div>
        <div className="absolute top-[58%] left-[7%] opacity-[0.13] text-pink-400">
          <Sparkles className="w-20 h-20" />
        </div>
        <div className="absolute top-[20%] right-[11%] opacity-[0.12] text-yellow-400">
          <Sun className="w-28 h-28" />
        </div>
        <div className="absolute bottom-[40%] left-[3%] opacity-[0.11] text-emerald-400">
          <Smile className="w-16 h-16" />
        </div>
      </div>

      {/* Score Toast */}
      {toastAmt !== null && <ScoreToast amount={toastAmt} onDone={() => setToastAmt(null)} />}

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4 animate-float animate-pulse-glow">
            <Heart className="w-10 h-10 text-white" fill="white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-3">
            <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Mental Health Support
            </span>
          </h1>
          <p className="text-xl text-gray-300 font-light">A safe space for emotional support and positive guidance</p>
        </div>

        {/* ── REWARDS PANEL ── */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-5 mb-6 backdrop-blur-lg">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Level + Points */}
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${currentLevel.color} flex items-center justify-center text-2xl shadow-lg flex-shrink-0`}>
                {currentLevel.emoji}
              </div>
              <div>
                <p className="text-white font-black text-lg leading-none">{currentLevel.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-yellow-300 font-bold text-xl">{totalPoints}</span>
                  <span className="text-gray-400 text-sm">pts</span>
                </div>
                {nextLevel && (
                  <div className="mt-2 w-48">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>{currentLevel.name}</span>
                      <span>{nextLevel.emoji} {nextLevel.name} ({nextLevel.min})</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className={`h-2 rounded-full bg-gradient-to-r ${currentLevel.color} transition-all duration-500`} style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex gap-3 flex-wrap">
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-center">
                <Zap className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                <p className="text-white font-black text-sm">{totalPoints}</p>
                <p className="text-gray-400 text-xs">Total Pts</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-center">
                <Award className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                <p className="text-white font-black text-sm">{earnedBadges.size}</p>
                <p className="text-gray-400 text-xs">Badges</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-center">
                <Gift className="w-4 h-4 text-pink-400 mx-auto mb-1" />
                <p className="text-white font-black text-sm">{BADGES.length - earnedBadges.size}</p>
                <p className="text-gray-400 text-xs">Left</p>
              </div>
            </div>
          </div>

          {/* Badges row */}
          <div className="mt-4 border-t border-white/10 pt-4">
            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-3 flex items-center gap-2"><Trophy className="w-3.5 h-3.5" /> Badges</p>
            <div className="flex flex-wrap gap-2">
              {BADGES.map(b => {
                const earned = earnedBadges.has(b.id);
                return (
                  <div key={b.id} title={`${b.label}: ${b.desc}`}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${earned ? 'bg-yellow-400/20 border border-yellow-400/40 text-yellow-200' : 'bg-white/5 border border-white/10 text-gray-500 opacity-50'}`}
                  >
                    <span className={earned ? '' : 'grayscale'}>{b.emoji}</span>
                    {b.label}
                    {earned && <span className="text-yellow-400">✓</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" /><span>{error}</span>
          </div>
        )}

        {/* Disclaimer */}
        <div className="glass-effect border-l-4 border-blue-400 p-4 rounded-lg mb-6 flex items-start space-x-3 bg-blue-900/20">
          <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-100">
            This chatbot provides emotional support and encouragement. For professional mental health support,
            please reach out to a licensed therapist or counselor. In crisis, call <strong>988</strong> or text HOME to <strong>741741</strong>.
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white/5 rounded-2xl p-1 mb-6 border border-white/10">
          <button onClick={() => setActiveTab('chat')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === 'chat' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            <Heart className="w-4 h-4" /> Support Chat <span className="ml-1 bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">+5 pts/msg</span>
          </button>
          <button onClick={() => setActiveTab('games')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === 'games' ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            <Gamepad2 className="w-4 h-4" /> Mood-Boost Games
          </button>
        </div>

        {/* ── CHAT TAB ── */}
        {activeTab === 'chat' && (
          <div className="flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-white/10" style={{ height: '560px' }}>
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" fill="white" />
                </div>
                <div>
                  <p className="font-bold text-white">Mental Health Companion</p>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                    <span className="text-xs text-green-100">Always here for you</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-xl">
                <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                <span className="text-white font-black">{totalPoints}</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-900/60 backdrop-blur-lg">
              {messages.map((message, index) => (
                <div key={index} className={`flex items-end gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${message.role === 'bot' ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-teal-500 to-cyan-600'}`}>
                    {message.role === 'bot' ? <Heart className="w-4 h-4 text-white" fill="white" /> : <Sparkles className="w-4 h-4 text-white" />}
                  </div>
                  <div className={`max-w-[80%] p-4 rounded-2xl ${message.role === 'bot' ? 'bg-white/10 text-white rounded-bl-sm border border-white/10' : 'bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-br-sm'}`}>
                    <p className="whitespace-pre-line leading-relaxed text-sm">{message.content}</p>
                    <p className="text-xs opacity-50 mt-1 text-right">{message.timestamp.toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-end gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-white" fill="white" />
                  </div>
                  <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
                    <div className="flex space-x-1">
                      {[0, 0.2, 0.4].map((delay, i) => (
                        <div key={i} className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: `${delay}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 bg-slate-800/80 border-t border-white/10">
              <div className="flex gap-3">
                <input type="text" value={input} onChange={e => setInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSend()}
                  placeholder="Share how you're feeling... (+5 pts)"
                  className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
                <button onClick={handleSend} disabled={!input.trim() || isTyping}
                  className="px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:hover:translate-y-0"
                >
                  {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── GAMES TAB ── */}
        {activeTab === 'games' && (
          <div>
            <div className="text-center mb-5">
              <p className="text-gray-300 text-sm">Play to earn points and unlock badges! ✨</p>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {GAMES.map(game => (
                <button key={game.id} onClick={() => setActiveGame(activeGame === game.id ? null : game.id)}
                  className={`p-4 rounded-2xl border transition-all duration-300 text-left group ${activeGame === game.id ? `bg-gradient-to-br ${game.color} border-transparent shadow-2xl scale-[1.02]` : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'}`}
                >
                  <game.icon className={`w-8 h-8 mb-2 ${activeGame === game.id ? 'text-white' : 'text-gray-300 group-hover:text-white'}`} />
                  <p className={`font-bold text-sm ${activeGame === game.id ? 'text-white' : 'text-gray-200'}`}>{game.label}</p>
                  <p className={`text-xs mt-1 ${activeGame === game.id ? 'text-white/80' : 'text-gray-400'}`}>{game.desc}</p>
                </button>
              ))}
            </div>

            {activeGame && ActiveGameComponent && (
              <div className={`bg-gradient-to-br ${GAMES.find(g => g.id === activeGame)?.color} p-1 rounded-3xl shadow-2xl`}>
                <div className="bg-slate-900/80 backdrop-blur-lg rounded-3xl p-8">
                  <h3 className="text-xl font-black text-white text-center mb-6">
                    {GAMES.find(g => g.id === activeGame)?.label}
                  </h3>
                  <ActiveGameComponent onScore={addPoints} onBadge={unlockBadge} />
                </div>
              </div>
            )}

            {!activeGame && (
              <div className="text-center py-12 border border-white/10 rounded-3xl bg-white/5">
                <Gamepad2 className="w-16 h-16 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400 text-lg font-semibold">Select a game above to start!</p>
                <p className="text-gray-500 text-sm mt-1">Earn points and unlock badges as you play.</p>
              </div>
            )}

            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { emoji: '🌈', text: 'Self-Care Matters', sub: 'You deserve rest & joy' },
                { emoji: '💪', text: 'You Are Strong', sub: 'Every step forward counts' },
                { emoji: '🤗', text: "You're Not Alone", sub: "We're here for you" },
              ].map((aff, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 text-center border border-white/10 hover:bg-white/10 transition-all">
                  <div className="text-3xl mb-2">{aff.emoji}</div>
                  <p className="text-sm font-bold text-white">{aff.text}</p>
                  <p className="text-xs text-gray-400 mt-1">{aff.sub}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
