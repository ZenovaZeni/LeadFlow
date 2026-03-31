import { useState, useEffect, useRef } from 'react'
import '../styles/demo.css'
import { DEMO_SMS_FLOW, OWNER_NOTIFICATION } from '../data/mock'
import { TreePine, Wrench, Sparkles, Home, Landmark, Bell, Lightbulb, Sun, Moon } from 'lucide-react'

export default function DemoFlow({ onBack, onViewDashboard, businessName: propBusinessName }) {
  const searchParams = new URLSearchParams(window.location.search)
  const urlBiz = searchParams.get('biz')
  const businessName = urlBiz || propBusinessName || 'Your Business'

  // Steps: 'form' | 'sms' | 'notify' | 'complete'
  const [step, setStep] = useState('form')
  const [formData, setFormData] = useState({ name: '', phone: '', service: '' })
  const [selectedIndustry, setSelectedIndustry] = useState(searchParams.get('industry') || 'tree') 

  const bizInitial = businessName ? businessName.charAt(0).toUpperCase() : 'L'

  const handleBack = () => {
    if (step === 'sms') setStep('form')
    else if (step === 'notify') setStep('sms')
    else if (step === 'complete') setStep('notify')
    else onBack()
  }

  return (
    <div className="demo-page">
      <div className="demo-nav">
        <button className="btn btn-secondary" onClick={handleBack} style={{ flexShrink: 0 }}>← Back</button>
        
        <div className="industry-switcher" style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '6px', 
          background: 'var(--color-bg-secondary)', 
          padding: '8px 10px', 
          borderRadius: '16px', 
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', paddingLeft: '8px', paddingRight: '4px', whiteSpace: 'nowrap', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}><Lightbulb size={14} /> Scenario:</span>
          <button className={`btn btn-sm ${selectedIndustry === 'tree' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setSelectedIndustry('tree')} style={{ borderRadius: '15px', padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}><TreePine size={16} /> Tree</button>
          <button className={`btn btn-sm ${selectedIndustry === 'plumbing' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setSelectedIndustry('plumbing')} style={{ borderRadius: '15px', padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}><Wrench size={16} /> Plumbing</button>
          <button className={`btn btn-sm ${selectedIndustry === 'cleaning' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setSelectedIndustry('cleaning')} style={{ borderRadius: '15px', padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}><Sparkles size={16} /> Cleaning</button>
          <button className={`btn btn-sm ${selectedIndustry === 'realestate' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setSelectedIndustry('realestate')} style={{ borderRadius: '15px', padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}><Home size={16} /> Real Estate</button>
          <button className={`btn btn-sm ${selectedIndustry === 'mortgage' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setSelectedIndustry('mortgage')} style={{ borderRadius: '15px', padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}><Landmark size={16} /> Mortgage</button>
        </div>

        <div className="demo-progress" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', margin: '15px 0', gap: '0' }}>
          <div className={`demo-dot ${step === 'form' ? 'active' : ''} ${['sms','notify','complete'].includes(step) ? 'done' : ''}`}>1</div>
          <div className={`demo-line ${['sms','notify','complete'].includes(step) ? 'done' : ''}`} />
          <div className={`demo-dot ${step === 'sms' ? 'active' : ''} ${['notify','complete'].includes(step) ? 'done' : ''}`}>2</div>
          <div className={`demo-line ${['notify','complete'].includes(step) ? 'done' : ''}`} />
          <div className={`demo-dot ${step === 'notify' ? 'active' : ''} ${step === 'complete' ? 'done' : ''}`}>3</div>
          <div className={`demo-line ${step === 'complete' ? 'done' : ''}`} />
          <div className={`demo-dot ${step === 'complete' ? 'active' : ''}`}>4</div>
        </div>
        
        <div className="demo-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 40 }} className="desktop-only" />
        </div>
      </div>

      <div className="demo-stage">
        {step === 'form' && (
          <CustomerForm formData={formData} setFormData={setFormData} onSubmit={() => setStep('sms')} businessName={businessName} selectedIndustry={selectedIndustry} />
        )}
        {step === 'sms' && (
          <SmsView formData={formData} onComplete={() => setStep('notify')} businessName={businessName} selectedIndustry={selectedIndustry} />
        )}
        {step === 'notify' && (
          <OwnerNotify formData={formData} onContinue={() => setStep('complete')} selectedIndustry={selectedIndustry} />
        )}
        {step === 'complete' && (
          <DemoComplete onViewDashboard={onViewDashboard} onRestart={() => { setStep('form'); setFormData({ name: '', phone: '', service: '' }) }} />
        )}
      </div>
    </div>
  )
}

/* ---- Realistic Phone Frame ---- */
function PhoneFrame({ children, statusBarTitle, icon = <TreePine size={16} /> }) {
  const now = new Date()
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  return (
    <div className="phone-frame">
      <div className="phone-bezel">
        {/* Dynamic Island / Notch */}
        <div className="phone-island" />
        {/* Status Bar */}
        <div className="phone-status-bar">
          <span className="phone-time">{timeStr}</span>
          <div className="phone-status-icons">
            <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor" aria-hidden="true">
              <rect x="0" y="7" width="3" height="5" rx="0.5" opacity="0.3"/>
              <rect x="4" y="5" width="3" height="7" rx="0.5" opacity="0.5"/>
              <rect x="8" y="3" width="3" height="9" rx="0.5" opacity="0.7"/>
              <rect x="12" y="0" width="3" height="12" rx="0.5"/>
            </svg>
            <svg width="15" height="11" viewBox="0 0 15 11" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
              <path d="M1 8.5C3.5 4 11.5 4 14 8.5"/>
              <path d="M3.5 7C5 4.5 10 4.5 11.5 7"/>
              <circle cx="7.5" cy="9" r="1.2" fill="currentColor" stroke="none"/>
            </svg>
            <div className="phone-battery">
              <div className="phone-battery-body"><div className="phone-battery-fill" /></div>
              <div className="phone-battery-cap" />
            </div>
          </div>
        </div>
        {/* App Header */}
        {statusBarTitle && (
          <div className="phone-app-header">
            <div className="phone-app-avatar">
              <span>{icon}</span>
            </div>
            <div className="phone-app-info">
              <span className="phone-app-name">{statusBarTitle}</span>
              <span className="phone-app-status">Online</span>
            </div>
          </div>
        )}
        {/* Content Area */}
        <div className="phone-screen">
          {children}
        </div>
        {/* Home Indicator */}
        <div className="phone-home-bar" />
      </div>
    </div>
  )
}

/* ---- Customer Form ---- */
function CustomerForm({ formData, setFormData, onSubmit, businessName, selectedIndustry }) {
  const bizInitial = businessName ? businessName.charAt(0).toUpperCase() : 'L'
  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit()
  }

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    let formatted = digits;
    if (digits.length > 6) {
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length > 3) {
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}`;
    } else if (digits.length > 0) {
      formatted = `(${digits}`;
    }
    setFormData({...formData, phone: formatted});
  };

  const defaults = {
    tree: { logo: <TreePine size={24} />, placeholder: 'Tree is leaning on our fence after the storm...', bizName: "John's Tree Service" },
    plumbing: { logo: <Wrench size={24} />, placeholder: 'Water backing up in the shower drain...', bizName: "Apex Plumbing" },
    cleaning: { logo: <Sparkles size={24} />, placeholder: 'Deep clean needed for 3-bedroom house...', bizName: "Sparkle Cleaning Co." },
    realestate: { logo: <Home size={24} />, placeholder: 'Looking to tour the Oak Street listing...', bizName: "Prime Real Estate" },
    mortgage: { logo: <Landmark size={24} />, placeholder: 'Wanting to pre-qualify for a home loan...', bizName: "First Choice Mortgage" }
  }[selectedIndustry] || { logo: <TreePine size={24} />, placeholder: 'Tree is leaning on our fence...', bizName: "John's Tree Service" }

  const displayName = (!businessName || businessName === 'Your Business') ? defaults.bizName : businessName

  const industryHighlights = {
    tree: ['Emergency Tree Removal', 'Licensed & Insured', 'Free On-Site Quotes'],
    plumbing: ['24/7 Burst Pipe Repair', 'No Hidden Fees', 'Local Master Plumbers'],
    cleaning: ['Satisfaction Guaranteed', 'Eco-Friendly Products', 'Background-Checked Staff'],
    realestate: ['Exclusive Pre-Market Listings', 'Local Neighborhood Experts', 'Free Home Valuation'],
    mortgage: ['Lock In Low Rates', 'Fast 10-Day Pre-approvals', 'No-Obligation Consultation']
  }[selectedIndustry] || ['Professional Service', 'Licensed & Insured', 'Free Quotes']

  return (
    <div className="demo-card glass-card animate-fade-in-up" style={{ maxWidth: '1000px', width: '95%', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="demo-label">Step 1: Customer View</div>
      <div className="cf-split-container">
        {/* Left Side: The Pitch / Social Proof */}
        <div className="cf-left-pitch">
          <div className="pitch-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--space-3)' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-accent) 0%, rgba(139, 92, 246, 0.8) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1.2rem', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)' }}>
                {bizInitial}
              </div>
              <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '12px', height: '12px', background: '#10b981', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.9)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-text-primary)', fontWeight: 700 }}>{displayName}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <span style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%' }} />
                <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>Available Now ⚡ Response time: <span style={{ color: 'var(--color-text-primary)' }}>~1 min</span></span>
              </div>
            </div>
          </div>
          <div className="pitch-content">
            <div className="rating-badge">
              <span className="stars">⭐⭐⭐⭐⭐</span>
              <span className="rating-text">4.9/5 (120+ Reviews)</span>
            </div>
            <h1 className="pitch-headline" style={{ color: 'var(--color-text-primary)', fontWeight: 800, fontSize: '2.2rem', margin: 'var(--space-2) 0', background: 'linear-gradient(135deg, var(--color-text-primary) 0%, rgba(200,220,255,0.8) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Ready To Get Started?</h1>
            <p className="pitch-subhead">We respond to all requests within 5 minutes. Guaranteed.</p>
            
            <ul className="pitch-bullets">
              {industryHighlights.map((highlight, index) => (
                <li key={index}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  {highlight}
                </li>
              ))}
            </ul>

            <div className="pitch-footer">
              <div className="guarantee-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div>
                <span className="guarantee-title">Instant Response Guarantee</span>
                <span className="guarantee-desc">Always connected with a live helper.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: The Capture Form */}
        <div className="cf-right-form">
          <div className="cf-body">
            <h3>Get a Free Estimate</h3>
            <p className="cf-sub">Fill out the form below and we'll get back to you right away.</p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Your Name</label>
                <input className="input" placeholder="Marcus Rivera" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required autoFocus />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="tel"
                  className="input" 
                  placeholder="(813) 555-0142" 
                  value={formData.phone} 
                  onChange={handlePhoneChange} 
                  required
                />
              </div>
              {['mortgage'].includes(selectedIndustry) ? (
                <>
                  <div className="form-group">
                    <label>Desired Loan Amount</label>
                    <input className="input" type="text" placeholder="$350,000" />
                  </div>
                  <div className="form-group">
                    <label>Estimated Credit Score</label>
                    <select className="input" style={{ fontSize: '0.85rem' }}>
                      <option>740+ (Excellent)</option>
                      <option>680-739 (Good)</option>
                      <option>620-679 (Fair)</option>
                      <option>Below 620</option>
                    </select>
                  </div>
                </>
              ) : ['realestate'].includes(selectedIndustry) ? (
                <>
                  <div className="form-group">
                    <label>Are you looking to Buy or Sell?</label>
                    <select className="input" style={{ fontSize: '0.85rem' }}>
                      <option>Buy a House</option>
                      <option>Sell my House</option>
                      <option>Just browsing / Commercial</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Target Address / Neighborhood</label>
                    <input className="input" placeholder="123 Oak St or Downtown..." />
                  </div>
                </>
              ) : (
                <div className="form-group">
                  <label>What do you need help with?</label>
                  <textarea className="input" rows={3} placeholder={defaults.placeholder} value={formData.service} onChange={e => setFormData({...formData, service: e.target.value})} required />
                </div>
              )}
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100% ' }}>
                Submit Request
              </button>
              <p className="cf-privacy">We'll text you within seconds to confirm.</p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---- SMS View ---- */
function SmsView({ formData, onComplete, businessName, selectedIndustry }) {
  const [messages, setMessages] = useState([])
  const chatRef = useRef(null)
  const leadName = formData.name || 'Marcus'

  const industryData = {
    tree: { logo: <TreePine size={16} />, service: 'Tree Removal', text: 'tree is leaning on our fence', bizName: "John's Tree Service" },
    plumbing: { logo: <Wrench size={16} />, service: 'Drain Cleaning', text: 'water backing up in the shower', bizName: "Apex Plumbing" },
    cleaning: { logo: <Sparkles size={16} />, service: 'Deep Clean', text: 'deep clean needed for 3 bedrooms', bizName: "Sparkle Cleaning Co." },
    realestate: { logo: <Home size={16} />, service: 'Home Tour', text: 'interested in touring Oak St', bizName: "Prime Real Estate" },
    mortgage: { logo: <Landmark size={16} />, service: 'Pre-Approval', text: 'looking to qualify for a loan', bizName: "First Choice Mortgage" }
  }[selectedIndustry] || { logo: <TreePine size={16} />, service: 'Tree Removal', text: 'tree is leaning on our fence', bizName: "John's Tree Service" }

  const displayName = (!businessName || businessName === 'Your Business') ? industryData.bizName : businessName

  useEffect(() => {
    const timers = []
    DEMO_SMS_FLOW.forEach((msg, i) => {
      const t = setTimeout(() => {
        setMessages(prev => [...prev, { 
          ...msg, 
          text: msg.text
            .replace('Marcus', leadName.split(' ')[0])
            .replace("John's Tree Service", displayName)
            .replace('tree is leaning on our fence after the storm', industryData.text)
            .replace('Emergency Tree Removal', industryData.service)
        }])
      }, msg.delay)
      timers.push(t)
    })
    const doneTimer = setTimeout(() => onComplete(), DEMO_SMS_FLOW[DEMO_SMS_FLOW.length - 1].delay + 3500)
    timers.push(doneTimer)
    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages])

  return (
    <div className="animate-fade-in-up">
      <div className="demo-label">Step 2: SMS Conversation</div>
      <PhoneFrame statusBarTitle={displayName} icon={industryData.logo}>
        <div className="sms-chat" ref={chatRef}>
          {messages.map((m, i) => (
            <div key={i} className={`sms-bubble ${m.role} animate-fade-in-up`}>
              {m.text}
            </div>
          ))}
          {messages.length < DEMO_SMS_FLOW.length && (
            <div className="sms-typing">
              <span /><span /><span />
            </div>
          )}
        </div>
      </PhoneFrame>
    </div>
  )
}

/* ---- Owner Notification ---- */
function OwnerNotify({ formData, onContinue, selectedIndustry }) {
  const name = formData.name || OWNER_NOTIFICATION.leadName

  const industryNotify = {
    tree: { service: 'Emergency Tree Removal', urgency: 'ASAP — tree leaning on fence', summary: 'Large oak leaning over backyard fence after last storm.' },
    plumbing: { service: 'Emergency Drain Cleaning', urgency: 'Urgent — spreading water', summary: 'Severe backup in shower, urgent support requested.' },
    cleaning: { service: 'Deep House Cleaning', urgency: 'By Friday — move-in due', summary: 'Requires a deep clean before tenant move-in Friday.' },
    realestate: { service: 'Home Tour Request', urgency: 'This Weekend', summary: 'Wants to tour the 4br Listing on Oak Street Saturday morning.' },
    mortgage: { service: 'Mortgage Pre-Approval', urgency: 'Urgent — Rate Lock', summary: 'Checking rates for a 30yr fixed, wants to pre-qualify today.' }
  }[selectedIndustry] || OWNER_NOTIFICATION

  return (
    <div className="animate-fade-in-up">
      <div className="demo-label">Step 3: Owner Gets Notified</div>
      <PhoneFrame>
        <div className="notify-content">
          <div className="notify-header-card">
            <span className="notify-bell" style={{ background: 'var(--color-warning)', color: '#000', borderRadius: '50%', padding: '6px', display: 'flex' }}><Bell size={20} /></span>
            <div>
              <div className="notify-alert-title">New Lead Alert</div>
              <div className="notify-alert-sub">Just now</div>
            </div>
          </div>
          <div className="notify-body-inner">
            <h4>New lead from {name}</h4>
            <div className="notify-detail"><strong>Service:</strong> {formData.service || industryNotify.service}</div>
            <div className="notify-detail"><strong>Address:</strong> {OWNER_NOTIFICATION.address}</div>
            <div className="notify-detail"><strong>Urgency:</strong> {industryNotify.urgency || OWNER_NOTIFICATION.urgency}</div>
            <div className="notify-detail"><strong>Phone:</strong> {formData.phone || OWNER_NOTIFICATION.phone}</div>
            <div className="notify-summary">
              <p><strong>Summary:</strong> {industryNotify.summary}</p>
            </div>
          </div>
        </div>
      </PhoneFrame>
      <button className="btn btn-primary btn-lg glow-button" onClick={onContinue} style={{ width: '100%', maxWidth: 340, display: 'block', margin: 'var(--space-6) auto 0' }}>
        View Dashboard →
      </button>
    </div>
  )
}

/* ---- Demo Complete ---- */
function DemoComplete({ onViewDashboard, onRestart }) {
  return (
    <div className="demo-card glass-card animate-fade-in-up text-center">
      <div className="demo-complete-icon">✅</div>
      <h2>That's the Full Flow</h2>
      <p className="demo-complete-text">
        From form submission to SMS follow-up to owner notification — all in under 60 seconds. 
        Every lead is saved to a clean, organized dashboard.
      </p>
      <div className="demo-complete-actions">
        <button className="btn btn-primary btn-lg glow-button" onClick={onViewDashboard}>
          Explore the Dashboard
        </button>
        <button className="btn btn-secondary btn-lg" onClick={onRestart}>
          Try Again
        </button>
      </div>
    </div>
  )
}
