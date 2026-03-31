import { useState, useEffect } from 'react'
import { getAvailableSlots, createBooking } from '../lib/queries'

export default function BookingModal({ lead, isOpen, onClose, isDemo, businessId }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [slots, setSlots] = useState([])
  const [selectedTime, setSelectedTime] = useState('')
  const [serviceType, setServiceType] = useState(lead?.service || '')
  const [notes, setNotes] = useState('')
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen && date) {
      setLoadingSlots(true)
      getAvailableSlots(businessId, date, serviceType).then(data => {
        setSlots(data)
        setLoadingSlots(false)
      })
    }
  }, [isOpen, date, businessId])

  if (!isOpen) return null

  const handleCreate = async () => {
    if (!selectedTime) return alert('Please select a time')
    
    setIsSubmitting(true)
    try {
      await createBooking(businessId, {
        customer_name: lead.name,
        phone: lead.phone,
        service_type: serviceType,
        date: date,
        time: selectedTime,
        booking_status: 'Confirmed',
        source: 'Manual',
        requested_time_text: 'Manual Booking',
        notes: notes
      })
      alert('Booking Created Successfully')
      onClose()
    } catch (err) {
      console.error(err)
      alert('Failed to create booking')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#060e20]/80 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative w-full max-w-xl bg-[#091328] border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden animate-fade-in-up">
         <div className="p-10 space-y-8">
            <div className="flex justify-between items-start">
               <div>
                  <h3 className="text-2xl font-headline font-black text-white tracking-tight">Manual Booking</h3>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Schedule appointment for {lead?.name}</p>
               </div>
               <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><span className="material-symbols-outlined">close</span></button>
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2rem] pl-1">Booking Date</label>
                  <input 
                    type="date" 
                    className="w-full bg-[#060e20] border border-white/5 rounded-2xl py-4 px-6 text-sm text-white focus:border-indigo-500 outline-none transition-all"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                  />
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2rem] pl-1">Service Type</label>
                  <input 
                    className="w-full bg-[#060e20] border border-white/5 rounded-2xl py-4 px-6 text-sm text-white focus:border-indigo-500 outline-none transition-all"
                    value={serviceType}
                    onChange={e => setServiceType(e.target.value)}
                    placeholder="e.g. Roof Inspection"
                  />
               </div>
            </div>

            <div className="space-y-4">
               <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2rem] pl-1">Available Times</label>
               {loadingSlots ? (
                 <div className="py-8 text-center animate-pulse text-indigo-400 text-xs font-bold uppercase tracking-widest">Calculating Slots...</div>
               ) : (
                 <div className="grid grid-cols-3 gap-3">
                    {slots.map(slot => (
                      <button 
                        key={slot}
                        onClick={() => setSelectedTime(slot)}
                        className={`py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${selectedTime === slot ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20'}`}
                      >
                         {slot}
                      </button>
                    ))}
                    {slots.length === 0 && <p className="col-span-3 py-8 text-center text-slate-500 text-xs font-medium italic">No availability found for this date.</p>}
                 </div>
               )}
            </div>

            <div className="space-y-3">
               <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2rem] pl-1">Internal Notes</label>
               <textarea 
                 className="w-full bg-[#060e20] border border-white/5 rounded-3xl py-5 px-6 text-sm text-white focus:border-indigo-500 outline-none transition-all min-h-[100px] resize-none"
                 value={notes}
                 onChange={e => setNotes(e.target.value)}
                 placeholder="Add any specific details for the crew..."
               />
            </div>

            <div className="flex gap-4 pt-4">
               <button 
                 onClick={onClose}
                 className="flex-1 py-5 rounded-3xl border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:bg-white/5 transition-all"
               >
                  Cancel
               </button>
               <button 
                 onClick={handleCreate}
                 disabled={isSubmitting || !selectedTime}
                 className="flex-[2] py-5 rounded-3xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:bg-slate-800"
               >
                  {isSubmitting ? 'Scheduling...' : 'Confirm Booking'}
               </button>
            </div>
         </div>
      </div>
    </div>
  )
}
