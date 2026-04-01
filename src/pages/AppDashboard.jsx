import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import '../styles/dashboard.css'
import { getDashboardStats, getLeads, getLiveEvents, addLead, deleteLead, createSampleLead, toggleLeadUrgency } from '../lib/queries'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import InfoExplainer from '../components/InfoExplainer'
import AITrainingOverlay from '../components/AITrainingOverlay'
import BookingsTab from '../views/BookingsTab'
import BookingModal from '../components/BookingModal'
import NotificationCenter from '../components/NotificationCenter'
import AdminDashboard from '../views/AdminDashboard'

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 15.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
)
const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
)

const tabs = [
  { id: 'overview', label: 'Overview', icon: 'dashboard' },
  { id: 'leads', label: 'Leads', icon: 'chat_bubble' },
  { id: 'bookings', label: 'Bookings', icon: 'calendar_month' },
  { id: 'settings', label: 'Settings', icon: 'settings' }
]

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 10)
  if (digits.length < 4) return digits
  if (digits.length < 7) return `(${digits.slice(0,3)}) ${digits.slice(3)}`
  return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`
}

export default function AppDashboard({ tab, onTabChange, onLogout, theme, toggleTheme, businessName, setBusinessName, isDemo = false }) {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentTab = searchParams.get('tab') || 'overview'

  const [selectedLead, setSelectedLead] = useState(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(!isDemo)
  const [businessId, setBusinessId] = useState(null)
  
  const [aiName, setAiName] = useState('LeadFlow Assistant')
  const [aiAvatar, setAiAvatar] = useState('')
  const [brandingLogoImage, setBrandingLogoImage] = useState('')
  const [toast, setToast] = useState(null)
  const [showAITraining, setShowAITraining] = useState(false)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [bookingLead, setBookingLead] = useState(null)
  const [hasTrainedAI, setHasTrainedAI] = useState(false)
  const [fullBizData, setFullBizData] = useState(null)
  const [bookingsRefreshKey, setBookingsRefreshKey] = useState(0)
  const [calConfig, setCalConfig] = useState({ enabled: false, api_key: '', service_mappings: {} })
  const [newMapping, setNewMapping] = useState({ service: '', eventId: '' })
  const [handoffPhone, setHandoffPhone] = useState('')
  const [aiNiche, setAiNiche] = useState('General')
  
  // 👑 ADMIN STATE
  const isAdmin = !isDemo && (user?.email === 'jdouglas8585@gmail.com' || user?.email === 'officialzenovaai@gmail.com')

  const [impersonatedBiz, setImpersonatedBiz] = useState(null) // { id, name }
  const activeBusinessId = impersonatedBiz ? impersonatedBiz.id : businessId
  const activeBusinessName = impersonatedBiz ? impersonatedBiz.name : businessName

  useEffect(() => {
    if (isDemo || !user) {
      if (!isDemo) setIsLoadingProfile(false);
      return;
    }
    
    async function fetchProfile() {
      try {
        const { data, error } = await supabase.from('businesses').select('*').eq('user_id', user?.id).single()
        if (data) {
          setBusinessName(data.name); setBusinessId(data.id);
          setHasTrainedAI(data.has_trained_ai || false);
          setFullBizData(data);
          if (data.branding) {
             setAiName(data.branding.ai_name || 'LeadFlow AI')
             setAiAvatar(data.branding.ai_avatar || '')
             setBrandingLogoImage(data.branding.logo_image || '')
          }
          if (data.integrations) {
             setCalConfig(data.integrations.cal_com || { enabled: false, api_key: '', service_mappings: {} })
          }
          setHandoffPhone(data.handoff_phone || '')
           setShowOnboarding(false)
        } else { setShowOnboarding(true); }
      } catch (err) { console.error('Supabase fetch error:', err); }
      finally { setIsLoadingProfile(false) }
    }
    fetchProfile()
  }, [user, isDemo])

  const onTabChangeInternal = (newTab) => {
    setSearchParams({ tab: newTab }, { replace: true })
    onTabChange(newTab);
    setSelectedLead(null);
  }

  if (isLoadingProfile) return <LoadingSkeleton />

  return (
    <div className="dash dash-top-layout bg-[#060e20] text-[#dee5ff] font-body min-h-screen">
      <header className="fixed top-0 w-full z-50 bg-[#060e20]/80 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-indigo-900/10">
        <div className="flex justify-between items-center px-8 py-4 w-full">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-indigo-500 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>bubble_chart</span>
            <span className="text-2xl font-black bg-gradient-to-r from-[#818cf8] to-[#4F46E5] bg-clip-text text-transparent font-headline tracking-tight">LeadFlow</span>
            {isDemo && (
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] animate-pulse ml-2">
                Demo Mode
              </span>
            )}
          </div>
          <nav className="hidden md:flex gap-8 items-center">
            {tabs.map(t => (
              <button key={t.id} className={`transition-colors font-headline text-sm font-semibold ${currentTab === t.id ? 'text-indigo-500' : 'text-slate-400 hover:text-indigo-400'}`} onClick={() => onTabChangeInternal(t.id)}>{t.label}</button>
            ))}
            {isAdmin && !isDemo && (
              <button 
                className={`transition-all font-headline text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl border focus:ring-0 focus:outline-none ${currentTab === 'admin' ? 'border-amber-500/50 text-amber-500 bg-amber-500/5' : 'border-white/5 text-slate-500 hover:text-amber-400 hover:border-amber-500/20'}`} 
                onClick={() => onTabChangeInternal('admin')}
              >
                Admin Hub
              </button>
            )}
          </nav>
          <div className="flex items-center gap-6">
             <NotificationCenter businessId={businessId} isDemo={isDemo} />
             
             <div className="flex items-center gap-2 pr-4 border-r border-white/10">
                <button 
                  onClick={() => onTabChangeInternal('settings')}
                  className="w-10 h-10 rounded-full border-2 border-indigo-500/20 bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-xs hover:border-indigo-500/40 hover:bg-indigo-500/20 transition-all cursor-pointer"
                >
                  {businessName?.substring(0, 2).toUpperCase() || 'LF'}
                </button>
                <div className="hidden lg:block text-left">
                   <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase leading-none">Business</p>
                   <p className="text-xs font-bold text-white mt-1">{businessName || 'LeadFlow User'}</p>
                </div>
             </div>
             <button 
               onClick={onLogout}
               className="flex items-center gap-2 text-slate-500 hover:text-rose-400 transition-colors group"
               title="Log Out"
             >
               <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">logout</span>
               <span className="hidden lg:block text-[10px] font-black uppercase tracking-widest">Logout</span>
             </button>
          </div>
        </div>
      </header>
      <main className="pt-24 pb-32 md:pb-20 px-4 md:px-8 w-full flex flex-col gap-8 md:gap-12">
        {currentTab === 'overview' && <OverviewTab onViewLeads={() => onTabChangeInternal('leads')} isDemo={isDemo} businessName={activeBusinessName} businessId={activeBusinessId} hasTrainedAI={hasTrainedAI} onStartTraining={() => setShowAITraining(true)} />}
        {currentTab === 'leads' && <LeadsTab selectedLead={selectedLead} setSelectedLead={setSelectedLead} isDemo={isDemo} businessId={activeBusinessId} onBookAppointment={(lead) => { setBookingLead(lead); setIsBookingModalOpen(true); }} />}
        {currentTab === 'bookings' && <BookingsTab key={bookingsRefreshKey} isDemo={isDemo} businessId={activeBusinessId} />}
        {currentTab === 'settings' && (
          <SettingsTab 
            isDemo={isDemo} 
            businessName={activeBusinessName} 
            setBusinessName={setBusinessName} 
            aiName={aiName} 
            setAiName={setAiName} 
            aiAvatar={aiAvatar} 
            setAiAvatar={setAiAvatar} 
            brandingLogoImage={brandingLogoImage} 
            setBrandingLogoImage={setBrandingLogoImage} 
            calConfig={calConfig}
            setCalConfig={setCalConfig}
            newMapping={newMapping}
            setNewMapping={setNewMapping}
            businessId={activeBusinessId}
          />
        )}
        {currentTab === 'admin' && isAdmin && !isDemo && (
          <AdminDashboard 
            onImpersonate={(biz) => {
              setImpersonatedBiz(biz);
              onTabChangeInternal('overview');
            }} 
          />
        )}

        {/* Impersonation Banner */}
        {impersonatedBiz && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] bg-amber-600 text-white px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-6 animate-bounce-subtle border-2 border-white/20">
             <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-xl">visibility</span>
                <p className="text-xs font-black uppercase tracking-widest">Viewing as: <span className="text-amber-100">{impersonatedBiz.name}</span></p>
             </div>
             <button 
               onClick={() => setImpersonatedBiz(null)}
               className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all"
               title="Stop Impersonation"
             >
                <span className="material-symbols-outlined text-sm">close</span>
             </button>
          </div>
        )}
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#060e20]/90 backdrop-blur-2xl border-t border-white/5 px-6 py-4 flex justify-around items-center z-[100] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {tabs.map(t => (
          <button 
            key={t.id} 
            onClick={() => onTabChangeInternal(t.id)}
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${currentTab === t.id ? 'text-indigo-400 scale-110' : 'text-slate-500'}`}
          >
            <span className={`material-symbols-outlined text-2xl ${currentTab === t.id ? 'font-fill' : ''}`} style={{ fontVariationSettings: currentTab === t.id ? "'FILL' 1" : "'FILL' 0" }}>{t.icon}</span>
            <span className="text-[9px] font-black uppercase tracking-widest">{t.label}</span>
            {currentTab === t.id && <div className="w-1 h-1 rounded-full bg-indigo-400 shadow-[0_0_8px_#6366f1] mt-0.5"></div>}
          </button>
        ))}
      </nav>
      
      {showOnboarding && <OnboardingOverlay isDemo={isDemo} onComplete={(name) => { setBusinessName(name); setShowOnboarding(false); }} />}
      {showAITraining && (
        <AITrainingOverlay 
          businessId={businessId} 
          isDemo={isDemo}
          initialData={fullBizData} 
          onComplete={() => {
            setShowAITraining(false);
            setHasTrainedAI(true);
            setToast({ type: 'success', message: 'Assistant Training Complete! Your smart agent is now active.' });
            setTimeout(() => setToast(null), 5000);
          }} 
          onCancel={() => setShowAITraining(false)} 
        />
      )}
      {toast && (
        <div className={`toast toast-${toast.type} animate-fade-in-up`} style={{
          position: 'fixed', bottom: '24px', right: '24px', padding: '12px 20px',
          background: 'rgba(15, 25, 48, 0.9)', borderLeft: `4px solid ${toast.type === 'success' ? '#10b981' : '#f59e0b'}`,
          borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 9999,
          display: 'flex', alignItems: 'center', gap: '10px', backdropFilter: 'blur(10px)'
        }}>
          <span>{toast.type === 'success' ? '✅' : '⚡'}</span><span>{toast.message}</span>
        </div>
      )}
      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => {
          setIsBookingModalOpen(false);
          setBookingsRefreshKey(prev => prev + 1);
        }} 
        lead={bookingLead} 
        isDemo={isDemo} 
        businessId={businessId} 
      />
    </div>
  )
}

function OverviewTab({ onViewLeads, isDemo = false, businessName, businessId, hasTrainedAI, onStartTraining }) {
  const [loading, setLoading] = useState(true)
  const [statsData, setStatsData] = useState(null)
  const [liveEvents, setLiveEvents] = useState([])
  const [recentLeads, setRecentLeads] = useState([])

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        const [stats, leads, events] = await Promise.all([
          getDashboardStats(isDemo, businessId),
          getLeads(isDemo, businessId),
          getLiveEvents(isDemo)
        ])
        if (active) {
          setStatsData(stats)
          setRecentLeads(leads?.slice(0, 8) || [])
          setLiveEvents(events || [])
          setLoading(false)
        }
      } catch (err) {
        console.error('Overview data error:', err)
        if (active) setLoading(false)
      }
    }
    loadData()
    return () => { active = false }
  }, [isDemo, businessId])

  if (loading || !statsData) return <div className="p-24 animate-pulse text-indigo-400">Loading Revenue Intelligence...</div>

  return (
    <div className="animate-fade-in flex flex-col gap-12">
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: 'Leads Captured', value: statsData.leadsCaptured, color: 'text-[#4F46E5]' },
          { label: 'Avg Response', value: '24s', sub: 'Target: < 30s' },
          { label: 'Jobs Booked', value: statsData.jobsBooked },
          { label: 'Pending Bookings', value: statsData.pendingBookings, color: 'text-[#818cf8]' },
          { label: 'Est. Revenue', value: statsData.estimatedRevenue },
          { label: 'Voice Calls', value: 'Coming Soon', opacity: true }
        ].map((stat, i) => (
          <div key={i} className={`glass-card p-5 rounded-3xl flex flex-col justify-between group hover:bg-[#192540] transition-all ${stat.alert ? 'border-[#ff6e84]/20' : ''}`}>
             <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest font-headline">{stat.label}</span>
             <div className="mt-3 flex items-baseline gap-2">
                <span className={`text-3xl font-headline font-extrabold ${stat.color || 'text-white'} ${stat.opacity ? 'opacity-30' : ''}`}>{stat.value}</span>
             </div>
             {stat.sub && <div className="text-[9px] text-slate-500 mt-2">{stat.sub}</div>}
          </div>
        ))}
      </section>

      {!hasTrainedAI && (
        <section className="bg-gradient-to-r from-indigo-600/10 via-indigo-500/5 to-transparent border border-indigo-500/20 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-indigo-500/40 transition-all cursor-pointer shadow-2xl shadow-indigo-500/5" onClick={onStartTraining}>
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-indigo-500 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                 <span className="material-symbols-outlined text-3xl">psychology</span>
              </div>
              <div>
                 <h3 className="text-xl font-headline font-extrabold text-white tracking-tight">Configure Your Assistant</h3>
                 <p className="text-slate-400 text-sm mt-1">Upload FAQs, set response rules, and define your tone.</p>
              </div>
           </div>
           <button className="px-8 py-4 bg-white text-[#060e20] rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-white/5 group-hover:bg-indigo-500 group-hover:text-white transition-all">Start Training</button>
        </section>
      )}

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#091328]/50 rounded-[2.5rem] p-8 border border-white/5 h-[400px] hover:border-white/10 transition-colors">
           <h2 className="text-2xl font-headline font-black text-white tracking-tight mb-2">Revenue Intelligence</h2>
           <p className="text-slate-500 text-sm mb-12">Performance vs Daily Targets</p>
           <div className="w-full h-48 flex items-end gap-3 px-4">
              {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                <div key={i} className="flex-1 bg-indigo-500/20 rounded-t-xl group/bar relative hover:bg-indigo-500/40 transition-all" style={{ height: `${h}%` }}>
                   <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-indigo-600 text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity text-white">${(h*12).toLocaleString()}</div>
                </div>
              ))}
           </div>
           <div className="flex justify-between mt-6 px-4 text-[10px] font-black uppercase text-slate-600 tracking-widest">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
           </div>
        </div>

        <div className="bg-[#091328]/50 rounded-[2.5rem] p-8 border border-white/5 flex flex-col h-[400px] hover:border-white/10 transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-headline font-bold text-white tracking-tight">Recent Leads</h2>
            <button onClick={onViewLeads} className="text-[10px] font-black uppercase text-indigo-400 hover:text-indigo-300 transition-colors tracking-widest">View All</button>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {recentLeads.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20 text-center px-4">
                <span className="material-symbols-outlined text-4xl mb-2">person_search</span>
                <p className="text-xs font-bold uppercase tracking-widest">No recent leads</p>
              </div>
            ) : (
              recentLeads.map((lead) => (
                <div key={lead.id} onClick={onViewLeads} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer group">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{lead.name}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 uppercase font-bold tracking-wider">{lead.service || 'General Inquiry'}</p>
                    </div>
                    <span className={`text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-tighter ${lead.status === 'new' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                      {lead.status === 'assistant_handling' ? 'Assistant Handling' : (lead.status || 'New')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="bg-[#091328]/50 rounded-[2.5rem] p-10 border border-white/5 hover:border-white/10 transition-colors">
        <div className="flex items-center gap-4 mb-10">
           <span className="material-symbols-outlined text-indigo-500 bg-indigo-500/10 p-3 rounded-2xl">sensors</span>
           <div>
              <h2 className="text-2xl font-headline font-black text-white tracking-tight">Live Activity</h2>
              <p className="text-slate-500 text-sm">Real-time engagement from your Assistant</p>
           </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {liveEvents.slice(0, 6).map((event) => (
            <div key={event.id} className="flex gap-5 items-start relative pl-6 border-l-2 border-indigo-500/20 hover:border-indigo-500 transition-all py-2">
              <div className="flex-1">
                <p className="text-sm text-white font-medium leading-relaxed"><strong>{event.leadName}</strong>: {event.text}</p>
                <div className="flex items-center gap-2 mt-3">
                   <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                   <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{event.timeAgo}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function LeadsTab({ selectedLead, setSelectedLead, isDemo = false, businessId, onBookAppointment }) {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [draftMsg, setDraftMsg] = useState('')
  const [showAddLead, setShowAddLead] = useState(false)
  const [newLead, setNewLead] = useState({ name: '', phone: '', email: '', service: '' })
  const [isDeleting, setIsDeleting] = useState(false)

  const refreshLeads = () => {
    setLoading(true)
    getLeads(isDemo, businessId).then(data => {
      setLeads(data || [])
      setLoading(false)
    })
  }

  useEffect(() => {
    refreshLeads()
  }, [isDemo, businessId])

  const handleAddLead = async (e) => {
    e.preventDefault()
    if (!newLead.name || !newLead.phone) return alert('Name and Phone are required')
    try {
      await addLead(businessId, { ...newLead, status: 'new', urgency: 'Medium' })
      setShowAddLead(false)
      setNewLead({ name: '', phone: '', email: '', service: '' })
      refreshLeads()
    } catch (err) {
      console.error('Error adding lead:', err)
      alert('Failed to add lead')
    }
  }

  const handleToggleUrgency = async () => {
    if (!selectedLead) return
    const newStatus = !selectedLead.is_urgent
    try {
      await toggleLeadUrgency(selectedLead.id, newStatus)
      setSelectedLead({ ...selectedLead, is_urgent: newStatus })
      refreshLeads()
    } catch (err) {
      console.error('Error toggling urgency:', err)
      alert('Failed to update urgency')
    }
  }

  const handleDeleteLead = async (id) => {
    if (!confirm('Are you sure you want to delete this lead?')) return
    setIsDeleting(true)
    try {
      await deleteLead(id)
      setSelectedLead(null)
      refreshLeads()
    } catch (err) {
      console.error('Error deleting lead:', err)
      alert('Failed to delete lead')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleExportCSV = () => {
    if (!leads || leads.length === 0) return alert('No leads to export')
    
    const headers = ['Name', 'Phone', 'Email', 'Service', 'Urgency', 'Status', 'Temperature']
    const csvRows = [
      headers.join(','),
      ...leads.map(l => [
        `"${l.name || ''}"`,
        `"${l.phone || ''}"`,
        `"${l.email || ''}"`,
        `"${l.service || ''}"`,
        `"${l.urgency || ''}"`,
        `"${l.status || ''}"`,
        `"${l.temperature || ''}"`
      ].join(','))
    ]
    
    const csvString = csvRows.join('\\n')
    const blob = new Blob([csvString], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('hidden', '')
    a.setAttribute('href', url)
    a.setAttribute('download', 'leadflow_export.csv')
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleImportCSV = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = async (event) => {
      const text = event.target.result
      const lines = text.split('\\n').filter(l => l.trim())
      if (lines.length <= 1) return alert('No data found in CSV')
      
      const imported = []
      // Skip header
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.replace(/"/g, '').trim())
        if (parts.length >= 2) {
          imported.push({
            name: parts[0],
            phone: parts[1],
            email: parts[2] || '',
            service: parts[3] || 'Imported Lead',
            urgency: parts[4] || 'Medium',
            status: 'new'
          })
        }
      }
      
      if (imported.length > 0) {
        setLoading(true)
        try {
          await Promise.all(imported.map(l => addLead(businessId, l)))
          alert(`Successfully imported ${imported.length} leads`)
          refreshLeads()
        } catch (err) {
          console.error('Import error:', err)
          alert('Failed to import some leads')
        } finally {
          setLoading(false)
        }
      }
    }
    reader.readAsText(file)
  }

  if (loading) return <div className="p-24 animate-pulse text-indigo-400">Loading Intelligence...</div>

  const filtered = (leads || []).filter(lead => 
    lead.name?.toLowerCase().includes(search.toLowerCase()) ||
    lead.service?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] xl:grid-cols-[360px_1fr_400px] gap-6 h-[calc(100vh-160px)] animate-fade-in relative pb-12">
      {/* 1. LEAD LIST SIDEBAR */}
      <aside className={`flex flex-col bg-[#091328]/40 backdrop-blur-md rounded-[2.5rem] border border-white/5 overflow-hidden transition-all duration-500 ${selectedLead ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-8 border-b border-white/5">
           <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                 <h2 className="text-3xl font-headline font-black text-white">Leads</h2>
                 <InfoExplainer text="Active leads are potential customers who have engaged with your AI or were manually added." />
              </div>
              <div className="flex items-center gap-1.5">
                <input 
                  type="file" 
                  id="csv-import" 
                  className="hidden" 
                  accept=".csv" 
                  onChange={handleImportCSV} 
                />
                <div className="flex items-center gap-1 bg-white/5 border border-white/5 rounded-xl px-2 py-1 hover:bg-white/10 transition-all">
                   <button 
                     onClick={() => document.getElementById('csv-import').click()}
                     className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                     title="Import CSV"
                   >
                      <span className="material-symbols-outlined text-xl">upload_file</span>
                   </button>
                   <InfoExplainer text="Bulk import leads from a CSV file. Format: Name, Phone, Email, Service." />
                </div>
                
                <div className="flex items-center gap-1 bg-white/5 border border-white/5 rounded-xl px-2 py-1 hover:bg-white/10 transition-all">
                   <button 
                     onClick={handleExportCSV}
                     className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                     title="Export CSV"
                   >
                      <span className="material-symbols-outlined text-xl">download</span>
                   </button>
                   <InfoExplainer text="Export your full leads list as a CSV file for backup or external analysis." />
                </div>

                <button 
                  onClick={() => setShowAddLead(true)}
                  className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all shadow-lg shadow-indigo-500/5 group ml-1"
                  title="Add New Lead"
                >
                   <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">person_add</span>
                </button>
              </div>
           </div>
           
           {showAddLead && (
             <div className="mb-6 p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-3xl animate-fade-in-up">
                <div className="flex justify-between items-center mb-4">
                   <h4 className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Add Manual Lead</h4>
                   <button onClick={() => setShowAddLead(false)} className="text-slate-500 hover:text-white transition-colors"><span className="material-symbols-outlined text-sm">close</span></button>
                </div>
                <form onSubmit={handleAddLead} className="space-y-3">
                   <input type="text" placeholder="Full Name" className="w-full bg-[#060e20] border border-white/5 rounded-xl py-2.5 px-4 text-xs text-white outline-none focus:border-indigo-500/50" value={newLead.name} onChange={e => setNewLead({...newLead, name: e.target.value})} required />
                   <input type="tel" placeholder="(555) 000-0000" maxLength={14} className="w-full bg-[#060e20] border border-white/5 rounded-xl py-2.5 px-4 text-xs text-white outline-none focus:border-indigo-500/50" value={newLead.phone} onChange={e => setNewLead({...newLead, phone: formatPhone(e.target.value)})} required />
                   <input type="text" placeholder="Service Needed" className="w-full bg-[#060e20] border border-white/5 rounded-xl py-2.5 px-4 text-xs text-white outline-none focus:border-indigo-500/50" value={newLead.service} onChange={e => setNewLead({...newLead, service: e.target.value})} />
                   <button type="submit" className="w-full bg-indigo-600 text-white rounded-xl py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all">Save Lead</button>
                </form>
             </div>
           )}

           <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm group-focus-within:text-indigo-500 transition-colors">search</span>
              <input type="text" placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[#060e20]/50 border border-white/5 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/30 transition-all font-medium placeholder:text-slate-600" />
           </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {filtered.map(lead => (
            <div key={lead.id} onClick={() => setSelectedLead(lead)} className={`p-5 rounded-[2.2rem] cursor-pointer border transition-all duration-300 group relative ${selectedLead?.id === lead.id ? 'bg-[#192540] border-indigo-500/30 shadow-2xl' : 'bg-transparent border-transparent hover:bg-white/5'}`}>
              {selectedLead?.id === lead.id && <div className="absolute left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]"></div>}
              <div className="pl-4">
                 <div className="flex justify-between items-start gap-2">
                    <div className="flex flex-col gap-1">
                       <h3 className={`font-bold text-sm truncate transition-colors ${selectedLead?.id === lead.id ? 'text-indigo-400' : 'text-slate-200 group-hover:text-white'}`}>{lead.name}</h3>
                       <div className="flex items-center gap-2">
                          {lead.is_urgent && (
                            <span className="flex items-center gap-0.5 text-[8px] font-black bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded-md animate-pulse border border-rose-500/20">
                               <span className="material-symbols-outlined text-[10px]">emergency</span> URGENT
                            </span>
                          )}
                          {lead.voicemail_transcript && (
                            <span className="material-symbols-outlined text-indigo-400 text-sm" title="Voicemail Received">voicemail</span>
                          )}
                       </div>
                    </div>
                    {lead.is_sample && (
                      <span className="bg-indigo-500/20 text-indigo-400 text-[8px] font-black px-1.5 py-0.5 rounded-md tracking-tighter shrink-0 border border-indigo-500/10">DEMO LEAD</span>
                    )}
                 </div>
                 <p className="text-[10px] text-slate-500 truncate mt-1 font-medium tracking-tight uppercase tracking-[0.05em]">{lead.service}</p>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* 2. CONVERSATION VIEW (READING LANE) */}
      <main className={`flex flex-col bg-[#091328]/40 backdrop-blur-md rounded-[2.5rem] border border-white/5 overflow-hidden transition-all duration-500 ${!selectedLead ? 'hidden lg:flex items-center justify-center' : 'flex'}`}>
        {!selectedLead ? (
          <div className="flex flex-col items-center gap-6 opacity-30 text-center max-w-sm">
             <span className="material-symbols-outlined text-7xl">forum</span>
             <p className="text-slate-400 font-headline font-bold">Inbox empty. Select a lead to reveal conversation history.</p>
          </div>
        ) : (
          <div className="flex flex-col h-full relative">
            <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-[#091328]/20">
                <div className="flex items-center gap-4">
                   <button onClick={() => setSelectedLead(null)} className="lg:hidden material-symbols-outlined text-slate-400">arrow_back</button>
                   <div>
                       <div className="flex items-center gap-3">
                          <h2 className="text-xl font-headline font-black text-white tracking-tight">{selectedLead.name}</h2>
                          {selectedLead.is_urgent && (
                            <span className="flex items-center gap-1 bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-lg shadow-rose-900/40 animate-pulse">
                               <span className="material-symbols-outlined text-xs">emergency</span> Escalated
                            </span>
                          )}
                       </div>
                       <div className="flex items-center gap-2 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none pt-0.5">{selectedLead.booking_status ? `Booking: ${selectedLead.booking_status}` : 'Live Session'}</p>
                       </div>
                    </div>
                </div>
                <div className="flex gap-2">
                   <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-2 hover:bg-indigo-500 hover:text-white transition-all group cursor-pointer" onClick={() => {/* Future Implementation */}}>
                      <span className="material-symbols-outlined text-sm text-indigo-400 group-hover:text-white">link</span>
                   </div>
                   <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all"><span className="material-symbols-outlined text-sm">call</span></button>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-gradient-to-b from-transparent to-black/10">
                <div className="max-w-3xl mx-auto w-full space-y-8 py-4">
                    {/* SYSTEM GENERATED CHAT EXAMPLE */}
                    <div className="flex justify-start">
                       <div className="max-w-[85%] bg-[#192540] rounded-3xl p-6 border border-white/5 shadow-xl">
                          <p className="text-[13px] text-slate-100 font-medium leading-[1.6]">Hi! I saw your ad for {selectedLead.service}. Can you tell me more about your pricing?</p>
                          <span className="text-[10px] text-slate-500 mt-3 block font-black uppercase tracking-widest">Yesterday, 11:40 AM</span>
                       </div>
                    </div>
                    <div className="flex justify-end">
                       <div className="max-w-[85%] bg-indigo-600 rounded-3xl p-6 shadow-2xl shadow-indigo-500/10">
                          <p className="text-[13px] text-white font-medium leading-[1.6]">Hello! I'd love to help with that. To give you an accurate quote, do you have any photos of the project or a rough square footage?</p>
                          <span className="text-[10px] text-indigo-200 mt-3 block font-black uppercase tracking-widest">Yesterday, 11:42 AM</span>
                       </div>
                    </div>
                </div>
            </div>

            <div className="p-8 border-t border-white/5 bg-[#091328]/40 shadow-[0_-10px_30px_rgba(0,0,0,0.2)]">
                <div className="max-w-3xl mx-auto w-full relative group">
                    <textarea 
                      placeholder="Type a premium response..." 
                      className="w-full bg-[#060e20] border border-white/10 rounded-[2rem] p-6 pr-20 text-sm text-white min-h-[100px] focus:outline-none focus:border-indigo-500/40 transition-all shadow-inner resize-none font-medium placeholder:text-slate-600" 
                      value={draftMsg} 
                      onChange={(e) => setDraftMsg(e.target.value)}
                    ></textarea>
                    <button className="absolute bottom-6 right-6 w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-900/40 hover:bg-slate-900 transition-all group-focus-within:scale-105">
                       <span className="material-symbols-outlined">send</span>
                    </button>
                    <div className="absolute -top-6 left-6 text-[9px] font-black uppercase text-indigo-400 tracking-widest px-3 py-1 bg-indigo-500/10 rounded-full flex items-center">
                       Smart Draft Enabled
                       <InfoExplainer text="Your assistant drafts responses based on your business intelligence to help you respond instantly." />
                    </div>
                </div>
            </div>
          </div>
        )}
      </main>
      {/* 3. LEAD INTELLIGENCE (RIGHT PANEL) */}
       <aside className={`hidden xl:flex flex-col bg-[#091328]/40 backdrop-blur-md rounded-[2.5rem] border border-white/5 overflow-hidden transition-all duration-500 ${!selectedLead ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
        {selectedLead && (
          <div className="flex flex-col h-full">
            <div className="p-8 border-b border-white/5">
               <div className="flex items-center mb-4">
                  <h3 className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.2em]">Assistant Intelligence</h3>
                  <InfoExplainer text="This score is calculated based on lead urgency, frequency of engagement, and specific high-intent keywords." />
               </div>
               <div className="flex items-center gap-4 p-4 bg-white/5 rounded-3xl mb-8">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 font-black text-xs">98%</div>
                  <div>
                     <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Intent Score</p>
                     <p className="text-xs text-white font-bold">Highly Qualified</p>
                  </div>
               </div>
               
               <div className="space-y-6">
                  <div className="space-y-1">
                     <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Contact Information</p>
                     <p className="text-sm font-bold text-white">{selectedLead.phone}</p>
                     <p className="text-[11px] text-slate-400 font-medium">{selectedLead.email || 'Email not captured'}</p>
                  </div>
                  <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Desired Service</p>
                      <p className="text-sm font-extrabold text-[#5eead4]">{selectedLead.service}</p>
                   </div>
                   {selectedLead.voicemail_transcript && (
                     <div className="p-5 bg-indigo-500/10 rounded-3xl border border-indigo-500/20 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                           <span className="material-symbols-outlined text-3xl">voicemail</span>
                        </div>
                        <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-3">AI Voicemail Transcript</p>
                        <p className="text-[11px] text-slate-300 font-medium leading-relaxed italic">"{selectedLead.voicemail_transcript}"</p>
                        <div className="mt-4 flex items-center justify-between">
                           <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest italic flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-indigo-500"></span> Verified LeadFlow Audio
                           </span>
                           <button className="text-[9px] font-black uppercase text-indigo-400 hover:text-white transition-colors">Play Audio</button>
                        </div>
                     </div>
                   )}
                </div>
             </div>
            
            <div className="p-8 space-y-8 flex-1">
               <div className="space-y-4">
                  <h4 className="text-xs font-black text-white uppercase tracking-widest">Lead Actions</h4>
                   <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => onBookAppointment(selectedLead)}
                          className="flex flex-col items-center gap-2 p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all group"
                        >
                           <span className="material-symbols-outlined text-indigo-400 group-hover:text-white">calendar_add_on</span>
                           <span className="text-[10px] font-black uppercase">Book Appointment</span>
                        </button>
                        <button 
                          onClick={handleToggleUrgency}
                          className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all group ${selectedLead.is_urgent ? 'bg-rose-500/20 border-rose-500/30 text-rose-400' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400'}`}
                        >
                           <span className={`material-symbols-outlined ${selectedLead.is_urgent ? 'animate-pulse' : ''}`}>{selectedLead.is_urgent ? 'emergency' : 'priority_high'}</span>
                           <span className="text-[10px] font-black uppercase">{selectedLead.is_urgent ? 'Escalated' : 'Escalate'}</span>
                        </button>
                        <button className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
                           <span className="material-symbols-outlined text-emerald-400">check_circle</span>
                           <span className="text-[10px] font-black uppercase">Archive</span>
                        </button>
                       <button 
                         onClick={() => handleDeleteLead(selectedLead.id)}
                         disabled={isDeleting}
                         className="flex flex-col items-center gap-2 p-4 bg-rose-500/5 rounded-2xl border border-rose-500/10 hover:bg-rose-500/10 transition-all group"
                       >
                          <span className={`material-symbols-outlined text-rose-500 group-hover:scale-110 transition-transform ${isDeleting ? 'animate-pulse' : ''}`}>delete</span>
                          <span className="text-[10px] font-black uppercase text-rose-500">{isDeleting ? 'Deleting...' : 'Delete Lead'}</span>
                       </button>
                    </div>
               </div>
                             {selectedLead.booking_status && (
                  <div className="p-6 bg-indigo-500/10 rounded-[2rem] border border-indigo-500/20 mt-6">
                     <div className="flex justify-between items-center mb-2">
                        <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Active Booking</p>
                        <span className="text-[8px] font-black bg-indigo-500 text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">{selectedLead.booking_status}</span>
                     </div>
                     <p className="text-[11px] text-white/80 font-bold">Scheduled for March 28th at 9:00 AM</p>
                  </div>
                )}
                
                <div className="p-6 bg-amber-500/5 rounded-[2rem] border border-amber-500/20 mt-6">
                   <p className="text-[10px] text-amber-500/60 font-black uppercase tracking-widest mb-2">Internal Note</p>
                   <p className="text-[11px] text-white/80 leading-relaxed font-medium italic">Lead mentioned they have a 2500 sq ft roof and want a metal shingle estimate by Friday.</p>
                </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}


function SettingsTab({ 
  businessName, setBusinessName, 
  aiName, setAiName, 
  aiAvatar, setAiAvatar, 
  brandingLogoImage, setBrandingLogoImage, 
  calConfig, setCalConfig,
  newMapping, setNewMapping,
  isDemo = false 
}) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [businessId, setBusinessId] = useState(null)
  
  // Profile & Foundation State
  const [businessEmail, setBusinessEmail] = useState('')
  const [businessPhone, setBusinessPhone] = useState('')
  const [businessWebsite, setBusinessWebsite] = useState('')
  const [businessAddress, setBusinessAddress] = useState('')
  
  // Operational Bounds State
  const [minTicket, setMinTicket] = useState('$500')
  const [serviceFee, setServiceFee] = useState('$99')
  const [serviceRadii, setServiceRadii] = useState('Austin + 40mi')
  
  // Branding State
  const [brandingHeadline, setBrandingHeadline] = useState('Get a Free Estimate')
  const [brandingSubheadline, setBrandingSubheadline] = useState("Fill out the form and we'll get back to you right away.")
  const [brandingColor, setBrandingColor] = useState('#2d6a4f')
  const [brandingLogo, setBrandingLogo] = useState('🌳')
  
  // AI Rules State
  const [aiBio, setAiBio] = useState('')
  const [aiGoal, setAiGoal] = useState('')
  const [aiTone, setAiTone] = useState('Professional')
  const [aiCustomRules, setAiCustomRules] = useState('')
  const [faqs, setFaqs] = useState([])
  
  // Workflow State expansion
  const [responseDelay, setResponseDelay] = useState('2s')
  const [routingMode, setRoutingMode] = useState('standard')
  const [afterHoursAi, setAfterHoursAi] = useState(true)
  const [leadCapacity, setLeadCapacity] = useState('No Limit')
  const [autoArchiveDays, setAutoArchiveDays] = useState('7')
  const [followUpEnabled, setFollowUpEnabled] = useState(true)
  const [urgencyKeywords, setUrgencyKeywords] = useState('emergency, urgent, leaking, broken')
  const [handoffPhone, setHandoffPhone] = useState('')

  // Notifications State
  const [smsAlerts, setSmsAlerts] = useState(true)
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [weeklyReports, setWeeklyReports] = useState(true)
  
  // Booking Settings State
  const [bookingEnabled, setBookingEnabled] = useState(true)
  const [bookingMode, setBookingMode] = useState('assistant') // manual, link, assistant
  const [bookingUrl, setBookingUrl] = useState('')
  const [bookingTrigger, setBookingTrigger] = useState('qualification') // schedule, qualification, first_response
  const [appointmentDuration, setAppointmentDuration] = useState('30')
  const [bookingBuffer, setBookingBuffer] = useState('15')
  const [confirmationPolicy, setConfirmationPolicy] = useState('manual') // auto, manual
  const [serviceRadius, setServiceRadius] = useState('25')
  const [serviceCities, setServiceCities] = useState('')
  
  // Booking Message Templates
  const [msgTemplateBooking, setMsgTemplateBooking] = useState('Thanks — we can get this scheduled. Here are our next available times: {{available_times}}')
  const [msgTemplateConfirm, setMsgTemplateConfirm] = useState('You’re booked for {{booking_time}}. We’ll see you then.')
  const [msgTemplateReschedule, setMsgTemplateReschedule] = useState('No problem — let’s find another time that works.')
  const [msgTemplateCallback, setMsgTemplateCallback] = useState('Thanks. We’ll review this and call you to confirm the best time.')

  // Assistant-Guided Booking Logic
  const [maxSuggestions, setMaxSuggestions] = useState('2')
  const [suggestedWindows, setSuggestedWindows] = useState([
    { day: 'Mon-Fri', times: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'] }
  ])
  const [bookingEligibility, setBookingEligibility] = useState('qualification') // qualification, approval, standard
  const [escalationRules, setEscalationRules] = useState({
    emergency: 'callback',
    outside_area: 'callback',
    same_day: 'callback',
    pricing_only: 'notify'
  })

  // Reminder Placeholders
  const [reminderEnabled, setReminderEnabled] = useState(true)
  const [reminderMessage, setReminderMessage] = useState('Hi {{customer_name}}, just a reminder for your appointment at {{booking_time}}.')
  const [reminderTime, setReminderTime] = useState('24') // hours before

  // External Calendar
  const [externalCalendarType, setExternalCalendarType] = useState('none') // none, google, cal, calendly
  const [externalCalendarUrl, setExternalCalendarUrl] = useState('')
  
  // UI State
  const [settingsView, setSettingsView] = useState('profile')
  const [hasChanges, setHasChanges] = useState(false)
  const [showFaqForm, setShowFaqForm] = useState(false)
  const [newFaq, setNewFaq] = useState({ q: '', a: '' })
  const [showCopied, setShowCopied] = useState(false)

  const handleCopyLink = () => {
    const url = `${window.location.origin}/lead/${businessId}`
    navigator.clipboard.writeText(url)
    setShowCopied(true)
    setTimeout(() => setShowCopied(false), 2000)
  }

  const handlePreview = () => {
    const url = `${window.location.origin}/lead/${businessId}`
    window.open(url, '_blank')
  }

  const [businessHours, setBusinessHours] = useState({
    monday: { open: '08:00', close: '17:00', closed: false },
    tuesday: { open: '08:00', close: '17:00', closed: false },
    wednesday: { open: '08:00', close: '17:00', closed: false },
    thursday: { open: '08:00', close: '17:00', closed: false },
    friday: { open: '08:00', close: '17:00', closed: false },
    saturday: { open: '00:00', close: '00:00', closed: true },
    sunday: { open: '00:00', close: '00:00', closed: true }
  })

  useEffect(() => {
    if (isDemo && !businessId) {
       setBusinessId('demo-id');
       return;
    }
    if (!user) return;
    async function fetchSettings() {
      const { data: biz } = await supabase.from('businesses').select('*').eq('user_id', user?.id).single()
      if (biz) {
        setBusinessId(biz.id); setBusinessName(biz.name);
        setBusinessEmail(biz.email || '');
        setBusinessPhone(biz.phone || '');
        setBusinessWebsite(biz.website || '');
        setBusinessAddress(biz.address || '');
        setHandoffPhone(biz.handoff_phone || '');
        
        // Restore Operational Bounds from metadata or separate fields
        if (biz.operational_bounds) {
           setMinTicket(biz.operational_bounds.min_ticket || '$500');
           setServiceFee(biz.operational_bounds.service_fee || '$99');
           setServiceRadii(biz.operational_bounds.service_radii || 'Austin + 40mi');
        }

        if (biz.branding) {
           setBrandingHeadline(biz.branding.headline || 'Get a Free Estimate');
           setBrandingSubheadline(biz.branding.subheadline || "");
           setBrandingColor(biz.branding.color || '#2d6a4f');
           setBrandingLogo(biz.branding.logo || '🌳');
           setAiName(biz.branding.ai_name || 'LeadFlow AI');
           setAiAvatar(biz.branding.ai_avatar || "");
           setBrandingLogoImage(biz.branding.logo_image || "");
        }
        if (biz.ai_rules) {
           setAiBio(biz.ai_rules.bio || '');
           setAiGoal(biz.ai_rules.goal || '');
           setAiTone(biz.ai_rules.tone || 'Professional');
           setAiCustomRules(biz.ai_rules.custom_rules || '');
        }
         if (biz.business_hours) setBusinessHours(biz.business_hours);
         
         if (biz.workflow) {
            setResponseDelay(biz.workflow.response_delay || '2s');
            setRoutingMode(biz.workflow.routing_mode || 'standard');
            setAfterHoursAi(biz.workflow.after_hours_ai ?? true);
            setLeadCapacity(biz.workflow.lead_capacity || 'No Limit');
            setAutoArchiveDays(biz.workflow.auto_archive_days || '7');
            setFollowUpEnabled(biz.workflow.follow_up_enabled ?? true);
            setUrgencyKeywords(biz.workflow.urgency_keywords || 'emergency, urgent, leaking, broken');
         }

         if (biz.notifications) {
            setSmsAlerts(biz.notifications.sms_alerts ?? true);
            setEmailAlerts(biz.notifications.email_alerts ?? true);
            setWeeklyReports(biz.notifications.weekly_reports ?? true);
         }

         if (biz.integrations) {
            setCalConfig(biz.integrations.cal_com || { enabled: false, api_key: '', service_mappings: {} });
         }

         const { data: fqs } = await supabase.from('faqs').select('*').eq('business_id', biz.id);
         if (fqs) setFaqs(fqs);
      }
    }
    fetchSettings()
  }, [user])

  const handleSaveAll = async () => {
    if (!user) return alert('Demo Mode: Settings cannot be saved.');
    setLoading(true);
    try {
      await supabase.from('businesses').upsert({
        id: businessId, user_id: user.id, name: businessName,
        email: businessEmail, phone: businessPhone, website: businessWebsite, address: businessAddress,
        handoff_phone: handoffPhone,
        operational_bounds: { min_ticket: minTicket, service_fee: serviceFee, service_radii: serviceRadii },
         branding: { headline: brandingHeadline, subheadline: brandingSubheadline, color: brandingColor, logo: brandingLogo, ai_name: aiName, ai_avatar: aiAvatar, logo_image: brandingLogoImage },
         ai_rules: { bio: aiBio, goal: aiGoal, tone: aiTone, custom_rules: aiCustomRules },
         workflow: { 
           response_delay: responseDelay, 
           routing_mode: routingMode, 
           after_hours_ai: afterHoursAi,
           lead_capacity: leadCapacity,
           auto_archive_days: autoArchiveDays,
           follow_up_enabled: followUpEnabled,
           urgency_keywords: urgencyKeywords,
         },
         notifications: { sms_alerts: smsAlerts, email_alerts: emailAlerts, weekly_reports: weeklyReports },
         business_hours: businessHours,
         booking: {
            enabled: bookingEnabled,
            mode: bookingMode,
            url: bookingUrl,
            trigger: bookingTrigger,
            duration: appointmentDuration,
            buffer: bookingBuffer,
            confirmation_policy: confirmationPolicy,
            service_radius: serviceRadius,
            service_cities: serviceCities,
            templates: {
              booking: msgTemplateBooking,
              confirm: msgTemplateConfirm,
              reschedule: msgTemplateReschedule,
              callback: msgTemplateCallback
            },
            logic: {
              max_suggestions: maxSuggestions,
              suggested_windows: suggestedWindows,
              eligibility: bookingEligibility,
              escalation_rules: escalationRules
            },
            reminders: {
              enabled: reminderEnabled,
              message: reminderMessage,
              time: reminderTime
            },
            external: {
              type: externalCalendarType,
              url: externalCalendarUrl
            }
          },
          integrations: {
            cal_com: calConfig
          },
          handoff_phone: handoffPhone,
        ai_niche: aiNiche
        });
      setHasChanges(false); alert('Settings Hub Updated Successfully');
    } catch (err) { console.error('Save error:', err); }
    finally { setLoading(false); }
  }

  const handleAddFaq = async () => {
    if (!newFaq.q || !newFaq.a) return alert('Question and Answer are required');
    
    if (!user || isDemo) {
      // In Demo Mode, just update local state
      const mockData = {
        id: crypto.randomUUID(),
        business_id: businessId,
        q: newFaq.q,
        a: newFaq.a,
        inserted_at: new Date().toISOString()
      };
      setFaqs([...faqs, mockData]);
      setNewFaq({ q: '', a: '' });
      setShowFaqForm(false);
      if (isDemo) alert('Demo Mode: Entry added locally for preview.');
      return;
    }

    try {
      const { data, error } = await supabase.from('faqs').insert([{
        business_id: businessId,
        q: newFaq.q,
        a: newFaq.a
      }]).select().single();
      
      if (error) throw error;
      setFaqs([...faqs, data]);
      setNewFaq({ q: '', a: '' });
      setShowFaqForm(false);
    } catch (err) {
      console.error('Error adding FAQ:', err);
      alert('Failed to add Knowledge Base entry. Please ensure you are logged in.');
    }
  }

  const removeFaq = async (id) => {
     setFaqs(faqs.filter(f => f.id !== id));
     setHasChanges(true);
     await supabase.from('faqs').delete().eq('id', id);
  }

  const navItems = [
    { id: 'profile', label: 'BUSINESS PROFILE', icon: 'storefront' },
    { id: 'ai', label: 'ASSISTANT SETUP', icon: 'psychology' },
    { id: 'booking', label: 'BOOKING RULES', icon: 'calendar_month' },
    { id: 'workflow', label: 'WORKFLOW', icon: 'bolt' },
    { id: 'voice', label: 'VOICE CALLS (SOON)', icon: 'mic', disabled: true },
    { id: 'notifications', label: 'NOTIFICATIONS', icon: 'notifications' }
  ]

  return (
    <div className="w-full min-h-[800px]">
      <div className="flex flex-col lg:flex-row gap-12 animate-fade-in mb-24 max-w-[1600px] mx-auto w-full">
      {/* SIDEBAR HUB */}
      <aside className="lg:w-[360px] space-y-3">
        <div className="px-6 py-8 mb-4">
           <h2 className="text-3xl font-headline font-black text-white tracking-tight">Settings Hub</h2>
        </div>
        <div className="space-y-2">
           {navItems.map(item => (
             <button 
               key={item.id} 
               disabled={item.disabled}
               onClick={() => setSettingsView(item.id)} 
               className={`w-full flex items-center gap-5 p-6 rounded-[1.8rem] text-left transition-all group ${settingsView === item.id ? 'bg-[#192540] text-indigo-400 border border-indigo-500/20 shadow-2xl' : 'text-slate-500 hover:bg-white/5 opacity-70 hover:opacity-100'}`}
             >
               <span className={`material-symbols-outlined text-2xl ${settingsView === item.id ? 'text-indigo-400' : 'text-slate-600 group-hover:text-indigo-400/50'}`}>{item.icon}</span>
               <span className="font-black text-[11px] tracking-[0.15em] uppercase">{item.label}</span>
             </button>
           ))}
        </div>
        
        {hasChanges && (
          <button onClick={handleSaveAll} className="w-full flex items-center justify-center gap-3 p-6 bg-indigo-600 text-white rounded-[2rem] mt-12 font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-900/40 hover:bg-indigo-500 transition-all animate-pulse">
             <span className="material-symbols-outlined">save</span> SAVE HUB CHANGES
          </button>
        )}
      </aside>

      {/* CONTENT ENGINE */}
      <div className="flex-1 space-y-10 min-w-0 w-full">
        {settingsView === 'profile' && (
           <div className="space-y-10 animate-fade-in-up">
              {/* 1. FOUNDATION */}
              <div className="bg-[#091328]/40 backdrop-blur-md p-10 rounded-[3rem] border border-white/5 space-y-10 shadow-2xl">
                 <div className="flex items-center gap-4 mb-2">
                    <span className="material-symbols-outlined text-indigo-500 bg-indigo-500/10 p-2 rounded-xl">info</span>
                    <h3 className="text-2xl font-headline font-black text-white tracking-tight">Foundation</h3>
                 </div>
                 <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Business Identity</label>
                       <input className="w-full bg-[#060e20] border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-indigo-500/50 outline-none transition-all shadow-inner font-medium" value={businessName} onChange={e => {setBusinessName(e.target.value); setHasChanges(true);}} placeholder="Your Business" />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Business Email</label>
                       <input className="w-full bg-[#060e20] border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-indigo-500/50 outline-none transition-all shadow-inner font-medium" value={businessEmail} onChange={e => {setBusinessEmail(e.target.value); setHasChanges(true);}} placeholder="e.g. contact@evergreen.com" />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Support Phone</label>
                       <input type="tel" maxLength={14} className="w-full bg-[#060e20] border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-indigo-500/50 outline-none transition-all shadow-inner font-medium" value={businessPhone} onChange={e => {setBusinessPhone(formatPhone(e.target.value)); setHasChanges(true);}} placeholder="(813) 555-1234" />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Website URL</label>
                       <input className="w-full bg-[#060e20] border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-indigo-500/50 outline-none transition-all shadow-inner font-medium" value={businessWebsite} onChange={e => {setBusinessWebsite(e.target.value); setHasChanges(true);}} placeholder="https://..." />
                    </div>
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Physical Address</label>
                    <input className="w-full bg-[#060e20] border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-indigo-500/50 outline-none transition-all shadow-inner font-medium" value={businessAddress} onChange={e => {setBusinessAddress(e.target.value); setHasChanges(true);}} placeholder="123 Main St, City, ST 12345" />
                 </div>
              </div>

              {/* 2. OPERATIONAL BOUNDS */}
              <div className="bg-[#091328]/40 backdrop-blur-md p-10 rounded-[3rem] border border-white/5 space-y-10 shadow-2xl">
                 <div className="flex items-center gap-4 mb-2">
                    <span className="material-symbols-outlined text-amber-500 bg-amber-500/10 p-2 rounded-xl">shelves</span>
                    <h3 className="text-2xl font-headline font-black text-white tracking-tight">Operational Bounds</h3>
                 </div>
                 <div className="grid md:grid-cols-3 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Min. Ticket</label>
                       <input className="w-full bg-[#060e20] border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-indigo-500/50 outline-none transition-all shadow-inner font-medium" value={minTicket} onChange={e => {setMinTicket(e.target.value); setHasChanges(true);}} placeholder="$500" />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Service Fee</label>
                       <input className="w-full bg-[#060e20] border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-indigo-500/50 outline-none transition-all shadow-inner font-medium" value={serviceFee} onChange={e => {setServiceFee(e.target.value); setHasChanges(true);}} placeholder="$99" />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Service Radii</label>
                       <input className="w-full bg-[#060e20] border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-indigo-500/50 outline-none transition-all shadow-inner font-medium" value={serviceRadii} onChange={e => {setServiceRadii(e.target.value); setHasChanges(true);}} placeholder="Austin + 40mi" />
                    </div>
                 </div>
              </div>
 
                {/* 3. VISUAL IDENTITY */}
                <div className="bg-[#091328]/40 backdrop-blur-md p-10 rounded-[3rem] border border-white/5 space-y-10 shadow-2xl">
                   <div className="flex items-center gap-4 mb-2">
                      <span className="material-symbols-outlined text-indigo-500 bg-indigo-500/10 p-2 rounded-xl">palette</span>
                      <h3 className="text-2xl font-headline font-black text-white tracking-tight">Visual Identity</h3>
                   </div>
                   <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Brand Emotion (Emoji)</label>
                         <input className="w-full bg-[#060e20] border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-indigo-500/50 outline-none transition-all shadow-inner font-medium" value={brandingLogo} onChange={e => {setBrandingLogo(e.target.value); setHasChanges(true);}} placeholder="🌳" />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Branding Color</label>
                         <input type="color" className="w-full h-[60px] bg-[#060e20] border border-white/5 rounded-2xl p-2 cursor-pointer" value={brandingColor} onChange={e => {setBrandingColor(e.target.value); setHasChanges(true);}} />
                      </div>
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Custom Logo Image URL</label>
                      <input className="w-full bg-[#060e20] border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-indigo-500/50 outline-none transition-all shadow-inner font-medium" value={brandingLogoImage} onChange={e => {setBrandingLogoImage(e.target.value); setHasChanges(true);}} placeholder="https://..." />
                      <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-2 pl-1">Transparent PNG recommended (height: 80px)</p>
                   </div>
                </div>
 
                {/* 4. OPERATING HOURS */}
                <div className="bg-[#091328]/40 backdrop-blur-md p-10 rounded-[3rem] border border-white/5 space-y-10 shadow-2xl">
                   <div className="flex items-center gap-4 mb-2">
                      <span className="material-symbols-outlined text-indigo-500 bg-indigo-500/10 p-2 rounded-xl">schedule</span>
                      <h3 className="text-2xl font-headline font-black text-white tracking-tight">Operating Hours</h3>
                   </div>
                   <div className="space-y-4">
                      {Object.entries(businessHours).map(([day, hours]) => (
                        <div key={day} className="flex items-center justify-between p-6 bg-[#060e20]/50 rounded-[2rem] border border-white/5 group hover:border-indigo-500/30 transition-all">
                           <span className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] w-28">{day}</span>
                           <div className="flex items-center gap-6">
                              {!hours.closed ? (
                                <div className="flex items-center gap-4">
                                   <input type="time" value={hours.open} onChange={e => {setBusinessHours({...businessHours, [day]: {...hours, open: e.target.value}}); setHasChanges(true);}} className="bg-[#091328] border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-indigo-500/50 transition-all font-bold" />
                                   <span className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">to</span>
                                   <input type="time" value={hours.close} onChange={e => {setBusinessHours({...businessHours, [day]: {...hours, close: e.target.value}}); setHasChanges(true);}} className="bg-[#091328] border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-indigo-500/50 transition-all font-bold" />
                                </div>
                              ) : (
                                <span className="text-[10px] font-black text-rose-500/50 uppercase tracking-[0.2em] mr-4">Closed for Business</span>
                              )}
                              <button onClick={() => {setBusinessHours({...businessHours, [day]: {...hours, closed: !hours.closed}}); setHasChanges(true);}} className={`text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all ${hours.closed ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/10 hover:bg-rose-500/20'}`}>
                                 {hours.closed ? 'Open' : 'Close'}
                              </button>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
 
                {/* 5. PUBLIC LEAD CAPTURE FOOTER */}
                <div className="bg-gradient-to-br from-indigo-600/20 to-indigo-900/40 p-12 rounded-[3.5rem] border border-indigo-500/30 text-center space-y-6 shadow-2xl shadow-indigo-900/20 group hover:border-indigo-400 transition-all">
                   <h3 className="text-3xl font-headline font-black text-white tracking-tight">Public Lead Capture</h3>
                   <p className="text-indigo-200/60 text-sm font-medium">Share this link with your customers or on Google Business.</p>
                   <div className="flex justify-center gap-4 pt-4">
                      <button 
                         onClick={handleCopyLink}
                         className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2 relative min-w-[150px] justify-center"
                      >
                         <span className="material-symbols-outlined text-sm">{showCopied ? 'check' : 'content_copy'}</span> {showCopied ? 'Copied!' : 'Copy Link'}
                      </button>
                      <button 
                         onClick={handlePreview}
                         className="px-10 py-4 bg-indigo-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-500/30 hover:bg-slate-900 transition-all flex items-center gap-2"
                      >
                         <span className="material-symbols-outlined text-sm">visibility</span> Preview
                      </button>
                   </div>
                </div>
             </div>
          )}
        
          {settingsView === 'ai' && (
             <div className="space-y-10 animate-fade-in-up">
                {/* 1. PERSONALITY & TONE */}
                <div className="bg-[#091328]/40 backdrop-blur-md p-10 rounded-[3rem] border border-white/5 space-y-10 shadow-2xl">
                   <div className="flex items-center gap-4 mb-2">
                      <span className="material-symbols-outlined text-indigo-500 bg-indigo-500/10 p-2 rounded-xl">psychology</span>
                      <h3 className="text-2xl font-headline font-black text-white tracking-tight">Assistant Tone & Style</h3>
                   </div>
                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-indigo-400/60 tracking-[0.2em] pl-1">AI Assistant Name</label>
                       <input className="w-full bg-[#060e20] border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-indigo-500 outline-none transition-all shadow-inner font-medium" value={aiName} onChange={e => {setAiName(e.target.value); setHasChanges(true);}} placeholder="e.g. Jarvis" />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-indigo-400/60 tracking-[0.2em] pl-1">Communication Tone</label>
                       <select className="w-full bg-[#060e20] border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-indigo-500 outline-none transition-all shadow-inner font-medium appearance-none" value={aiTone} onChange={e => {setAiTone(e.target.value); setHasChanges(true);}}>
                          <option value="Professional">Professional & Formal</option>
                          <option value="Friendly">Friendly & Enthusiastic</option>
                          <option value="Direct">Direct & Concise</option>
                          <option value="Empathetic">Empathetic & Supportive</option>
                       </select>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-indigo-400/60 tracking-[0.2em] pl-1">AI Avatar URL</label>
                       <input className="w-full bg-[#060e20] border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-indigo-500 outline-none transition-all shadow-inner font-medium" value={aiAvatar} onChange={e => {setAiAvatar(e.target.value); setHasChanges(true);}} placeholder="https://..." />
                    </div>
                 </div>
              </div>

              {/* 2. LEAD QUALIFICATION & SCOPE */}
              <div className="bg-[#091328]/40 backdrop-blur-md p-10 rounded-[3rem] border border-white/5 space-y-10 shadow-2xl">
                 <div className="flex items-center gap-4 mb-2">
                    <span className="material-symbols-outlined text-amber-500 bg-amber-500/10 p-2 rounded-xl">verified_user</span>
                    <h3 className="text-2xl font-headline font-black text-white tracking-tight">Lead Qualification & Scope</h3>
                 </div>
                 <div className="grid md:grid-cols-3 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Min. Ticket Size</label>
                       <input className="w-full bg-[#060e20] border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-indigo-500/50 outline-none transition-all shadow-inner font-medium" value={minTicket} onChange={e => {setMinTicket(e.target.value); setHasChanges(true);}} placeholder="$500" />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Service Fee</label>
                       <input className="w-full bg-[#060e20] border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-indigo-500/50 outline-none transition-all shadow-inner font-medium" value={serviceFee} onChange={e => {setServiceFee(e.target.value); setHasChanges(true);}} placeholder="$99" />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Service Area (Radius)</label>
                       <input className="w-full bg-[#060e20] border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-indigo-500/50 outline-none transition-all shadow-inner font-medium" value={serviceRadii} onChange={e => {setServiceRadii(e.target.value); setHasChanges(true);}} placeholder="Austin + 40mi" />
                    </div>
                 </div>
              </div>

              {/* 3. INTELLIGENCE CORE */}
              <div className="bg-[#091328]/40 backdrop-blur-md p-10 rounded-[3rem] border border-white/5 space-y-10 shadow-2xl">
                 <div className="flex items-center gap-4 mb-2">
                    <span className="material-symbols-outlined text-indigo-500 bg-indigo-500/10 p-2 rounded-xl">hub</span>
                    <h3 className="text-2xl font-headline font-black text-white tracking-tight text-indigo-400">Intelligence Core</h3>
                 </div>
                 <div className="space-y-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Primary Objective / AI Goal</label>
                        <textarea className="w-full bg-[#060e20] border border-white/5 rounded-3xl py-5 px-6 text-sm text-white focus:border-indigo-500/50 outline-none transition-all shadow-inner min-h-[100px] resize-none font-medium leading-relaxed" value={aiGoal} onChange={e => {setAiGoal(e.target.value); setHasChanges(true);}} placeholder="What is the main purpose of this AI? e.g. Book roofing appointments" />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Who is your company?</label>
                       <textarea className="w-full bg-[#060e20] border border-white/5 rounded-3xl py-5 px-6 text-sm text-white focus:border-indigo-500/50 outline-none transition-all shadow-inner min-h-[140px] resize-none font-medium leading-relaxed" value={aiBio} onChange={e => {setAiBio(e.target.value); setHasChanges(true);}} placeholder="Tell the AI about your history, services, and values..." />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Personality Guardrails (Fixed Rules)</label>
                       <textarea className="w-full bg-[#060e20] border border-white/5 rounded-3xl py-5 px-6 text-sm text-white focus:border-indigo-500/50 outline-none transition-all shadow-inner min-h-[140px] resize-none font-medium leading-relaxed" value={aiCustomRules} onChange={e => {setAiCustomRules(e.target.value); setHasChanges(true);}} placeholder="1. Always be professional. 2. Never offer discounts..." />
                    </div>
                 </div>
              </div>

              {/* 4. KNOWLEDGE BASE */}
              <div className="bg-[#091328]/40 backdrop-blur-md p-10 rounded-[3rem] border border-white/5">
                 <div className="flex justify-between items-center mb-10">
                    <div>
                       <h3 className="text-2xl font-headline font-black text-white tracking-tight text-indigo-400">Knowledge Base</h3>
                       <p className="text-slate-500 text-xs mt-1 uppercase font-black tracking-widest">Train your AI on specific business logic</p>
                    </div>
                    <button 
                      onClick={() => setShowFaqForm(!showFaqForm)}
                      className="flex items-center gap-3 px-8 py-4 bg-indigo-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-indigo-500/20"
                    >
                       <span className="material-symbols-outlined text-sm">{showFaqForm ? 'close' : 'add'}</span> {showFaqForm ? 'Cancel' : 'Add Entry'}
                    </button>
                 </div>

                 {showFaqForm && (
                    <div className="mb-10 p-8 bg-indigo-500/5 border border-indigo-500/20 rounded-[2.5rem] animate-fade-in-up">
                       <div className="grid md:grid-cols-2 gap-6 mb-6">
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase text-indigo-400/60 tracking-[0.2em] pl-1">Question / Intent</label>
                             <input className="w-full bg-[#060e20] border border-white/10 rounded-2xl py-5 px-6 text-sm text-white focus:border-indigo-500 outline-none transition-all font-medium" value={newFaq.q} onChange={e => setNewFaq({ ...newFaq, q: e.target.value })} placeholder="e.g. What are your hours?" />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase text-indigo-400/60 tracking-[0.2em] pl-1">AI Response</label>
                             <input className="w-full bg-[#060e20] border border-white/10 rounded-2xl py-5 px-6 text-sm text-white focus:border-indigo-500 outline-none transition-all font-medium" value={newFaq.a} onChange={e => setNewFaq({ ...newFaq, a: e.target.value })} placeholder="e.g. We are open 8am-5pm..." />
                          </div>
                       </div>
                       <button onClick={handleAddFaq} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-900/40">
                          Save Knowledge Entry
                       </button>
                    </div>
                 )}

                 {/* 5. FAQ TEMPLATES */}
                 <div className="mb-10">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1 mb-6">Quick-Add Templates</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                       {[
                          { q: "Free Estimates?", a: "Yes, we providing free on-site estimates for all new projects." },
                          { q: "Service Area?", a: "We primarily serve the local metro area and surrounding 40-mile radius." },
                          { q: "Licensed & Insured?", a: "Absolutely. We are fully licensed and carry comprehensive insurance." },
                          { q: "After-Hours Service?", a: "Yes, we have a technician on-call for emergency situations 24/7." }
                       ].map((tpl, i) => (
                          <button 
                            key={i}
                            onClick={async () => {
                               if (!user || isDemo) {
                                  setFaqs([...faqs, { ...tpl, id: crypto.randomUUID() }]);
                                  return;
                               }
                               const { data, error } = await supabase.from('faqs').insert([{ business_id: businessId, q: tpl.q, a: tpl.a }]).select().single();
                               if (data) setFaqs([...faqs, data]);
                            }}
                            className="p-5 bg-[#060e20]/40 border border-white/5 rounded-[2rem] text-left hover:border-indigo-500/30 transition-all group relative overflow-hidden"
                          >
                             <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/0 group-hover:bg-indigo-500 transition-all"></div>
                             <p className="text-white font-bold text-[11px] mb-1">{tpl.q}</p>
                             <p className="text-slate-500 text-[10px] line-clamp-1">{tpl.a}</p>
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="grid lg:grid-cols-2 gap-6">
                    {faqs.length === 0 ? (
                        <div className="col-span-full py-12 text-center bg-[#060e20]/40 rounded-[2.5rem] border border-white/5 border-dashed">
                           <p className="text-slate-500 text-sm font-medium">No knowledge base entries yet. Add some to train your Assistant.</p>
                        </div>
                    ) : (
                        faqs.map(f => (
                           <div key={f.id} className="group relative bg-[#060e20]/80 p-8 rounded-[2.5rem] border border-white/5 hover:border-indigo-500/40 transition-all shadow-inner">
                              <button onClick={() => removeFaq(f.id)} className="absolute top-6 right-6 text-slate-700 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all material-symbols-outlined text-sm">delete</button>
                              <p className="font-extrabold text-sm text-white mb-3 pr-6">{f.q}</p>
                              <p className="text-[11px] text-slate-500 leading-[1.6] font-medium">{f.a}</p>
                           </div>
                        ))
                    )}
                 </div>
              </div>
           </div>
        )}
         
            {settingsView === 'booking' && (
             <div className="space-y-10 animate-fade-in-up">
                {/* 1. DIRECT INTEGRATION (CAL.COM) */}
                <div className="bg-[#091328]/40 backdrop-blur-md p-10 rounded-[3rem] border border-white/5 space-y-10 shadow-2xl overflow-hidden relative">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -mr-32 -mt-32"></div>
                   
                   <div className="flex justify-between items-center relative z-10">
                     <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined text-indigo-400 bg-indigo-400/10 p-2 rounded-xl">hub</span>
                        <div>
                          <h3 className="text-2xl font-headline font-black text-white tracking-tight">External Calendar Sync</h3>
                          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Connect Cal.com as your source of truth</p>
                        </div>
                     </div>
                     <button 
                       onClick={() => {setCalConfig({...calConfig, enabled: !calConfig.enabled}); setHasChanges(true);}}
                       className={`px-6 py-2 rounded-full font-black text-[10px] tracking-widest uppercase transition-all ${calConfig.enabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500 border border-white/5'}`}
                     >
                       {calConfig.enabled ? 'Integration Active' : 'Disconnected'}
                     </button>
                   </div>

                   {calConfig.enabled ? (
                     <div className="space-y-8 animate-fade-in relative z-10">
                        <div className="p-8 bg-[#060e20] rounded-[2.5rem] border border-white/5 space-y-6">
                           <div className="space-y-3">
                              <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Cal.com API Key (v2)</label>
                              <div className="relative">
                                 <input 
                                 type="password"
                                 className="w-full bg-[#091328] border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-indigo-500/50 outline-none transition-all pr-12" 
                                 value={calConfig.api_key} 
                                 onChange={e => {setCalConfig({...calConfig, api_key: e.target.value}); setHasChanges(true);}} 
                                 placeholder="cal_live_..." 
                                 />
                                 <span className="absolute right-6 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-600">key</span>
                              </div>
                              <p className="text-[9px] text-slate-600 italic px-2">Key is encrypted and used only via secure Edge Function proxy.</p>
                           </div>
                           
                           <button 
                              onClick={() => alert(`Run this in your terminal to set the proxy secret:\n\nnpx supabase secrets set CAL_COM_API_KEY=${calConfig.api_key}`)}
                              className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] w-full border border-indigo-500/20 hover:bg-indigo-500/20 transition-all flex items-center justify-center gap-2"
                           >
                              <span className="material-symbols-outlined text-sm">lock</span> Copy Secret Set Command
                           </button>
                        </div>

                        <div className="space-y-6">
                           <div className="flex items-center justify-between">
                              <h4 className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] pl-1">Service Event Mapper</h4>
                              <div className="px-3 py-1 bg-indigo-500/10 rounded-lg text-indigo-400 text-[9px] font-black tracking-widest uppercase">AI Data Routing</div>
                           </div>
                           
                           <div className="grid gap-4">
                              {Object.entries(calConfig.service_mappings || {}).map(([service, eventId]) => (
                                 <div key={service} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 group hover:border-indigo-500/30 transition-all">
                                    <div className="flex items-center gap-4">
                                       <span className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-xs font-bold">{service[0]?.toUpperCase()}</span>
                                       <div>
                                       <p className="text-sm font-bold text-white">{service}</p>
                                       <p className="text-[10px] text-slate-500 font-medium font-mono uppercase tracking-tighter">Maps to Cal.com ID: {eventId}</p>
                                       </div>
                                    </div>
                                    <button 
                                       onClick={() => {
                                       const newMappings = {...calConfig.service_mappings};
                                       delete newMappings[service];
                                       setCalConfig({...calConfig, service_mappings: newMappings});
                                       setHasChanges(true);
                                       }}
                                       className="p-2 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-all"
                                    >
                                       <span className="material-symbols-outlined text-xl">delete</span>
                                    </button>
                                 </div>
                              ))}

                              <div className="grid md:grid-cols-[1fr_1fr_auto] gap-4 p-5 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                                 <input 
                                 className="bg-[#060e20] border border-white/5 rounded-xl py-4 px-4 text-xs text-white outline-none focus:border-indigo-500/30" 
                                 placeholder="Service (e.g. Roofing)"
                                 value={newMapping.service}
                                 onChange={e => setNewMapping({...newMapping, service: e.target.value})}
                                 />
                                 <input 
                                 className="bg-[#060e20] border border-white/5 rounded-xl py-4 px-4 text-xs text-white outline-none focus:border-indigo-500/30" 
                                 placeholder="Cal Event ID"
                                 value={newMapping.eventId}
                                 onChange={e => setNewMapping({...newMapping, eventId: e.target.value})}
                                 />
                                 <button 
                                 onClick={() => {
                                    if (!newMapping.service || !newMapping.eventId) return;
                                    setCalConfig({
                                       ...calConfig, 
                                       service_mappings: {
                                          ...calConfig.service_mappings,
                                          [newMapping.service]: newMapping.eventId
                                       }
                                    });
                                    setNewMapping({ service: '', eventId: '' });
                                    setHasChanges(true);
                                 }}
                                 className="px-6 py-4 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all"
                                 >
                                 Add
                                 </button>
                              </div>
                           </div>
                        </div>

                        <div className="p-6 bg-amber-500/5 rounded-[2rem] border border-amber-500/20">
                           <div className="flex gap-4">
                              <span className="material-symbols-outlined text-amber-500">lightbulb</span>
                              <p className="text-xs text-amber-200/70 leading-relaxed font-medium">
                                 <strong className="text-amber-400">Pro Tip:</strong> Link your Google Calendar inside Cal.com to automatically prevent double-bookings from personal events.
                              </p>
                           </div>
                        </div>
                     </div>
                   ) : (
                     <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-[2.5rem] animate-fade-in">
                        <span className="material-symbols-outlined text-5xl text-slate-700 mb-4">settings_ethernet</span>
                        <p className="text-sm text-slate-500 font-medium">External integration is currently disabled.</p>
                        <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest mt-2">Activate now to sync slots automatically</p>
                     </div>
                   )}
                </div>

                {/* 2. BOOKING CONTROL */}
                <div className="bg-[#091328]/40 backdrop-blur-md p-10 rounded-[3rem] border border-white/5 space-y-10 shadow-2xl">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <span className="material-symbols-outlined text-indigo-500 bg-indigo-500/10 p-2 rounded-xl">calendar_today</span>
                         <div>
                            <h3 className="text-2xl font-headline font-black text-white tracking-tight">Booking Logic</h3>
                            <p className="text-slate-500 text-xs uppercase font-black tracking-widest mt-1">Enable and configure how customers book appointments</p>
                         </div>
                      </div>
                      <button 
                        onClick={() => {setBookingEnabled(!bookingEnabled); setHasChanges(true);}}
                        className={`w-14 h-8 rounded-full transition-all relative ${bookingEnabled ? 'bg-indigo-600' : 'bg-slate-800'}`}
                      >
                         <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${bookingEnabled ? 'left-7' : 'left-1'}`}></div>
                      </button>
                   </div>

                   {bookingEnabled && (
                     <div className="grid md:grid-cols-2 gap-8 pt-6 animate-fade-in">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Booking Mode</label>
                           <select className="w-full bg-[#060e20] border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-indigo-500 outline-none transition-all shadow-inner font-medium appearance-none" value={bookingMode} onChange={e => {setBookingMode(e.target.value); setHasChanges(true);}}>
                              <option value="manual">Manual Callback Only</option>
                              <option value="link">Share Booking Link</option>
                              <option value="assistant">Assistant-Guided Booking</option>
                           </select>
                        </div>
                        {bookingMode === 'link' && (
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Booking Link URL (Cal.com / Calendly)</label>
                             <input className="w-full bg-[#060e20] border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-indigo-500 outline-none transition-all shadow-inner font-medium" value={bookingUrl} onChange={e => {setBookingUrl(e.target.value); setHasChanges(true);}} placeholder="https://cal.com/your-business" />
                          </div>
                        )}
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Booking Trigger</label>
                           <select className="w-full bg-[#060e20] border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-indigo-500 outline-none transition-all shadow-inner font-medium appearance-none" value={bookingTrigger} onChange={e => {setBookingTrigger(e.target.value); setHasChanges(true);}}>
                              <option value="schedule">Only when customer asks to schedule</option>
                              <option value="qualification">After qualification complete</option>
                              <option value="first_response">After first response</option>
                           </select>
                        </div>
                     </div>
                   )}
                </div>

                {bookingEnabled && (
                  <>
                    {/* 2. APPOINTMENT SPECS */}
                    <div className={`bg-[#091328]/40 backdrop-blur-md p-10 rounded-[3rem] border border-white/5 space-y-10 shadow-2xl relative overflow-hidden transition-all duration-500 ${calConfig.enabled ? 'opacity-40 grayscale-[0.5]' : ''}`}>
                       {calConfig.enabled && (
                         <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#060e20]/20 backdrop-blur-[2px] group">
                            <div className="bg-indigo-600/90 text-white text-[10px] font-black uppercase tracking-[0.2em] px-6 py-3 rounded-2xl shadow-2xl border border-white/20 transform -rotate-2">
                               Managed by Cal.com
                            </div>
                         </div>
                       )}
                       <div className="flex items-center gap-4 mb-2">
                          <span className="material-symbols-outlined text-amber-500 bg-amber-500/10 p-2 rounded-xl">timer</span>
                          <h3 className="text-2xl font-headline font-black text-white tracking-tight">Appointment Specs</h3>
                       </div>
                       <div className="grid md:grid-cols-3 gap-8">
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Duration (Min)</label>
                             <select disabled={calConfig.enabled} className="w-full bg-[#060e20] border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-indigo-500 outline-none transition-all shadow-inner font-medium appearance-none" value={appointmentDuration} onChange={e => {setAppointmentDuration(e.target.value); setHasChanges(true);}}>
                                <option value="15">15 min</option>
                                <option value="30">30 min</option>
                                <option value="45">45 min</option>
                                <option value="60">60 min</option>
                             </select>
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Buffer Between (Min)</label>
                             <select disabled={calConfig.enabled} className="w-full bg-[#060e20] border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-indigo-500 outline-none transition-all shadow-inner font-medium appearance-none" value={bookingBuffer} onChange={e => {setBookingBuffer(e.target.value); setHasChanges(true);}}>
                                <option value="0">0 min</option>
                                <option value="15">15 min</option>
                                <option value="30">30 min</option>
                                <option value="60">60 min</option>
                             </select>
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Confirmation Policy</label>
                             <select disabled={calConfig.enabled} className="w-full bg-[#060e20] border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-indigo-500 outline-none transition-all shadow-inner font-medium appearance-none" value={confirmationPolicy} onChange={e => {setConfirmationPolicy(e.target.value); setHasChanges(true);}}>
                                <option value="auto">Auto-confirm</option>
                                <option value="manual">Owner must confirm first</option>
                             </select>
                          </div>
                       </div>
                    </div>

                    {/* 3. SERVICE AREA RULES */}
                    <div className="bg-[#091328]/40 backdrop-blur-md p-10 rounded-[3rem] border border-white/5 space-y-10 shadow-2xl">
                       <div className="flex items-center gap-4 mb-2">
                          <span className="material-symbols-outlined text-emerald-500 bg-emerald-500/10 p-2 rounded-xl">map</span>
                          <h3 className="text-2xl font-headline font-black text-white tracking-tight">Service Area Rules</h3>
                       </div>
                       <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Service Radius (Miles)</label>
                             <input className="w-full bg-[#060e20] border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-indigo-500 outline-none transition-all shadow-inner font-medium" value={serviceRadius} onChange={e => {setServiceRadius(e.target.value); setHasChanges(true);}} placeholder="25" />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Cities Covered (Optional)</label>
                             <input className="w-full bg-[#060e20] border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-indigo-500 outline-none transition-all shadow-inner font-medium" value={serviceCities} onChange={e => {setServiceCities(e.target.value); setHasChanges(true);}} placeholder="e.g. Austin, Round Rock" />
                          </div>
                       </div>
                    </div>

                    {/* 4. SMART MESSAGING TEMPLATES */}
                    <div className="bg-[#091328]/40 backdrop-blur-md p-10 rounded-[3rem] border border-white/5 space-y-10 shadow-2xl">
                       <div className="flex items-center gap-4 mb-2">
                          <span className="material-symbols-outlined text-indigo-400 bg-indigo-400/10 p-2 rounded-xl">forum</span>
                          <h3 className="text-2xl font-headline font-black text-white tracking-tight text-indigo-400">Response Rules</h3>
                       </div>
                       <div className="space-y-8">
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Booking Suggestion Template</label>
                             <textarea className="w-full bg-[#060e20] border border-white/5 rounded-3xl py-5 px-6 text-sm text-white focus:border-indigo-500 outline-none transition-all shadow-inner min-h-[100px] resize-none font-medium leading-relaxed" value={msgTemplateBooking} onChange={e => {setMsgTemplateBooking(e.target.value); setHasChanges(true);}} />
                             <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest pl-1">Use `{"{{available_times}}"}` for suggested slots.</p>
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Confirmation Message</label>
                             <textarea className="w-full bg-[#060e20] border border-white/5 rounded-3xl py-5 px-6 text-sm text-white focus:border-indigo-500 outline-none transition-all shadow-inner min-h-[100px] resize-none font-medium leading-relaxed" value={msgTemplateConfirm} onChange={e => {setMsgTemplateConfirm(e.target.value); setHasChanges(true);}} />
                             <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest pl-1">Use `{"{{booking_time}}"}` for the confirmed slot.</p>
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Reschedule Request</label>
                             <textarea className="w-full bg-[#060e20] border border-white/5 rounded-3xl py-5 px-6 text-sm text-white focus:border-indigo-500 outline-none transition-all shadow-inner min-h-[100px] resize-none font-medium leading-relaxed" value={msgTemplateReschedule} onChange={e => {setMsgTemplateReschedule(e.target.value); setHasChanges(true);}} />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Callback Required Message</label>
                             <textarea className="w-full bg-[#060e20] border border-white/5 rounded-3xl py-5 px-6 text-sm text-white focus:border-indigo-500 outline-none transition-all shadow-inner min-h-[100px] resize-none font-medium leading-relaxed" value={msgTemplateCallback} onChange={e => {setMsgTemplateCallback(e.target.value); setHasChanges(true);}} />
                          </div>
                       </div>
                    </div>

                    {/* 5. ASSISTANT-GUIDED LOGIC */}
                    <div className={`bg-[#091328]/40 backdrop-blur-md p-10 rounded-[3rem] border border-white/5 space-y-10 shadow-2xl relative overflow-hidden transition-all duration-500 ${calConfig.enabled ? 'opacity-40 grayscale-[0.5]' : ''}`}>
                       {calConfig.enabled && (
                         <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#060e20]/20 backdrop-blur-[2px]">
                            <div className="bg-indigo-600/90 text-white text-[10px] font-black uppercase tracking-[0.2em] px-6 py-3 rounded-2xl shadow-2xl border border-white/20 transform rotate-1">
                               Availability Managed by Cal.com
                            </div>
                         </div>
                       )}
                       <div className="flex items-center gap-4 mb-2">
                          <span className="material-symbols-outlined text-indigo-500 bg-indigo-500/10 p-2 rounded-xl">smart_toy</span>
                          <h3 className="text-2xl font-headline font-black text-white tracking-tight">Lead Handling Strategy</h3>
                       </div>
                       
                       <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Max suggestions (times to offer)</label>
                             <select className="w-full bg-[#060e20] border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-indigo-500 outline-none transition-all shadow-inner font-medium appearance-none" value={maxSuggestions} onChange={e => {setMaxSuggestions(e.target.value); setHasChanges(true);}}>
                                <option value="1">1 slot</option>
                                <option value="2">2 slots</option>
                                <option value="3">3 slots</option>
                             </select>
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Eligibility Rule</label>
                             <select className="w-full bg-[#060e20] border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-indigo-500 outline-none transition-all shadow-inner font-medium appearance-none" value={bookingEligibility} onChange={e => {setBookingEligibility(e.target.value); setHasChanges(true);}}>
                                <option value="qualification">Only after lead qualification</option>
                                <option value="approval">Only after owner approval</option>
                                <option value="standard">Immediately if service is standard</option>
                             </select>
                          </div>
                       </div>

                       <div className="space-y-4">
                          <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Suggested Windows (Default Offerings)</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {suggestedWindows.map((window, idx) => (
                               <div key={idx} className="p-6 bg-[#060e20]/50 rounded-3xl border border-white/5 space-y-4">
                                  <div className="flex justify-between items-center">
                                     <span className="text-xs font-bold text-white uppercase tracking-widest">{window.day}</span>
                                     <button className="text-slate-600 hover:text-rose-500 transition-colors"><span className="material-symbols-outlined text-sm">delete</span></button>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                     {window.times.map((t, tidx) => (
                                       <span key={tidx} className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[9px] font-black text-indigo-400 uppercase tracking-widest">{t}</span>
                                     ))}
                                     <button className="px-3 py-1.5 border border-white/5 border-dashed rounded-lg text-[9px] font-black text-slate-600 hover:text-white transition-colors cursor-pointer">+ Add Time</button>
                                  </div>
                               </div>
                             ))}
                          </div>
                       </div>

                       <div className="space-y-4">
                          <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Escalation Rules</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                             {[
                               { id: 'emergency', label: 'Emergency', icon: 'emergency' },
                               { id: 'outside_area', label: 'Outside Area', icon: 'distance' },
                               { id: 'same_day', label: 'Same Day Req', icon: 'today' },
                               { id: 'pricing_only', label: 'Pricing Question', icon: 'payments' }
                             ].map(rule => (
                               <div key={rule.id} className="p-5 bg-[#060e20]/30 rounded-2xl border border-white/5 space-y-3">
                                  <div className="flex items-center gap-2">
                                     <span className="material-symbols-outlined text-sm text-indigo-400">{rule.icon}</span>
                                     <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{rule.label}</span>
                                  </div>
                                  <select 
                                    className="w-full bg-transparent border-none text-[10px] font-bold text-white focus:ring-0 appearance-none p-0"
                                    value={escalationRules[rule.id]}
                                    onChange={e => {
                                      setEscalationRules(prev => ({ ...prev, [rule.id]: e.target.value }));
                                      setHasChanges(true);
                                    }}
                                  >
                                     <option value="callback">Manual Callback</option>
                                     <option value="notify">Notify Owner</option>
                                     <option value="standard">Book Normally</option>
                                  </select>
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>

                    {/* 6. EXTERNAL SCHEDULING */}
                    <div className="bg-[#091328]/40 backdrop-blur-md p-10 rounded-[3rem] border border-white/5 space-y-10 shadow-2xl">
                       <div className="flex items-center gap-4 mb-2">
                          <span className="material-symbols-outlined text-indigo-500 bg-indigo-500/10 p-2 rounded-xl">sync_alt</span>
                          <h3 className="text-2xl font-headline font-black text-white tracking-tight">External Scheduling (Optional)</h3>
                       </div>
                       <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">External Calendar Type</label>
                             <select className="w-full bg-[#060e20] border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-indigo-500 outline-none transition-all shadow-inner font-medium appearance-none" value={externalCalendarType} onChange={e => {setExternalCalendarType(e.target.value); setHasChanges(true);}}>
                                <option value="none">LeadFlow Native</option>
                                <option value="google">Google Calendar</option>
                                <option value="cal">Cal.com</option>
                                <option value="calendly">Calendly</option>
                             </select>
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Integration URL / Note</label>
                             <input className="w-full bg-[#060e20] border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-indigo-500 outline-none transition-all shadow-inner font-medium" value={externalCalendarUrl} onChange={e => {setExternalCalendarUrl(e.target.value); setHasChanges(true);}} placeholder="Webhook URL or account ID" />
                          </div>
                       </div>
                       <div className="p-6 bg-indigo-500/5 rounded-[2rem] border border-white/5">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">External calendars are currently in early access. If enabled, the Assistant will attempt to sync availability but may fallback to owner templates.</p>
                       </div>
                    </div>
                  </>
                )}
             </div>
          )}

        {settingsView === 'workflow' && (
            <div className="space-y-10 animate-fade-in-up">
               {/* 1. LEAD PROCESSING */}
               <div className="bg-[#091328]/40 backdrop-blur-md p-10 rounded-[3rem] border border-white/5 space-y-10 shadow-2xl">
                  <div className="flex items-center gap-4 mb-2">
                     <span className="material-symbols-outlined text-indigo-500 bg-indigo-500/10 p-2 rounded-xl">bolt</span>
                     <h3 className="text-2xl font-headline font-black text-white tracking-tight">Lead Processing</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">AI Response Delay (Humanization)</label>
                        <select className="w-full bg-[#060e20] border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-indigo-500/50 outline-none transition-all shadow-inner font-medium appearance-none" value={responseDelay} onChange={e => {setResponseDelay(e.target.value); setHasChanges(true);}}>
                           <option value="Instant">Instant (0s)</option>
                           <option value="2s">Natural (2s)</option>
                           <option value="5s">Thinker (5s)</option>
                           <option value="15s">Deliberate (15s)</option>
                        </select>
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Routing Strategy</label>
                        <select className="w-full bg-[#060e20] border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-indigo-500/50 outline-none transition-all shadow-inner font-medium appearance-none" value={routingMode} onChange={e => {setRoutingMode(e.target.value); setHasChanges(true);}}>
                           <option value="standard">Standard (Sequential)</option>
                           <option value="priority">Priority (High Intent First)</option>
                           <option value="geo">Geographic Proximity</option>
                        </select>
                     </div>
                  </div>
               </div>

               {/* 2. LEAD MANAGEMENT */}
               <div className="bg-[#091328]/40 backdrop-blur-md p-10 rounded-[3rem] border border-white/5 space-y-10 shadow-2xl">
                  <div className="flex items-center gap-4 mb-2">
                     <span className="material-symbols-outlined text-emerald-500 bg-emerald-500/10 p-2 rounded-xl">inventory_2</span>
                     <h3 className="text-2xl font-headline font-black text-white tracking-tight">Lead Management</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Daily Lead Capacity</label>
                        <select className="w-full bg-[#060e20] border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-indigo-500/50 outline-none transition-all shadow-inner font-medium appearance-none" value={leadCapacity} onChange={e => {setLeadCapacity(e.target.value); setHasChanges(true);}}>
                           <option value="No Limit">No Limit</option>
                           <option value="5">Soft Cap (5 leads/day)</option>
                           <option value="10">Standard (10 leads/day)</option>
                           <option value="25">Enterprise (25 leads/day)</option>
                        </select>
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Auto-Archive Inactivity</label>
                        <select className="w-full bg-[#060e20] border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-indigo-500/50 outline-none transition-all shadow-inner font-medium appearance-none" value={autoArchiveDays} onChange={e => {setAutoArchiveDays(e.target.value); setHasChanges(true);}}>
                           <option value="3">Quick (3 Days)</option>
                           <option value="7">Standard (7 Days)</option>
                           <option value="14">Patient (14 Days)</option>
                           <option value="30">Long-term (30 Days)</option>
                        </select>
                     </div>
                  </div>
               </div>

               {/* 3. ENGAGEMENT & URGENCY */}
               <div className="bg-[#091328]/40 backdrop-blur-md p-10 rounded-[3rem] border border-white/5 space-y-10 shadow-2xl">
                  <div className="flex items-center gap-4 mb-2">
                     <span className="material-symbols-outlined text-rose-500 bg-rose-500/10 p-2 rounded-xl">emergency</span>
                     <h3 className="text-2xl font-headline font-black text-white tracking-tight">Engagement & Urgency</h3>
                  </div>
                  <div className="space-y-8">
                     <div className="flex items-center justify-between p-6 bg-[#060e20]/50 rounded-[2rem] border border-white/5">
                        <div className="flex items-center gap-4">
                           <span className="material-symbols-outlined text-indigo-400">history</span>
                           <div>
                              <p className="text-sm font-bold text-white">Automated AI Follow-up</p>
                              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-0.5">AI will check in after 24h of silence</p>
                           </div>
                        </div>
                        <button onClick={() => {setFollowUpEnabled(!followUpEnabled); setHasChanges(true);}} className={`w-12 h-6 rounded-full transition-all relative ${followUpEnabled ? 'bg-indigo-600' : 'bg-slate-800'}`}>
                           <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${followUpEnabled ? 'left-6.5' : 'left-0.5'}`}></div>
                        </button>
                     </div>

                     <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Urgency Keywords (Direct Human Handoff)</label>
                          <input 
                            className="w-full bg-[#060e20] border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-indigo-500/50 outline-none transition-all shadow-inner font-medium" 
                            value={urgencyKeywords} 
                            onChange={e => {setUrgencyKeywords(e.target.value); setHasChanges(true);}} 
                            placeholder="emergency, urgent, leaking, broken" 
                          />
                          <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wider pl-1">Separate keywords with commas. Assistant will immediately notify you if these are mentioned.</p>
                      </div>

                      <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase text-amber-500/60 tracking-[0.2em] pl-1 flex items-center gap-2">
                             <span className="material-symbols-outlined text-sm">phone_forwarded</span>
                             Escalation Handoff Number
                          </label>
                          <input 
                            className="w-full bg-[#060e20] border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-amber-500/30 outline-none transition-all shadow-inner font-medium" 
                            value={handoffPhone}
                            type="tel"
                            maxLength={14}
                            onChange={e => {setHandoffPhone(formatPhone(e.target.value)); setHasChanges(true);}} 
                            placeholder="+1 (555) 000-0000" 
                          />
                          <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wider pl-1">The number AI will mention when 'looping in the owner'.</p>
                     </div>
                  </div>
               </div>

               {/* 4. NOTIFICATION CENTER (NEW) */}
               <div className="bg-[#091328]/40 backdrop-blur-md p-10 rounded-[3rem] border border-white/5 space-y-10 shadow-2xl">
                  <div className="flex items-center gap-4 mb-2">
                     <span className="material-symbols-outlined text-indigo-500 bg-indigo-500/10 p-2 rounded-xl">notifications_active</span>
                     <h3 className="text-2xl font-headline font-black text-white tracking-tight">Notification Center</h3>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                     <div className="flex items-center justify-between p-6 bg-[#060e20]/50 rounded-[2rem] border border-white/5">
                        <div className="flex items-center gap-4">
                           <span className="material-symbols-outlined text-indigo-400">sms</span>
                           <div>
                              <p className="text-sm font-bold text-white">SMS Alerts</p>
                              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-0.5">Real-time phone alerts</p>
                           </div>
                        </div>
                        <button onClick={() => {setSmsAlerts(!smsAlerts); setHasChanges(true);}} className={`w-12 h-6 rounded-full transition-all relative ${smsAlerts ? 'bg-indigo-600' : 'bg-slate-800'}`}>
                           <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${smsAlerts ? 'left-6.5' : 'left-0.5'}`}></div>
                        </button>
                     </div>

                     <div className="flex items-center justify-between p-6 bg-[#060e20]/50 rounded-[2rem] border border-white/5">
                        <div className="flex items-center gap-4">
                           <span className="material-symbols-outlined text-indigo-400">mail</span>
                           <div>
                              <p className="text-sm font-bold text-white">Email Digests</p>
                              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-0.5">Daily summary of lead activity</p>
                           </div>
                        </div>
                        <button onClick={() => {setEmailAlerts(!emailAlerts); setHasChanges(true);}} className={`w-12 h-6 rounded-full transition-all relative ${emailAlerts ? 'bg-indigo-600' : 'bg-slate-800'}`}>
                           <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${emailAlerts ? 'left-6.5' : 'left-0.5'}`}></div>
                        </button>
                     </div>
                  </div>

                  <div className="p-6 bg-amber-500/5 rounded-[2rem] border border-amber-500/20">
                     <div className="flex items-start gap-4">
                        <span className="material-symbols-outlined text-amber-500">priority_high</span>
                        <div>
                           <p className="text-xs font-bold text-white">Escalation Bypass</p>
                           <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-1">If "SMS Alerts" are enabled, any lead tagged as <span className="text-rose-400 font-black">URGENT</span> will bypass your notification quiet hours to ensure you never miss a critical job.</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* 4. AFTER HOURS */}
               <div className="bg-[#091328]/40 backdrop-blur-md p-10 rounded-[3rem] border border-white/5 space-y-8 shadow-2xl">
                  <div className="flex items-center justify-between">
                     <div>
                        <h3 className="text-xl font-headline font-black text-white tracking-tight">After-Hours AI Handling</h3>
                        <p className="text-slate-500 text-sm mt-1">When your business is closed, AI will take full control of lead engagement.</p>
                     </div>
                     <button 
                       onClick={() => {setAfterHoursAi(!afterHoursAi); setHasChanges(true);}}
                       className={`w-14 h-8 rounded-full transition-all relative ${afterHoursAi ? 'bg-indigo-600' : 'bg-slate-800'}`}
                     >
                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${afterHoursAi ? 'left-7' : 'left-1'}`}></div>
                     </button>
                  </div>
               </div>
            </div>
          )}


          {settingsView === 'notifications' && (
           <div className="space-y-10 animate-fade-in-up">
              <div className="bg-[#091328]/40 backdrop-blur-md p-10 rounded-[3rem] border border-white/5 space-y-8 shadow-2xl">
                 <div className="flex items-center gap-4 mb-2">
                    <span className="material-symbols-outlined text-indigo-500 bg-indigo-500/10 p-2 rounded-xl">notifications</span>
                    <h3 className="text-2xl font-headline font-black text-white tracking-tight">Alert Preferences</h3>
                 </div>
                 
                 <div className="space-y-6">
                    <div className="flex items-center justify-between p-6 bg-[#060e20]/50 rounded-[2rem] border border-white/5">
                       <div className="flex items-center gap-4">
                          <span className="material-symbols-outlined text-indigo-400">sms</span>
                          <div>
                             <p className="text-sm font-bold text-white">Instant SMS Alerts</p>
                             <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-0.5">Mobile push when new lead arrives</p>
                          </div>
                       </div>
                       <button onClick={() => {setSmsAlerts(!smsAlerts); setHasChanges(true);}} className={`w-12 h-6 rounded-full transition-all relative ${smsAlerts ? 'bg-emerald-500' : 'bg-slate-800'}`}>
                          <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${smsAlerts ? 'left-6.5' : 'left-0.5'}`}></div>
                       </button>
                    </div>

                    <div className="flex items-center justify-between p-6 bg-[#060e20]/50 rounded-[2rem] border border-white/5">
                       <div className="flex items-center gap-4">
                          <span className="material-symbols-outlined text-indigo-400">mail</span>
                          <div>
                             <p className="text-sm font-bold text-white">Email Lead Notifications</p>
                             <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-0.5">Detailed lead profile via email</p>
                          </div>
                       </div>
                       <button onClick={() => {setEmailAlerts(!emailAlerts); setHasChanges(true);}} className={`w-12 h-6 rounded-full transition-all relative ${emailAlerts ? 'bg-emerald-500' : 'bg-slate-800'}`}>
                          <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${emailAlerts ? 'left-6.5' : 'left-0.5'}`}></div>
                       </button>
                    </div>

                    <div className="flex items-center justify-between p-6 bg-[#060e20]/50 rounded-[2rem] border border-white/5">
                       <div className="flex items-center gap-4">
                          <span className="material-symbols-outlined text-indigo-400">analytics</span>
                          <div>
                             <p className="text-sm font-bold text-white">Weekly Performance Reports</p>
                             <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-0.5">Summary of revenue and lead counts</p>
                          </div>
                       </div>
                       <button onClick={() => {setWeeklyReports(!weeklyReports); setHasChanges(true);}} className={`w-12 h-6 rounded-full transition-all relative ${weeklyReports ? 'bg-emerald-500' : 'bg-slate-800'}`}>
                          <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${weeklyReports ? 'left-6.5' : 'left-0.5'}`}></div>
                       </button>
                    </div>
                 </div>
              </div>
           </div>
         )}
        </div>
      </div>
    </div>
  )
}


function LoadingSkeleton() {
  return (
    <div className="fixed inset-0 bg-[#060e20] z-[9000] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin shadow-[0_0_15px_rgba(99,102,241,0.3)]"></div>
        <p className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.3em] animate-pulse">Initializing Intelligence...</p>
      </div>
    </div>
  )
}

function OnboardingOverlay({ onComplete, isDemo = false }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSkip = async () => {
    const defaultName = 'My Business';
    setIsSubmitting(true);
    if (!isDemo) {
      try {
        const { data: userData } = await supabase.auth.getUser()
        const userId = userData.user?.id
        
        // 1. Check if business already exists
        const { data: existingBiz } = await supabase
          .from('businesses')
          .select('id')
          .eq('user_id', userId)
          .single()
          
        if (!existingBiz) {
          // 2. Insert default business
          const { data: business, error: bizError } = await supabase
            .from('businesses')
            .insert([{ user_id: userId, name: defaultName }])
            .select()
            .single()

          if (bizError) throw bizError
          if (business) await createSampleLead(business.id)
        }
      } catch (err) {
        console.error('Error skipping onboarding:', err)
        // We still let them through to the dashboard even if DB fails
      }
    }
    setIsSubmitting(false);
    onComplete(defaultName);
  };

   const handleFinish = async () => {
    if (!name) return alert('Enter business name');
    setIsSubmitting(true);
    
    if (!isDemo) {
      try {
        const { data: userData } = await supabase.auth.getUser()
        const userId = userData.user?.id
        
        // 1. Check if business already exists
        const { data: existingBiz } = await supabase
          .from('businesses')
          .select('id')
          .eq('user_id', userId)
          .single()
          
        if (existingBiz) {
          onComplete(name)
          return
        }

        // 2. Insert new business
        const { data: business, error: bizError } = await supabase
          .from('businesses')
          .insert([{ user_id: userId, name }])
          .select()
          .single()

        if (bizError) throw bizError
        
        if (business) {
          await createSampleLead(business.id)
        }
      } catch (err) {
        console.error('Error in onboarding finish:', err)
        alert(`Failed to save business profile: ${err.message || 'Unknown error'}`)
        setIsSubmitting(false)
        return
      }
    }
    
    setIsSubmitting(false);
    onComplete(name);
  };

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/95 backdrop-blur-xl p-6">
       <div className="bg-white p-12 rounded-[3.5rem] w-full max-w-xl text-black shadow-2xl relative overflow-hidden animate-fade-in-up">
          <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
             <div className="h-full bg-indigo-600 transition-all duration-700" style={{ width: step === 1 ? '50%' : '100%' }}></div>
          </div>
          <h2 className="text-4xl font-headline font-black mb-2 tracking-tight">Scale Your Business</h2>
          <p className="text-slate-500 mb-10 font-medium font-body">Let's set up your high-fidelity AI lead capture system.</p>
          
          <div className="space-y-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Business Name</label>
                <input className="w-full p-6 border-2 border-slate-100 rounded-[2rem] text-sm font-bold focus:border-indigo-600 outline-none transition-all mr-2" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Skyline Roofing" />
             </div>
             <button 
               onClick={handleFinish} 
               disabled={isSubmitting}
               className="w-full p-6 bg-indigo-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-900/20 hover:bg-slate-900 transition-all disabled:opacity-50"
             >
               {isSubmitting ? 'Finalizing...' : 'Complete Setup'}
             </button>
             
             <div className="pt-4 border-t border-slate-100/50 mt-4 text-center">
                <button 
                  onClick={handleSkip} 
                  disabled={isSubmitting}
                  className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-all px-4 py-2 group"
                >
                  Want to set this up later? <br/>
                  <span className="text-indigo-600 mt-1 inline-block group-hover:scale-105 transition-transform">Skip for now & enter dashboard</span>
                </button>
             </div>
          </div>
          <p className="text-[9px] text-slate-400 mt-8 text-center uppercase font-black tracking-widest opacity-50">Secure Enterprise Infrastructure Powered by LeadFlow</p>
       </div>
    </div>
  );
}
