import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabase.js'
import { saveDraftStep, activateClient } from '../../lib/queries.js'

const STEPS = [
  { id: 1, title: 'Identity', icon: 'badge' },
  { id: 2, title: 'Context', icon: 'psychology' },
  { id: 3, title: 'AI Rules', icon: 'neurology' },
  { id: 4, title: 'Setup', icon: 'settings_input_component' },
  { id: 5, title: 'Ready', icon: 'verified' },
  { id: 6, title: 'Launch', icon: 'rocket_launch' }
]

export default function OnboardingWizard({ draftId, draftObject, onBack }) {
  const [currentStep, setCurrentStep] = useState(draftObject?.onboarding_step || 1)
  const [draftData, setDraftData] = useState(draftObject || null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadDraft() {
      if (!draftId) return;
      const { data, error } = await supabase
        .from('onboarding_drafts')
        .select('*')
        .eq('id', draftId)
        .single();
      
      if (data) setDraftData(data);
      setLoading(false);
    }
    loadDraft();
  }, [draftId])

  const handleNext = async () => {
    if (currentStep < 6) {
      setSaving(true);
      try {
        await saveDraftStep(draftId || draftObject?.id, { ...draftData, onboarding_step: currentStep + 1 });
        setCurrentStep(prev => prev + 1);
      } catch (err) {
        console.error('Save error:', err);
      } finally {
        setSaving(false);
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
    else onBack();
  }

  const handleActivate = async () => {
    setSaving(true);
    try {
      await activateClient(draftId);
      onBack(); // Go back to pipeline
    } catch (err) {
       alert('Activation failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-20 text-center uppercase font-black text-slate-500 animate-pulse">Retrieving Draft #{draftId?.slice(0,8)}...</div>

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-32">
      {/* 1. PROGRESS HEADER */}
      <div className="bg-[#091328]/30 backdrop-blur-xl p-8 rounded-[3rem] border border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-10">
           <button onClick={handleBack} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all hover:bg-white/10">
              <span className="material-symbols-outlined">arrow_back</span>
           </button>
           <div>
              <h1 className="text-2xl font-headline font-black text-white tracking-tight uppercase">{draftData?.business_name || 'Loading Business...'}</h1>
              <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mt-1">Onboarding Activation Engine</p>
           </div>
        </div>

        <div className="flex gap-4">
           {STEPS.map(s => (
              <div key={s.id} className="flex flex-col items-center gap-2">
                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${
                   currentStep === s.id ? 'bg-indigo-500 border-indigo-400 text-white shadow-xl shadow-indigo-500/30 font-black' :
                   currentStep > s.id ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' :
                   'bg-white/5 border-white/5 text-slate-500'
                 }`}>
                    {currentStep > s.id ? <span className="material-symbols-outlined text-[16px]">check</span> : <span className="text-[11px] font-black">{s.id}</span>}
                 </div>
                 <span className={`text-[8px] font-black uppercase tracking-widest ${currentStep === s.id ? 'text-white' : 'text-slate-600'}`}>{s.title}</span>
              </div>
           ))}
        </div>
      </div>

      {/* 2. DYNAMIC STAGE CONTENT */}
      <AnimatePresence mode="wait">
        <motion.div
           key={currentStep}
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: -20 }}
           className="bg-[#091328]/50 rounded-[3.5rem] p-16 border border-white/5 shadow-3xl min-h-[500px] flex flex-col justify-between"
        >
           <div className="space-y-12">
              {currentStep === 1 && (
                <div className="grid md:grid-cols-2 gap-10">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest block pl-2">Legal Business Name</label>
                      <input 
                         className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-amber-500 transition-all font-bold"
                         value={draftData?.business_name || ''}
                         onChange={e => setDraftData({...draftData, business_name: e.target.value})}
                      />
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest block pl-2">Public Website URL</label>
                      <input 
                         className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-amber-500 transition-all font-bold"
                         value={draftData?.website_url || ''}
                         placeholder="https://..."
                         onChange={e => setDraftData({...draftData, website_url: e.target.value})}
                      />
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest block pl-2">Business Phone (Main)</label>
                      <input 
                         className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-amber-500 transition-all font-bold"
                         value={draftData?.business_phone || ''}
                         onChange={e => setDraftData({...draftData, business_phone: e.target.value})}
                      />
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest block pl-2">Business Email (Support)</label>
                      <input 
                         className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-amber-500 transition-all font-bold"
                         value={draftData?.business_email || ''}
                         onChange={e => setDraftData({...draftData, business_email: e.target.value})}
                      />
                   </div>
                   <div className="md:col-span-2 space-y-4">
                      <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest block pl-2">Business Address</label>
                      <input 
                         className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-amber-500 transition-all font-bold"
                         value={draftData?.business_address || ''}
                         onChange={e => setDraftData({...draftData, business_address: e.target.value})}
                      />
                   </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-12">
                   <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                         <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest block pl-2">Core Industry</label>
                         <input 
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-amber-500 transition-all font-bold"
                            value={draftData?.industry || ''}
                            onChange={e => setDraftData({...draftData, industry: e.target.value})}
                         />
                      </div>
                      <div className="space-y-4">
                         <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest block pl-2">Niche Specialization</label>
                         <input 
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-amber-500 transition-all font-bold"
                            value={draftData?.sub_industry || ''}
                            onChange={e => setDraftData({...draftData, sub_industry: e.target.value})}
                         />
                      </div>
                   </div>

                   <div className="space-y-6">
                      <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest block pl-2">Primary Services Offered</label>
                      <div className="flex flex-wrap gap-3">
                         {draftData?.services_offered?.map((s, idx) => (
                           <div key={idx} className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-black text-white uppercase flex items-center gap-3">
                              {s}
                              <button 
                                onClick={() => setDraftData({...draftData, services_offered: draftData.services_offered.filter((_, i) => i !== idx)})}
                                className="material-symbols-outlined text-xs text-rose-500"
                              >close</button>
                           </div>
                         ))}
                         <button 
                           onClick={() => {
                             const s = prompt('Add service:');
                             if (s) setDraftData({...draftData, services_offered: [...(draftData.services_offered || []), s]})
                           }}
                           className="bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-xl text-[10px] font-black text-indigo-400 uppercase hover:bg-indigo-500 hover:text-white transition-all flex items-center gap-2"
                         >
                            <span className="material-symbols-outlined text-sm">add</span>
                            Add Service
                         </button>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest block pl-2">Business Description (AI Prompt Input)</label>
                      <textarea 
                         className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-white outline-none focus:border-amber-500 transition-all font-bold h-40"
                         value={draftData?.short_business_summary || ''}
                         onChange={e => setDraftData({...draftData, short_business_summary: e.target.value})}
                         placeholder="A brief overview of what this business does and who they serve..."
                      />
                   </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-12">
                   <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                        { id: 'Professional', label: 'Professional', desc: 'Neutral, helpful, corporate', icon: 'business_center' },
                        { id: 'Friendly', label: 'Friendly', desc: 'Warm, approachable, conversational', icon: 'sentiment_satisfied' },
                        { id: 'Bold', label: 'Bold', desc: 'Direct, confident, sales-focused', icon: 'bolt' },
                        { id: 'Concise', label: 'Concise', desc: 'Short, efficient, low-fluff', icon: 'compress' }
                      ].map(t => (
                        <button 
                          key={t.id}
                          onClick={() => setDraftData({...draftData, brand_tone: t.id})}
                          className={`p-6 rounded-[2rem] border transition-all text-left group ${
                            draftData?.brand_tone === t.id ? 'bg-indigo-500 border-indigo-400 text-white shadow-xl shadow-indigo-500/20' : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/10'
                          }`}
                        >
                           <span className={`material-symbols-outlined mb-4 block ${draftData?.brand_tone === t.id ? 'text-white' : 'text-indigo-400 group-hover:scale-110 transition-transform'}`}>{t.icon}</span>
                           <h4 className="text-[11px] font-black uppercase tracking-widest mb-1">{t.label}</h4>
                           <p className={`text-[9px] font-bold ${draftData?.brand_tone === t.id ? 'text-indigo-100' : 'text-slate-600'}`}>{t.desc}</p>
                        </button>
                      ))}
                   </div>

                   <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                         <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest block pl-2">Primary Conversation Goal</label>
                         <select 
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-amber-500 transition-all font-bold appearance-none"
                            value={draftData?.primary_goal || ''}
                            onChange={e => setDraftData({...draftData, primary_goal: e.target.value})}
                         >
                            <option value="Lead Capture">Lead Capture (Capture name/email/phone)</option>
                            <option value="Booking">Direct Booking (Push to calendar link)</option>
                            <option value="Qualify">Lead Qualification (Ask budget/timeline)</option>
                            <option value="Support">Support/FAQ Only</option>
                         </select>
                      </div>
                      <div className="space-y-4">
                         <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest block pl-2">Max Questions Before Escalation</label>
                         <input 
                            type="number"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-amber-500 transition-all font-bold"
                            value={draftData?.max_questions || 2}
                            onChange={e => setDraftData({...draftData, max_questions: parseInt(e.target.value)})}
                         />
                      </div>
                   </div>

                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest block pl-2">Critical Response Guardrails (One per line)</label>
                      <textarea 
                         className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-white outline-none focus:border-amber-500 transition-all font-bold h-32"
                         value={draftData?.hard_response_rules?.join('\n') || ''}
                         onChange={e => setDraftData({...draftData, hard_response_rules: e.target.value.split('\n')})}
                         placeholder="Never promise pricing... Always mention we are local... Stop if user says 'legal'..."
                      />
                   </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-12">
                   <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                         <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest block pl-2">Booking / Calendar link</label>
                         <input 
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-amber-500 transition-all font-bold"
                            value={draftData?.booking_url || ''}
                            placeholder="https://calendly.com/..."
                            onChange={e => setDraftData({...draftData, booking_url: e.target.value})}
                         />
                      </div>
                      <div className="space-y-4">
                         <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest block pl-2">Handoff Keywords (Comma separated)</label>
                         <input 
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-amber-500 transition-all font-bold"
                            value={draftData?.handoff_keywords?.join(', ') || ''}
                            onChange={e => setDraftData({...draftData, handoff_keywords: e.target.value.split(',').map(s => s.trim())})}
                         />
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="flex justify-between items-center pl-2">
                         <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest block">Knowledge Base / FAQs</label>
                         <button 
                           onClick={() => setDraftData({...draftData, faq_entries: [...(draftData.faq_entries || []), { q: '', a: '' }]})}
                           className="text-[9px] font-black uppercase text-indigo-400 hover:text-white transition-colors"
                         >+ Add FAQ Entry</button>
                      </div>
                      <div className="space-y-4">
                         {draftData?.faq_entries?.map((faq, idx) => (
                           <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-6 relative group">
                              <button 
                                onClick={() => setDraftData({...draftData, faq_entries: draftData.faq_entries.filter((_, i) => i !== idx)})}
                                className="absolute top-4 right-4 material-symbols-outlined text-xs text-slate-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                              >delete</button>
                              <div className="space-y-4">
                                <input 
                                   className="w-full bg-transparent border-b border-white/5 pb-2 text-white outline-none font-bold text-xs"
                                   placeholder="Question..."
                                   value={faq.q}
                                   onChange={e => {
                                     const newFaq = [...draftData.faq_entries];
                                     newFaq[idx].q = e.target.value;
                                     setDraftData({...draftData, faq_entries: newFaq});
                                   }}
                                />
                                <input 
                                   className="w-full bg-transparent text-slate-400 outline-none font-bold text-xs"
                                   placeholder="Answer..."
                                   value={faq.a}
                                   onChange={e => {
                                      const newFaq = [...draftData.faq_entries];
                                      newFaq[idx].a = e.target.value;
                                      setDraftData({...draftData, faq_entries: newFaq});
                                   }}
                                />
                              </div>
                           </div>
                         ))}
                         {(!draftData?.faq_entries || draftData.faq_entries.length === 0) && (
                           <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-3xl opacity-30">
                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">No FAQs added yet</p>
                           </div>
                         )}
                      </div>
                   </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-12">
                   <div className="text-center max-w-xl mx-auto mb-10">
                      <h3 className="text-2xl font-headline font-black text-white tracking-tight uppercase">Readiness Gate</h3>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-2">The system must pass all validation checks before production deployment</p>
                   </div>

                   <div className="grid md:grid-cols-2 gap-6">
                      {[
                        { label: 'Business Identity', checked: draftData?.business_name && draftData?.business_email, desc: 'Contact info and address verified' },
                        { label: 'AI Persona & Tone', checked: draftData?.brand_tone && draftData?.primary_goal, desc: 'Communication rules established' },
                        { label: 'Service Intelligence', checked: draftData?.services_offered?.length > 0, desc: 'Product knowledge base extracted' },
                        { label: 'Operational Sync', checked: draftData?.booking_url && draftData?.faq_entries?.length > 0, desc: 'Booking and FAQ connectivity active' },
                        { label: 'Phone Provisioning', checked: draftData?.telnyx_phone_number || true, desc: 'Telnyx inbound routing confirmed' }, // Default true for now
                        { label: 'Safety Guardrails', checked: draftData?.hard_response_rules?.length > 0, desc: 'Critical avoidance rules defined' },
                      ].map((item, i) => (
                        <div key={i} className={`p-6 rounded-3xl border flex items-center gap-6 transition-all ${
                          item.checked ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20 opacity-60'
                        }`}>
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                             item.checked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                           }`}>
                              <span className="material-symbols-outlined text-[20px]">{item.checked ? 'check_circle' : 'pending'}</span>
                           </div>
                           <div>
                              <h4 className="text-[11px] font-black uppercase text-white tracking-widest mb-1">{item.label}</h4>
                              <p className="text-[9px] text-slate-500 font-bold uppercase">{item.desc}</p>
                           </div>
                        </div>
                      ))}
                   </div>

                   <div className="mt-12 p-10 bg-indigo-500/5 border border-indigo-500/10 rounded-[2.5rem] flex items-center justify-between">
                      <div className="flex items-center gap-5">
                         <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-indigo-400">labs</span>
                         </div>
                         <div>
                            <h4 className="text-xs font-black text-white uppercase tracking-widest">Run QA Simulation</h4>
                            <p className="text-[9px] text-slate-500 font-bold uppercase">Test AI responses against configured rules before launch</p>
                         </div>
                      </div>
                      <button className="px-8 py-3 border border-indigo-500/30 text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-xl shadow-indigo-500/10">Start Simulation</button>
                   </div>
                </div>
              )}

              {currentStep === 6 && (
                <div className="space-y-12 text-center">
                   <div className="w-32 h-32 bg-emerald-500/20 border-4 border-emerald-500/30 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20">
                      <span className="material-symbols-outlined text-emerald-400 text-5xl">rocket_launch</span>
                   </div>
                   <div>
                      <h3 className="text-4xl font-headline font-black text-white tracking-tight uppercase">Ready for Deployment?</h3>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.3em] mt-4">Review all parameters before provisioning production instance</p>
                   </div>
                   <div className="bg-white/5 rounded-3xl p-10 border border-white/10 max-w-2xl mx-auto text-left space-y-6">
                      <div className="flex justify-between border-b border-white/5 pb-4">
                         <span className="text-[10px] font-black uppercase text-slate-500">Business</span>
                         <span className="text-xs text-white uppercase font-bold">{draftData?.business_name}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-4">
                         <span className="text-[10px] font-black uppercase text-slate-500">Integrations</span>
                         <span className="text-xs text-emerald-400 uppercase font-black">Connected</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-4">
                         <span className="text-[10px] font-black uppercase text-slate-500">AI Ruleset</span>
                         <span className="text-xs text-emerald-400 uppercase font-black">Validated</span>
                      </div>
                   </div>
                </div>
              )}
           </div>

           {/* FOOTER NAV */}
           <div className="flex justify-between items-center mt-12 pt-12 border-t border-white/5">
              <button 
                onClick={handleBack}
                className="px-10 py-4 bg-white/5 text-slate-500 font-black uppercase text-[10px] tracking-widest rounded-3xl hover:bg-white/10 hover:text-white transition-all border border-white/5"
              >Back</button>

              <div className="flex items-center gap-6">
                 {saving && <span className="text-[9px] font-black uppercase text-indigo-400 animate-pulse tracking-widest">Saving Draft...</span>}
                 {currentStep < 6 ? (
                   <button 
                     onClick={handleNext}
                     disabled={saving}
                     className="px-12 py-5 bg-indigo-500 text-white font-black uppercase text-[11px] tracking-[0.2em] rounded-3xl hover:bg-indigo-600 transition-all shadow-2xl shadow-indigo-500/30 flex items-center gap-3 disabled:opacity-50"
                   >
                     Next Step
                     <span className="material-symbols-outlined text-sm">arrow_forward</span>
                   </button>
                 ) : (
                    <button 
                      onClick={handleActivate}
                      disabled={saving}
                      className="px-16 py-6 bg-emerald-500 text-white font-black uppercase text-[12px] tracking-[0.3em] rounded-full hover:bg-emerald-600 transition-all shadow-[0_0_50px_rgba(16,185,129,0.3)] flex items-center gap-4 disabled:opacity-50 group"
                    >
                      Initialize System
                      <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">bolt</span>
                    </button>
                 )}
              </div>
           </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
