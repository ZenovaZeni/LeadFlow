import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import './index.css'
import './App.css'

// Moved Pages
import MarketingSite from './pages/MarketingSite'
import DemoFlow from './pages/DemoFlow'
import DashboardApp from './pages/DashboardApp'
import AppDashboard from './pages/AppDashboard'
import LoginPage from './pages/LoginPage'
import Onboarding from './pages/Onboarding'
import BrandedLeadPage from './pages/BrandedLeadPage'
import ProtectedRoute from './components/ProtectedRoute'
import InstallPrompt from './components/InstallPrompt'

export default function App() {
  const navigate = useNavigate()
  const [dashboardTab, setDashboardTab] = useState('overview')
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark')
  const [businessName, setBusinessName] = useState("Your Business") // Updated defaults

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-mode')
    } else {
      document.documentElement.classList.remove('light-mode')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark')
      })
    } else {
      setTheme(prev => prev === 'dark' ? 'light' : 'dark')
    }
  }

  return (
    <div className="app-root">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <main id="main-content">
        <Routes>
          {/* Public Marketing & Demo */}
          <Route path="/" element={
            <MarketingSite
              onTryDemo={() => navigate('/demo')}
              onGetStarted={() => navigate('/onboarding')}
              onViewDashboard={() => navigate('/login')}
              onViewDemoDashboard={() => navigate('/demo/dashboard')}
              theme={theme}
              toggleTheme={toggleTheme}
              businessName={businessName}
              setBusinessName={setBusinessName}
            />
          } />
          
          <Route path="/demo" element={
            <DemoFlow
              onBack={() => navigate('/')}
              onViewDashboard={() => navigate('/demo/dashboard')}
              businessName={businessName}
              theme={theme}
              toggleTheme={toggleTheme}
            />
          } />

          <Route path="/demo/dashboard" element={
            <AppDashboard 
              tab={dashboardTab} 
              onTabChange={setDashboardTab} 
              onLogout={() => navigate('/')} 
              theme={theme} 
              toggleTheme={toggleTheme} 
              businessName={businessName} 
              setBusinessName={setBusinessName} 
              isDemo={true} 
            />
          } />

          <Route path="/login" element={
            <LoginPage
              onLogin={(path) => navigate(path || '/app')}
              onBack={() => navigate('/')}
            />
          } />

          {/* Protected Onboarding & Live App */}
          <Route path="/onboarding" element={
            <Onboarding />
          } />

          <Route path="/app" element={
            <ProtectedRoute>
              <AppDashboard
                tab={dashboardTab}
                onTabChange={setDashboardTab}
                onLogout={() => navigate('/')}
                theme={theme}
                toggleTheme={toggleTheme}
                businessName={businessName}
                setBusinessName={setBusinessName}
              />
            </ProtectedRoute>
          } />

          {/* Public Branded Lead Page */}
          <Route path="/lead/:businessId" element={<BrandedLeadPage />} />

          {/* Catch-all redirect to Landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <InstallPrompt />
    </div>
  )
}
