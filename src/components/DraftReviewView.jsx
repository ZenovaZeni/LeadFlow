import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DraftReviewView({ draft, onClose, onActivate }) {
  // Merge the top-level draft info with the rich scrape_data
  const [editedDraft, setEditedDraft] = useState({
    ...draft,
    ...(draft.scrape_data || {})
  });
  const [isActivating, setIsActivating] = useState(false);
  const [activeSection, setActiveSection] = useState('basics');

  const handleFieldChange = (field, value) => {
    setEditedDraft(prev => ({ ...prev, [field]: value }));
  };

  const handleActivate = async () => {
    if (!editedDraft.business_email) {
      alert('A business email is required to create the client account.');
      return;
    }

    setIsActivating(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/api/admin/create-client`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft: { ...editedDraft, id: draft.id } })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Activation failed');

      onActivate();
    } catch (err) {
      console.error('Activation Error:', err);
      alert(`Failed to activate client: ${err.message}`);
    } finally {
      setIsActivating(false);
    }
  };

  const sections = [
    { id: 'basics', label: 'Basics', icon: 'info' },
    { id: 'services', label: 'Services', icon: 'work' },
    { id: 'tone', label: 'Tone & Logic', icon: 'psychology' },
    { id: 'knowledge', label: 'Knowledge Base', icon: 'library_books' }
  ];

  return (
    <div className="fixed inset-0 z-[110] flex items-end md:items-center justify-center p-0 md:p-6 pb-0">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#060e20]/90 backdrop-blur-2xl"
      />
      
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full max-w-5xl h-[90vh] bg-[#091328] border-t md:border border-white/10 rounded-t-[3rem] md:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center shrink-0">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                <span className="material-symbols-outlined">description</span>
              </div>
              <div>
                <h3 className="text-xl font-headline font-black text-white">{editedDraft.business_name}</h3>
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Master Admin Review Assistant</p>
              </div>
           </div>
           
           <div className="flex items-center gap-4">
              <button 
                onClick={onClose}
                className="p-4 text-slate-500 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
              <button 
                disabled={isActivating || editedDraft.draft_status === 'activated'}
                onClick={handleActivate}
                className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                  editedDraft.draft_status === 'activated' 
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                  : 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-xl shadow-indigo-500/20'
                }`}
              >
                {isActivating ? 'Activating...' : editedDraft.draft_status === 'activated' ? 'Already Active' : 'Approve & Activate'}
              </button>
           </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
           {/* Sidebar */}
           <div className="w-64 border-r border-white/5 p-6 space-y-2 shrink-0 hidden md:block">
              {sections.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${
                    activeSection === s.id ? 'bg-white/5 text-amber-500 border border-white/10' : 'text-slate-500 hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{s.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span>
                </button>
              ))}
           </div>

           {/* Content */}
           <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
              <div className="max-w-3xl space-y-12">
                 {activeSection === 'basics' && (
                   <div className="space-y-8">
                      <div className="grid grid-cols-2 gap-6">
                         {[
                           { label: 'Business Name', field: 'business_name' },
                           { label: 'Website URL', field: 'website_url' },
                           { label: 'Business Phone', field: 'business_phone' },
                           { label: 'Business Email', field: 'business_email' },
                           { label: 'City', field: 'city' },
                           { label: 'State', field: 'state' }
                         ].map(item => (
                           <div key={item.field} className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">{item.label}</label>
                              <input 
                                type="text"
                                value={editedDraft[item.field] || ''}
                                onChange={e => handleFieldChange(item.field, e.target.value)}
                                className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-xs text-white outline-none focus:border-indigo-500"
                              />
                           </div>
                         ))}
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Business Summary</label>
                        <textarea 
                          rows={4}
                          value={editedDraft.short_business_summary || ''}
                          onChange={e => handleFieldChange('short_business_summary', e.target.value)}
                          className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-xs text-white outline-none focus:border-indigo-500"
                        />
                      </div>
                   </div>
                 )}

                 {activeSection === 'services' && (
                   <div className="space-y-8">
                      <div className="grid grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Industry</label>
                            <input type="text" value={editedDraft.industry || ''} className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-xs" />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Sub-Industry</label>
                            <input type="text" value={editedDraft.sub_industry || ''} className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-xs" />
                         </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Services Offered (Detected)</label>
                        <div className="flex flex-wrap gap-2 pt-2">
                           {editedDraft.services_offered?.map(s => (
                             <span key={s} className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg text-[10px] font-bold">
                               {s}
                             </span>
                           ))}
                        </div>
                      </div>
                   </div>
                 )}

                 {activeSection === 'tone' && (
                   <div className="space-y-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Brand Tone</label>
                        <select 
                          value={editedDraft.brand_tone || 'professional'}
                          onChange={e => handleFieldChange('brand_tone', e.target.value)}
                          className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-xs"
                        >
                           {['professional', 'friendly', 'premium', 'no-nonsense', 'local'].map(t => (
                             <option key={t} value={t}>{t}</option>
                           ))}
                        </select>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Suggested Responses</h4>
                        {[
                          { label: 'Missed Call', field: 'missed_call_message' },
                          { label: 'After Hours', field: 'after_hours_message' },
                          { label: 'Booking Prompt', field: 'booking_prompt' }
                        ].map(item => (
                          <div key={item.field} className="space-y-2">
                             <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{item.label}</label>
                             <textarea 
                               rows={2}
                               value={editedDraft[item.field] || ''}
                               onChange={e => handleFieldChange(item.field, e.target.value)}
                               className="w-full bg-white/3 border border-white/5 rounded-xl p-3 text-xs italic"
                             />
                          </div>
                        ))}
                      </div>
                   </div>
                 )}
                 
                 {/* Logic for more sections... */}
              </div>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
