import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { onboardingAssistant } from '../services/onboardingAssistant.js';
import { supabase } from '../lib/supabase.js';

export default function ScrapeModal({ onClose }) {
  const [url, setUrl] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [status, setStatus] = useState('queued'); // queued, scraping_site, extracting_profile, etc
  const [error, setError] = useState(null);
  const [draftId, setDraftId] = useState(null);

  // Status mapping for progress bar
  const statusWeight = {
    'queued': 5,
    'scraping_site': 25,
    'extracting_profile': 50,
    'generating_settings': 75,
    'building_response_library': 90,
    'review_ready': 100,
    'failed': 0
  };

  const statusLabels = {
    'queued': 'Queueing request...',
    'scraping_site': 'Firecrawl deep crawling site...',
    'extracting_profile': 'Gemini analyzing business logic...',
    'generating_settings': 'Synthesizing configuration...',
    'building_response_library': 'Drafting AI response library...',
    'review_ready': 'Draft complete!',
    'failed': 'Scrape failed'
  };

  const handleStart = async (e) => {
    e.preventDefault();
    setIsScraping(true);
    setError(null);
    
    const result = await onboardingAssistant.startScrape(companyName, url, (newStatus) => {
      setStatus(newStatus);
    });

    if (result.success) {
      setDraftId(result.draftId);
    } else {
      setError(result.error);
      setStatus('failed');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pb-20">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#060e20]/80 backdrop-blur-xl"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl bg-[#091328] border border-white/10 rounded-[3rem] p-12 shadow-2xl overflow-hidden"
      >
        {/* Background Glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-indigo-500/10 blur-[100px] rounded-full" />
        
        {!isScraping ? (
          <form onSubmit={handleStart} className="space-y-8 relative z-10">
            <div className="flex items-center gap-4 mb-2">
               <span className="material-symbols-outlined text-amber-500 bg-amber-500/10 p-3 rounded-2xl">magic_button</span>
               <div>
                  <h3 className="text-2xl font-headline font-black text-white tracking-tight">New Drafting Assistant</h3>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Enter a URL to pre-fill an onboarding draft</p>
               </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Company Name</label>
                <input 
                  required
                  type="text" 
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="e.g. Zenova Plumbing"
                  className="w-full bg-[#060e20] border border-white/5 rounded-2xl py-5 px-6 text-sm text-white outline-none focus:border-indigo-500/50 transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Website URL (Deep Crawl)</label>
                <input
                  required
                  type="text"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onBlur={e => {
                    const val = e.target.value.trim();
                    if (val && !/^https?:\/\//i.test(val)) setUrl('https://' + val);
                  }}
                  placeholder="www.example.com"
                  className="w-full bg-[#060e20] border border-white/5 rounded-2xl py-5 px-6 text-sm text-white outline-none focus:border-indigo-500/50 transition-all font-medium"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
               <button 
                 type="button"
                 onClick={onClose}
                 className="flex-1 px-8 py-5 border border-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-white/5 transition-all"
               >
                 Cancel
               </button>
               <button 
                 type="submit"
                 className="flex-[2] px-8 py-5 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-500/20"
               >
                 Start Extraction
               </button>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-10 py-10 relative z-10">
            <div className="relative inline-block">
               <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto" />
               <span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl text-indigo-400 animate-pulse">psychology</span>
            </div>

            <div className="space-y-3">
               <h4 className="text-xl font-headline font-black text-white tracking-tight uppercase tracking-[0.1em]">{statusLabels[status]}</h4>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Master Admin Drafting Assistant is Active</p>
            </div>

            <div className="space-y-4">
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${statusWeight[status]}%` }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-amber-500"
                />
              </div>
              <div className="flex justify-between text-[9px] font-black text-slate-600 uppercase tracking-widest">
                <span>Phase: Extraction</span>
                <span>{statusWeight[status]}% Complete</span>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-[10px] font-bold">
                ⚠️ {error}
              </div>
            )}

            {status === 'review_ready' && (
              <button 
                onClick={onClose}
                className="w-full px-8 py-5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20"
              >
                Go to Draft List
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
