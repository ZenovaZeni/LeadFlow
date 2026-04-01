import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'

const steps = [
  {
    id: 'welcome',
    title: "Let's Set Up Your Assistant",
    description: "This 2-minute walkthrough turns your assistant into a high-performance member of your team. We'll capture your business logic to ensure every response is smart and human-like.",
    type: 'info'
  },
  {
    id: 'ai_name',
    title: "What is your Assistant's name?",
    description: "Giving your assistant a name makes it feel more personable to your customers. (e.g. Jarvis, Maya, or Smart Assistant)",
    field: 'ai_name',
    type: 'input',
    placeholder: 'Jarvis',
    required: true
  },
  {
    id: 'ai_bio',
    title: "Tell us about your business.",
    description: "Describe what you do, your history, and what makes you special. The Assistant uses this to answer general questions about your company.",
    field: 'bio',
    type: 'textarea',
    placeholder: 'We are a family-owned tree service company in Austin since 1998...',
    required: true
  },
  {
    id: 'operational_bounds',
    title: "Set your job minimums.",
    description: "What is the smallest job you'll take, and do you charge a service fee? The Assistant uses this to qualify leads.",
    fields: [
      { name: 'min_ticket', label: 'Min. Ticket Size', placeholder: '$500' },
      { name: 'service_fee', label: 'Service/Estimate Fee', placeholder: '$99' }
    ],
    type: 'multi-input'
  },
  {
    id: 'service_radii',
    title: "Where do you operate?",
    description: "List the cities or radius you cover. This helps the Assistant confirm if a customer is within your service area.",
    field: 'service_radii',
    type: 'input',
    placeholder: 'Austin + 40mi radius'
  },
  {
    id: 'business_hours',
    title: "When are you open?",
    description: "The Assistant acts differently when you're closed (e.g., promising a callback tomorrow). Join the 24/7 era.",
    type: 'hours'
  },
  {
    id: 'faqs',
    title: "Top 3 Frequently Asked Questions",
    description: "Add a few things customers always ask. (e.g. 'Do you offer free estimates?')",
    type: 'faqs'
  },
  {
    id: 'custom_rules',
    title: "Any ground rules?",
    description: "Specify things the Assistant should always or never do. (e.g. 'Never promise same-day service')",
    field: 'custom_rules',
    type: 'textarea',
    placeholder: '1. Always be professional.\n2. Do NOT give pricing over text.'
  },
  {
    id: 'complete',
    title: "Assistant Setup Complete!",
    description: "Your assistant is now 10x smarter and ready to handle leads with your business intelligence. You can always edit these in Settings later.",
    type: 'success'
  }
]

export default function AITrainingOverlay({ businessId, initialData, onComplete, onCancel, isDemo = false }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    ai_name: initialData?.branding?.ai_name || 'Smart Assistant',
    bio: initialData?.ai_rules?.bio || '',
    min_ticket: initialData?.operational_bounds?.min_ticket || '$500',
    service_fee: initialData?.operational_bounds?.service_fee || '$99',
    service_radii: initialData?.operational_bounds?.service_radii || '',
    custom_rules: initialData?.ai_rules?.custom_rules || '',
    business_hours: initialData?.business_hours || {
      monday: { open: '08:00', close: '17:00', closed: false },
      tuesday: { open: '08:00', close: '17:00', closed: false },
      wednesday: { open: '08:00', close: '17:00', closed: false },
      thursday: { open: '08:00', close: '17:00', closed: false },
      friday: { open: '08:00', close: '17:00', closed: false },
      saturday: { open: '00:00', close: '00:00', closed: true },
      sunday: { open: '00:00', close: '00:00', closed: true }
    },
    faqs: []
  })
  const [loading, setLoading] = useState(false)
  const [newFaq, setNewFaq] = useState({ q: '', a: '' })

  const step = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      saveData()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1)
  }

  const saveData = async () => {
    if (isDemo) {
      setLoading(true)
      await new Promise(r => setTimeout(r, 1000))
      onComplete()
      return
    }
    setLoading(true)
    try {
      // 1. Update Business Profile
      const { error: bizError } = await supabase.from('businesses').update({
        branding: { ...initialData?.branding, ai_name: formData.ai_name },
        ai_rules: { bio: formData.bio, custom_rules: formData.custom_rules },
        operational_bounds: { 
          min_ticket: formData.min_ticket, 
          service_fee: formData.service_fee, 
          service_radii: formData.service_radii 
        },
        business_hours: formData.business_hours,
        has_trained_ai: true
      }).eq('id', businessId)

      if (bizError) throw bizError

      // 2. Save FAQs if any
      if (formData.faqs.length > 0) {
        const faqsToInsert = formData.faqs.map(f => ({
          business_id: businessId,
          q: f.q,
          a: f.a
        }))
        const { error: faqError } = await supabase.from('faqs').insert(faqsToInsert)
        if (faqError) throw faqError
      }

      onComplete()
    } catch (err) {
      console.error('Save error:', err)
      alert('Failed to save your Assistant setup. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const addFaq = () => {
    if (!newFaq.q || !newFaq.a) return
    setFormData(prev => ({
      ...prev,
      faqs: [...prev.faqs, { ...newFaq, id: Date.now() }]
    }))
    setNewFaq({ q: '', a: '' })
  }

  const removeFaq = (id) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.filter(f => f.id !== id)
    }))
  }

  const toggleDay = (day) => {
    setFormData(prev => ({
      ...prev,
      business_hours: {
        ...prev.business_hours,
        [day]: { ...prev.business_hours[day], closed: !prev.business_hours[day].closed }
      }
    }))
  }

  const updateTime = (day, type, value) => {
    setFormData(prev => ({
      ...prev,
      business_hours: {
        ...prev.business_hours,
        [day]: { ...prev.business_hours[day], [type]: value }
      }
    }))
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#060e20] flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-900/10 blur-[120px] rounded-full translate-y-1/2"></div>

      {/* Progress Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
        <motion.div 
          className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
      </div>

      <button onClick={onCancel} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors">
        <span className="material-symbols-outlined text-3xl">close</span>
      </button>

      <div className="w-full max-w-2xl relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="flex flex-col gap-8"
          >
            <div className="space-y-4">
              <span className="text-indigo-400 font-black text-xs uppercase tracking-[0.2em]">Step {currentStep + 1} of {steps.length}</span>
              <h2 className="text-4xl md:text-5xl font-headline font-black text-white tracking-tight leading-tight">{step.title}</h2>
              <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed max-w-xl">{step.description}</p>
            </div>

            <div className="mt-4">
              {step.type === 'input' && (
                <input 
                  type="text"
                  value={formData[step.field]}
                  onChange={(e) => setFormData({ ...formData, [step.field]: e.target.value })}
                  placeholder={step.placeholder}
                  className="w-full bg-transparent border-b-2 border-white/10 text-2xl md:text-3xl font-medium text-white py-4 outline-none focus:border-indigo-500 transition-all placeholder:text-slate-800"
                  autoFocus
                />
              )}

              {step.type === 'textarea' && (
                <textarea 
                  value={formData[step.field]}
                  onChange={(e) => setFormData({ ...formData, [step.field]: e.target.value })}
                  placeholder={step.placeholder}
                  className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-lg text-white min-h-[180px] outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700 resize-none font-medium"
                  autoFocus
                />
              )}

              {step.type === 'multi-input' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {step.fields.map(f => (
                    <div key={f.name} className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{f.label}</label>
                      <input 
                        type="text"
                        value={formData[f.name]}
                        onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
                        placeholder={f.placeholder}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xl text-white outline-none focus:border-indigo-500 transition-all"
                      />
                    </div>
                  ))}
                </div>
              )}

              {step.id === 'business_hours' && (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                  {Object.keys(formData.business_hours).map(day => (
                    <div key={day} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${formData.business_hours[day].closed ? 'bg-white/5 border-transparent opacity-50' : 'bg-indigo-500/5 border-indigo-500/20'}`}>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => toggleDay(day)}
                          className={`w-12 h-6 rounded-full relative transition-all ${formData.business_hours[day].closed ? 'bg-slate-700' : 'bg-indigo-500'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.business_hours[day].closed ? 'left-1' : 'left-7'}`} />
                        </button>
                        <span className="capitalize font-bold text-white w-24">{day}</span>
                      </div>
                      {!formData.business_hours[day].closed && (
                        <div className="flex items-center gap-2">
                          <input type="time" value={formData.business_hours[day].open} onChange={(e) => updateTime(day, 'open', e.target.value)} className="bg-black/40 border border-white/5 rounded-lg px-2 py-1 text-sm text-white outline-none focus:border-indigo-500" />
                          <span className="text-slate-600">to</span>
                          <input type="time" value={formData.business_hours[day].close} onChange={(e) => updateTime(day, 'close', e.target.value)} className="bg-black/40 border border-white/5 rounded-lg px-2 py-1 text-sm text-white outline-none focus:border-indigo-500" />
                        </div>
                      )}
                      {formData.business_hours[day].closed && <span className="text-xs font-black uppercase text-slate-500">Closed</span>}
                    </div>
                  ))}
                </div>
              )}

              {step.id === 'faqs' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    {formData.faqs.map(f => (
                      <div key={f.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 relative group">
                        <p className="text-white font-bold text-sm">Q: {f.q}</p>
                        <p className="text-slate-400 text-xs mt-1">A: {f.a}</p>
                        <button onClick={() => removeFaq(f.id)} className="absolute top-4 right-4 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-3xl space-y-4">
                    <input 
                      type="text" 
                      placeholder="Question (e.g. Do you offer free estimates?)" 
                      value={newFaq.q}
                      onChange={(e) => setNewFaq({ ...newFaq, q: e.target.value })}
                      className="w-full bg-black/20 border border-white/5 rounded-xl p-3 text-sm text-white outline-none focus:border-indigo-500" 
                    />
                    <textarea 
                      placeholder="Answer (e.g. Yes, we provide free on-site inspections...)" 
                      value={newFaq.a}
                      onChange={(e) => setNewFaq({ ...newFaq, a: e.target.value })}
                      className="w-full bg-black/20 border border-white/5 rounded-xl p-3 text-sm text-white outline-none focus:border-indigo-500 min-h-[80px] resize-none" 
                    />
                    <button onClick={addFaq} className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all">Add FAQ Entry</button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 mt-8">
              <button 
                onClick={handleNext}
                disabled={loading || (step.required && !formData[step.field])}
                className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-900/40 hover:bg-indigo-500 hover:scale-105 transition-all active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? 'Saving...' : currentStep === steps.length - 1 ? 'Finish & Launch' : 'Continue'}
              </button>
              {currentStep > 0 && currentStep < steps.length - 1 && (
                <button onClick={handleBack} className="text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors">Go Back</button>
              )}
              {!step.required && currentStep < steps.length - 1 && currentStep > 0 && (
                <button onClick={handleNext} className="text-slate-600 font-bold text-[10px] uppercase tracking-widest hover:text-indigo-400 transition-colors ml-auto">Skip Step</button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Footer */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {steps.map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 transition-all duration-500 rounded-full ${i === currentStep ? 'w-8 bg-indigo-500' : 'w-2 bg-white/10'}`}
          />
        ))}
      </div>
    </div>
  )
}
