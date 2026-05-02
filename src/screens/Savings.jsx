import { useState } from 'react'
import { fmtAOA } from '../lib/utils'
import { SFLogo } from '../components/Logo'

const TIPS = [
  { icon: '🔒', text: 'Guarda 3 a 6 meses de despesas em emergências' },
  { icon: '🏥', text: 'Cobre emergências: saúde, carro, perda de emprego' },
  { icon: '😌', text: 'Elimina a ansiedade financeira e dormes melhor' },
  { icon: '🚀', text: 'Depois do fundo, começa a investir ou crescer' },
]

const GOALS = [
  { label: '3 meses', multiplier: 3 },
  { label: '6 meses', multiplier: 6 },
  { label: 'Personalizado', multiplier: null },
]

export function Savings({ store }) {
  const { savings, user, updateSavings } = store
  const current  = savings?.current_amount || 0
  const goal     = savings?.goal_amount || 150000
  const pct      = Math.min(100, Math.round(current / goal * 100))
  const remaining = Math.max(0, goal - current)

  const [adding, setAdding]     = useState(false)
  const [editGoal, setEditGoal] = useState(false)
  const [input, setInput]       = useState('')
  const [goalInput, setGoalInput] = useState(String(goal))
  const [saving, setSaving]     = useState(false)
  const [msg, setMsg]           = useState('')

  async function handleAdd() {
    const v = parseInt(input)
    if (!v || v <= 0) return
    setSaving(true)
    await updateSavings({ current_amount: current + v, goal_amount: goal })
    setInput('')
    setAdding(false)
    setSaving(false)
    setMsg(`+${fmtAOA(v)} AOA guardados! 🎉`)
    setTimeout(() => setMsg(''), 3000)
  }

  async function handleSetGoal() {
    const v = parseInt(goalInput)
    if (!v || v <= 0) return
    await updateSavings({ current_amount: current, goal_amount: v })
    setEditGoal(false)
  }

  function suggestGoal(mult) {
    if (mult) {
      const monthly = (user.income || 200000)
      setGoalInput(String(monthly * mult))
    }
    setEditGoal(true)
  }

  return (
    <div className="screen" style={{overflowY:"scroll",WebkitOverflowScrolling:"touch"}}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(160deg, var(--g800), var(--g600))',
        padding: '52px 20px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, background: 'rgba(255,255,255,.04)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, background: 'rgba(255,255,255,.03)', borderRadius: '50%' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <SFLogo size={36} />
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.6px', color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', marginBottom: 8 }}>
            Fundo de emergência
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, color: 'white', letterSpacing: '-1px', lineHeight: 1 }}>
            {fmtAOA(current)}
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,.45)', fontWeight: 600, marginLeft: 4 }}>AOA</span>
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,.45)', marginTop: 4, fontWeight: 500 }}>
            de {fmtAOA(goal)} AOA
          </div>

          {/* Progress bar */}
          <div style={{ margin: '20px 0 8px' }}>
            <div style={{ height: 12, background: 'rgba(255,255,255,.12)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${pct}%`, borderRadius: 99,
                background: 'linear-gradient(90deg,#4dd98a,#25c06e)',
                transition: 'width .7s cubic-bezier(.4,0,.2,1)',
                boxShadow: '0 0 12px rgba(77,217,138,.5)'
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', fontWeight: 700 }}>
                {pct}% alcançado
              </span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', fontWeight: 700 }}>
                Faltam {fmtAOA(remaining)} AOA
              </span>
            </div>
          </div>

          {pct >= 100 && (
            <div style={{ background: 'rgba(77,217,138,.2)', border: '1px solid rgba(77,217,138,.3)', borderRadius: 12, padding: '10px 16px', marginTop: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#4dd98a' }}>🎉 Meta alcançada! Parabéns!</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>

        {msg && (
          <div style={{
            background: 'var(--g50)', border: '1px solid var(--g100)', borderRadius: 12,
            padding: '12px 16px', marginBottom: 12, fontSize: 14, fontWeight: 700,
            color: 'var(--g600)', textAlign: 'center', animation: 'fadeUp .3s ease'
          }}>{msg}</div>
        )}

        {/* Add money */}
        {adding ? (
          <div className="card card-padded fade-up" style={{ marginBottom: 14 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Quanto guardaste?</div>
            <input
              className="sf-input"
              type="number"
              inputMode="numeric"
              placeholder="Valor em AOA"
              value={input}
              onChange={e => setInput(e.target.value)}
              autoFocus
              style={{ marginBottom: 12, fontSize: 20, fontWeight: 700 }}
            />
            <button className="btn btn-primary" onClick={handleAdd} disabled={saving || !input}>
              {saving ? <div className="spinner" /> : '✓ Confirmar'}
            </button>
            <button className="btn btn-outline" onClick={() => { setAdding(false); setInput('') }} style={{ marginTop: 8 }}>
              Cancelar
            </button>
          </div>
        ) : (
          <button className="btn btn-primary fade-up" onClick={() => setAdding(true)} style={{ marginBottom: 14 }}>
            + Guardar dinheiro
          </button>
        )}

        {/* Set goal */}
        {editGoal ? (
          <div className="card card-padded fade-up" style={{ marginBottom: 14 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Definir meta de poupança</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {GOALS.filter(g => g.multiplier).map(g => (
                <button key={g.label} onClick={() => suggestGoal(g.multiplier)} style={{
                  flex: 1, padding: '8px 4px', borderRadius: 10, border: '1.5px solid var(--g300)',
                  background: 'var(--g50)', fontSize: 12, fontWeight: 700, color: 'var(--g600)', cursor: 'pointer'
                }}>{g.label}</button>
              ))}
            </div>
            <input
              className="sf-input"
              type="number"
              inputMode="numeric"
              value={goalInput}
              onChange={e => setGoalInput(e.target.value)}
              style={{ marginBottom: 12, fontWeight: 700 }}
            />
            <button className="btn btn-primary" onClick={handleSetGoal}>✓ Guardar meta</button>
            <button className="btn btn-outline" onClick={() => setEditGoal(false)} style={{ marginTop: 8 }}>Cancelar</button>
          </div>
        ) : (
          <button className="btn btn-outline fade-up" onClick={() => setEditGoal(true)} style={{ marginBottom: 14 }}>
            ✏️ Alterar meta
          </button>
        )}

        {/* Why it matters */}
        <div className="card card-padded fade-up" style={{ marginBottom: 14 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Porque é importante</div>
          {TIPS.map((t, i) => (
            <div key={i} style={{
              display: 'flex', gap: 12, alignItems: 'flex-start',
              padding: '10px 0',
              borderTop: i > 0 ? '1px solid rgba(10,34,24,.07)' : 'none'
            }}>
              <span style={{ fontSize: 20, lineHeight: 1.2 }}>{t.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text2)', lineHeight: 1.5 }}>{t.text}</span>
            </div>
          ))}
        </div>

        {/* Monthly saving suggestion */}
        {user.income > 0 && (
          <div className="card fade-up" style={{
            marginBottom: 24, background: 'linear-gradient(135deg,var(--g50),#fff)',
            border: '1px solid var(--g100)'
          }}>
            <div style={{ padding: '16px 18px' }}>
              <div className="eyebrow" style={{ marginBottom: 8, color: 'var(--g600)' }}>Sugestão de poupança</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', lineHeight: 1.5 }}>
                Com o teu rendimento de <strong>{fmtAOA(user.income)} AOA</strong>,
                poupar <strong style={{ color: 'var(--g500)' }}>{fmtAOA(Math.round(user.income * 0.1))} AOA/mês</strong> (10%)
                leva-te à tua meta em <strong>{Math.ceil(remaining / (user.income * 0.1))}</strong> meses.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
