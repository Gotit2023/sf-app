import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { SFLogo } from '../components/Logo'

export function AuthCallback({ onDone }) {
  const [status, setStatus] = useState('Verificando...')
  const [error, setError]   = useState('')

  useEffect(() => {
    // Supabase reads the URL hash automatically on init
    supabase?.auth.getSession().then(({ data, error }) => {
      if (error) {
        setError('Link inválido ou expirado. Tenta novamente.')
      } else if (data.session) {
        setStatus('Entrou com sucesso! 🎉')
        setTimeout(() => onDone(), 1500)
      } else {
        setError('Não foi possível autenticar. Tenta novamente.')
      }
    })
  }, [])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(160deg, var(--g800), var(--g600))',
      padding: 24, textAlign: 'center'
    }}>
      <SFLogo size={48} />
      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: 'white', marginTop: 20, marginBottom: 8 }}>
        SF
      </div>
      {error ? (
        <>
          <div style={{ fontSize: 16, color: '#ff8a8a', fontWeight: 600, marginBottom: 20 }}>{error}</div>
          <button className="btn btn-ghost" onClick={onDone} style={{ width: 'auto', padding: '12px 24px' }}>
            Voltar ao início
          </button>
        </>
      ) : (
        <>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,.7)', fontWeight: 500 }}>{status}</div>
          <div style={{ marginTop: 20 }}>
            <div className="spinner" style={{ borderTopColor: 'var(--g300)', borderColor: 'rgba(255,255,255,.2)', width: 28, height: 28 }} />
          </div>
        </>
      )}
    </div>
  )
}
