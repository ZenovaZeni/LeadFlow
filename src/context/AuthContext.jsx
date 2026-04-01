import { createContext, useState, useEffect, useContext } from 'react'
import { supabase } from '../lib/supabase.js'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      if (subscription) subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {loading ? (
        <div style={{ 
          height: '100vh', 
          width: '100vw', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: '#060e20',
          color: '#4f46e5',
          fontFamily: 'sans-serif'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div className="animate-pulse" style={{ fontSize: '2rem', fontWeight: 'bold' }}>Loading...</div>
            <div style={{ marginTop: '1rem', opacity: 0.5 }}>Checking authentication status...</div>
          </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
