import { useState, useCallback } from 'react'
import { CATEGORIES, fmtAOA } from '../lib/utils'

export function AddExpense({ store, onNavigate }) {
  const [amount, setAmount]   = useState('')
  const [category, setCategory] = useState(null)
  const [note, setNote]       = useState('')
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState('')

  const pressNum = useCallback((n) => {
    setAmount(prev => {
      if (prev.length >= 8) return prev
      if (prev === '' && n === '0') return prev
      return prev + n
    })
  }, [])

  const pressBack = useCallback(() => {
    setAmount(prev => prev.slice(0, -1))
  }, [])

  const handleSave = async () => {
    if (!amount || !category) {
      setError(!amount ? 'Introduz um valor' : 'Escolhe uma categoria')
      setTimeout(() => setError(''), 2000)
      return
    }
    setSaving(true)
    try {
      await store.addExpense({ amount: parseInt(amount), category, note })
      setSaved(true)
      setTimeout(() => {
        setSaved(false)
        setAmount('')
        setCategory(null)
        setNote('')
        onNavigate('home')
      }, 1200)
    } catch (e) {
      setError('Erro ao guardar. Tenta novamente.')
      setTimeout(() => setError(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  const displayAmount = amount ? fmtAOA(parseInt(amount)) : '0'

  return (
    <div className="screen" style={{ background: 'var(--surface)' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(160deg, var(--g800), var(--g600))',
        padding: '52px 20px 24px'
      }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', fontWeight: 600, marginBottom: 4 }}>
          Nova despesa
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>
          Quanto gastaste?
        </div>
      </div>

      {/* Amount display */}
      <div style={{ textAlign: 'center', padding: '28px 20px 16px', background: 'var(--card)' }}>
        <div style={{
          fontSize: amount ? 52 : 40, fontWeight: 800,
          color: amount ? 'var(--text)' : 'var(--faint)',
          letterSpacing: '-2px', lineHeight: 1,
          transition: 'font-size .15s ease',
          fontFamily: "'DM Serif Display', serif"
        }}>
          {displayAmount}
          <span style={{
            fontSize: 14, fontWeight: 700, color: 'var(--muted)',
            letterSpacing: 0, verticalAlign: 'super', marginLeft: 4
          }}>AOA</span>
          <span style={{ animation: 'blink 1s step-end infinite', color: 'var(--g400)' }}>|</span>
        </div>
      </div>

      {/* Categories */}
      <div style={{ background: 'var(--card)', borderTop: '1px solid rgba(10,34,24,.06)' }}>
        <div style={{ padding: '14px 16px 10px' }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Categoria</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                style={{
                  background: category === cat.id ? cat.light : 'var(--surface)',
                  border: `2px solid ${category === cat.id ? cat.color : 'transparent'}`,
                  borderRadius: 14, padding: '10px 4px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 4, cursor: 'pointer', transition: 'all .15s',
                  transform: category === cat.id ? 'scale(1.05)' : 'scale(1)'
                }}
              >
                <span style={{ fontSize: 24 }}>{cat.emoji}</span>
                <span style={{
                  fontSize: 9, fontWeight: 800, color: category === cat.id ? cat.color : 'var(--muted)',
                  letterSpacing: '.3px', textTransform: 'uppercase', lineHeight: 1
                }}>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Note input */}
        <div style={{ padding: '0 16px 14px' }}>
          <input
            className="sf-input"
            placeholder="Nota opcional (ex: almoço com colegas)"
            value={note}
            onChange={e => setNote(e.target.value)}
            style={{ fontSize: 14 }}
          />
        </div>
      </div>

      {/* Numpad */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1px', background: 'rgba(10,34,24,.06)',
        margin: '10px 16px', borderRadius: 16, overflow: 'hidden'
      }}>
        {['1','2','3','4','5','6','7','8','9'].map(n => (
          <NumKey key={n} label={n} onPress={() => pressNum(n)} />
        ))}
        <NumKey label="000" onPress={() => {
          if (amount.length + 3 <= 8) setAmount(a => a + '000')
        }} />
        <NumKey label="0" onPress={() => pressNum('0')} />
        <NumKey label="⌫" onPress={pressBack} muted />
      </div>

      {/* Save button */}
      <div style={{ padding: '0 16px 24px' }}>
        {error && (
          <div style={{
            background: 'var(--red-bg)', color: 'var(--red)', padding: '10px 14px',
            borderRadius: 10, fontSize: 13, fontWeight: 600, marginBottom: 10, textAlign: 'center'
          }}>{error}</div>
        )}
        {saved ? (
          <div style={{
            background: 'var(--g50)', color: 'var(--g600)', padding: '16px',
            borderRadius: 14, fontSize: 16, fontWeight: 700, textAlign: 'center',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
          }}>
            <span>✓</span> Despesa guardada!
          </div>
        ) : (
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving || !amount || !category}
          >
            {saving ? <div className="spinner" /> : '+ Guardar despesa'}
          </button>
        )}
      </div>
    </div>
  )
}

function NumKey({ label, onPress, muted }) {
  return (
    <button
      onClick={onPress}
      style={{
        background: 'var(--card)', padding: '18px 8px',
        border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', inherit",
        fontSize: label === '⌫' ? 20 : 22, fontWeight: 700,
        color: muted ? 'var(--muted)' : 'var(--text)',
        transition: 'background .1s', userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
      onTouchStart={e => e.currentTarget.style.background = 'var(--g50)'}
      onTouchEnd={e => e.currentTarget.style.background = 'var(--card)'}
    >
      {label}
    </button>
  )
}
