import { useMemo } from 'react'
import { SFLogo } from '../components/Logo'
import {
  fmtAOA, getMonthExpenses, getTodayExpenses,
  getCategoryTotals, getTodayChallenge, getTodayMotivation,
  generateInsights, CAT_MAP
} from '../lib/utils'

export function Dashboard({ store, onNavigate }) {
  const { user, expenses, savings } = store

  const todayExp   = useMemo(() => getTodayExpenses(expenses), [expenses])
  const monthExp   = useMemo(() => getMonthExpenses(expenses), [expenses])
  const catTotals  = useMemo(() => getCategoryTotals(monthExp), [monthExp])
  const insights   = useMemo(() => generateInsights(expenses, user.income), [expenses, user.income])

  const todayTotal  = useMemo(() => todayExp.reduce((s, e) => s + e.amount, 0), [todayExp])
  const monthTotal  = useMemo(() => monthExp.reduce((s, e) => s + e.amount, 0), [monthExp])
  const income      = user.income || 200000
  const dayBudget   = Math.round(income / 30)
  const dayRemain   = Math.max(0, dayBudget - todayTotal)
  const overBudget  = todayTotal > dayBudget

  const challenge   = getTodayChallenge()
  const motivation  = getTodayMotivation()

  function shareWhatsApp() {
    const text = `📊 *SF — Resumo do Mês*\n\n` +
      `💰 Receitas: ${fmtAOA(income)} AOA\n` +
      `💸 Despesas: ${fmtAOA(monthTotal)} AOA\n` +
      `📉 Maior gasto: ${catTotals[0]?.label || '—'}\n\n` +
      `Controla as tuas finanças com SF!`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="screen" style={{overflowY:"scroll",WebkitOverflowScrolling:"touch"}}>
      {/* ── Hero Header ── */}
      <div className="hero-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <SFLogo size={30} />
            <span style={{ fontSize: 20, fontWeight: 800, color: 'white', letterSpacing: '-.3px' }}>SF</span>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', fontWeight: 600 }}>
            {new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long' })}
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.55)', fontWeight: 500, marginBottom: 4 }}>
            {motivation}
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'white', letterSpacing: '-.5px' }}>
            Olá, {user.name} 👋
          </div>
        </div>

        {/* Today's spend card */}
        <div style={{
          marginTop: 20, background: 'rgba(255,255,255,.1)',
          backdropFilter: 'blur(12px)', borderRadius: 16,
          padding: '16px 18px', position: 'relative', zIndex: 1,
          border: '1px solid rgba(255,255,255,.15)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.8px', color: 'rgba(255,255,255,.55)', textTransform: 'uppercase', marginBottom: 4 }}>
                Gasto hoje
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'white', letterSpacing: '-1px', lineHeight: 1 }}>
                {fmtAOA(todayTotal)}
                <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,.5)', marginLeft: 4 }}>AOA</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.8px', color: 'rgba(255,255,255,.55)', textTransform: 'uppercase', marginBottom: 4 }}>
                Restante
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: overBudget ? '#ff8a8a' : '#4dd98a', letterSpacing: '-.5px' }}>
                {overBudget ? '−' : ''}{fmtAOA(Math.abs(dayRemain))}
                <span style={{ fontSize: 11, marginLeft: 2, opacity: .7 }}>AOA</span>
              </div>
            </div>
          </div>
          {/* Day progress */}
          <div style={{ marginTop: 12 }}>
            <div style={{ height: 4, background: 'rgba(255,255,255,.15)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 99,
                width: `${Math.min(100, Math.round(todayTotal / dayBudget * 100))}%`,
                background: overBudget ? '#ff8a8a' : 'linear-gradient(90deg,#4dd98a,#25c06e)',
                transition: 'width .5s ease'
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontWeight: 600 }}>
                Orçamento diário: {fmtAOA(dayBudget)} AOA
              </span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontWeight: 600 }}>
                {Math.min(100, Math.round(todayTotal / dayBudget * 100))}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>

        {/* ── Month summary row ── */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }} className="stagger">
          <MetricCard label="Receitas mês" value={fmtAOA(income)} unit="AOA" color="var(--g500)" />
          <MetricCard label="Despesas mês" value={fmtAOA(monthTotal)} unit="AOA" color={monthTotal > income ? 'var(--red)' : 'var(--text)'} />
        </div>

        {/* ── Challenge card ── */}
        <div className="card fade-up" style={{ marginBottom: 14, background: 'linear-gradient(135deg,#0a1628,#132040)', border: 'none' }}>
          <div style={{ padding: '14px 16px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{
              width: 44, height: 44, minWidth: 44, borderRadius: 12,
              background: 'rgba(245,166,35,.15)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 22
            }}>💡</div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '1px', color: '#f5c842', textTransform: 'uppercase', marginBottom: 4 }}>
                Desafio do dia
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,.85)', lineHeight: 1.5 }}>
                {challenge}
              </div>
            </div>
          </div>
        </div>

        {/* ── Category breakdown ── */}
        {catTotals.length > 0 ? (
          <div className="card card-padded fade-up" style={{ marginBottom: 14 }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Este mês — onde vai o dinheiro</div>
            {catTotals.map((cat, i) => {
              const pct = monthTotal > 0 ? Math.round(cat.total / monthTotal * 100) : 0
              return (
                <div key={cat.id}>
                  {i > 0 && <div className="divider" style={{ margin: '10px -18px' }} />}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10, minWidth: 38,
                      background: cat.light, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 18
                    }}>{cat.emoji}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{cat.label}</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                          {fmtAOA(cat.total)} AOA
                        </span>
                      </div>
                      <div style={{ height: 4, background: 'var(--surface)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: cat.color, borderRadius: 99, transition: 'width .5s' }} />
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3, fontWeight: 600 }}>{pct}%</div>
                    </div>
                  </div>
                </div>
              )
            })}
            {catTotals.length > 0 && (
              <div style={{
                marginTop: 14, background: 'var(--g50)', borderRadius: 10, padding: '10px 12px',
                display: 'flex', gap: 8, alignItems: 'center'
              }}>
                <span style={{ fontSize: 16 }}>⚠️</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--g600)', lineHeight: 1.4 }}>
                  {catTotals[0].label} é a tua maior despesa este mês
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="card fade-up" style={{ marginBottom: 14 }}>
            <div className="empty-state">
              <div className="empty-emoji">💸</div>
              <div className="empty-title">Sem despesas este mês</div>
              <div className="empty-sub">Adiciona a tua primeira despesa para começar a ver os teus padrões.</div>
              <button className="btn btn-primary" style={{ marginTop: 8, width: 'auto', padding: '12px 24px' }}
                onClick={() => onNavigate('add')}>
                + Adicionar agora
              </button>
            </div>
          </div>
        )}

        {/* ── Insights ── */}
        {insights.length > 0 && (
          <div className="card card-padded fade-up" style={{ marginBottom: 14 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Insights personalizados</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {insights.map((ins, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                  padding: '10px 12px', borderRadius: 10,
                  background: ins.type === 'danger' ? 'var(--red-bg)' :
                              ins.type === 'warn'   ? 'var(--amber-bg)' :
                              ins.type === 'ok'     ? 'var(--g50)' : 'var(--surface)'
                }}>
                  <span style={{ fontSize: 18, lineHeight: 1 }}>{ins.icon}</span>
                  <span style={{
                    fontSize: 13, fontWeight: 600, lineHeight: 1.5,
                    color: ins.type === 'danger' ? 'var(--red)' :
                           ins.type === 'ok'     ? 'var(--g600)' : 'var(--text2)'
                  }}>{ins.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Recent expenses ── */}
        {todayExp.length > 0 && (
          <div className="card card-padded fade-up" style={{ marginBottom: 14 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Hoje</div>
            {todayExp.slice(0, 5).map((exp, i) => {
              const cat = CAT_MAP[exp.category]
              return (
                <div key={exp.id}>
                  {i > 0 && <div className="divider" style={{ margin: '8px -18px' }} />}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: i > 0 ? 8 : 0 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 9, background: cat?.light,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
                    }}>{cat?.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{cat?.label}</div>
                      {exp.note && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{exp.note}</div>}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                      {fmtAOA(exp.amount)} <span style={{ fontSize: 11, color: 'var(--muted)' }}>AOA</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── WhatsApp share ── */}
        <button className="btn btn-whatsapp fade-up" style={{ marginBottom: 120 }} onClick={shareWhatsApp}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
          </svg>
          Partilhar no WhatsApp
        </button>
      </div>
    </div>
  )
}

function MetricCard({ label, value, unit, color }) {
  return (
    <div className="card card-padded fade-up" style={{ flex: 1 }}>
      <div className="eyebrow" style={{ marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color, letterSpacing: '-.5px', lineHeight: 1.1 }}>
        {value}
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginLeft: 3 }}>{unit}</span>
      </div>
    </div>
  )
}
