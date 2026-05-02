import { useState, useEffect } from 'react'
import { BottomNav } from './components/BottomNav'
import { Dashboard } from './screens/Dashboard'
import { AddExpense } from './screens/AddExpense'
import { Overview } from './screens/Overview'
import { Savings } from './screens/Savings'
import { Settings } from './screens/Settings'
import { AuthCallback } from './screens/AuthCallback'
import { useAppStore } from './hooks/useAppStore'

export default function App() {
  const [tab, setTab] = useState('home')
  const [toast, setToast] = useState('')
  const store = useAppStore()

  // Handle magic link callback from email
  const isAuthCallback = window.location.hash.includes('access_token') ||
                         window.location.search.includes('type=recovery')

  useEffect(() => {
    if (store.offlineCount > 0 && navigator.onLine) {
      showToast(`${store.offlineCount} despesa(s) sincronizada(s)`)
    }
  }, [store.offlineCount])

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  function handleNavigate(screen) {
    setTab(screen)
  }

  if (isAuthCallback) {
    return <AuthCallback onDone={() => {
      window.history.replaceState({}, '', '/')
      setTab('home')
    }} />
  }

  const screens = {
    home:     <Dashboard  store={store} onNavigate={handleNavigate} />,
    add:      <AddExpense store={store} onNavigate={handleNavigate} />,
    overview: <Overview   store={store} onNavigate={handleNavigate} />,
    savings:  <Savings    store={store} />,
    settings: <Settings   store={store} />,
  }

  return (
    <div className="app" style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Offline/sync banner */}
      {!navigator.onLine && (
        <div className="sync-banner">
          <span style={{ fontSize: 14 }}>📡</span>
          Sem internet — os dados serão sincronizados quando estiveres online
        </div>
      )}
      {store.syncing && (
        <div className="sync-banner" style={{ background: 'var(--g50)', borderColor: 'var(--g100)', color: 'var(--g700)' }}>
          <div className="spinner" style={{ borderTopColor: 'var(--g400)', borderColor: 'rgba(10,34,24,.15)', width: 14, height: 14 }} />
          A sincronizar...
        </div>
      )}

      {/* Screens */}
      <div style={{ flex: 1, overflow: 'visible', position: 'relative' }}>
        {screens[tab]}
      </div>

      {/* Bottom nav */}
      <BottomNav active={tab} onChange={setTab} />

      {/* Toast notification */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
