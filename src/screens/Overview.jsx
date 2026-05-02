import { useMemo, useEffect, useRef, useState } from 'react'
import {
  fmtAOA, fmtDate, getMonthExpenses, getCategoryTotals,
  CAT_MAP, CATEGORIES, generateInsights
} from '../lib/utils'

export function Overview({ store, onNavigate }) {
  const { expenses, user } = store
  const [tab, setTab] = useState('month')

  const monthExp  = useMemo(() => getMonthExpenses(expenses), [expenses])
  const allExp    = expenses
  const displayed = tab === 'month' ? monthExp : allExp
  const total     = displayed.reduce((s, e) => s + e.amount, 0)
  const catTotals = useMemo(() => getCategoryTotals(displayed), [displayed])
  const insights  = useMemo(() => generateInsights(expenses, user.income), [expenses, user.income])
  const canvasRef = useRef()
  const chartRef  = useRef()

  useEffect(() => {
    if (!canvasRef.current || !catTotals.length) return
    import('chart.js').then(({ Chart, ArcElement, Tooltip, Legend }) => {
      Chart.register(ArcElement, Tooltip, Legend)
      if (chartRef.current) chartRef.current.destroy()
      chartRef.current = new Chart(canvasRef.current, {
        type: 'doughnut',
        data: {
          labels: catTotals.map(c => c.label),
          datasets: [{
            data: catTotals.map(c => c.total),
            backgroundColor: catTotals.map(c => c.color),
            borderWidth: 3,
            borderColor: '#ffffff',
            hoverOffset: 8
          }]
        },
        options: {
          cutout: '68%',
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: ctx => ` ${ctx.label}: ${fmtAOA(ctx.raw)} AOA (${Math.round(ctx.raw / total * 100)}%)`
              }
            }
          },
          animation: { animateRotate: true, duration: 700 }
        }
      })
    })
    return () => { if (chartRef.current) chartRef.current.destroy() }
  }, [catTotals, tab])

  // Group by date for the list view
  const grouped = useMemo(() => {
    const g = {}
    for (const e of displayed) {
      if (!g[e.date]) g[e.date] = []
      g[e.date].push(e)
    }
    return Object.entries(g).sort(([a], [b]) => b.localeCompare(a))
  }, [displayed])

  return (
    <div className="screen" style={{overflowY:"scroll",WebkitOverflowScrolling:"touch"}}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(160deg, var(--g800), var(--g600))',
        padding: '52px 20px 28px'
      }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.55)', marginBottom: 4, fontWeight: 600 }}>
          {tab === 'month' ? 'Este mês' : 'Tudo'}
        </div>
        <div style={{ fontSize: 34, fontWeight: 800, color: 'white', letterSpacing: '-1px' }}>
          {fmtAOA(total)}
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', marginTop: 4, fontWeight: 500 }}>
          Total em despesas · {displayed.length} transacções
        </div>
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 16px', background: 'var(--card)', borderBottom: '1px solid rgba(10,34,24,.07)' }}>
        {[['month','Este mês'], ['all','Tudo']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding: '8px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
            background: tab === id ? 'var(--g500)' : 'var(--surface)',
            color: tab === id ? 'white' : 'var(--muted)',
            transition: 'all .18s'
          }}>{label}</button>
        ))}
      </div>

      <div style={{ padding: '16px 16px 0' }}>

        {catTotals.length === 0 ? (
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="empty-state">
              <div className="empty-emoji">📊</div>
              <div className="empty-title">Sem dados ainda</div>
              <div className="empty-sub">Adiciona despesas para ver os teus padrões financeiros.</div>
              <button className="btn btn-primary" style={{ marginTop: 8, width: 'auto', padding: '12px 24px' }}
                onClick={() => onNavigate('add')}>+ Adicionar despesa</button>
            </div>
          </div>
        ) : (
          <>
            {/* Pie chart */}
            <div className="card card-padded fade-up" style={{ marginBottom: 14 }}>
              <div className="eyebrow" style={{ marginBottom: 14 }}>Para onde vai o dinheiro</div>
              <div style={{ position: 'relative', height: 200 }}>
                <canvas ref={canvasRef} />
                {/* Centre label */}
                <div style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none'
                }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>TOTAL</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', letterSpacing: '-.5px' }}>
                    {fmtAOA(total)}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--muted)' }}>AOA</div>
                </div>
              </div>
              {/* Legend */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', marginTop: 12, justifyContent: 'center' }}>
                {catTotals.map(c => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)' }}>
                      {c.label} {Math.round(c.total / total * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category bars */}
            <div className="card card-padded fade-up" style={{ marginBottom: 14 }}>
              <div className="eyebrow" style={{ marginBottom: 14 }}>Detalhes por categoria</div>
              {catTotals.map((cat, i) => {
                const pct = Math.round(cat.total / total * 100)
                return (
                  <div key={cat.id}>
                    {i > 0 && <div className="divider" style={{ margin: '12px -18px' }} />}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10, background: cat.light,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0
                      }}>{cat.emoji}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: 14, fontWeight: 600 }}>{cat.label}</span>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: 14, fontWeight: 700 }}>{fmtAOA(cat.total)}</span>
                            <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 2 }}>AOA</span>
                          </div>
                        </div>
                        <div style={{ height: 6, background: 'var(--surface)', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: cat.color, borderRadius: 99, transition: 'width .6s' }} />
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3, fontWeight: 600 }}>
                          {pct}% do total · {displayed.filter(e => e.category === cat.id).length} transacções
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Insights */}
            {insights.length > 0 && (
              <div className="card card-padded fade-up" style={{ marginBottom: 14 }}>
                <div className="eyebrow" style={{ marginBottom: 12 }}>Insights</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {insights.map((ins, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 12px',
                      borderRadius: 10, background: ins.type === 'danger' ? 'var(--red-bg)' :
                        ins.type === 'warn' ? 'var(--amber-bg)' : ins.type === 'ok' ? 'var(--g50)' : 'var(--surface)'
                    }}>
                      <span style={{ fontSize: 16, lineHeight: 1.2 }}>{ins.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.5, color: 'var(--text2)' }}>{ins.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transaction list */}
            {grouped.length > 0 && (
              <div className="card fade-up" style={{ marginBottom: 24 }}>
                <div style={{ padding: '14px 18px 10px' }}>
                  <div className="eyebrow">Transacções</div>
                </div>
                {grouped.map(([date, exps]) => (
                  <div key={date}>
                    <div style={{ padding: '6px 18px', background: 'var(--surface)' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}>
                        {fmtDate(date)}
                      </span>
                    </div>
                    {exps.map((exp, i) => {
                      const cat = CAT_MAP[exp.category]
                      return (
                        <div key={exp.id} style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '12px 18px',
                          borderTop: i > 0 ? '1px solid rgba(10,34,24,.05)' : 'none'
                        }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: 9, background: cat?.light,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0
                          }}>{cat?.emoji}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{cat?.label}</div>
                            {exp.note && <div style={{ fontSize: 12, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exp.note}</div>}
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                              {fmtAOA(exp.amount)}
                            </div>
                            <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600 }}>AOA</div>
                          </div>
                          <button
                            onClick={() => store.removeExpense(exp.id)}
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer',
                              color: 'var(--faint)', fontSize: 16, padding: '4px', flexShrink: 0
                            }}
                          >×</button>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
