import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIPlayground({ config, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: `Hi! This is the AI simulator for ${config.businessName}. You can type a message as if you were a lead to see how I'd respond.` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/admin/test-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, config })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to get response');

      setMessages(prev => [...prev, { role: 'assistant', text: result.response }]);
    } catch (err) {
      console.error('Test AI Error:', err);
      setMessages(prev => [...prev, { role: 'assistant', text: `Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-end md:items-center justify-end md:p-6 pb-0">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full max-w-lg h-[90vh] md:h-[600px] bg-[#091328] border-l md:border border-white/10 rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/3 shrink-0">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white">
                <span className="material-symbols-outlined">psychology</span>
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-tight">AI Simulator</h3>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Testing: {config.businessName}</p>
              </div>
           </div>
           <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
             <span className="material-symbols-outlined">close</span>
           </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[#060e20]/50">
           {messages.map((m, i) => (
             <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed shadow-lg ${
                  m.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-white/5 border border-white/10 text-slate-300 rounded-bl-none'
                }`}>
                  {m.text}
                </div>
             </div>
           ))}
           {loading && (
             <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-bl-none animate-pulse flex gap-2">
                   <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
                   <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                   <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
             </div>
           )}
        </div>

        {/* Input */}
        <div className="p-6 border-t border-white/5 bg-white/3">
           <form onSubmit={handleSend} className="relative">
              <input 
                type="text"
                placeholder="Type a test message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={loading}
                className="w-full bg-[#060e20] border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-xs text-white outline-none focus:border-indigo-500/50 transition-all"
              />
              <button 
                type="submit"
                disabled={!input.trim() || loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 disabled:opacity-50 disabled:grayscale transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
           </form>
           <p className="text-[9px] text-center text-slate-600 mt-4 uppercase tracking-[0.2em] font-black">
             Live GTM Simulation Protocol
           </p>
        </div>
      </motion.div>
    </div>
  );
}
