import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { createManualDraft, updateDraftStatus } from '../../lib/queries'
import { motion, AnimatePresence } from 'framer-motion'
import ScrapeModal from '../ScrapeModal.jsx'

export default function DraftsManager() {
  const [drafts, setDrafts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showScrapeModal, setShowScrapeModal] = useState(false)
  const [showManualForm, setShowManualForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [manualData, setManualData] = useState({
    business_name: '',
    owner_name: '',
    industry: '',
    business_phone: '',
    business_email: '',
    website_url: '',
    service_area_text: '',
    review_notes: ''
  })

  useEffect(() => {
    async function loadDrafts() {
      const { data } = await supabase
        .from('onboarding_drafts')
        .select('*')
        .in('draft_status', ['Draft', 'Needs Review', 'Ready for Onboarding'])
        .order('created_at', { ascending: false });
      setDrafts(data || []);
      setLoading(false);
    }
    loadDrafts();

    const channel = supabase
      .channel('onboarding_drafts_manager')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'onboarding_drafts' }, payload => {
        setDrafts(prev => {
          if (payload.eventType === 'INSERT') return [payload.new, ...prev];
          if (payload.eventType === 'UPDATE') return prev.map(d => d.id === payload.new.id ? payload.new : d);
          if (payload.eventType === 'DELETE') return prev.filter(d => d.id !== payload.old.id);
          return prev;
        });
      })
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, [])

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createManualDraft(manualData);
      setShowManualForm(false);
      setManualData({ business_name: '', owner_name: '', industry: '', business_phone: '', business_email: '', website_url: '', service_area_text: '', review_notes: '' });
    } catch (err) {
      console.error('Manual draft error:', err);
      alert('Failed to create manual draft');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) return <div className="text-slate-500 font-black uppercase text-[10px] animate-pulse">Loading Drafts...</div>

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <div className="flex justify-between items-center bg-[#091328]/30 backdrop-blur-md p-8 rounded-[3rem] border border-white/5">
        <div>
           <h2 className="text-3xl font-headline font-black text-white tracking-tight">Draft Intake</h2>
           <p className="text-[11px] text-slate-500 uppercase font-black tracking-widest mt-2">Manage incoming leads and scraper results</p>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={() => setShowManualForm(true)}
             className="px-8 py-4 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all flex items-center gap-2"
           >
              <span className="material-symbols-outlined text-sm">person_add</span>
              Manual Entry
           </button>
           <button 
             onClick={() => setShowScrapeModal(true)}
             className="px-8 py-4 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2"
           >
              <span className="material-symbols-outlined text-sm">search</span>
              New Scrape
           </button>
        </div>
      </div>

      <div className="bg-[#091328]/50 rounded-[3rem] p-10 border border-white/5 shadow-2xl">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="border-b border-white/5">
                     <th className="pb-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-4">Business</th>
                     <th className="pb-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Source</th>
                     <th className="pb-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Status</th>
                     <th className="pb-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Next Action</th>
                     <th className="pb-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] text-right pr-4">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {drafts.length > 0 ? drafts.map(draft => (
                     <tr key={draft.id} className="group hover:bg-white/5 transition-all">
                        <td className="py-6 pl-4">
                           <div className="font-bold text-white uppercase text-xs">{draft.business_name}</div>
                           <div className="text-[10px] text-slate-500 mt-1">{draft.business_email || 'No email provided'}</div>
                        </td>
                        <td className="py-6">
                           <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${draft.is_manual ? 'bg-amber-500/10 text-amber-500' : 'bg-indigo-500/10 text-indigo-400'}`}>
                              {draft.is_manual ? 'Manual' : 'Scraped'}
                           </span>
                        </td>
                        <td className="py-6">
                           <span className="text-[10px] font-black uppercase text-white bg-white/5 border border-white/5 px-3 py-1 rounded-lg">
                              {draft.draft_status}
                           </span>
                        </td>
                        <td className="py-6">
                           <span className="text-[10px] font-bold text-slate-400">
                              {draft.draft_status === 'Needs Review' ? 'Review scraped data' : 
                               draft.draft_status === 'Draft' ? 'Add contact info' : 'Start onboarding'}
                           </span>
                        </td>
                        <td className="py-6 text-right pr-4 space-x-3">
                           <button className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Edit</button>
                           <button className="px-6 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-indigo-500 hover:text-white transition-all shadow-lg">Start Onboarding</button>
                        </td>
                     </tr>
                  )) : (
                     <tr>
                        <td colSpan="5" className="py-20 text-center text-slate-500 text-[10px] font-black uppercase tracking-widest opacity-30">No drafts in the pipeline</td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

      <AnimatePresence>
        {showManualForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-24 bg-[#020617]/90 backdrop-blur-2xl">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="w-full max-w-4xl bg-[#091328] rounded-[3.5rem] border border-white/10 shadow-3xl overflow-hidden flex flex-col max-h-full"
            >
               <div className="p-12 space-y-10 overflow-y-auto pr-8 custom-scrollbar">
                  <div className="flex justify-between items-start">
                     <div>
                        <h3 className="text-3xl font-headline font-black text-white tracking-tight">Add Client Manually</h3>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Initialize a new client without scraping</p>
                     </div>
                     <button onClick={() => setShowManualForm(false)} className="material-symbols-outlined text-slate-500 hover:text-white transition-colors">close</button>
                  </div>

                  <form onSubmit={handleManualSubmit} className="grid md:grid-cols-2 gap-8">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest block pl-2">Business Name</label>
                        <input 
                           required
                           className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-amber-500 transition-all font-bold"
                           value={manualData.business_name}
                           onChange={e => setManualData({...manualData, business_name: e.target.value})}
                        />
                     </div>
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest block pl-2">Owner / Contact Name</label>
                        <input 
                           className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-amber-500 transition-all font-bold"
                           value={manualData.owner_name}
                           onChange={e => setManualData({...manualData, owner_name: e.target.value})}
                        />
                     </div>
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest block pl-2">Industry / Niche</label>
                        <input 
                           className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-amber-500 transition-all font-bold"
                           value={manualData.industry}
                           onChange={e => setManualData({...manualData, industry: e.target.value})}
                        />
                     </div>
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest block pl-2">Business Email</label>
                        <input 
                           required
                           type="email"
                           className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-amber-500 transition-all font-bold"
                           value={manualData.business_email}
                           onChange={e => setManualData({...manualData, business_email: e.target.value})}
                        />
                     </div>
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest block pl-2">Business Phone</label>
                        <input 
                           className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-amber-500 transition-all font-bold"
                           value={manualData.business_phone}
                           onChange={e => setManualData({...manualData, business_phone: e.target.value})}
                        />
                     </div>
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest block pl-2">Website (Optional)</label>
                        <input 
                           className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-amber-500 transition-all font-bold"
                           value={manualData.website_url}
                           onChange={e => setManualData({...manualData, website_url: e.target.value})}
                        />
                     </div>
                     <div className="md:col-span-2 space-y-4">
                        <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest block pl-2">Service Area / Notes</label>
                        <textarea 
                           className="w-full bg-white/5 border border-white/10 rounded-3xl p-5 text-white outline-none focus:border-amber-500 transition-all font-bold h-32"
                           value={manualData.review_notes}
                           onChange={e => setManualData({...manualData, review_notes: e.target.value})}
                        />
                     </div>

                     <div className="md:col-span-2 flex justify-end pt-8">
                        <button 
                           disabled={isSubmitting}
                           className="px-12 py-5 bg-amber-500 text-white font-black uppercase tracking-widest rounded-3xl hover:bg-amber-600 transition-all shadow-2xl shadow-amber-500/20 disabled:opacity-50"
                        >
                           {isSubmitting ? 'Creating' : 'Save Draft'}
                        </button>
                     </div>
                  </form>
               </div>
            </motion.div>
          </div>
        )}

        {showScrapeModal && (
          <ScrapeModal onClose={() => setShowScrapeModal(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
