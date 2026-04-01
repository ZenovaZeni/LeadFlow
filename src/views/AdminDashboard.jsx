import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AdminOverview from '../components/admin/AdminOverview.jsx'
import DraftsManager from '../components/admin/DraftsManager.jsx'
import OnboardingPipeline from '../components/admin/OnboardingPipeline.jsx'
import ClientList from '../components/admin/ClientList.jsx'
import GlobalQATools from '../components/admin/GlobalQATools.jsx'
import SystemLogs from '../components/admin/SystemLogs.jsx'
import { toggleGlobalPause } from '../lib/queries.js'

export default function AdminDashboard({ onImpersonate }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [isSidebarOpen] = useState(true)
  const [isPaused, setIsPaused] = useState(false)

  const handleGlobalPause = async () => {
     const nextState = !isPaused;
     if (confirm(`Are you sure you want to ${nextState ? 'PAUSE' : 'RESUME'} all system activities?`)) {
        try {
           setIsPaused(nextState);
           await toggleGlobalPause(nextState);
        } catch (err) {
           console.error('Failed to toggle pause:', err);
           setIsPaused(!nextState);
        }
     }
  }

  const navItems = [
    { id: 'overview', label: 'Command Center', icon: 'dashboard', color: 'text-indigo-400' },
    { id: 'drafts', label: 'Intake / Drafts', icon: 'magic_button', color: 'text-amber-400' },
    { id: 'onboarding', label: 'Onboarding', icon: 'rocket_launch', color: 'text-indigo-400' },
    { id: 'clients', label: 'Live Clients', icon: 'shield_person', color: 'text-emerald-400' },
    { id: 'qa', label: 'QA / Testing', icon: 'biotech', color: 'text-amber-400' },
    { id: 'logs', label: 'Activity Logs', icon: 'list_alt', color: 'text-slate-500' },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <AdminOverview />
      case 'drafts': return <DraftsManager />
      case 'onboarding': return <OnboardingPipeline />
      case 'clients': return <ClientList onImpersonate={onImpersonate} />
      case 'qa': return <GlobalQATools />
      case 'logs': return <SystemLogs />
      default: return <AdminOverview />
    }
  }

  return (
    <div className="flex h-[calc(100vh-120px)] -mx-12 -mb-20 overflow-hidden bg-[#020617]/50 backdrop-blur-3xl rounded-t-[4rem] border-t border-white/5">
      {/* SIDEBAR */}
      <aside className={`w-80 border-r border-white/5 flex flex-col p-8 transition-all duration-500 ${isSidebarOpen ? '' : 'w-24 overflow-hidden'}`}>
        <div className="flex items-center gap-4 mb-12">
           <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-500 shadow-2xl shadow-indigo-500/10 shrink-0">
              <span className="material-symbols-outlined text-3xl">terminal</span>
           </div>
           {isSidebarOpen && (
             <div>
                <h2 className="text-xl font-headline font-black text-white tracking-tight">Admin Hub</h2>
                <p className="text-[9px] font-black uppercase text-indigo-400 tracking-widest mt-1">LeadFlow Internal Suite</p>
             </div>
           )}
        </div>

        <nav className="flex-1 space-y-3">
           {navItems.map(item => (
             <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${
                   activeTab === item.id ? 'bg-indigo-500/10 border border-indigo-500/20 text-white shadow-xl shadow-indigo-500/5' : 'text-slate-500 hover:text-white'
                }`}
             >
                <span className={`material-symbols-outlined transition-all ${activeTab === item.id ? item.color : 'group-hover:scale-110'}`}>{item.icon}</span>
                {isSidebarOpen && (
                  <span className={`text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === item.id ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`}>{item.label}</span>
                )}
             </button>
           ))}
        </nav>

        {/* Global Action Toggle */}
        <div className="mt-auto pt-8 border-t border-white/5">
           <button 
             onClick={handleGlobalPause}
             className={`w-full flex items-center gap-4 p-5 rounded-[2rem] transition-all shadow-2xl group ${
               isPaused ? 'bg-emerald-500/10 border border-emerald-500/20 shadow-emerald-500/10' : 'bg-rose-500/5 border border-rose-500/10 shadow-rose-500/10 hover:bg-rose-500'
             }`}
           >
              <span className={`material-symbols-outlined group-hover:text-white ${isPaused ? 'text-emerald-400' : 'text-rose-500'}`}>{isPaused ? 'play_arrow' : 'emergency_home'}</span>
              {isSidebarOpen && (
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] group-hover:text-white ${isPaused ? 'text-emerald-400' : 'text-rose-500'}`}>
                  {isPaused ? 'Resume Ops' : 'Global Pause'}
                </span>
              )}
           </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-12 overflow-y-auto custom-scrollbar bg-gradient-to-br from-[#020617] to-transparent">
        <center className="w-full max-w-7xl mx-auto">
          {renderContent()}
        </center>
      </main>
    </div>
  )
}

