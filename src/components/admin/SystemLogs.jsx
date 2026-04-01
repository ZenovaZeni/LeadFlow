import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function SystemLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Placeholder for system event logs
    setLogs([
       { id: 1, type: 'info', message: 'Admin login detected', time: '2 minutes ago' },
       { id: 2, type: 'success', message: 'New scraping job completed: "Elite Plumbing"', time: '15 minutes ago' },
       { id: 3, type: 'warning', message: 'Telnyx Webhook timeout (retrying)', time: '42 minutes ago' },
       { id: 4, type: 'error', message: 'Failed to process lead - Missing phone entry', time: '1 hour ago' },
    ])
    setLoading(false)
  }, [])

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      <div className="flex justify-between items-center bg-[#091328]/30 backdrop-blur-md p-8 rounded-[3rem] border border-white/5">
         <div>
            <h2 className="text-3xl font-headline font-black text-white tracking-tight">Activity Feed</h2>
            <p className="text-[11px] text-slate-500 uppercase font-black tracking-widest mt-2">Real-time system events and operational logs</p>
         </div>
         
         <div className="flex gap-4">
            {['All Events', 'Errors Only', 'Onboarding'].map(filter => (
               <button key={filter} className="px-6 py-3 bg-white/5 border border-white/10 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all">
                  {filter}
               </button>
            ))}
         </div>
      </div>

      <div className="bg-[#091328]/50 rounded-[3rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden backdrop-blur-md">
         <div className="space-y-6">
            {logs.map(log => (
               <div key={log.id} className="flex gap-6 items-start group">
                  <div className="w-16 text-[9px] text-slate-600 font-bold uppercase tracking-widest pt-1">{log.time}</div>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                     log.type === 'error' ? 'bg-rose-500/10 text-rose-500' : 
                     log.type === 'warning' ? 'bg-amber-500/10 text-amber-500' : 
                     log.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'
                  }`}>
                     <span className="material-symbols-outlined text-[16px]">
                        {log.type === 'error' ? 'error' : 
                         log.type === 'warning' ? 'warning' : 
                         log.type === 'success' ? 'check_circle' : 'info'}
                     </span>
                  </div>
                  <div className="flex-1 pb-6 border-b border-white/5 group-last:border-none">
                     <p className="text-[13px] text-slate-300 font-bold leading-relaxed">{log.message}</p>
                     <div className="flex gap-2 mt-2">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-600 bg-white/3 px-2 py-0.5 rounded">System-Event-001</span>
                     </div>
                  </div>
               </div>
            ))}
         </div>
         <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#091328] to-transparent pointer-events-none" />
      </div>
    </div>
  )
}
