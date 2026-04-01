import { useState } from 'react'
import AIPlayground from '../AIPlayground.jsx'
import { motion, AnimatePresence } from 'framer-motion'

export default function GlobalQATools() {
  const [showTester, setShowTester] = useState(false)
  const [selectedConfig, setSelectedConfig] = useState(null)

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      <div className="bg-[#091328]/30 backdrop-blur-md p-8 rounded-[3rem] border border-white/5">
         <h2 className="text-3xl font-headline font-black text-white tracking-tight">QA Command Center</h2>
         <p className="text-[11px] text-slate-500 uppercase font-black tracking-widest mt-2">Test AI configurations and simulate real-time message flows</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
         <div className="bg-[#091328]/50 p-10 rounded-[3rem] border border-white/5 space-y-6 shadow-2xl">
            <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-indigo-400 border border-white/10 group-hover:bg-indigo-500 group-hover:text-white transition-all">
               <span className="material-symbols-outlined text-3xl">psychology</span>
            </div>
            <div>
               <h3 className="text-xl font-headline font-black text-white tracking-tight">AI Agent Simulator</h3>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2 leading-relaxed">
                  Run simulated conversations using any draft or live client configuration. 
                  Verify that "Hard Rules" and brand tone are being followed before activation.
               </p>
            </div>
            <button 
              onClick={() => setShowTester(true)}
              className="w-full py-4 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-500/20"
            >
               Open Global Tester
            </button>
         </div>

         <div className="bg-[#091328]/50 p-10 rounded-[3rem] border border-white/5 space-y-6 shadow-2xl">
            <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-amber-500 border border-white/10 group-hover:bg-amber-500 group-hover:text-black transition-all">
               <span className="material-symbols-outlined text-3xl">nest_remote_comfort_sensor</span>
            </div>
            <div>
               <h3 className="text-xl font-headline font-black text-white tracking-tight">Webhook Mirror</h3>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2 leading-relaxed">
                  Monitor live webhook traffic across all clients. 
                  Spot delivery failures or processing delays in real-time.
               </p>
            </div>
            <button className="w-full py-4 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all">
               Watch Traffic
            </button>
         </div>
      </div>

      <AnimatePresence>
        {showTester && (
          <AIPlayground 
            onClose={() => setShowTester(false)}
            config={selectedConfig}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
