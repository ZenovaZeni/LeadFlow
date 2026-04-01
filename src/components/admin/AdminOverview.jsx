import { useState, useEffect } from 'react'
import { getAdminOperationalStats, getActionQueue, getRecentOnboardingDrafts, getRecentErrors } from '../../lib/queries'
import { motion } from 'framer-motion'

export default function AdminOverview() {
  const [stats, setStats] = useState(null)
  const [actionQueue, setActionQueue] = useState([])
  const [inProgress, setInProgress] = useState([])
  const [errors, setErrors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [s, q, ip, errs] = await Promise.all([
          getAdminOperationalStats(),
          getActionQueue(),
          getRecentOnboardingDrafts(5),
          getRecentErrors(5)
        ])
        setStats(s)
        setActionQueue(q || [])
        setInProgress(ip || [])
        setErrors(errs || [])
      } catch (err) {
        console.error('Failed to load overview data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) return <div className="text-slate-500 font-black uppercase text-[10px] animate-pulse">Initializing Overview...</div>

  const statCards = [
    { label: 'Active Clients', value: stats?.activeClients, icon: 'shield_person', color: 'text-emerald-400' },
    { label: 'Drafts Awaiting Review', value: stats?.draftsAwaitingReview, icon: 'magic_button', color: 'text-amber-400' },
    { label: 'Clients In Onboarding', value: stats?.clientsInOnboarding, icon: 'rocket_launch', color: 'text-indigo-400' },
    { label: 'Missing Number', value: stats?.clientsMissingNumber, icon: 'phone_disabled', color: 'text-rose-400' },
    { label: 'Missing Webhook', value: stats?.clientsMissingWebhook, icon: 'link_off', color: 'text-rose-400' },
    { label: 'Awaiting QA', value: stats?.clientsAwaitingQA, icon: 'checklist', color: 'text-amber-400' },
    { label: 'Failed Webhooks Today', value: stats?.failedWebhooksToday, icon: 'error', color: stats?.failedWebhooksToday > 0 ? 'text-rose-500' : 'text-slate-500' },
    { label: 'Messages Today', value: stats?.messagesSentToday, icon: 'sms', color: 'text-indigo-400' },
    { label: 'Missed Calls Today', value: stats?.missedCallsRecoveredToday, icon: 'call_missed_outgoing', color: 'text-emerald-400' },
  ]

  return (
    <div className="space-y-12 animate-fade-in">
      {/* 1. TOP STATS BAR */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-[#091328]/50 backdrop-blur-md p-6 rounded-3xl border border-white/5 flex flex-col justify-between group hover:border-white/10 transition-all">
            <div className="flex justify-between items-start">
              <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest leading-none">{stat.label}</span>
              <span className={`material-symbols-outlined ${stat.color} opacity-40 group-hover:opacity-100 transition-opacity text-lg`}>{stat.icon}</span>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-headline font-black text-white tracking-tight">{stat.value ?? 0}</span>
            </div>
          </div>
        ))}
      </section>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* ACTION QUEUE */}
        <div className="lg:col-span-1 bg-[#091328]/50 rounded-[3rem] p-10 border border-white/5 space-y-8 shadow-2xl">
           <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-amber-500">priority_high</span>
              <h3 className="text-xl font-headline font-black text-white tracking-tight">Action Queue</h3>
           </div>
           
           <div className="space-y-4">
              {actionQueue.length > 0 ? actionQueue.map((action, i) => (
                <div key={i} className="p-5 bg-white/5 border border-white/5 rounded-2xl group hover:border-amber-500/30 transition-all flex justify-between items-center">
                   <div>
                      <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest block mb-1">{action.title}</span>
                      <span className="text-xs text-white font-bold">{action.target}</span>
                   </div>
                   <button className="material-symbols-outlined text-slate-500 hover:text-white transition-colors">chevron_right</button>
                </div>
              )) : (
                <div className="p-8 text-center border-2 border-dashed border-white/5 rounded-3xl opacity-30">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">All clear for now</p>
                </div>
              )}
           </div>
        </div>

        {/* SYSTEM HEALTH */}
        <div className="lg:col-span-2 bg-[#091328]/50 rounded-[3rem] p-10 border border-white/5 space-y-10 shadow-2xl">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-emerald-400">health_and_safety</span>
              <h3 className="text-xl font-headline font-black text-white tracking-tight">System Health</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-white/5 pb-2">Status Monitoring</h4>
                  {[
                    { label: 'Voice Webhooks', status: 'Healthy', icon: 'voice_over_off' },
                    { label: 'SMS Webhooks', status: 'Healthy', icon: 'sms' },
                    { label: 'AI Processing', status: 'Optimal', icon: 'psychology' },
                  ].map((s, i) => (
                    <div key={i} className="flex justify-between items-center">
                       <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-sm text-slate-500">{s.icon}</span>
                          <span className="text-[10px] font-bold text-slate-300 uppercase">{s.label}</span>
                       </div>
                       <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">{s.status}</span>
                    </div>
                  ))}
               </div>

               <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-white/5 pb-2">Recent Errors</h4>
                  <div className="p-6 text-center border-2 border-dashed border-white/5 rounded-3xl opacity-30 h-full flex flex-col justify-center">
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">No recent errors</p>
                  </div>
               </div>
            </div>
        </div>

        {/* RECENT ONBOARDING ACTIVITY */}
        <div className="lg:col-span-3 bg-[#091328]/50 rounded-[3rem] p-10 border border-white/5 space-y-10 shadow-2xl">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-indigo-400">rocket_launch</span>
                  <h3 className="text-xl font-headline font-black text-white tracking-tight">Recent Onboarding Activity</h3>
                </div>
                <button className="text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors border border-white/5 px-4 py-2 rounded-full">View Pipeline</button>
             </div>

             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inProgress.length > 0 ? inProgress.map((p, i) => (
                  <div key={i} className="p-6 bg-white/5 border border-white/5 rounded-3xl group hover:border-indigo-500/30 transition-all">
                     <div className="flex justify-between items-start mb-4">
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                          p.draft_status === 'Ready to Activate' ? 'bg-emerald-500/10 text-emerald-400' :
                          p.draft_status === 'Needs Review' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-indigo-500/10 text-indigo-400'
                        }`}>{p.draft_status}</span>
                        <span className="text-[8px] text-slate-600 font-bold uppercase">{new Date(p.updated_at).toLocaleDateString()}</span>
                     </div>
                     <h4 className="text-sm font-black text-white mb-1">{p.business_name}</h4>
                     <p className="text-[10px] text-slate-500 font-bold mb-4 uppercase">Last updated: {new Date(p.updated_at).toLocaleTimeString()}</p>
                     <button className="w-full py-2 bg-white/5 hover:bg-indigo-500 text-white text-[9px] font-black uppercase rounded-xl transition-all opacity-0 group-hover:opacity-100">Resume Setup</button>
                  </div>
                )) : (
                  <div className="md:col-span-2 lg:col-span-3 p-12 text-center border-2 border-dashed border-white/5 rounded-[2.5rem] opacity-30">
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">No active onboading sessions</p>
                  </div>
                )}
             </div>
        </div>
      </div>
    </div>
  )
}
