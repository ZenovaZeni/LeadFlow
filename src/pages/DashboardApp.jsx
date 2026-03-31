import { useState, useEffect } from 'react'
import '../styles/dashboard.css'
import { api } from '../services/api'

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 15.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
)
const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
)

export default function DashboardApp({ tab, onTabChange, onLogout, theme, toggleTheme }) {
  const [selectedLead, setSelectedLead] = useState(null)

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'leads', label: 'Leads', icon: '👥' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'billing', label: 'Billing', icon: '💳' },
  ]

  return (
    <div className="dash">
      {/* Mobile Header */}
      <div className="dash-mobile-header">
        <div className="dash-logo">
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="7" fill="url(#lgD)"/>
            <path d="M8 14l4 4 8-8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <defs><linearGradient id="lgD" x1="0" y1="0" x2="28" y2="28"><stop stopColor="#4f6ef7"/><stop offset="1" stopColor="#7c3aed"/></linearGradient></defs>
          </svg>
          <span>LeadFlow</span>
        </div>
        <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle Theme">
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className="dash-sidebar">
        <div className="dash-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div className="dash-logo">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="7" fill="url(#lgD)"/>
                <path d="M8 14l4 4 8-8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <defs><linearGradient id="lgD" x1="0" y1="0" x2="28" y2="28"><stop stopColor="#4f6ef7"/><stop offset="1" stopColor="#7c3aed"/></linearGradient></defs>
              </svg>
              <span>LeadFlow</span>
            </div>
            <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle Theme">
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>
        <nav className="dash-sidebar-nav">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`dash-nav-item ${tab === t.id ? 'active' : ''}`}
              onClick={() => { onTabChange(t.id); setSelectedLead(null) }}
            >
              <span className="dash-nav-icon">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>
        <div className="dash-sidebar-footer">
          <div className="dash-user">
            <div className="dash-user-avatar">JT</div>
            <div>
              <div className="dash-user-name">John's Tree Service</div>
              <div className="dash-user-email">john@treesvc.com</div>
            </div>
          </div>
          <button className="btn btn-secondary" onClick={onLogout} style={{ width: '100%', marginTop: 'var(--space-3)' }}>
            Log Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="dash-main">
        {tab === 'overview' && <OverviewTab onViewLeads={() => onTabChange('leads')} />}
        {tab === 'leads' && <LeadsTab selectedLead={selectedLead} setSelectedLead={setSelectedLead} />}
        {tab === 'settings' && <SettingsTab />}
        {tab === 'billing' && <BillingTab />}
      </main>

      {/* Bottom Nav (Mobile) */}
      <nav className="dash-bottom-nav">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`dash-bottom-item ${tab === t.id ? 'active' : ''}`}
            onClick={() => { onTabChange(t.id); setSelectedLead(null) }}
          >
            <span className="dash-bottom-icon">{t.icon}</span>
            <span className="dash-bottom-label">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

/* ---- Overview ---- */
function OverviewTab({ onViewLeads }) {
  const [loading, setLoading] = useState(true)
  const [statsData, setStatsData] = useState(null)
  const [recentLeads, setRecentLeads] = useState([])

  useEffect(() => {
    async function loadData() {
      const [stats, leads] = await Promise.all([
        api.getDashboardStats(),
        api.getLeads()
      ])
      setStatsData(stats)
      setRecentLeads(leads.slice(0, 3))
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading || !statsData) return <LoadingSkeleton />

  const stats = [
    { label: 'Total Leads', value: statsData.totalLeads, accent: true },
    { label: 'This Week', value: statsData.thisWeek },
    { label: 'Avg. Response', value: statsData.avgResponseTime },
    { label: 'Reply Rate', value: statsData.repliedRate },
    { label: 'New Today', value: statsData.newToday },
  ]

  return (
    <div className="dash-content animate-fade-in">
      <div className="dash-page-header">
        <div>
          <h1>Welcome back, John 👋</h1>
          <p>Here's what's happening with your leads.</p>
        </div>
      </div>
      <div className="stats-grid">
        {stats.map((s, i) => (
          <div key={i} className={`stat-card card ${s.accent ? 'stat-accent' : ''}`}>
            <span className="stat-label">{s.label}</span>
            <span className="stat-value">{s.value}</span>
          </div>
        ))}
      </div>
      <div className="dash-section-header">
        <h2>Recent Leads</h2>
        <button className="btn btn-secondary" onClick={onViewLeads}>View All</button>
      </div>
      <div className="leads-table-wrap desktop-only">
        <table className="leads-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Service</th>
              <th>Status</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {recentLeads.map(lead => (
              <tr key={lead.id}>
                <td className="lead-name-cell">{lead.name}</td>
                <td>{lead.service}</td>
                <td><span className={`badge ${lead.status === 'new' ? 'badge-warning' : 'badge-success'}`}>{lead.statusLabel}</span></td>
                <td className="lead-time">{lead.timeAgo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards List */}
      <div className="leads-mobile-list">
        {recentLeads.map(lead => (
          <div key={lead.id} className="lead-mobile-card" onClick={onViewLeads}>
            <div className="lead-mobile-header">
              <span className="lead-mobile-name">{lead.name}</span>
              <span className="lead-mobile-time">{lead.timeAgo}</span>
            </div>
            <div className="lead-mobile-body">
              <span>{lead.service}</span>
              <span className={`badge ${lead.status === 'new' ? 'badge-warning' : 'badge-success'}`}>
                {lead.statusLabel}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---- Leads ---- */
function LeadsTab({ selectedLead, setSelectedLead }) {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    api.getLeads().then(data => {
      setLeads(data)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="dash-content"><LoadingSkeleton /></div>

  const filtered = leads.filter(lead => {
    const matchesSearch = !search || 
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.service.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="dash-content animate-fade-in">
      <div className="dash-page-header">
        <h1>All Leads</h1>
      </div>
      <div className="leads-toolbar">
        <div className="leads-search">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            className="leads-search-input"
            placeholder="Search leads..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search leads"
          />
        </div>
        <select
          className="leads-filter"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="replied">Replied</option>
        </select>
      </div>
      <div className="leads-layout">
        <div className="leads-list-panel">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>No leads found</h3>
              <p>Try adjusting your search or filter to find what you're looking for.</p>
              <button className="btn btn-secondary" onClick={() => { setSearch(''); setStatusFilter('all') }}>Clear Filters</button>
            </div>
          ) : (
            <div style={{ width: '100%' }}>
              <div className="leads-table-wrap desktop-only">
                <table className="leads-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Service</th>
                      <th>Status</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(lead => (
                      <tr
                        key={lead.id}
                        className={`clickable ${selectedLead?.id === lead.id ? 'selected' : ''}`}
                        onClick={() => setSelectedLead(lead)}
                      >
                        <td className="lead-name-cell">{lead.name}</td>
                        <td>{lead.service}</td>
                        <td><span className={`badge ${lead.status === 'new' ? 'badge-warning' : 'badge-success'}`}>{lead.statusLabel}</span></td>
                        <td className="lead-time">{lead.timeAgo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards List */}
              <div className="leads-mobile-list">
                {filtered.map(lead => (
                  <div 
                    key={lead.id} 
                    className={`lead-mobile-card ${selectedLead?.id === lead.id ? 'selected' : ''}`}
                    onClick={() => setSelectedLead(lead)}
                  >
                    <div className="lead-mobile-header">
                      <span className="lead-mobile-name">{lead.name}</span>
                      <span className="lead-mobile-time">{lead.timeAgo}</span>
                    </div>
                    <div className="lead-mobile-body">
                      <span>{lead.service}</span>
                      <span className={`badge ${lead.status === 'new' ? 'badge-warning' : 'badge-success'}`}>
                        {lead.statusLabel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {selectedLead && (
          <div className="lead-detail-panel animate-slide-in-right">
            <div className="ldp-header">
              <h2>{selectedLead.name}</h2>
              <button className="ldp-close" onClick={() => setSelectedLead(null)} aria-label="Close detail panel">✕</button>
            </div>
            <div className="ldp-info-grid">
              <div className="ldp-info-item">
                <span className="ldp-label">Phone</span>
                <span className="ldp-value">{selectedLead.phone}</span>
              </div>
              <div className="ldp-info-item">
                <span className="ldp-label">Email</span>
                <span className="ldp-value">{selectedLead.email || '—'}</span>
              </div>
              <div className="ldp-info-item">
                <span className="ldp-label">Service</span>
                <span className="ldp-value">{selectedLead.service}</span>
              </div>
              <div className="ldp-info-item">
                <span className="ldp-label">Address</span>
                <span className="ldp-value">{selectedLead.address}</span>
              </div>
              <div className="ldp-info-item">
                <span className="ldp-label">Urgency</span>
                <span className="ldp-value">{selectedLead.urgency}</span>
              </div>
              <div className="ldp-info-item">
                <span className="ldp-label">Received</span>
                <span className="ldp-value">{selectedLead.timestamp}</span>
              </div>
            </div>
            <div className="ldp-section">
              <h3>Summary</h3>
              <p>{selectedLead.summary}</p>
            </div>
            <div className="ldp-section">
              <h3>Conversation</h3>
              <div className="ldp-chat">
                {selectedLead.conversation.map((m, i) => (
                  <div key={i} className={`ldp-bubble ${m.role}`}>
                    <span className="ldp-bubble-role">{m.role === 'assistant' ? 'System' : selectedLead.name.split(' ')[0]}</span>
                    {m.text}
                  </div>
                ))}
              </div>
            </div>
            <div className="ldp-section">
              <h3>Notes</h3>
              <textarea className="input" rows={3} placeholder="Add a note about this lead..." />
            </div>
            <div className="ldp-actions">
              <button className="btn btn-primary">Call {selectedLead.name.split(' ')[0]}</button>
              <button className="btn btn-secondary">Mark as Contacted</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ---- Loading Skeleton ---- */
function LoadingSkeleton() {
  return (
    <div className="dash-content">
      <div className="skeleton-header">
        <div className="skeleton-bar" style={{ width: '40%', height: 28 }} />
        <div className="skeleton-bar" style={{ width: '55%', height: 16, marginTop: 8 }} />
      </div>
      <div className="stats-grid" style={{ marginTop: 32 }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} className="stat-card card">
            <div className="skeleton-bar" style={{ width: '60%', height: 12 }} />
            <div className="skeleton-bar" style={{ width: '40%', height: 28, marginTop: 12 }} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 40 }}>
        <div className="skeleton-bar" style={{ width: '30%', height: 20 }} />
        <div style={{ marginTop: 16 }}>
          {[1,2,3].map(i => (
            <div key={i} className="skeleton-row">
              <div className="skeleton-bar" style={{ width: '25%', height: 14 }} />
              <div className="skeleton-bar" style={{ width: '30%', height: 14 }} />
              <div className="skeleton-bar" style={{ width: '15%', height: 14 }} />
              <div className="skeleton-bar" style={{ width: '15%', height: 14 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ---- Settings ---- */
function SettingsTab() {
  return (
    <div className="dash-content animate-fade-in">
      <div className="dash-page-header">
        <h1>Settings</h1>
      </div>
      <div className="settings-sections">
        {/* Business Info */}
        <div className="card settings-card">
          <h3>Business Info</h3>
          <div className="settings-form">
            <div className="form-group">
              <label>Business Name</label>
              <input className="input" defaultValue="John's Tree Service" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input className="input" defaultValue="(813) 555-1234" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input className="input" defaultValue="john@johnstreeservice.com" />
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="card settings-card">
          <h3>Notifications</h3>
          <div className="settings-toggles">
            <div className="settings-toggle-row">
              <div>
                <span className="toggle-label">SMS Notifications</span>
                <span className="toggle-desc">Get a text when a new lead comes in</span>
              </div>
              <div className="toggle active"><div className="toggle-knob" /></div>
            </div>
            <div className="settings-toggle-row">
              <div>
                <span className="toggle-label">Email Notifications</span>
                <span className="toggle-desc">Get an email summary for each new lead</span>
              </div>
              <div className="toggle active"><div className="toggle-knob" /></div>
            </div>
            <div className="settings-toggle-row">
              <div>
                <span className="toggle-label">Daily Summary</span>
                <span className="toggle-desc">Receive a daily digest at 8:00 AM</span>
              </div>
              <div className="toggle"><div className="toggle-knob" /></div>
            </div>
          </div>
        </div>

        {/* Intake Questions */}
        <div className="card settings-card">
          <h3>Intake Questions</h3>
          <p className="settings-desc">These are the follow-up questions sent to new leads via text.</p>
          <div className="intake-list">
            {INTAKE_QUESTIONS.map(q => (
              <div key={q.id} className="intake-item">
                <div className={`toggle ${q.enabled ? 'active' : ''}`}><div className="toggle-knob" /></div>
                <span>{q.question}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Branded Page */}
        <div className="card settings-card">
          <h3>Branded Lead Page</h3>
          <p className="settings-desc">Customize the customer-facing lead capture page.</p>
          <div className="settings-form">
            <div className="form-group">
              <label>Page Headline</label>
              <input className="input" defaultValue="Get a Free Estimate" />
            </div>
            <div className="form-group">
              <label>Page Subheadline</label>
              <input className="input" defaultValue="Fill out the form and we'll get back to you right away." />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Primary Color</label>
                <input className="input" defaultValue="#2d6a4f" />
              </div>
              <div className="form-group">
                <label>Logo Emoji / Upload</label>
                <input className="input" defaultValue="🌳" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---- Billing ---- */
function BillingTab() {
  return (
    <div className="dash-content animate-fade-in">
      <div className="dash-page-header">
        <h1>Billing</h1>
      </div>
      <div className="billing-layout">
        <div className="card billing-plan-card">
          <div className="billing-plan-header">
            <span className="badge badge-accent">Current Plan</span>
            <h3>LeadFlow Pro</h3>
            <p>$97/month</p>
          </div>
          <ul className="billing-features">
            <li>✓ Unlimited leads</li>
            <li>✓ SMS responses</li>
            <li>✓ Full dashboard</li>
            <li>✓ Owner notifications</li>
          </ul>
          <button className="btn btn-secondary" style={{ width: '100%' }}>Manage Plan</button>
        </div>
        <div className="card billing-info-card">
          <h3>Payment Method</h3>
          <div className="billing-card-preview">
            <span>💳</span>
            <span>•••• •••• •••• 4242</span>
            <span className="billing-exp">Exp 09/28</span>
          </div>
          <button className="btn btn-secondary" style={{ width: '100%', marginTop: 'var(--space-4)' }}>Update Payment</button>
        </div>
      </div>
    </div>
  )
}
