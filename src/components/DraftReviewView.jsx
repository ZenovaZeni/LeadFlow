import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AIPlayground from './AIPlayground';

export default function DraftReviewView({ draft, onClose, onActivate }) {
  // Merge the top-level draft info with the rich scrape_data
  const [editedDraft, setEditedDraft] = useState({
    ...draft,
    ...(draft.scrape_data || {})
  });
  const [isActivating, setIsActivating] = useState(false);
  const [activatedBusinessId, setActivatedBusinessId] = useState(null);
  const [activeSection, setActiveSection] = useState('basics');
  const [showPlayground, setShowPlayground] = useState(false);

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
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/admin/create-client`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft: { ...editedDraft, id: draft.id } })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Activation failed');

      setActivatedBusinessId(result.businessId);
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
              {activatedBusinessId || editedDraft.draft_status === 'activated' ? (
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span> Activated
                  </span>
                  <a
                    href="/app"
                    target="_blank"
                    rel="noreferrer"
                    className="px-6 py-4 bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span> View Dashboard
                  </a>
                </div>
              ) : (
                <button
                  disabled={isActivating}
                  onClick={handleActivate}
                  className="px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all bg-indigo-500 text-white hover:bg-indigo-600 shadow-xl shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isActivating ? (
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span> Activating...
                    </span>
                  ) : 'Approve & Activate'}
                </button>
              )}
              <button 
                onClick={() => setShowPlayground(true)}
                className="px-6 py-4 bg-[#060e20] border border-white/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-500 hover:text-white transition-all shadow-xl flex items-center gap-2 group"
              >
                <span className="material-symbols-outlined text-[14px] group-hover:animate-pulse">psychology</span>
                Test AI Response
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
                 
                 {activeSection === 'knowledge' && (
                   <div className="space-y-12">
                     {/* Qualification Questions */}
                     <div className="space-y-4">
                       <div className="flex items-center justify-between">
                         <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Qualification Questions</h4>
                         <button
                           onClick={() => handleFieldChange('qualification_questions', [...(editedDraft.qualification_questions || []), ''])}
                           className="flex items-center gap-1 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all"
                         >
                           <span className="material-symbols-outlined text-[12px]">add</span> Add
                         </button>
                       </div>
                       <div className="space-y-3">
                         {(editedDraft.qualification_questions || []).map((q, i) => (
                           <div key={i} className="flex items-center gap-3">
                             <span className="text-[10px] font-black text-slate-600 w-5 shrink-0">{i + 1}.</span>
                             <input
                               type="text"
                               value={q}
                               onChange={e => {
                                 const updated = [...editedDraft.qualification_questions];
                                 updated[i] = e.target.value;
                                 handleFieldChange('qualification_questions', updated);
                               }}
                               className="flex-1 bg-white/5 border border-white/5 rounded-xl p-3 text-xs text-white outline-none focus:border-indigo-500"
                             />
                             <button
                               onClick={() => handleFieldChange('qualification_questions', editedDraft.qualification_questions.filter((_, idx) => idx !== i))}
                               className="p-2 text-slate-600 hover:text-rose-400 transition-colors"
                             >
                               <span className="material-symbols-outlined text-[14px]">close</span>
                             </button>
                           </div>
                         ))}
                         {!(editedDraft.qualification_questions?.length) && (
                           <p className="text-[11px] text-slate-600 italic">No qualification questions extracted. Add some above.</p>
                         )}
                       </div>
                     </div>

                     {/* Handoff Keywords */}
                     <div className="space-y-4">
                       <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Escalation Keywords</h4>
                       <p className="text-[10px] text-slate-600">If a lead says any of these words, the AI will flag for human takeover.</p>
                       <div className="flex flex-wrap gap-2">
                         {(editedDraft.handoff_keywords || []).map((kw, i) => (
                           <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-[10px] font-bold">
                             {kw}
                             <button onClick={() => handleFieldChange('handoff_keywords', editedDraft.handoff_keywords.filter((_, idx) => idx !== i))}>
                               <span className="material-symbols-outlined text-[11px]">close</span>
                             </button>
                           </span>
                         ))}
                         <input
                           type="text"
                           placeholder="+ add keyword"
                           className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-[10px] text-white outline-none focus:border-rose-500/50 placeholder:text-slate-600 w-32"
                           onKeyDown={e => {
                             if (e.key === 'Enter' && e.target.value.trim()) {
                               handleFieldChange('handoff_keywords', [...(editedDraft.handoff_keywords || []), e.target.value.trim()]);
                               e.target.value = '';
                             }
                           }}
                         />
                       </div>
                     </div>

                     {/* FAQ Entries */}
                     <div className="space-y-4">
                       <div className="flex items-center justify-between">
                         <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">FAQ Entries</h4>
                         <button
                           onClick={() => handleFieldChange('faq_entries', [...(editedDraft.faq_entries || []), { question: '', answer: '' }])}
                           className="flex items-center gap-1 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all"
                         >
                           <span className="material-symbols-outlined text-[12px]">add</span> Add
                         </button>
                       </div>
                       <div className="space-y-4">
                         {(editedDraft.faq_entries || []).map((faq, i) => (
                           <div key={i} className="bg-white/3 border border-white/5 rounded-2xl p-5 space-y-3 relative">
                             <button
                               onClick={() => handleFieldChange('faq_entries', editedDraft.faq_entries.filter((_, idx) => idx !== i))}
                               className="absolute top-4 right-4 p-1 text-slate-600 hover:text-rose-400 transition-colors"
                             >
                               <span className="material-symbols-outlined text-[14px]">close</span>
                             </button>
                             <div className="space-y-1.5">
                               <label className="text-[9px] font-black uppercase text-slate-600 tracking-widest">Question</label>
                               <input
                                 type="text"
                                 value={faq.question || ''}
                                 onChange={e => {
                                   const updated = [...editedDraft.faq_entries];
                                   updated[i] = { ...updated[i], question: e.target.value };
                                   handleFieldChange('faq_entries', updated);
                                 }}
                                 className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-xs text-white outline-none focus:border-indigo-500"
                               />
                             </div>
                             <div className="space-y-1.5">
                               <label className="text-[9px] font-black uppercase text-slate-600 tracking-widest">Answer</label>
                               <textarea
                                 rows={2}
                                 value={faq.answer || ''}
                                 onChange={e => {
                                   const updated = [...editedDraft.faq_entries];
                                   updated[i] = { ...updated[i], answer: e.target.value };
                                   handleFieldChange('faq_entries', updated);
                                 }}
                                 className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-xs text-white outline-none focus:border-indigo-500 resize-none"
                               />
                             </div>
                           </div>
                         ))}
                         {!(editedDraft.faq_entries?.length) && (
                           <p className="text-[11px] text-slate-600 italic">No FAQs extracted. Add some above.</p>
                         )}
                       </div>
                     </div>

                     {/* Raw Source Data */}
                     <div className="space-y-4">
                       <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Raw Source Data</h4>
                       <pre className="bg-black/30 border border-white/5 rounded-2xl p-6 text-[10px] text-slate-400 overflow-x-auto whitespace-pre-wrap leading-relaxed font-mono max-h-64 overflow-y-auto custom-scrollbar">
                         {JSON.stringify(editedDraft.scrape_data || {}, null, 2)}
                       </pre>
                     </div>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showPlayground && (
          <AIPlayground 
            config={{
              businessName: editedDraft.business_name,
              services: editedDraft.services_offered,
              tone: editedDraft.brand_tone,
              bio: editedDraft.short_business_summary,
              customRules: editedDraft.hard_response_rules?.join('\n')
            }}
            onClose={() => setShowPlayground(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
