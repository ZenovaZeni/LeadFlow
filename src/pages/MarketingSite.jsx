import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function MarketingSite({ onTryDemo, onGetStarted, onViewDashboard, onViewDemoDashboard }) {
  const navigate = useNavigate()
  return (
    <div className="selection:bg-primary selection:text-on-primary bg-[#060e20] text-[#dee5ff] font-body min-h-screen">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-[#060e20]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-indigo-500 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>bubble_chart</span>
            <span className="text-2xl font-black bg-gradient-to-r from-[#818cf8] to-[#4F46E5] bg-clip-text text-transparent font-headline tracking-tight">LeadFlow</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a className="text-indigo-500 font-semibold font-headline" href="#">Product</a>
            <a className="text-slate-400 hover:text-indigo-400 transition-colors font-headline" href="#calculator">Savings</a>
            <a className="text-slate-400 hover:text-indigo-400 transition-colors font-headline" href="#proof">Proof</a>
            <a className="text-slate-400 hover:text-indigo-400 transition-colors font-headline" href="#pricing">Pricing</a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="hidden md:block text-slate-400 hover:text-indigo-400 transition-colors font-medium" onClick={onViewDashboard}>Log In</button>
            <button 
              className="bg-[#4F46E5] px-6 py-2.5 rounded-full text-white font-bold text-sm shadow-xl shadow-indigo-900/40 hover:scale-105 transition-transform animate-glow"
              onClick={onGetStarted}
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative px-6 py-20 max-w-7xl mx-auto overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#192540] border border-white/5 mb-6">
                <span className="w-2 h-2 rounded-full bg-[#4F46E5] animate-pulse"></span>
                <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold">Kinetic Mode Active</span>
              </div>
              <h1 className="font-headline text-5xl lg:text-7xl font-extrabold leading-tight mb-6">
                Stop missing leads <span className="text-gradient">when you're busy.</span>
              </h1>
              <p className="text-lg text-[#a3aac4] max-w-xl mb-10 leading-relaxed">
                The elite Assistant that captures, qualifies, and schedules every inbound lead while you're on the job. Turn missed calls into booked revenue effortlessly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  className="bg-gradient-to-r from-[#6366f1] to-[#4F46E5] px-8 py-4 rounded-xl text-white font-extrabold flex items-center justify-center gap-2 group transition-all duration-300 active:scale-95 shadow-lg shadow-indigo-600/20 animate-glow"
                  onClick={onTryDemo}
                >
                  See How It Works
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
                <button 
                  className="px-8 py-4 rounded-xl border border-white/10 font-bold hover:bg-white/5 transition-colors"
                  onClick={() => navigate('/login?mode=signup')}
                >
                  Create Account
                </button>
              </div>
            </div>
            <div className="relative animate-float">
              {/* Dashboard Mockup */}
              <div className="glass-card rounded-3xl p-4 shadow-2xl relative z-10 transform lg:rotate-2 hover:rotate-0 transition-transform duration-700">
                <img 
                  className="rounded-2xl w-full h-auto opacity-90 shadow-2xl" 
                  alt="LeadFlow Dashboard Preview" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtDdX57LsfFbUiNFWK1UO9-n9VuGApRpvf63MkxAR3V5515i1YzUPEZW7iDHih4jvQgGTwLwT5j4BZgXE6DJLs0rBWoZ1xXsN8TZEXvJWCSjh5Ie14EiIG9mOs5g47UY72olpvx5Yp7dQqEUg8zmn83QJQ2Rli1OdQSiYyGmRFPUFQlMpZCsaSgU5MISp6F72tEMf9-4J6k9jfDyyWSE3wLmJPFFoSEvSN0lePo-df1sIH22GywXuugwkbkvTAQgb7RmHtjMeCWd-g" 
                />
                {/* Floating Notification Bubbles */}
                <div className="absolute -top-6 -left-6 bg-[#0f1930] p-4 rounded-2xl shadow-2xl border border-indigo-500/20 flex items-center gap-4 animate-bounce hidden md:flex">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <span className="material-symbols-outlined">person_add</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#a3aac4] uppercase font-bold tracking-tighter">New Qualified Lead</p>
                    <p className="font-headline font-bold text-white text-sm">Marcus J. (HVAC Repair)</p>
                  </div>
                </div>
                <div className="absolute -bottom-10 -right-6 bg-[#192540] p-4 rounded-2xl shadow-2xl border border-indigo-500/20 flex items-center gap-4 hidden md:flex">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <span className="material-symbols-outlined">calendar_today</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#a3aac4] uppercase font-bold tracking-tighter">Automated Booking</p>
                    <p className="font-headline font-bold text-white text-sm">Tomorrow at 2:00 PM</p>
                  </div>
                </div>
              </div>
              {/* Ambient Background Glow */}
              <div className="absolute -top-20 -right-20 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full"></div>
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500/10 blur-[100px] rounded-full"></div>
            </div>
          </div>
        </section>

        {/* Interactive Revenue Calculator */}
        <section id="calculator" className="luxury-gap px-6 py-24 bg-[#091328]/50">
          <CalculatorContent onTryDemo={onTryDemo} onGetStarted={onGetStarted} />
        </section>

        {/* Social Proof / Trusted By */}
        <section className="py-12 border-y border-white/5 opacity-50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-[10px] uppercase tracking-[0.3em] font-bold mb-8 text-indigo-400">Trusted by over 450+ Local Service Professionals</p>
            <div className="flex flex-wrap justify-center gap-12 md:gap-24 items-center">
              {['ACME HVAC', 'ELITE PLUMBING', 'APEX ROOFING', 'ZENITH SOLAR', 'PRO PAINTING'].map((logo, i) => (
                <span key={i} className="font-headline font-black text-xl text-slate-500 whitespace-nowrap">{logo}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Problem Section (Restored for Tests) */}
        <section id="problem" className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="font-headline text-4xl font-bold mb-4">The Cost of Silence</h2>
            <p className="text-[#a3aac4] max-w-2xl mx-auto">Missed calls are missed opportunities. See where you're losing revenue.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Missed Calls", desc: "62% of customers won't call back if you don't answer.", icon: "phone_missed" },
              { title: "Slow Response", desc: "Leads go cold in under 5 minutes. You're busy on site.", icon: "timer" },
              { title: "Manual Entry", desc: "Losing lead details in sticky notes and texts.", icon: "edit_note" },
              { title: "No Follow-up", desc: "80% of sales require 5 follow-ups. Most businesses do zero.", icon: "sync_problem" }
            ].map((p, i) => (
              <div key={i} className="pain-card bg-[#0f1930] p-8 rounded-3xl border border-white/5 hover:border-indigo-500/30 transition-all">
                <span className="material-symbols-outlined text-indigo-400 mb-4">{p.icon}</span>
                <h3 className="font-headline font-bold mb-2">{p.title}</h3>
                <p className="text-sm text-[#a3aac4]">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* AI Chat Simulator & Visual Proof */}
        <section id="proof" className="max-w-7xl mx-auto px-6 py-24 overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="absolute -inset-10 bg-indigo-500/10 blur-[100px] rounded-full"></div>
              <ChatSimulator />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="font-headline text-4xl lg:text-5xl font-extrabold mb-8 leading-tight">
                Conversations that <br /><span className="text-[#4F46E5]">Close Themselves.</span>
              </h2>
              <p className="text-[#a3aac4] text-lg leading-relaxed mb-12">
                Our Assistant doesn't just "chat"—it calculates, qualifies, and converts. It handles complex scheduling logic and handles follow-ups across SMS and Email automatically.
              </p>
              <div className="grid sm:grid-cols-2 gap-8">
                {[
                  { title: "Instant SMS Response", desc: "The Assistant texts back within 15 seconds.", icon: "bolt" },
                  { title: "Deep Qualification", desc: "Filters 'tire kickers' automatically.", icon: "verified" },
                  { title: "Direct Calendar Sync", desc: "Integrates with Google & Jobber.", icon: "calendar_today" },
                  { title: "Lead Recovery", desc: "Auto-follow up on abandoned leads.", icon: "sync_problem" },
                  { title: "Live Intelligence", desc: "Summaries sent to your phone instantly.", icon: "psychology" },
                  { title: "Always Active", desc: "24/7 coverage, even on holidays.", icon: "nights_stay" }
                ].map((s, i) => (
                  <div key={i} className="solution-card flex items-start gap-4">
                    <div className="mt-1 w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      <span className="material-symbols-outlined text-sm">{s.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-headline font-bold text-sm">{s.title}</h4>
                      <p className="text-xs text-[#a3aac4]">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 bg-[#091328]/30 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16 underline-decoration">
              <h2 className="font-headline text-4xl font-bold mb-4">Success Stories</h2>
              <p className="text-[#a3aac4] max-w-2xl mx-auto">See how LeadFlow is transforming local businesses across the country.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { name: "Jim Carter", role: "Owner, Carter HVAC", text: "LeadFlow booked 4 jobs while I was on a roof today. It literally paid for itself in 3 hours.", rating: 5 },
                { name: "Sarah Miller", role: "Miller Plumbing", text: "I used to lose leads because I couldn't text back fast enough. Now 100% of leads get an instant reply.", rating: 5 },
                { name: "Dave Evans", role: "Apex Roofing", text: "The calendar sync is a game changer. My crews are booked 2 weeks out without me touching a phone.", rating: 5 }
              ].map((t, i) => (
                <div key={i} className="bg-[#0f1930] p-8 rounded-[2rem] border border-white/5 relative group hover:border-indigo-500/30 transition-all duration-300">
                  <div className="flex gap-1 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-amber-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    ))}
                  </div>
                  <p className="text-[#a3aac4] italic mb-6">"{t.text}"</p>
                  <div>
                    <p className="font-headline font-bold text-white mb-1">{t.name}</p>
                    <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works (Restored) */}
        <section className="bg-[#091328]/30 py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="font-headline text-4xl font-bold mb-4">6 Steps to Automation</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                "Connect Your Phone", "Customize Your Assistant", "Set Your Hours", 
                "Live Qualification", "Automated Booking", "Close More Jobs"
              ].map((step, i) => (
                <div key={i} className="automation-step bg-[#0f1930]/50 p-8 rounded-3xl border border-white/5">
                  <span className="text-4xl font-black text-indigo-500/20 mb-4 block">{i + 1}</span>
                  <h3 className="font-headline font-bold mb-2">{step}</h3>
                  <p className="text-sm text-[#a3aac4]">Optimized kinetic flow for maximum conversion and speed.</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Live Demo Showcase CTA */}
        <section className="py-24 relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-6 text-center z-10 relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold">Interactive Experience</span>
            </div>
            <h2 className="font-headline text-4xl lg:text-5xl font-extrabold mb-8 leading-tight">
              Don't just take our word for it. <br /><span className="text-gradient">Experience the Kinetic Engine.</span>
            </h2>
            <p className="text-[#a3aac4] text-lg mb-12 max-w-2xl mx-auto">
              Click below to launch an interactive demo. You'll see exactly how the Assistant qualifies leads and books them into your schedule in real-time.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <button 
                className="bg-white text-[#060e20] px-10 py-5 rounded-2xl font-black text-lg hover:bg-indigo-500 hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-2xl shadow-white/5"
                onClick={onTryDemo}
              >
                Launch Live Demo
              </button>
              <button 
                className="px-10 py-5 rounded-2xl border border-white/10 font-bold hover:bg-white/5 transition-colors"
                onClick={onViewDemoDashboard}
              >
                View Dashboard Preview
              </button>
            </div>
          </div>
          {/* Background decoration */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-600/10 blur-[120px] rounded-full -z-0"></div>
        </section>

        {/* Features Highlights */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Smart Qualification", desc: "The Assistant vets every lead by budget, location, and job type before you ever see them.", icon: "verified_user" },
              { title: "Instant Capture", desc: "Never lose a lead to 'first call wins' again. Responses are immediate 24/7.", icon: "speed" },
              { title: "Seamless Scheduling", desc: "Automatic booking directly into your calendar. No more phone tag.", icon: "event_available" },
              { title: "Cross-Channel Sync", desc: "SMS, Email, and Web leads all handled in one unified, kinetic workflow.", icon: "hub" },
              { title: "Lead Intelligence", desc: "Detailed summaries and sentiment analysis for every conversation.", icon: "auto_awesome" },
              { title: "Revenue Recovery", desc: "Auto-follow up stops leads from leaking away during long workdays.", icon: "trending_up" }
            ].map((f, i) => (
              <div key={i} className="feature-card p-8 bg-[#0f1930]/50 rounded-3xl border border-white/5 hover:bg-indigo-500/5 transition-all">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 mb-6 flex items-center justify-center text-indigo-400">
                  <span className="material-symbols-outlined">{f.icon}</span>
                </div>
                <h3 className="font-headline font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-[#a3aac4]">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-6 py-24">
          <h2 className="font-headline text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <FaqItem 
              question="Do I need to install an app?" 
              answer="No installation required. LeadFlow works entirely through your browser and SMS. You can even add it to your home screen for instant access, just like an app."
            />
            <FaqItem 
              question="How long does it take to set up?" 
              answer="Under 24 hours. Once you provide your business details and sync your calendar, our team ensures your Assistant is fully calibrated and tested before going live."
            />
            <FaqItem 
              question="How does the Assistant know my pricing?" 
              answer="You provide your baseline pricing during onboarding, and the Assistant uses that to give estimates or qualify leads based on budget."
            />
            <FaqItem 
              question="Can it work with my CRM?" 
              answer="Yes. You can easily import your existing customer lists via CSV to get started immediately."
            />
            <FaqItem 
              question="How does it sync with my calendar?" 
              answer="We connect directly with Google Calendar. The AI only offers slots you're actually available for, so you never get double-booked."
            />
            <FaqItem 
              question="Is my data secure?" 
              answer="Yes. We use industry-standard encryption and secure Supabase architecture to protect your business and customer data."
            />
          </div>
        </section>

        {/* Final CTA / Pricing Section */}
        <section id="pricing" className="max-w-7xl mx-auto px-6 mb-24">
          <div className="bg-[#0f1930] rounded-[3rem] p-12 lg:p-24 text-center relative overflow-hidden border border-white/5">
            <div className="pricing-card relative z-10 max-w-lg mx-auto bg-[#060e20]/80 backdrop-blur-xl p-10 rounded-[3rem] border border-indigo-500/30 shadow-2xl">
              <h2 className="font-headline text-3xl font-bold mb-2">LeadFlow Elite</h2>
              <div className="flex items-center justify-center gap-2 mb-8">
                <span className="text-5xl font-black text-white">$97</span>
                <span className="text-[#a3aac4]">/mo</span>
              </div>
              
              <ul className="text-left space-y-4 mb-12">
                {[
                  "Unlimited Assistant Conversations",
                  "Direct Calendar Integration",
                  "24/7 Lead Qualification",
                  "Revenue Recovery Sequences",
                  "Mobile Dashboard Access",
                  "Priority SMS Support"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-[#a3aac4]">
                    <span className="material-symbols-outlined text-indigo-500 text-sm">check_circle</span>
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-4">
                <button 
                  className="bg-indigo-500 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-indigo-600 hover:scale-[1.02] transition-all duration-300 shadow-xl shadow-indigo-500/20 active:scale-95"
                  onClick={onGetStarted}
                >
                  Start Scaling Now
                </button>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">No credit card required • 14-day trial</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 border-t border-white/5 bg-[#060e20]">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-8">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-400">bubble_chart</span>
            <span className="text-indigo-400 font-bold text-lg">LeadFlow Kinetic</span>
          </div>
          <div className="flex gap-8">
            <a className="text-slate-600 hover:text-indigo-400 transition-colors text-xs font-body" href="#">Privacy Policy</a>
            <a className="text-slate-600 hover:text-indigo-400 transition-colors text-xs font-body" href="#">Terms of Service</a>
            <a className="text-slate-600 hover:text-indigo-400 transition-colors text-xs font-body" href="#">API Docs</a>
            <a className="text-slate-600 hover:text-indigo-400 transition-colors text-xs font-body" href="#">Support</a>
          </div>
          <p className="text-slate-500 text-xs font-body">© 2026 LeadFlow Kinetic. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function CalculatorContent({ onTryDemo, onGetStarted }) {
  const [missedLeads, setMissedLeads] = useState(45)
  const [jobValue, setJobValue] = useState(1250)
  const [closeRate, setCloseRate] = useState(35)

  const lostRevenue = Math.round(missedLeads * jobValue * (closeRate / 100))

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="font-headline text-4xl font-bold mb-4">The Cost of Silence</h2>
        <p className="text-[#a3aac4] max-w-2xl mx-auto">Calculate how much revenue you're leaving on the table every month by not capturing missed calls.</p>
      </div>
      <div className="grid lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-3 space-y-12 bg-[#0f1930] p-8 lg:p-12 rounded-3xl border border-white/5">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <label className="font-headline font-semibold text-lg">Missed Leads Per Month</label>
              <span className="text-indigo-400 font-bold text-2xl">{missedLeads}</span>
            </div>
            <input 
              className="w-full h-2 bg-[#192540] rounded-lg appearance-none cursor-pointer accent-indigo-500" 
              max="200" min="0" type="range" value={missedLeads} 
              onChange={e => setMissedLeads(Number(e.target.value))}
            />
          </div>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <label className="font-headline font-semibold text-lg">Average Job Value</label>
              <span className="text-indigo-400 font-bold text-2xl">${jobValue.toLocaleString()}</span>
            </div>
            <input 
              className="w-full h-2 bg-[#192540] rounded-lg appearance-none cursor-pointer accent-indigo-500" 
              max="10000" min="100" type="range" value={jobValue}
              onChange={e => setJobValue(Number(e.target.value))}
            />
          </div>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <label className="font-headline font-semibold text-lg">Closing Rate (%)</label>
              <span className="text-indigo-400 font-bold text-2xl">{closeRate}%</span>
            </div>
            <input 
              className="w-full h-2 bg-[#192540] rounded-lg appearance-none cursor-pointer accent-indigo-500" 
              max="100" min="1" type="range" value={closeRate}
              onChange={e => setCloseRate(Number(e.target.value))}
            />
          </div>
        </div>
        <div className="lg:col-span-2 h-full">
          <div className="bg-gradient-to-br from-indigo-900/40 to-blue-900/40 border border-white/5 rounded-3xl p-10 h-full flex flex-col justify-center items-center text-center shadow-2xl">
            <p className="text-[#a3aac4] uppercase tracking-[0.2em] text-xs font-bold mb-4">Estimated Monthly Leakage</p>
            <div className="text-6xl font-headline font-black text-white mb-6">${lostRevenue.toLocaleString()}</div>
            <p className="text-indigo-200/70 mb-10 leading-relaxed">Stop the bleed. LeadFlow captures and closes these opportunities for a fraction of the cost.</p>
            <button 
              className="w-full bg-white text-[#060e20] px-8 py-4 rounded-xl font-extrabold hover:bg-indigo-500 hover:text-white transition-colors shadow-lg shadow-white/5 active:scale-95"
              onClick={onGetStarted}
            >
              Plug the Leak Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChatSimulator() {
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [sequenceIndex, setSequenceIndex] = useState(0)

  const conversation = [
    { sender: 'lead', text: "Hi! I'm calling about a leak in my basement. Are you available today?", delay: 1000 },
    { sender: 'system', text: "I can certainly help with that! Our technicians are available in your area. To give you an accurate quote, how many rooms are affected?", delay: 2000 },
    { sender: 'lead', text: "Just the main utility room. It's about 150 sq ft.", delay: 1500 },
    { sender: 'system', text: "Got it. Based on that size, an inspection typically takes 45 mins. I have a slot open at 4 PM today. Should I book that for you?", delay: 2000 },
    { sender: 'lead', text: "Yes please! That works perfectly.", delay: 1200 },
    { sender: 'system', text: "Excellent. You're all set for 4:00 PM today. A confirmation text has been sent to your phone. See you then!", delay: 1500 }
  ]

  useEffect(() => {
    let timeoutId;
    const runSequence = (index) => {
      if (index >= conversation.length) {
        timeoutId = setTimeout(() => {
          setMessages([])
          setSequenceIndex(0)
          runSequence(0)
        }, 5000)
        return
      }

      const msg = conversation[index]
      timeoutId = setTimeout(() => {
        setIsTyping(true)
        timeoutId = setTimeout(() => {
          setIsTyping(false)
          setMessages(prev => [...prev, msg])
          setSequenceIndex(index + 1)
          runSequence(index + 1)
        }, 1000)
      }, msg.delay)
    }

    runSequence(0)
    return () => {
      clearTimeout(timeoutId)
    }
  }, [])

  return (
    <div className="max-w-[340px] mx-auto rounded-[3rem] border-[12px] border-[#192540] bg-[#060e20] h-[640px] w-full shadow-2xl relative overflow-hidden flex flex-col">
      {/* Status Bar */}
      <div className="h-8 flex justify-between items-center px-8 pt-6 pb-2 opacity-50 shrink-0">
        <span className="text-[10px] font-bold">9:41</span>
        <div className="flex gap-1.5 items-center">
          <span className="material-symbols-outlined text-[12px]">signal_cellular_alt</span>
          <span className="material-symbols-outlined text-[12px]">wifi</span>
          <span className="material-symbols-outlined text-[12px]">battery_full</span>
        </div>
      </div>
      
      {/* Chat Header */}
      <div className="p-6 border-b border-white/5 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#6366f1] to-[#4F46E5] flex items-center justify-center">
          <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
        </div>
        <div>
          <p className="text-sm font-bold">Smart Assistant</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] text-[#a3aac4] font-medium">Capture Mode Active</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.sender === 'lead' ? 'justify-start' : 'justify-end'} animate-scale-in`}>
            <div className={`${m.sender === 'lead' ? 'bg-[#141f38] text-slate-200 rounded-tl-none' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20 rounded-tr-none'} p-4 rounded-2xl max-w-[85%] text-xs leading-relaxed`}>
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-[#141f38] p-4 rounded-2xl rounded-tl-none flex gap-1">
              <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
      </div>

      {/* Mock Input Area */}
      <div className="p-4 bg-white/5 border-t border-white/5">
        <div className="bg-[#141f38] h-10 rounded-full px-4 flex items-center justify-between opacity-50">
          <span className="text-[10px] text-slate-500">Fast response enabled...</span>
          <span className="material-symbols-outlined text-sm">send</span>
        </div>
      </div>
    </div>
  )
}
function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`faq-item border border-white/5 rounded-2xl overflow-hidden transition-all ${open ? 'open bg-[#0f1930]' : 'bg-transparent'}`}>
      <button 
        onClick={() => setOpen(!open)}
        className="faq-question w-full p-6 flex justify-between items-center text-left hover:bg-white/5 transition-colors"
      >
        <span className="font-headline font-bold">{question}</span>
        <span className={`material-symbols-outlined transition-transform ${open ? 'rotate-180' : ''}`}>expand_more</span>
      </button>
      {open && (
        <div className="faq-answer p-6 pt-0 text-sm text-[#a3aac4] leading-relaxed animate-fade-in">
          {answer}
        </div>
      )}
    </div>
  )
}
