import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, AlertCircle, FileText, Activity, ListChecks, Upload, CheckCircle2, Sparkles, Loader2, Activity as ActivityIcon } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Message {
  role: 'bot' | 'user';
  content: string;
  timestamp: Date;
}

export default function DiseasePredictor() {
  const [activeTab, setActiveTab] = useState<'symptoms' | 'decoder'>('symptoms');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      content: 'Hello! I\'m your AI Health Assistant. I can help predict possible conditions based on your symptoms. Please describe your symptoms in detail.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scanResult, setScanResult] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const { user } = useAuth();

  const handleSend = async () => {
    if (!input.trim()) return;

    if (!user) {
      const authMessage: Message = {
        role: 'bot',
        content: 'Please login or create an account to use the AI Disease Predictor. This helps us maintain your health history and provide better insights.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, { role: 'user', content: input, timestamp: new Date() }, authMessage]);
      setInput('');
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await api.post('/disease/predict', { symptoms: input });
      const botMessage: Message = {
        role: 'bot',
        content: response.data.prediction,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        role: 'bot',
        content: "I'm sorry, I encountered an error while analyzing your symptoms. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const startScan = async () => {
    if (!selectedFile) return;

    setIsScanning(true);
    setError(null);

    const formData = new FormData();
    formData.append('report', selectedFile);

    try {
      const response = await api.post('/report-decoder/decode-report', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setScanResult(response.data);
    } catch (err: any) {
      console.error('Error scanning report:', err);
      const errorData = err.response?.data;
      const displayError = errorData?.details || errorData?.error || 'Failed to analyze the medical report. Please try again.';
      setError(displayError);

      // If debug info is present, log it specifically
      if (errorData?.debug) {
        console.log('🔍 Debug Info:', errorData.debug);
      }

      setSelectedFile(null);
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden pt-20 pb-12 px-4 bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-blob"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] animate-blob" style={{ animationDelay: '2s' }}></div>

      {/* Subtle Background Decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        <div className="absolute top-[25%] left-[4%] opacity-[0.14] text-blue-400">
          <Bot className="w-48 h-48 filter blur-[0.5px]" />
        </div>
        <div className="absolute bottom-[25%] right-[4%] opacity-[0.13] text-indigo-400">
          <ActivityIcon className="w-40 h-40 filter blur-[0.5px]" />
        </div>
        <div className="absolute top-[60%] left-[8%] opacity-[0.11] text-cyan-400">
          <Sparkles className="w-20 h-20" />
        </div>
        <div className="absolute top-[15%] right-[8%] opacity-[0.12] text-blue-300">
          <FileText className="w-28 h-28" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4 animate-float shadow-lg shadow-blue-500/20">
            <ActivityIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-3">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent animate-text-shimmer">
              AI Health Intelligence
            </span>
          </h1>
          <p className="text-xl text-gray-300 font-light max-w-2xl mx-auto">
            Advanced diagnostics powered by neural networks for a deeper understanding of your well-being.
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="inline-flex glass-effect rounded-full p-1 border border-blue-400/50">
            <button
              onClick={() => setActiveTab('symptoms')}
              className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 group relative overflow-hidden ${activeTab === 'symptoms'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-600/50'
                : 'text-gray-400 hover:text-blue-400'
                }`}
            >
              <div className="flex items-center space-x-2 relative z-10">
                <Activity className="w-5 h-5" />
                <span>Symptom Engine</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('decoder')}
              className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 group relative overflow-hidden ${activeTab === 'decoder'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-600/50'
                : 'text-gray-400 hover:text-blue-400'
                }`}
            >
              <div className="flex items-center space-x-2 relative z-10">
                <FileText className="w-5 h-5" />
                <span>Report Decoder</span>
              </div>
            </button>
          </div>
        </div>

        <div className="mb-8 glass-effect p-4 rounded-2xl border border-blue-500/30 flex items-start space-x-3 bg-blue-500/5 max-w-4xl mx-auto">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-100/80">
            <strong className="text-blue-400 uppercase tracking-tighter">Medical Disclaimer:</strong> Informational guidance only. Not a clinical diagnosis. Consult a professional.
          </div>
        </div>

        {activeTab === 'symptoms' ? (
          <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            {/* Chat History Container */}
            <div className="glass-effect rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-[500px] border border-white/5 bg-slate-900/40 backdrop-blur-xl">
              <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex items-start space-x-4 animate-slide-in ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${message.role === 'bot'
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                      : 'bg-gradient-to-br from-emerald-500 to-teal-600'}`}>
                      {message.role === 'bot' ? <Bot className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-white" />}
                    </div>
                    <div className={`max-w-[80%] p-5 rounded-2xl border ${message.role === 'bot'
                      ? 'bg-white/5 border-white/10 text-white'
                      : 'bg-blue-600/10 border-blue-500/30 text-blue-50'}`}>
                      <p className="whitespace-pre-line leading-relaxed text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex items-start space-x-4 animate-slide-in">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="p-4 rounded-2xl glass-effect border border-blue-500/30">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Centered Input Area - MATCHES BLOOD DONOR SEARCH BOX LOOK */}
            <div className="glass-effect rounded-3xl shadow-2xl p-8 border border-blue-500/30">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <Activity className="w-6 h-6 mr-3 text-blue-400" />
                Symptom Pulse Analysis
              </h2>
              <div className="space-y-6">
                <div className="relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Describe your symptoms in detail (e.g., headache for 2 days, mild fever)..."
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white min-h-[120px] resize-none placeholder-gray-500"
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-blue-600/40 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-3 disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                  <span>Predict Condition</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
            {!scanResult && !isScanning && (
              <div className="glass-effect rounded-3xl shadow-2xl p-12 border border-blue-500/30 text-center">
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`group h-[350px] rounded-[2rem] border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center space-y-6 ${dragActive ? 'border-blue-400 bg-blue-400/10 scale-[0.98]' : 'border-white/10 hover:border-blue-500/50 hover:bg-white/5'}`}
                >
                  <div className={`w-24 h-24 rounded-2xl bg-blue-500/10 flex items-center justify-center transition-all duration-500 ${selectedFile ? 'bg-emerald-500/10' : ''}`}>
                    {selectedFile ? (
                      <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                    ) : (
                      <Upload className="w-12 h-12 text-blue-400 group-hover:animate-bounce" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {selectedFile ? 'Report Locked' : 'Secure Document Drop'}
                    </h3>
                    <p className="text-gray-400">
                      {selectedFile ? selectedFile.name : 'PDF, JPG, or PNG (Max 5MB)'}
                    </p>
                  </div>
                  <div className="flex flex-col items-center space-y-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={onFileChange}
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    {!selectedFile ? (
                      <button
                        onClick={handleFileClick}
                        className="px-10 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold border border-white/10 transition-all flex items-center space-x-3"
                      >
                        <FileText className="w-5 h-5 text-blue-400" />
                        <span>Select File</span>
                      </button>
                    ) : (
                      <button
                        onClick={startScan}
                        className="px-16 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-600/40 hover:shadow-2xl transition-all flex items-center space-x-3 group/btn"
                      >
                        <ActivityIcon className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                        <span>Scan Report</span>
                      </button>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="mt-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center space-x-3 animate-shake max-w-md mx-auto relative z-20">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}
              </div>
            )}

            {isScanning && (
              <div className="h-[400px] rounded-[2.5rem] glass-effect border border-blue-500/30 flex flex-col items-center justify-center overflow-hidden relative shadow-2xl mx-auto max-w-4xl">
                <div className="absolute inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-blue-400 to-transparent top-0 animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_20px_blue]"></div>
                <div className="relative mb-8">
                  <div className="absolute -inset-4 bg-blue-500/20 rounded-full blur-2xl animate-pulse"></div>
                  <Loader2 className="w-16 h-16 text-blue-400 animate-spin relative z-10" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2 tracking-widest uppercase">Analyzing Data</h3>
                <p className="text-blue-400/80 font-mono text-xs animate-pulse">Accessing Neural Diagnostic Core...</p>
              </div>
            )}

            {scanResult && (
              <div className="space-y-8 animate-slide-up">
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Summary */}
                  <div className="lg:col-span-1 rounded-3xl glass-effect border border-white/10 p-8 flex flex-col bg-slate-900/40 shadow-xl">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-3 rounded-xl bg-emerald-500/10">
                        <Sparkles className="w-6 h-6 text-emerald-400" />
                      </div>
                      <h3 className="text-lg font-bold text-white uppercase tracking-tight">Plain Speech</h3>
                    </div>
                    <p className="flex-1 text-gray-300 leading-relaxed italic border-l-2 border-emerald-500/30 pl-4">
                      "{scanResult.summary}"
                    </p>
                  </div>

                  {/* Findings */}
                  <div className="lg:col-span-2 rounded-3xl glass-effect border border-white/10 p-8 flex flex-col bg-slate-900/40 shadow-xl">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-3 rounded-xl bg-blue-500/10">
                        <Activity className="w-6 h-6 text-blue-400" />
                      </div>
                      <h3 className="text-lg font-bold text-white uppercase tracking-tight">Clinical findings</h3>
                    </div>
                    <div className="space-y-4">
                      {scanResult.findings.map((finding: any, i: number) => (
                        <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-3 mb-1">
                              <span className="font-bold text-white">{finding.title}</span>
                              <span className={`px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${finding.level === 'high' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                                finding.level === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                  'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                }`}>
                                {finding.level}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">{finding.note}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-black text-white">{finding.value}</div>
                            <div className="text-[10px] text-gray-500 uppercase font-black">Normal: {finding.normal}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Doc Guide */}
                <div className="rounded-[2.5rem] glass-effect border border-blue-500/20 p-10 flex flex-col bg-blue-600/5 shadow-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                        <ListChecks className="w-8 h-8 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">Physician Bridge</h3>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Suggested queries for your session</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setScanResult(null);
                        setSelectedFile(null);
                      }}
                      className="px-8 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white text-xs border border-white/10 font-black uppercase tracking-widest transition-all"
                    >
                      Reset Module
                    </button>
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                    {scanResult.discussion.map((item: string, i: number) => (
                      <div key={i} className="flex flex-col space-y-4 p-6 rounded-[2rem] bg-slate-950/40 border border-white/5 hover:border-blue-500/40 transition-all group">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-black text-lg group-hover:bg-blue-500 group-hover:text-white transition-all">
                          {i + 1}
                        </div>
                        <p className="text-white font-medium leading-relaxed">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
