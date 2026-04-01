import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import '../styles/login.css'

export default function LoginPage({ onLogin, onBack }) {
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(searchParams.get('mode') === 'signup')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (import.meta.env.DEV && email === 'demo@demo.com' && password === 'demo') {
        sessionStorage.setItem('demo_bypass', 'true')
        onLogin(redirect)
        return
      }

      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({ 
          email, 
          password 
        })
        if (signUpError) throw signUpError
        alert('Account created! Please check your email for confirmation (if enabled in Supabase) or try logging in.')
        setIsSignUp(false)
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        })
        if (signInError) throw signInError
        onLogin(redirect) // Redirect to /app or specified path
      }
    } catch (err) {
      setError(err.message || 'Failed to authenticate. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card animate-fade-in-up">
        <div className="login-header">
          <div className="login-logo">
            <svg width="36" height="36" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="7" fill="url(#lgLogin)"/>
              <path d="M8 14l4 4 8-8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <defs><linearGradient id="lgLogin" x1="0" y1="0" x2="28" y2="28"><stop stopColor="#4f6ef7"/><stop offset="1" stopColor="#7c3aed"/></linearGradient></defs>
            </svg>
          </div>
          <h1>{isSignUp ? 'Create Account' : 'Welcome back'}</h1>
          <p>{isSignUp ? 'Sign up for a new dashboard' : 'Sign in to your LeadFlow dashboard'}</p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: 'var(--space-4)', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', color: '#f87171', fontSize: '14px' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input 
              className="input" 
              type="email" 
              placeholder="you@yourbusiness.com" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              className="input" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
          
          {import.meta.env.DEV && (
            <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              💡 Showcase Bypass: Use <strong style={{ color: 'var(--color-text-primary)' }}>demo@demo.com</strong> & password <strong style={{ color: 'var(--color-text-primary)' }}>demo</strong>
            </p>
          )}
          
          <div style={{ textAlign: 'center', marginTop: 'var(--space-4)', fontSize: 'var(--font-size-sm)' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            </span>
            <button 
              type="button" 
              className="text-link" 
              style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </form>
        
        <button className="btn btn-secondary" onClick={onBack} style={{ width: '100%', marginTop: 'var(--space-4)' }}>← Back to Site</button>
      </div>
    </div>
  )
}
