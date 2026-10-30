'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Cpu, Zap, ShieldCheck, Terminal } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function SupremeDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'standard' | 'advanced'>('standard');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Replace with your actual live public Render Web Service HTTPS URL
  const RENDER_BACKEND_URL = 'https://supreme-ai-uziz.onrender.com';

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userPrompt = input;
    setInput('');
    setLoading(true);

    // Append user query and prepare an empty animated node for incoming AI stream chunks
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: userPrompt },
      { role: 'assistant', content: '' }
    ]);

    try {
      const response = await fetch(RENDER_BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          mode: mode,
          max_tokens: 1024,
          temperature: 0.7
        })
      });

      if (!response.ok) throw new Error('Render service offline.');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const tokenChunk = decoder.decode(value);

        setMessages((prev) => {
          const updated = [...prev];
          if (updated.length > 0) {
            updated[updated.length - 1].content += tokenChunk;
          }
          return updated;
        });
      }
    } catch (err: any) {
      setMessages((prev) => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[updated.length - 1].content = `[System Core Error]: Connection dropped. ${err.message}`;
        }
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden relative">
      {/* Background Radial Ambiance */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div class="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div class="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-[120px]" />
      </div>

      {/* Main Structural Interface layout Container */}
      <div className="flex flex-col flex-grow max-w-5xl mx-auto w-full h-full p-4 md:p-6 relative z-10 justify-between">
        
        {/* Animated App Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center border-b border-slate-800/80 pb-4 backdrop-blur-md"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-md font-black tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">SUPREME AI</h1>
              <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Cloud Instance Router Active
              </p>
            </div>
          </div>

          {/* Mode Pill Toggle with sliding Spring Background */}
          <div className="flex bg-slate-900/90 border border-slate-800 p-1 rounded-xl relative shadow-inner">
            {(['standard', 'advanced'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`relative px-4 py-2 text-xs font-bold capitalize rounded-lg transition-colors duration-200 z-10 ${mode === m ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {m === 'standard' ? <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Standard</span> : <span className="flex items-center gap-1"><Terminal className="w-3 h-3" /> Advanced</span>}
                {mode === m && (
                  <motion.div
                    layoutId="activeCloudTab"
                    className="absolute inset-0 bg-indigo-600 rounded-lg -z-10 shadow-lg shadow-indigo-600/30"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </motion.header>

        {/* Messaging Area Canvas Container */}
        <main className="flex-grow overflow-y-auto my-6 space-y-4 pr-2 scrollbar-thin select-text">
          <AnimatePresence initial={false}>
            {messages.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 0.6, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center mt-20"
              >
                <div class="w-14 h-14 rounded-2xl border border-slate-800 flex items-center justify-center mb-4 bg-slate-900/40">
                  <ShieldCheck className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 class="text-md font-bold text-white tracking-wide">Secure Global Endpoint</h3>
                <p class="text-xs max-w-xs mt-1 text-slate-400">Your chat directives are processed securely through Render and routed directly to free-tier cloud processing layers.</p>
              </motion.div>
            ) : (
              messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', duration: 0.4 }}
                  className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] border rounded-2xl px-4 py-3 shadow-xl backdrop-blur-md ${msg.role === 'user' ? 'bg-indigo-600/10 border-indigo-500/20 text-indigo-100' : 'bg-slate-900/40 border-slate-800/60 text-slate-100'}`}>
                    <p className="text-[10px] font-bold tracking-widest uppercase opacity-40 mb-1">{msg.role === 'user' ? 'You' : 'Supreme Engine'}</p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content || (loading && i === messages.length - 1 ? '▮' : '')}</p>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </main>

        {/* Input Interactive Form Footer */}
        <motion.footer 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-slate-800/80 bg-slate-900/30 p-2 rounded-2xl backdrop-blur-md shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={loading ? "Supreme processing system queue stream..." : "Send data prompt execution down the wire..."}
              disabled={loading}
              className="flex-grow bg-transparent px-3 py-2.5 outline-none text-sm placeholder-slate-500 text-white disabled:opacity-40"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading || !input.trim()}
              type="submit"
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white disabled:from-slate-800 disabled:to-slate-800 p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center disabled:cursor-not-allowed shadow-md"
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </form>
        </motion.footer>
      </div>
    </div>
  );
}
