import { useState } from 'react'
import { signInWithMagicLink, signOut, isSupabaseEnabled } from '../lib/supabase'
import { fmtAOA } from '../lib/utils'
import { SFLogoDark } from '../components/Logo'

export function Settings({ store }) {
  const { user, session, updateUser, offlineCount, syncing } = store
  const [editName, setEditName]     = useState(false)
  const [editIncome, setEditIncome] = useState(false)
  const [nameInput, setNameInput]   = useState(user.name)
  const [incomeInput, setIncomeInput] = useState(String(user.income || ''))
  const [email, setEmail]           = useState('')
  const [authSent, setAuthSent]     = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError]   = useState('')
  const [saving, setSaving]         = useState(false)

  async function handleSendMagicLink() {
    if (!email || !email.includes('@')) {
      setAuthError('Introduz um email válido')
      return
    }
    setAuthLoading(true)
    setAuthError('')
    try {
      await signInWithMagicLink(email)
      setAuthSent(true)
    } catch (e) {
      setAuthError(e.message || 'Erro ao enviar email')
    } finally {
      setAuthLoading(false)
    }
  }

  async function handleSaveName() {
    if (!nameInput.trim()) return
    setSaving(true)
    await updateUser({ name: nameInput.trim() })
    setEditName(false)
    setSaving(false)
  }

  async function handleSaveIncome() {
    const v = parseInt(incomeInput)
    if (!v || v <= 0) return
    setSaving(true)
    await updateUser({ income: v })
    setEditIncome(false)
    setSaving(false)
  }

  return (
    <div className="screen">
      {/* Header */}
      <div style={{
        background: 'linear-gradient(160deg, var(--g800), var(--g700))',
        padding: '52px 20px 32px', textAlign: 'center', position: 'relative'
      }}>
        {/* Avatar */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--g300), var(--g400))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 14px', fontSize: 28, fontWeight: 800, color: 'white',
          boxShadow: '0 4px 20px rgba(77,217,138,.4)'
        }}>
          {(user.name || 'U')[0].toUpperCase()}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: '-.3px' }}>
          {user.name}
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', marginTop: 4 }}>
          {session ? session.user.email : 'Modo offline'}
        </div>
        {syncing && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10 }}>
            <div className="spinner" style={{ borderTopColor: 'var(--g300)', borderColor: 'rgba(255,255,255,.2)' }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', fontWeight: 600 }}>A sincronizar...</span>
          </div>
        )}
      </div>

      <div style={{ padding: '16px 16px 0' }}>

        {/* Offline notice */}
        {offlineCount > 0 && (
          <div style={{
            background: 'var(--amber-bg)', border: '1px solid rgba(245,166,35,.25)',
            borderRadius: 12, padding: '12px 14px', marginBottom: 14,
            display: 'flex', gap: 10, alignItems: 'center'
          }}>
            <span style={{ fontSize: 18 }}>📡</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#92600a' }}>
              {offlineCount} despesa(s) aguardam sincronização
            </span>
          </div>
        )}

        {/* Profile section */}
        <div className="card fade-up" style={{ marginBottom: 14 }}>
          <div style={{ padding: '14px 18px 10px' }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>O meu perfil</div>

            {/* Name */}
            <ProfileRow
              label="Nome"
              value={user.name}
              onEdit={() => { setNameInput(user.name); setEditName(true) }}
            />
            {editName && (
              <div style={{ padding: '10px 0' }}>
                <input className="sf-input" value={nameInput} onChange={e => setNameInput(e.target.value)}
                  placeholder="O teu nome" style={{ marginBottom: 8 }} autoFocus />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary" onClick={handleSaveName} disabled={saving} style={{ flex: 1, padding: '12px' }}>
                    {saving ? <div className="spinner" /> : 'Guardar'}
                  </button>
                  <button className="btn btn-outline" onClick={() => setEditName(false)} style={{ flex: 1, padding: '12px' }}>Cancelar</button>
                </div>
              </div>
            )}

            <div className="divider" style={{ margin: '8px -18px' }} />

            {/* Income */}
            <ProfileRow
              label="Rendimento mensal"
              value={user.income ? `${fmtAOA(user.income)} AOA` : 'Não definido'}
              onEdit={() => { setIncomeInput(String(user.income || '')); setEditIncome(true) }}
            />
            {editIncome && (
              <div style={{ padding: '10px 0' }}>
                <input className="sf-input" type="number" inputMode="numeric" value={incomeInput}
                  onChange={e => setIncomeInput(e.target.value)} placeholder="Ex: 200000"
                  style={{ marginBottom: 8 }} autoFocus />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary" onClick={handleSaveIncome} disabled={saving} style={{ flex: 1, padding: '12px' }}>
                    {saving ? <div className="spinner" /> : 'Guardar'}
                  </button>
                  <button className="btn btn-outline" onClick={() => setEditIncome(false)} style={{ flex: 1, padding: '12px' }}>Cancelar</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Auth section */}
        {isSupabaseEnabled && (
          <div className="card card-padded fade-up" style={{ marginBottom: 14 }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Conta & sincronização</div>

            {!session ? (
              authSent ? (
                <div style={{ textAlign: 'center', padding: '8px 0' }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>📧</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                    Email enviado!
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.5 }}>
                    Abre o link no email <strong>{email}</strong> para entrar e sincronizar os teus dados.
                  </div>
                  <button className="btn btn-outline" onClick={() => setAuthSent(false)} style={{ marginTop: 14 }}>
                    Tentar com outro email
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 14, lineHeight: 1.5 }}>
                    Entra com o teu email para guardar os dados na nuvem e aceder em qualquer dispositivo.
                  </div>
                  {authError && (
                    <div style={{ background: 'var(--red-bg)', color: 'var(--red)', padding: '10px 12px', borderRadius: 10, fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
                      {authError}
                    </div>
                  )}
                  <input className="sf-input" type="email" inputMode="email" value={email}
                    onChange={e => setEmail(e.target.value)} placeholder="o.teu@email.com"
                    style={{ marginBottom: 10 }} />
                  <button className="btn btn-primary" onClick={handleSendMagicLink} disabled={authLoading || !email}>
                    {authLoading ? <div className="spinner" /> : '✉️ Entrar com magic link'}
                  </button>
                  <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', marginTop: 10 }}>
                    Sem senha. Recebes um link seguro por email.
                  </div>
                </div>
              )
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, padding: '10px 12px', background: 'var(--g50)', borderRadius: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--g400)', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--g700)' }}>Sincronizado · {session.user.email}</span>
                </div>
                <button className="btn btn-danger" onClick={() => signOut()}>
                  Sair da conta
                </button>
              </div>
            )}
          </div>
        )}

        {/* About */}
        <div className="card fade-up" style={{ marginBottom: 24 }}>
          <div style={{ padding: '20px 18px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <SFLogoDark size={40} />
            </div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: 'var(--g800)', marginBottom: 4 }}>
              SF — Sobrevivência Financeira
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 16 }}>
              Aprender a sobreviver financeiramente em Angola.
              Feito para pessoas reais, com desafios reais.
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.5px', color: 'var(--faint)', textTransform: 'uppercase' }}>
              Versão 1.0 · MVP
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfileRow({ label, value, onEdit }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: '.4px', textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{value}</div>
      </div>
      <button onClick={onEdit} style={{
        background: 'var(--surface)', border: 'none', borderRadius: 8,
        padding: '6px 12px', fontSize: 12, fontWeight: 700,
        color: 'var(--g600)', cursor: 'pointer'
      }}>Editar</button>
    </div>
  )
}
