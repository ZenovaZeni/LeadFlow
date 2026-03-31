import { useState, useEffect } from 'react';

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show if already installed or previously dismissed
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      sessionStorage.getItem('pwa_prompt_dismissed')
    ) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);

    if (ios) {
      // Show iOS manual instructions after a short delay
      setTimeout(() => setVisible(true), 3000);
      return;
    }

    // Android/Chrome: capture the native install prompt
    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      setTimeout(() => setVisible(true), 3000);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setVisible(false);
    setPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (!visible || dismissed) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 'calc(env(safe-area-inset-bottom) + 1.5rem)',
      left: '1rem',
      right: '1rem',
      zIndex: 9999,
      background: 'linear-gradient(135deg, #1a2744, #0f1c36)',
      border: '1px solid rgba(79,110,247,0.3)',
      borderRadius: '1.5rem',
      padding: '1.25rem 1.5rem',
      boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      maxWidth: '480px',
      margin: '0 auto'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #4f6ef7, #7c3aed)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
          <path d="M8 14l4 4 8-8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.2rem' }}>
          Add LeadFlow to Home Screen
        </p>
        <p style={{ color: '#64748b', fontSize: '0.75rem', lineHeight: 1.4 }}>
          {isIOS
            ? 'Tap the Share button, then "Add to Home Screen"'
            : 'Install for instant access — no browser needed'}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 }}>
        {!isIOS && (
          <button
            onClick={handleInstall}
            style={{
              background: '#4f6ef7',
              color: '#fff',
              border: 'none',
              borderRadius: '0.75rem',
              padding: '0.5rem 1rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Install
          </button>
        )}
        <button
          onClick={handleDismiss}
          style={{
            background: 'transparent',
            color: '#475569',
            border: 'none',
            borderRadius: '0.75rem',
            padding: '0.5rem 1rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Not now
        </button>
      </div>
    </div>
  );
}
