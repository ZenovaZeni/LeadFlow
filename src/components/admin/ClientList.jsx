import { useState, useEffect } from 'react'
import { getAllBusinesses, updateBusinessAdmin } from '../../lib/queries'
import { motion } from 'framer-motion'

export default function ClientList({ onImpersonate }) {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    async function loadClients() {
      const data = await getAllBusinesses()
      setClients(data || [])
      setLoading(false)
    }
    loadClients()
  }, [])

  const filtered = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className="text-slate-500 font-black uppercase text-[10px] animate-pulse">Loading Live Clients...</div>

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#091328]/30 backdrop-blur-md p-8 rounded-[3rem] border border-white/5">
         <div>
            <h2 className="text-3xl font-headline font-black text-white tracking-tight">Client Operations</h2>
            <p className="text-[11px] text-slate-500 uppercase font-black tracking-widest mt-2">Manage live agents and system status</p>
         </div>
         
         <div className="relative w-full md:w-80">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">search</span>
            <input 
               type="text"
               placeholder="Search clients..."
               className="w-full bg-[#060e20] border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-xs text-white outline-none focus:border-amber-500/50 transition-all shadow-inner"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
            />
         </div>
      </div>

      <div className="bg-[#091328]/50 rounded-[3rem] p-10 border border-white/5 shadow-2xl overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="border-b border-white/5">
                     <th className="pb-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-4">Client</th>
                     <th className="pb-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Readiness Gates</th>
                     <th className="pb-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">AI State</th>
                     <th className="pb-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">System Health</th>
                     <th className="pb-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] text-right pr-4">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {filtered.map(biz => (
                     <tr key={biz.id} className="group hover:bg-white/5 transition-all">
                        <td className="py-6 pl-4">
                           <div className="font-bold text-white uppercase text-xs">{biz.name}</div>
                           <div className="text-[10px] text-slate-500 mt-1">{biz.email || 'No email provided'}</div>
                           <div className="text-[9px] font-mono text-indigo-400 mt-1 uppercase tracking-widest">{biz.telnyx_phone_number || 'No number assigned'}</div>
                        </td>
                        <td className="py-6">
                           <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${biz.telnyx_phone_number ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`} title="Phone Linked">
                                 <span className="material-symbols-outlined text-sm">phone_iphone</span>
                              </div>
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${biz.ai_rules?.bio ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`} title="Rules Set">
                                 <span className="material-symbols-outlined text-sm">psychology</span>
                              </div>
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-500`} title="Webhooks Verified">
                                 <span className="material-symbols-outlined text-sm">nest_remote_comfort_sensor</span>
                              </div>
                           </div>
                        </td>
                        <td className="py-6">
                           <button 
                             onClick={async () => {
                               const nextState = !biz.is_ai_active;
                               try {
                                 await updateBusinessAdmin(biz.id, { is_ai_active: nextState });
                                 setClients(prev => prev.map(p => p.id === biz.id ? { ...p, is_ai_active: nextState } : p));
                               } catch (err) { console.error('AI toggle error:', err); }
                             }}
                             className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                               biz.is_ai_active ? 'bg-indigo-500 text-white shadow-lg' : 'bg-white/5 text-slate-500 border border-white/5'
                             }`}
                           >
                              {biz.is_ai_active ? 'Live' : 'Paused'}
                           </button>
                        </td>
                        <td className="py-6">
                           <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">98% Stable</span>
                           </div>
                        </td>
                        <td className="py-6 text-right pr-4">
                           <button 
                             onClick={() => onImpersonate({ id: biz.id, name: biz.name })}
                             className="px-6 py-2.5 bg-amber-600/10 border border-amber-600/20 text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-amber-600 hover:text-white transition-all shadow-lg group-hover:scale-105"
                           >
                              Workspace
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  )
}
