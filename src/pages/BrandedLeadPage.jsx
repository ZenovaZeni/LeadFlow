import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function BrandedLeadPage() {
  const { businessId } = useParams()
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service: ''
  })

  useEffect(() => {
    async function fetchBusiness() {
      if (businessId === 'demo-id') {
        setBusiness(JSON.parse(localStorage.getItem('lf_demo_biz')) || {
          name: 'Skyline Roofing (Demo)',
          branding: {
            logo: '🌳',
            headline: 'Premium Roofing Estimates',
            color: '#4F46E5'
          }
        })
        setLoading(false)
        return
      }
      try {
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', businessId)
          .single()
        if (data) setBusiness(data)
      } catch (err) {
        console.error('Error fetching business:', err)
      } finally {
        setLoading(false)
      }
    }
    if (businessId) fetchBusiness()
  }, [businessId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    if (businessId === 'demo-id') {
      setTimeout(() => {
        setSubmitted(true)
        setLoading(false)
      }, 1000)
      return
    }
    try {
      const { error } = await supabase.from('leads').insert([{
        business_id: businessId,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        summary: formData.service, // Store service/message in summary
        status: 'new'
      }])
      if (!error) setSubmitted(true)
      else alert('Failed to send. Please try again.')
    } catch (err) {
      console.error('Lead submission error:', err)
      alert('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !submitted) return (
    <div className="min-h-screen bg-[#060e20] flex items-center justify-center">
      <div className="text-indigo-400 font-black text-[10px] tracking-[0.4em] uppercase animate-pulse">Initializing Portal...</div>
    </div>
  )

  if (!business && !loading) return (
    <div className="min-h-screen bg-[#060e20] flex items-center justify-center">
      <div className="text-slate-500 font-black text-[10px] tracking-[0.4em] uppercase">Portal Not Found</div>
    </div>
  )

  const brandingColor = business?.branding?.color || '#4F46E5'

  return (
    <div className="min-h-screen bg-[#060e20] text-white selection:bg-indigo-500/30 selection:text-indigo-200 font-inter">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/5 blur-[120px] rounded-full animate-pulse-slow"></div>
         <div className="absolute bottom-[10%] right-[-5%] w-[50%] h-[50%] bg-blue-600/5 blur-[100px] rounded-full animate-pulse-slow delay-700"></div>
      </div>

      <div className="relative z-10 max-w-xl mx-auto px-6 py-16 flex flex-col min-h-screen">
        {/* Header */}
        <div className="text-center space-y-6 mb-12">
          {business?.branding?.logo_image ? (
            <img 
              src={business.branding.logo_image} 
              alt={business.name} 
              className="h-20 mx-auto object-contain animate-fade-in-up"
            />
          ) : (
            <div className="w-20 h-20 mx-auto bg-indigo-600/20 border border-white/10 rounded-[2rem] flex items-center justify-center text-4xl shadow-2xl shadow-indigo-500/10 animate-fade-in-up">
              {business?.branding?.logo || '🚀'}
            </div>
          )}
          <div className="space-y-3 animate-fade-in-up delay-100">
            <h1 className="text-3xl font-headline font-black tracking-tight text-white leading-tight">{business?.name}</h1>
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-indigo-500/30"></div>
              <p className="text-indigo-400 font-black uppercase text-[9px] tracking-[0.3em]" style={{ color: brandingColor }}>{business?.branding?.headline || 'Lead Capture Portal'}</p>
              <div className="h-px w-8 bg-indigo-500/30"></div>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="w-full bg-[#091328]/40 backdrop-blur-3xl p-8 md:p-12 rounded-[3.5rem] border border-white/5 shadow-2xl animate-fade-in-up delay-200">
          {submitted ? (
            <div className="text-center py-10 space-y-8 animate-fade-in">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                <span className="material-symbols-outlined text-emerald-400 text-4xl">check</span>
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-black tracking-tight text-white">Thank You!</h2>
                <p className="text-slate-400 font-medium text-sm leading-relaxed px-4">Your request has been received. Our team from {business?.name} will be in touch with you shortly.</p>
              </div>
              <div className="space-y-4 pt-4">
                <button 
                  onClick={() => {
                    // In a real app, this would open a calendar or redirect to cal.com
                    window.location.href = `https://cal.com/${business?.name.toLowerCase().replace(/\s+/g, '-')}`;
                  }}
                  className="w-full py-6 bg-white text-[#060e20] rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl hover:bg-slate-100 transition-all flex items-center justify-center gap-3"
                >
                  <span className="material-symbols-outlined text-sm">calendar_month</span>
                  Pick a Time Now
                </button>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="w-full py-4 text-slate-500 font-black text-[9px] uppercase tracking-[0.3em] hover:text-white transition-colors"
                >
                  Back to Form
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">What is your name?</label>
                <input required className="w-full bg-[#060e20] border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-indigo-500/50 outline-none transition-all shadow-inner font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Jane Cooper" />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Phone Number</label>
                  <input required className="w-full bg-[#060e20] border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-indigo-500/50 outline-none transition-all shadow-inner font-bold" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="(555) 012-3456" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Email Address</label>
                  <input required type="email" className="w-full bg-[#060e20] border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-indigo-500/50 outline-none transition-all shadow-inner font-bold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="jane@example.com" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Explain your project</label>
                <textarea required className="w-full bg-[#060e20] border border-white/5 rounded-3xl py-6 px-6 text-sm text-white focus:border-indigo-500/50 outline-none transition-all shadow-inner min-h-[160px] resize-none font-bold leading-relaxed" value={formData.service} onChange={e => setFormData({...formData, service: e.target.value})} placeholder="Tell us how we can help..." />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-[0_20px_50px_-15px_rgba(79,70,229,0.3)] hover:shadow-none hover:bg-slate-900 transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
                style={{ backgroundColor: brandingColor }}
              >
                {loading ? 'Processing...' : (
                  <>
                    Submit Request <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="mt-20 text-center space-y-6 animate-fade-in delay-500 pb-12">
           <div className="flex flex-col items-center gap-4">
              <p className="text-[9px] font-black uppercase text-slate-600 tracking-[0.4em]">Proprietary Assistant by</p>
              <div className="flex items-center gap-2 grayscale brightness-50 opacity-40 group hover:grayscale-0 hover:opacity-100 transition-all">
                <span className="material-symbols-outlined text-sm">bolt</span>
                <span className="font-headline font-black text-xs tracking-tighter">LeadFlow Assistant</span>
              </div>
           </div>
           
           {business?.address && (
             <p className="text-[10px] text-slate-700 font-bold max-w-[200px] mx-auto leading-relaxed">{business.address}</p>
           )}
        </div>
      </div>
    </div>
  )
}
