import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase.js'
import { getNotifications, markNotificationRead } from '../lib/queries.js'

export default function NotificationCenter({ businessId, isDemo = false }) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef(null)

  const refreshNotifications = async () => {
    if (isDemo || !businessId) return
    const data = await getNotifications(false, businessId)
    setNotifications(data || [])
    setUnreadCount(data?.filter(n => !n.read_status).length || 0)
  }

  useEffect(() => {
    refreshNotifications()

    // Real-time subscription
    if (!isDemo && businessId) {
      const channel = supabase
        .channel(`public:notifications:business_id=eq.${businessId}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications', 
          filter: `business_id=eq.${businessId}` 
        }, (payload) => {
          setNotifications(prev => [payload.new, ...prev])
          setUnreadCount(prev => prev + 1)
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [businessId, isDemo])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkRead = async (id) => {
    await markNotificationRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_status: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isOpen ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'}`}
      >
        <span className="material-symbols-outlined text-xl">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-[#060e20] flex items-center justify-center text-[8px] font-black text-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-4 w-80 md:w-96 bg-[#091328]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] animate-fade-in-up overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
            <h3 className="text-sm font-headline font-black text-white tracking-tight uppercase">Intelligence Feed</h3>
            <span className="text-[10px] font-black uppercase text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">Live</span>
          </div>

          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-12 text-center opacity-20">
                <span className="material-symbols-outlined text-4xl mb-2">notifications_off</span>
                <p className="text-xs font-bold uppercase tracking-widest">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map(n => (
                  <div 
                    key={n.id} 
                    className={`p-5 hover:bg-white/5 transition-all group flex gap-4 items-start cursor-pointer ${!n.read_status ? 'bg-indigo-500/5' : ''}`}
                    onClick={() => !n.read_status && handleMarkRead(n.id)}
                  >
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      n.type === 'urgent_lead' ? 'bg-rose-500/10 text-rose-400' : 
                      n.type === 'new_booking' ? 'bg-emerald-500/10 text-emerald-400' : 
                      'bg-indigo-500/10 text-indigo-400'
                    }`}>
                      <span className="material-symbols-outlined text-lg">
                        {n.type === 'urgent_lead' ? 'emergency' : n.type === 'new_booking' ? 'calendar_month' : 'info'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[12px] leading-relaxed transition-colors ${!n.read_status ? 'text-white font-bold' : 'text-slate-400 font-medium'}`}>
                        {n.message}
                      </p>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-[9px] font-black uppercase text-slate-600 tracking-widest">
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {!n.read_status && (
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-4 bg-white/5 border-t border-white/5">
             <button className="w-full py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all">
                Clear All Notifications
             </button>
          </div>
        </div>
      )}
    </div>
  )
}
