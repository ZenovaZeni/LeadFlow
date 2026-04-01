import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createSampleLead } from '../lib/queries'
import '../styles/onboarding.css'

export default function Onboarding() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(() => {
    try {
      const saved = localStorage.getItem('onboarding_step')
      return saved ? parseInt(saved) : 1
    } catch (e) {
      return 1
    }
  })
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState(() => {
    const defaults = {
      fullName: '',
      businessName: '',
      email: '',
      phone: '',
      website: '',
      industry: '',
      servicesOffered: '',
      serviceArea: '',
      businessHours: '',
      preferredBooking: 'Link',
      bookingLink: '',
      qualQuestions: '',
      faq: '',
      assistantTone: 'Professional',
      assistantAvoid: '',
      additionalNotes: ''
    }
    try {
      const saved = localStorage.getItem('onboarding_data')
      return saved ? JSON.parse(saved) : defaults
    } catch (e) {
      return defaults
    }
  })

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem('onboarding_data', JSON.stringify(formData))
  }, [formData])

  useEffect(() => {
    localStorage.setItem('onboarding_step', step.toString())
  }, [step])

  const formatPhone = (value) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name === 'phone') {
      const formatted = formatPhone(value);
      if (value.length < formData.phone.length || formatted.length <= 14) {
        setFormData(prev => ({ ...prev, [name]: formatted }))
      }
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const nextStep = () => setStep(prev => prev + 1)
  const prevStep = () => setStep(prev => prev - 1)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const mappedData = {
        full_name: formData.fullName,
        business_name: formData.businessName,
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
        industry: formData.industry,
        services_offered: formData.servicesOffered,
        service_area: formData.serviceArea,
        business_hours: formData.businessHours,
        preferred_booking: formData.preferredBooking,
        booking_link: formData.bookingLink,
        qual_questions: formData.qualQuestions,
        faq: formData.faq,
        assistant_tone: formData.assistantTone,
        assistant_avoid: formData.assistantAvoid,
        additional_notes: formData.additionalNotes
      }

      const { error: submitError } = await supabase
        .from('onboarding_submissions')
        .insert([mappedData])

      if (submitError) throw submitError

      if (user) {
        const { error: bizError } = await supabase
          .from('businesses')
          .upsert({
            user_id: user.id,
            name: formData.businessName,
            phone: formData.phone,
            industry: formData.industry,
            service_area: formData.serviceArea,
            business_hours: formData.businessHours,
            missed_call_enabled: true
          })
        if (bizError) throw bizError
        
        // Fetch the business record to get ID for sample lead
        const { data: bizData } = await supabase.from('businesses').select('id').eq('user_id', user.id).single()
        if (bizData) {
          await createSampleLead(bizData.id)
        }
      }

      setIsSuccess(true)
      setSubmitting(false)
      // Cleanup
      localStorage.removeItem('onboarding_data')
      localStorage.removeItem('onboarding_step')

    } catch (err) {
      console.error('Submission failed:', err)
      setError(err.message || 'Failed to save onboarding. Please check your Supabase connection.')
      setSubmitting(false)
    }
  }

  const handleSkip = async () => {
    setSubmitting(true)
    const defaultName = 'My Business'
    try {
      if (user) {
        // 1. Check for existing
        const { data: existing } = await supabase.from('businesses').select('id').eq('user_id', user.id).single()
        if (!existing) {
          const { data: bizData, error: bizError } = await supabase
            .from('businesses')
            .upsert({
              user_id: user.id,
              name: defaultName,
              missed_call_enabled: true
            })
            .select()
            .single()
          if (bizError) throw bizError
          if (bizData) await createSampleLead(bizData.id)
        }
      }
      // Cleanup onboarding state
      localStorage.removeItem('onboarding_data')
      localStorage.removeItem('onboarding_step')
      navigate(user ? '/app' : '/demo/dashboard')
    } catch (err) {
      console.error('Skip failed:', err)
      navigate('/app') // Proceed anyway
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="onboarding-page loading">
        <div className="loading-spinner" />
        <p>Finalizing your setup...</p>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="onboarding-page success">
        <div className="container container-sm text-center" style={{ padding: 'var(--space-20) 0', position: 'relative', zIndex: 10 }}>
          <div className="success-icon">
            <span className="material-symbols-outlined text-emerald-400 text-4xl">check_circle</span>
          </div>
          <h2 className="font-headline text-3xl font-extrabold mb-4 text-[#dee5ff]">Onboarding Complete!</h2>
          <p className="text-[#a3aac4] text-lg mb-12 max-w-md mx-auto leading-relaxed">
            Your business profile is secured. We're now training your Assistant with your specific business logic.
          </p>
          {user ? (
            <button className="bg-white text-[#060e20] px-10 py-5 rounded-2xl font-black text-lg hover:bg-indigo-500 hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-2xl" onClick={() => navigate('/app')}>
              Enter Dashboard
            </button>
          ) : (
            <div className="guest-success">
              <p className="text-sm text-[#6d758c] mb-6">Create an account to access your platform and start capturing leads.</p>
              <button className="bg-indigo-500 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-500/20" onClick={() => navigate('/login?redirect=/app')}>
                Create Account / Sign In
              </button>
            </div>
          )}
        </div>
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="onboarding-page">
      <div className="container container-sm">
        <div className="onboarding-header text-center">
          <span className="badge badge-accent">Onboarding</span>
          <h2>Let's Get Your Assistant Ready</h2>
          <p className="section-subtitle">Tell us about your business so we can train your Assistant perfectly.</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            ⚠️ {error}
          </div>
        )}

        {/* Stepper */}
        <div className="stepper">
          <div className={`step-item ${step >= 1 ? 'active' : ''}`}>1. Basics</div>
          <div className="step-divider" />
          <div className={`step-item ${step >= 2 ? 'active' : ''}`}>2. Scope</div>
          <div className="step-divider" />
          <div className={`step-item ${step >= 3 ? 'active' : ''}`}>3. Assistant Setup</div>
        </div>

        <form className="onboarding-form card elevated" onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="form-step"
              >
                <h3>Basic Information</h3>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="input" placeholder="Josh Douglas" required />
                </div>
                <div className="form-group">
                  <label>Business Name</label>
                  <input type="text" name="businessName" value={formData.businessName} onChange={handleInputChange} className="input" placeholder="Zenova AI Systems" required />
                </div>
                <div className="form-group-row">
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="input" placeholder="you@domain.com" required />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="input" placeholder="(555) 555-5555" required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Website</label>
                  <input type="url" name="website" value={formData.website} onChange={handleInputChange} className="input" placeholder="https://joshdouglas.co" />
                </div>

                <div className="form-actions" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', alignItems: 'center', marginTop: 'var(--space-8)' }}>
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    style={{ width: '100%' }}
                    onClick={nextStep}
                    disabled={formData.phone.replace(/\D/g, '').length < 10}
                    title={formData.phone.replace(/\D/g, '').length < 10 ? "Please enter a valid 10-digit number" : ""}
                  >
                    Next Step
                  </button>
                  <button 
                    type="button" 
                    className="text-link" 
                    style={{ background: 'none', border: 'none', color: '#6d758c', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', transition: 'color 0.2s' }}
                    onClick={handleSkip}
                    disabled={submitting}
                  >
                    {submitting ? 'Preparing Dashboard...' : 'Skip for now & setup later in settings'}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="form-step"
              >
                <h3>Business Scope</h3>
                <div className="form-group">
                  <label>Industry / Business Type</label>
                  <input type="text" name="industry" value={formData.industry} onChange={handleInputChange} className="input" placeholder="Plumbing, Tree Service, Cleaning..." />
                </div>
                <div className="form-group">
                  <label>Services Offered</label>
                  <textarea name="servicesOffered" value={formData.servicesOffered} onChange={handleInputChange} className="input" placeholder="E.g., Stump grinding, tree removal, emergency calls..." rows={3} />
                </div>
                <div className="form-group">
                  <label>Service Area / Cities Covered</label>
                  <input type="text" name="serviceArea" value={formData.serviceArea} onChange={handleInputChange} className="input" placeholder="Austin, Round Rock, Pflugerville..." />
                  <div className="quick-chips" style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                    {['Palm Bay', 'Melbourne', 'Orlando', 'Rockledge'].map(c => (
                      <button key={c} type="button" className="chip" onClick={() => {
                        const current = formData.serviceArea;
                        const updated = current ? (current.includes(c) ? current : `${current}, ${c}`) : c;
                        setFormData(p => ({...p, serviceArea: updated}))
                      }}>
                        + {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Business Hours</label>
                  <input type="text" name="businessHours" value={formData.businessHours} onChange={handleInputChange} className="input" placeholder="Mon-Fri 8am - 5pm, 24/7 Emergencies" />
                  <div className="quick-chips" style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                    {['Mon-Fri 9-5', '24/7 Availability', 'Mon-Sat 8-6', 'Weekends Only'].map(h => (
                      <button key={h} type="button" className="chip" onClick={() => setFormData(p => ({...p, businessHours: h}))}>
                        {h}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>How do you book appointments?</label>
                  <div className="radio-group" style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="radio" name="preferredBooking" value="Link" checked={formData.preferredBooking === 'Link'} onChange={handleInputChange} /> Booking Link (Calendly)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="radio" name="preferredBooking" value="Manual" checked={formData.preferredBooking === 'Manual'} onChange={handleInputChange} /> Manual Callback
                    </label>
                  </div>
                </div>

                {formData.preferredBooking === 'Link' && (
                  <div className="form-group">
                    <label>Booking Link</label>
                    <input type="url" name="bookingLink" value={formData.bookingLink} onChange={handleInputChange} className="input" placeholder="https://calendly.com/yourlink" />
                  </div>
                )}

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={prevStep}>Back</button>
                  <button type="button" className="btn btn-primary" onClick={nextStep}>Next Step</button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="form-step"
              >
                <h3>Assistant Setup</h3>
                <div className="form-group">
                  <label>Lead Qualification Questions (3-5 items)</label>
                  <textarea name="qualQuestions" value={formData.qualQuestions} onChange={handleInputChange} className="input" placeholder="1. What kind of tree? \n2. Address? \n3. Is it touching power lines?" rows={4} />
                </div>
                <div className="form-group">
                  <label>Frequently Asked questions & Answers</label>
                  <textarea name="faq" value={formData.faq} onChange={handleInputChange} className="input" placeholder="Q: Do you offer free inspections? \nA: Yes, always." rows={4} />
                </div>
                <div className="form-group">
                  <label>Assistant Tone</label>
                  <select name="assistantTone" value={formData.assistantTone} onChange={handleInputChange} className="input">
                    <option value="Professional">Professional (Safe & Polite)</option>
                    <option value="Friendly">Friendly & Casual</option>
                    <option value="Direct">Direct & Concise (Saves time)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Things the assistant should AVOID saying</label>
                  <input type="text" name="assistantAvoid" value={formData.assistantAvoid} onChange={handleInputChange} className="input" placeholder="Don't give pricing over text, don't promise same-day service..." />
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={prevStep}>Back</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Complete Onboarding'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  )
}