import { useState, useEffect } from 'react'
import { getAdminStats, getAllBusinesses, updateBusinessAdmin, getLeads } from '../lib/queries'
import { supabase } from '../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import InfoExplainer from '../components/InfoExplainer'
import ScrapeModal from '../components/ScrapeModal'
import DraftReviewView from '../components/DraftReviewView'
import { INDUSTRY_PROMPTS } from '../data/industryPrompts'

export default function AdminDashboard({ onImpersonate }) {
  const [stats, setStats] = useState({ totalLeads: 0, totalClients: 0, totalRevenue: 0, totalBookings: 0, avgHealth: 0 })
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [leads, setLeads] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('clients') // 'clients' | 'drafts'
  const [drafts, setDrafts] = useState([])
  const [showScrapeModal, setShowScrapeModal] = useState(false)
  const [selectedDraft, setSelectedDraft] = useState(null)

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [s, b, l] = await Promise.all([getAdminStats(), getAllBusinesses(), getLeads()])
        setStats(s)
        setBusinesses(b)
        setLeads(l.slice(0, 15))

        // Load Drafts
        const { data: d } = await supabase
          .from('onboarding_drafts')
          .select('*')
          .order('created_at', { ascending: false });
        setDrafts(d || []);
      } catch (err) {
        console.error('Admin Load Error:', err)
      } finally {
        setLoading(false)
      }
    }
    loadAdminData()
    
    // Subscribe to Realtime Updates for Drafts
    const channel = supabase
      .channel('onboarding_drafts')
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

  const filtered = businesses.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className="p-24 animate-pulse text-amber-500 font-black uppercase tracking-widest text-center">Loading Admin Command Center...</div>

  return (
    <div className="animate-fade-in space-y-12 pb-20">
      {/* 1. GLOBAL PULSE */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Clients', value: stats.totalClients, icon: 'groups', color: 'text-indigo-400' },
          { label: 'Onboarding Drafts', value: drafts.length, icon: 'auto_fix_high', color: 'text-amber-400' },
          { label: 'Revenue Potential', value: `$${stats.totalRevenue.toLocaleString()}`, icon: 'payments', color: 'text-emerald-500', highlight: true },
        ].map((stat, i) => (
          <div key={i} className={`bg-[#091328]/50 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/5 flex flex-col justify-between group hover:border-white/10 transition-all ${stat.highlight ? 'ring-2 ring-amber-500/20 shadow-2xl shadow-amber-500/5' : ''}`}>
             <div className="flex justify-between items-start">
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none">{stat.label}</span>
                <span className={`material-symbols-outlined ${stat.color} opacity-40 group-hover:opacity-100 transition-opacity`}>{stat.icon}</span>
             </div>
             <div className="mt-6 flex items-baseline gap-3">
                <span className={`text-4xl font-headline font-black ${stat.color} tracking-tight`}>{stat.value}</span>
                {stat.highlight && <span className="text-[10px] font-black text-amber-500/50 uppercase tracking-widest animate-pulse">Live Value</span>}
             </div>
          </div>
        ))}
      </section>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* CLIENT FEED (Ticker) */}
        <div className="lg:col-span-1 bg-[#091328]/50 rounded-[3rem] p-10 border border-white/5 space-y-8 shadow-2xl overflow-hidden relative">
           <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-indigo-400">dynamic_form</span>
              <h3 className="text-xl font-headline font-black text-white tracking-tight">Global Activity</h3>
           </div>
           
           <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {leads.map(lead => (
                <div key={lead.id} className="p-5 bg-white/5 border border-white/5 rounded-2xl group hover:border-indigo-500/30 transition-all">
                   <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">{lead.name}</span>
                      <span className="text-[9px] text-slate-600 font-bold uppercase">{lead.timeAgo || 'Just now'}</span>
                   </div>
                   <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">
                      {lead.summary || 'Lead captured via portal'}
                   </p>
                </div>
              ))}
           </div>
           
           <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#091328] to-transparent pointer-events-none" />
        </div>

        {/* CLIENT LIST (Table) */}
        <div className="lg:col-span-2 bg-[#091328]/50 rounded-[3rem] p-10 border border-white/5 space-y-10 shadow-2xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-6">
                 {['clients', 'drafts'].map(tab => (
                   <button 
                     key={tab}
                     onClick={() => setActiveTab(tab)}
                     className={`flex items-center gap-2 pb-2 border-b-2 transition-all ${activeTab === tab ? 'border-amber-500 text-white' : 'border-transparent text-slate-500 hover:text-white'}`}
                   >
                      <span className="material-symbols-outlined text-sm">{tab === 'clients' ? 'shield_person' : 'magic_button'}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest">{tab === 'clients' ? 'Active Clients' : 'Drafting Assistant'}</span>
                   </button>
                 ))}
              </div>
              
              <div className="flex items-center gap-4 w-full md:w-auto">
                 <div className="relative flex-1 md:w-60">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">search</span>
                    <input 
                      type="text"
                      placeholder="Search..."
                      className="w-full bg-[#060e20] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-xs text-white outline-none focus:border-amber-500/50 transition-all shadow-inner"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                 </div>
                 {activeTab === 'drafts' && (
                    <button 
                      onClick={() => setShowScrapeModal(true)}
                      className="px-6 py-4 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2"
                    >
                       <span className="material-symbols-outlined text-sm">add</span>
                       New Scrape
                    </button>
                 )}
              </div>
           </div>

           <div className="overflow-x-auto">
              {activeTab === 'clients' ? (
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="border-b border-white/5">
                         <th className="pb-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-4">Client</th>
                         <th className="pb-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Vertical / Niche</th>
                         <th className="pb-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">SMS Number</th>
                         <th className="pb-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Total Leads</th>
                         <th className="pb-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] text-right pr-4">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                      {filtered.map(biz => (
                         <tr key={biz.id} className="group hover:bg-white/5 transition-all">
                            <td className="py-6 pl-4">
                               <div className="font-bold text-white uppercase text-xs">{biz.name}</div>
                               <div className="text-[10px] text-slate-500 mt-1">{biz.email || 'No Email'}</div>
                            </td>
                            <td className="py-6">
                               <div className="flex gap-2">
                                  <select 
                                    className="bg-[#060e20] border border-white/5 rounded-xl py-2 px-3 text-[10px] font-black uppercase tracking-widest text-indigo-400 outline-none focus:border-indigo-500/50 appearance-none"
                                    value={biz.ai_niche || 'General'}
                                    onChange={async (e) => {
                                       const newNiche = e.target.value;
                                       try {
                                           await updateBusinessAdmin(biz.id, { ai_niche: newNiche });
                                           setBusinesses(prev => prev.map(p => p.id === biz.id ? { ...p, ai_niche: newNiche } : p));
                                       } catch (err) { console.error('Niche update error:', err); }
                                    }}
                                 >
                                     {Object.keys(INDUSTRY_PROMPTS).map(n => (
                                       <option key={n} value={n}>{n}</option>
                                     ))}
                                  </select>
                                  <button 
                                    onClick={async () => {
                                      const niche = biz.ai_niche || 'General';
                                      const prompt = INDUSTRY_PROMPTS[niche];
                                      if (confirm(`Apply ${niche} blueprint? This will overwrite AI Bio and Rules.`)) {
                                        try {
                                          await updateBusinessAdmin(biz.id, {
                                            ai_rules: {
                                              bio: prompt.prePrompt,
                                              custom_rules: prompt.emergencyRules.map(r => `🚨 Escalation keyword: ${r}`).join('\n')
                                            }
                                          });
                                          alert(`${niche} Blueprint applied!`);
                                        } catch (err) { console.error('Blueprint error:', err); }
                                      }
                                    }}
                                    className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl hover:bg-indigo-500 hover:text-white transition-all"
                                    title="Apply Industry Blueprint"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">auto_fix_high</span>
                                  </button>
                               </div>
                            </td>
                            <td className="py-6">
                               <input
                                 type="text"
                                 defaultValue={biz.telnyx_phone_number || ''}
                                 placeholder="+1 (555) 000-0000"
                                 className="bg-[#060e20] border border-white/5 rounded-xl py-2 px-3 text-[10px] font-mono text-emerald-400 outline-none focus:border-emerald-500/50 w-36 transition-all placeholder:text-slate-700"
                                 onBlur={async (e) => {
                                   const val = e.target.value.trim();
                                   if (val === (biz.telnyx_phone_number || '')) return;
                                   try {
                                     await updateBusinessAdmin(biz.id, { telnyx_phone_number: val || null });
                                     setBusinesses(prev => prev.map(p => p.id === biz.id ? { ...p, telnyx_phone_number: val } : p));
                                   } catch (err) { console.error('Phone update error:', err); }
                                 }}
                               />
                            </td>
                            <td className="py-6">
                               <span className="text-xs font-black text-white px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                                 {biz.leads?.[0]?.count || 0}
                               </span>
                            </td>
                            <td className="py-6 text-right pr-4">
                               <button 
                                 onClick={() => onImpersonate({ id: biz.id, name: biz.name })}
                                 className="px-6 py-2.5 bg-amber-600/10 border border-amber-600/20 text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-amber-600 hover:text-white transition-all shadow-lg hover:shadow-amber-600/20"
                               >
                                  Teleport
                               </button>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
              ) : (
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="border-b border-white/5">
                         <th className="pb-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-4">Company</th>
                         <th className="pb-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Website</th>
                         <th className="pb-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Status</th>
                         <th className="pb-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Confidence</th>
                         <th className="pb-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] text-right pr-4">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                      {drafts.map(draft => (
                         <tr key={draft.id} className="group hover:bg-white/5 transition-all">
                            <td className="py-6 pl-4">
                               <div className="font-bold text-white uppercase text-xs">{draft.business_name}</div>
                               <div className="text-[10px] text-slate-500 mt-1">{draft.city ? `${draft.city}, ${draft.state}` : 'Pending Location'}</div>
                            </td>
                            <td className="py-6">
                               <a href={draft.website_url} target="_blank" className="text-[10px] text-indigo-400 hover:underline font-bold uppercase tracking-widest">{draft.website_url.replace('https://', '')}</a>
                            </td>
                            <td className="py-6">
                               <div className="flex items-center gap-2">
                                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                    draft.draft_status === 'review_ready' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                    draft.draft_status === 'activated' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                    'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse'
                                  }`}>
                                    {draft.draft_status.replace('_', ' ')}
                                  </span>
                               </div>
                            </td>
                            <td className="py-6">
                               <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full transition-all duration-1000 ${
                                      draft.scrape_confidence_score > 0.8 ? 'bg-emerald-500' : 
                                      draft.scrape_confidence_score > 0.5 ? 'bg-amber-500' : 'bg-rose-500'
                                    }`}
                                    style={{ width: `${(draft.scrape_confidence_score * 100) || 10}%` }}
                                  />
                               </div>
                            </td>
                            <td className="py-6 text-right pr-4">
                               <button 
                                 onClick={() => setSelectedDraft(draft)}
                                 className="px-6 py-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-indigo-500 hover:text-white transition-all shadow-lg hover:shadow-indigo-500/20 group-hover:scale-105"
                               >
                                  {draft.draft_status === 'activated' ? 'View Profile' : 'Review Draft'}
                                </button>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
              )}
           </div>
        </div>
      </div>

      {/* 3. PROACTIVE INSIGHTS */}
      <div className="p-10 bg-indigo-500/5 rounded-[3rem] border border-indigo-500/10 flex flex-col md:flex-row items-center gap-8">
         <div className="w-16 h-16 bg-indigo-500 rounded-3xl flex items-center justify-center text-white shrink-0 shadow-2xl shadow-indigo-500/20">
            <span className="material-symbols-outlined text-3xl">psychology</span>
         </div>
         <div className="flex-1 text-center md:text-left">
            <h4 className="text-xl font-headline font-black text-white tracking-tight mb-2">The Hybrid DFY Strategy</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
               Use the <strong className="text-amber-500 font-black">"Teleport"</strong> button to enter a client's dashboard and configure their unique "Hard Rules" or industry-specific prompts. This allows you to provide 
               concierge-level setup in minutes, ensuring their AI assistant feels human and local while you scale toward the 10k/month milestone.
            </p>
         </div>
         <div className="flex gap-4">
            <div className="px-6 py-4 bg-[#060e20] rounded-2xl border border-indigo-500/20 text-center min-w-[120px]">
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Bookings</p>
               <p className="text-lg font-black text-white">{stats.totalBookings}</p>
            </div>
            <div className="px-6 py-4 bg-[#060e20] rounded-2xl border border-indigo-500/20 text-center min-w-[120px]">
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Global Health</p>
               <p className="text-lg font-black text-emerald-400">{stats.avgHealth}%</p>
            </div>
         </div>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {showScrapeModal && (
          <ScrapeModal onClose={() => { setShowScrapeModal(false); setActiveTab('drafts'); }} />
        )}
        {selectedDraft && (
          <DraftReviewView 
            draft={selectedDraft} 
            onClose={() => setSelectedDraft(null)} 
            onActivate={async () => {
              setSelectedDraft(null);
              setActiveTab('clients');
              // Refresh data to show the new business
              const [s, b, l] = await Promise.all([getAdminStats(), getAllBusinesses(), getLeads()])
              setStats(s)
              setBusinesses(b)
              setLeads(l.slice(0, 15))
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
