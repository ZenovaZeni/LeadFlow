import { useState, useEffect } from 'react'
import { getBookings, updateBookingStatus } from '../lib/queries'
import InfoExplainer from '../components/InfoExplainer'

export default function BookingsTab({ isDemo = false, businessId = null }) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('All')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  
  // 📅 CALENDAR STATE
  const [viewMode, setViewMode] = useState('list') // 'list' or 'calendar'
  const [currentDate, setCurrentDate] = useState(new Date())

  const navigateMonth = (direction) => {
    const next = new Date(currentDate)
    next.setMonth(currentDate.getMonth() + direction)
    setCurrentDate(next)
  }

  const getCalendarDays = () => {
    const y = currentDate.getFullYear()
    const m = currentDate.getMonth()
    const firstDay = new Date(y, m, 1).getDay()
    const days = new Date(y, m + 1, 0).getDate()
    
    const daysArr = []
    for (let i = 0; i < firstDay; i++) daysArr.push(null)
    for (let d = 1; d <= days; d++) daysArr.push(new Date(y, m, d))
    return daysArr
  }

  const getDayBookings = (date) => {
    if (!date) return []
    const dStr = date.toISOString().split('T')[0]
    return bookings.filter(b => b.date === dStr)
  }

  const refreshBookings = () => {
    setLoading(true)
    getBookings(isDemo, businessId).then(data => {
      setBookings(data || [])
      setLoading(false)
    })
  }

  useEffect(() => {
    refreshBookings()
  }, [isDemo, businessId])

  const handleStatusUpdate = async (id, newStatus) => {
    setIsUpdating(true)
    try {
      await updateBookingStatus(id, newStatus)
      refreshBookings()
      if (selectedBooking?.id === id) {
        setSelectedBooking(prev => ({ ...prev, booking_status: newStatus }))
      }
    } catch (err) {
      console.error('Error updating booking:', err)
      alert('Failed to update status')
    } finally {
      setIsUpdating(false)
    }
  }

  const filtered = filterStatus === 'All' 
    ? bookings 
    : bookings.filter(b => b.booking_status === filterStatus)

  const stats = {
    pending: bookings.filter(b => b.booking_status === 'Pending').length,
    confirmedToday: bookings.filter(b => b.booking_status === 'Confirmed' && b.date === new Date().toISOString().split('T')[0]).length,
    completedWeek: bookings.filter(b => b.booking_status === 'Completed').length, // Simple count for now
    reschedule: bookings.filter(b => b.booking_status === 'Reschedule Requested').length
  }

  if (loading) return <div className="p-24 animate-pulse text-indigo-400">Loading Bookings...</div>

  return (
    <div className="animate-fade-in flex flex-col gap-8 md:gap-12">
      {/* SUMMARY CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pending Bookings', value: stats.pending, color: 'text-amber-400', icon: 'pending_actions' },
          { label: 'Confirmed Today', value: stats.confirmedToday, color: 'text-emerald-400', icon: 'event_available' },
          { label: 'Completed This Week', value: stats.completedWeek, color: 'text-indigo-400', icon: 'task_alt' },
          { label: 'Reschedules Needed', value: stats.reschedule, color: 'text-rose-400', icon: 'event_busy', alert: stats.reschedule > 0 }
        ].map((stat, i) => (
          <div key={i} className={`glass-card p-6 rounded-3xl flex flex-col justify-between group hover:bg-[#192540] transition-all ${stat.alert ? 'border-rose-500/20 shadow-lg shadow-rose-500/5' : ''}`}>
             <div className="flex justify-between items-start">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest font-headline">{stat.label}</span>
                <span className={`material-symbols-outlined text-lg ${stat.color} opacity-40 group-hover:opacity-100 transition-opacity`}>{stat.icon}</span>
             </div>
             <div className="mt-4 flex items-baseline gap-2">
                <span className={`text-4xl font-headline font-extrabold ${stat.color}`}>{stat.value}</span>
             </div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        {/* MAIN LIST */}
        <div className="bg-[#091328]/50 rounded-[2.5rem] p-8 border border-white/5 flex flex-col min-h-[600px] hover:border-white/10 transition-colors">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
               <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                     <h2 className="text-3xl font-headline font-black text-white tracking-tight">Active Schedule</h2>
                     <InfoExplainer text="All booked appointments across your manual and automated channels." />
                  </div>
                  
                  {/* View Toggle */}
                  <div className="flex bg-[#060e20] p-1 rounded-xl border border-white/5 shadow-inner">
                     <button 
                       onClick={() => setViewMode('list')}
                       className={`p-2 px-5 rounded-lg flex items-center gap-2 transition-all duration-300 ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                     >
                        <span className="material-symbols-outlined text-sm">list</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">List</span>
                     </button>
                     <button 
                       onClick={() => setViewMode('calendar')}
                       className={`p-2 px-5 rounded-lg flex items-center gap-2 transition-all duration-300 ${viewMode === 'calendar' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                     >
                        <span className="material-symbols-outlined text-sm">calendar_view_month</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">Grid</span>
                     </button>
                  </div>
               </div>
               
               <div className="flex items-center gap-4">
                  {viewMode === 'calendar' && (
                    <div className="flex items-center gap-4 bg-[#060e20] p-1.5 rounded-2xl border border-white/5 mr-4 animate-fade-in">
                       <button onClick={() => navigateMonth(-1)} className="p-2 text-slate-500 hover:text-indigo-400 transition-colors"><span className="material-symbols-outlined text-sm">chevron_left</span></button>
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white min-w-[140px] text-center">
                         {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                       </span>
                       <button onClick={() => navigateMonth(1)} className="p-2 text-slate-500 hover:text-indigo-400 transition-colors"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
                    </div>
                  )}

                  <div className="flex bg-[#060e20] p-1.5 rounded-2xl border border-white/5">
                     {['All', 'Pending', 'Confirmed', 'Completed'].map(s => (
                       <button 
                         key={s} 
                         onClick={() => setFilterStatus(s)}
                         className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === s ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-white'}`}
                       >
                         {s}
                       </button>
                     ))}
                  </div>
               </div>
            </div>

            {viewMode === 'list' ? (
              <div className="overflow-x-auto animate-fade-in">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="border-b border-white/5">
                          <th className="pb-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-4">Customer</th>
                          <th className="pb-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Service</th>
                          <th className="pb-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Date / Time</th>
                          <th className="pb-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Status</th>
                          <th className="pb-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Source</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {filtered.map(booking => (
                          <tr 
                            key={booking.id} 
                            onClick={() => setSelectedBooking(booking)}
                            className={`group cursor-pointer hover:bg-white/5 transition-all ${selectedBooking?.id === booking.id ? 'bg-white/5' : ''}`}
                          >
                             <td className="py-6 pl-4">
                                <div className="font-bold text-white group-hover:text-indigo-400 transition-colors uppercase text-xs">{booking.customer_name}</div>
                                <div className="text-[10px] text-slate-500 mt-1">{booking.phone}</div>
                             </td>
                             <td className="py-6">
                                <span className="text-xs font-medium text-slate-300">{booking.service_type}</span>
                             </td>
                             <td className="py-6">
                                <div className="text-xs font-bold text-white">{booking.date}</div>
                                <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1">{booking.time}</div>
                             </td>
                             <td className="py-6">
                                <span className={`text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest inline-block ${
                                   booking.booking_status === 'Confirmed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/10' :
                                   booking.booking_status === 'Pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/10' :
                                   booking.booking_status === 'Completed' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/10' :
                                   'bg-rose-500/20 text-rose-400 border border-rose-500/10'
                                }`}>
                                   {booking.booking_status}
                                </span>
                             </td>
                             <td className="py-6">
                                <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest flex items-center gap-2">
                                   <span className="material-symbols-outlined text-sm opacity-50">{booking.source === 'Assistant' ? 'smart_toy' : 'person'}</span>
                                   {booking.source}
                                </span>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
                 {filtered.length === 0 && (
                   <div className="py-24 text-center opacity-30">
                      <span className="material-symbols-outlined text-5xl mb-4">event_busy</span>
                      <p className="font-headline font-bold">No bookings found in this view.</p>
                   </div>
                 )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col animate-fade-in gap-8">
                 {/* Calendar Grid */}
                 <div className="grid grid-cols-7 gap-px bg-white/5 rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="bg-[#060e20]/80 p-4 text-center border-b border-white/5">
                         <span className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em]">{day}</span>
                      </div>
                    ))}
                    
                    {getCalendarDays().map((day, i) => {
                      const dayBookings = getDayBookings(day)
                      const isToday = day && day.toISOString().split('T')[0] === new Date().toISOString().split('T')[0]
                      
                      return (
                        <div 
                          key={i} 
                          className={`min-h-[120px] p-4 bg-[#091328]/30 transition-all ${day ? 'hover:bg-indigo-500/5 cursor-pointer relative' : 'opacity-20 pointer-events-none'}`}
                          onClick={() => day && dayBookings.length > 0 && setSelectedBooking(dayBookings[0])}
                        >
                           {day && (
                             <>
                               <div className="flex justify-between items-start mb-2">
                                  <span className={`text-xs font-bold ${isToday ? 'text-indigo-400' : 'text-slate-500'}`}>
                                    {day.getDate()}
                                  </span>
                                  {dayBookings.length > 0 && (
                                    <span className="w-5 h-5 bg-indigo-500/20 rounded-full flex items-center justify-center text-[9px] font-black text-indigo-400 border border-indigo-500/20">
                                       {dayBookings.length}
                                    </span>
                                  )}
                               </div>
                               
                               <div className="space-y-1.5 overflow-hidden">
                                  {dayBookings.slice(0, 3).map(b => (
                                    <div key={b.id} className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-tighter truncate ${
                                      b.booking_status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' :
                                      b.booking_status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/10' :
                                      'bg-indigo-500/10 text-indigo-400 border border-indigo-500/10'
                                    }`}>
                                       {b.time} - {b.customer_name}
                                    </div>
                                  ))}
                                  {dayBookings.length > 3 && (
                                    <div className="text-[8px] text-slate-600 font-bold uppercase pl-1">
                                       + {dayBookings.length - 3} more
                                    </div>
                                  )}
                               </div>
                             </>
                           )}
                        </div>
                      )
                    })}
                 </div>

                 <div className="p-8 bg-indigo-500/5 rounded-3xl border border-indigo-500/10 flex items-center gap-6">
                    <span className="material-symbols-outlined text-indigo-400 text-3xl">insights</span>
                    <div>
                       <p className="text-sm font-bold text-white">Visual Planning Mode</p>
                       <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1 leading-relaxed">
                          Your calendar is aggregated across all Cal.com integrations. Clicking a date will show detailed lead intelligence in the sidebar.
                       </p>
                    </div>
                 </div>
              </div>
            )}
        </div>

        {/* DETAIL PANEL */}
        <aside className={`bg-[#091328]/50 rounded-[2.5rem] border border-white/5 flex flex-col transition-all duration-500 overflow-hidden ${!selectedBooking ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
           {selectedBooking && (
             <div className="p-8 flex flex-col h-full">
                <div className="flex justify-between items-start mb-10">
                   <h3 className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.2em]">Booking Intelligence</h3>
                   <button onClick={() => setSelectedBooking(null)} className="text-slate-500 hover:text-white transition-colors"><span className="material-symbols-outlined text-sm">close</span></button>
                </div>

                <div className="space-y-8 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                   <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                      <div className="flex items-center gap-4 mb-6">
                         <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white font-black text-xs uppercase tracking-tighter">
                            {selectedBooking.customer_name.substring(0, 2)}
                         </div>
                         <div>
                            <h4 className="text-lg font-headline font-black text-white">{selectedBooking.customer_name}</h4>
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{selectedBooking.phone}</p>
                         </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                         <div className="p-4 bg-[#060e20]/50 rounded-2xl border border-white/5">
                            <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mb-1">Service</p>
                            <p className="text-xs font-bold text-white">{selectedBooking.service_type}</p>
                         </div>
                         <div className="p-4 bg-[#060e20]/50 rounded-2xl border border-white/5">
                            <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mb-1">Status</p>
                            <p className="text-xs font-bold text-indigo-400">{selectedBooking.booking_status}</p>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <h5 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Booking Request</h5>
                      <div className="p-6 bg-[#060e20]/50 rounded-3xl border border-white/5 space-y-4">
                         <div className="flex items-start gap-4">
                            <span className="material-symbols-outlined text-indigo-400 text-lg">event</span>
                            <div>
                               <p className="text-xs font-bold text-white">Desired Time: {selectedBooking.requested_time_text}</p>
                               <p className="text-[10px] text-slate-500 mt-1">Confirmed for: {selectedBooking.date} at {selectedBooking.time}</p>
                            </div>
                         </div>
                         {selectedBooking.notes && (
                           <div className="pt-4 border-t border-white/5">
                              <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mb-2">Internal Notes</p>
                              <p className="text-xs text-slate-300 leading-relaxed italic">"{selectedBooking.notes}"</p>
                           </div>
                         )}
                      </div>
                   </div>

                   <div className="space-y-4">
                      <h5 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Admin Actions</h5>
                      <div className="grid grid-cols-2 gap-3">
                         <button 
                           onClick={() => handleStatusUpdate(selectedBooking.id, 'Confirmed')}
                           disabled={isUpdating}
                           className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-col items-center gap-2 hover:bg-emerald-500/20 transition-all group"
                         >
                            <span className="material-symbols-outlined text-emerald-400 group-hover:scale-110 transition-transform">check_circle</span>
                            <span className="text-[9px] font-black uppercase text-emerald-400">Confirm</span>
                         </button>
                         <button 
                           onClick={() => handleStatusUpdate(selectedBooking.id, 'Completed')}
                           disabled={isUpdating}
                           className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex flex-col items-center gap-2 hover:bg-indigo-500/20 transition-all group"
                         >
                            <span className="material-symbols-outlined text-indigo-400 group-hover:scale-110 transition-transform">task_alt</span>
                            <span className="text-[9px] font-black uppercase text-indigo-400">Complete</span>
                         </button>
                         <button 
                           onClick={() => handleStatusUpdate(selectedBooking.id, 'Reschedule Requested')}
                           disabled={isUpdating}
                           className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex flex-col items-center gap-2 hover:bg-amber-500/20 transition-all group"
                         >
                            <span className="material-symbols-outlined text-amber-400 group-hover:scale-110 transition-transform">event_repeat</span>
                            <span className="text-[9px] font-black uppercase text-amber-400">Reschedule</span>
                         </button>
                         <button 
                           onClick={() => handleStatusUpdate(selectedBooking.id, 'Cancelled')}
                           disabled={isUpdating}
                           className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex flex-col items-center gap-2 hover:bg-rose-500/20 transition-all group"
                         >
                            <span className="material-symbols-outlined text-rose-400 group-hover:scale-110 transition-transform">cancel</span>
                            <span className="text-[9px] font-black uppercase text-rose-400">Cancel</span>
                         </button>
                      </div>
                   </div>
                </div>
                
                <button className="w-full py-5 bg-white/5 border border-white/10 rounded-3xl mt-8 flex items-center justify-center gap-3 group hover:bg-white/10 transition-all">
                   <span className="material-symbols-outlined text-slate-400 group-hover:text-white transition-colors">chat</span>
                   <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest group-hover:text-white transition-colors">Continue Conversation</span>
                </button>
             </div>
           )}
        </aside>
      </div>
    </div>
  )
}
