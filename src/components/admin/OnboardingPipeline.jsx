import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase.js'
import { motion, AnimatePresence } from 'framer-motion'
import OnboardingWizard from './OnboardingWizard.jsx'

export default function OnboardingPipeline() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedClient, setSelectedClient] = useState(null)

  useEffect(() => {
    async function loadOnboardingClients() {
      // Fetch clients that are in 'Ready for Onboarding' or 'Ready to Activate' or partially through
      const { data } = await supabase
        .from('onboarding_drafts')
        .select('*')
        .in('draft_status', ['Ready for Onboarding', 'Ready to Activate'])
        .order('updated_at', { ascending: false });
      setClients(data || []);
      setLoading(false);
    }
    loadOnboardingClients();

    const channel = supabase
      .channel('onboarding_pipeline')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'onboarding_drafts' }, payload => {
        // Simple refresh logic
        loadOnboardingClients();
      })
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, [])

  if (loading) return <div className="text-slate-500 font-black uppercase text-[10px] animate-pulse">Loading Pipeline...</div>

  if (selectedClient) {
    return <OnboardingWizard client={selectedClient} onBack={() => setSelectedClient(null)} />
  }

  return (
    <div className="space-y-12 animate-fade-in">
      <div className="bg-[#091328]/30 backdrop-blur-md p-8 rounded-[3rem] border border-white/5">
         <h2 className="text-3xl font-headline font-black text-white tracking-tight">Activation Pipeline</h2>
         <p className="text-[11px] text-slate-500 uppercase font-black tracking-widest mt-2">Guide clients through the 6-step activation wizard</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {clients.length > 0 ? clients.map(client => (
          <div key={client.id} className="bg-[#091328]/50 p-8 rounded-[2.5rem] border border-white/5 group hover:border-indigo-500/30 transition-all flex flex-col h-full bg-gradient-to-br from-indigo-500/5 to-transparent">
             <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-lg font-headline font-black text-white tracking-tight">{client.business_name}</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{client.industry || 'General Niche'}</p>
                </div>
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                   <span className="material-symbols-outlined">rocket_launch</span>
                </div>
             </div>

             <div className="flex-1 space-y-6">
                <div className="space-y-2">
                   <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500">
                      <span>Progress</span>
                      <span className="text-white">{client.onboarding_step || 1} / 6</span>
                   </div>
                   <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div 
                         className="h-full bg-indigo-500 transition-all duration-700"
                         style={{ width: `${((client.onboarding_step || 1) / 6) * 100}%` }}
                      />
                   </div>
                </div>

                <div className="p-4 bg-[#060e20] rounded-2xl border border-white/5">
                   <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-1">Next Action</span>
                   <span className="text-[11px] font-bold text-indigo-300">
                      {client.onboarding_step === 1 ? 'Configure Business Details' : 
                       client.onboarding_step === 2 ? 'Import Knowledge Base' :
                       client.onboarding_step === 3 ? 'Refine AI Behavior' :
                       client.onboarding_step === 4 ? 'Link Phone System' :
                       client.onboarding_step === 5 ? 'Run QA Simulation' : 'Ready to Activate'}
                   </span>
                </div>
             </div>

             <button 
               onClick={() => setSelectedClient(client)}
               className="mt-8 w-full py-4 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-500/20"
             >
                {client.onboarding_step > 1 ? 'Continue Setup' : 'Start Wizard'}
             </button>
          </div>
        )) : (
          <div className="md:col-span-2 lg:col-span-3 py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem] opacity-30">
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">No clients ready for onboarding</p>
          </div>
        )}
      </div>
    </div>
  )
}
