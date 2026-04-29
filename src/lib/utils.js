export const CATEGORIES = [
  { id: 'comida',     label: 'Comida',     emoji: '🍽️', color: '#f5a623', light: '#fff5e6' },
  { id: 'transporte', label: 'Transporte', emoji: '🚕', color: '#4a90d9', light: '#e6f2ff' },
  { id: 'casa',       label: 'Casa',       emoji: '🏠', color: '#9b59b6', light: '#f3eaff' },
  { id: 'dados',      label: 'Dados',      emoji: '📶', color: '#27ae60', light: '#e6f9ee' },
  { id: 'outros',     label: 'Outros',     emoji: '📦', color: '#95a5a6', light: '#f2f4f4' },
]

export const CAT_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c]))

export const DAILY_CHALLENGES = [
  'Evita gastar em algo desnecessário hoje.',
  'Regista cada kz que gastas — mesmo o pequeno.',
  'Antes de comprar: preciso mesmo disto?',
  'Leva comida de casa. Poupa em transporte e comida.',
  'Define um limite de gastos para hoje e cumpre-o.',
  'Identifica um gasto da semana passada que foi desnecessário.',
  'Faz uma lista antes de ir às compras. Não desvies.',
]

export const DAILY_MOTIVATIONS = [
  'Hoje vais controlar melhor. 💪',
  'Cada kz poupado é um passo para a liberdade.',
  'Controlo hoje = segurança amanhã.',
  'Tu consegues. Um dia de cada vez.',
  'A tua melhor versão financeira começa agora.',
  'Pequenos hábitos, grandes mudanças.',
  'Gasta com intenção, não por impulso.',
]

export function getTodayChallenge() {
  const day = new Date().getDay()
  return DAILY_CHALLENGES[day % DAILY_CHALLENGES.length]
}

export function getTodayMotivation() {
  const day = new Date().getDay()
  return DAILY_MOTIVATIONS[day % DAILY_MOTIVATIONS.length]
}

export function fmtAOA(n) {
  return Number(n || 0).toLocaleString('pt-PT')
}

export function fmtDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-PT', {
    day: '2-digit', month: 'short'
  })
}

export function getMonthExpenses(expenses) {
  const m = new Date().getMonth()
  const y = new Date().getFullYear()
  return expenses.filter(e => {
    const d = new Date(e.date + 'T00:00:00')
    return d.getMonth() === m && d.getFullYear() === y
  })
}

export function getTodayExpenses(expenses) {
  const today = new Date().toISOString().split('T')[0]
  return expenses.filter(e => e.date === today)
}

export function getCategoryTotals(expenses) {
  const totals = {}
  for (const e of expenses) {
    totals[e.category] = (totals[e.category] || 0) + e.amount
  }
  return CATEGORIES.map(c => ({ ...c, total: totals[c.id] || 0 })).filter(c => c.total > 0)
    .sort((a, b) => b.total - a.total)
}

export function generateInsights(expenses, income) {
  const monthExp = getMonthExpenses(expenses)
  const total = monthExp.reduce((s, e) => s + e.amount, 0)
  const catTotals = getCategoryTotals(monthExp)
  const insights = []

  if (!catTotals.length) return insights

  const top = catTotals[0]
  const pct = total > 0 ? Math.round(top.total / total * 100) : 0

  if (pct >= 40) insights.push({ type: 'warn', icon: top.emoji, text: `${top.label} representa ${pct}% dos teus gastos este mês` })
  if (income > 0 && total > income * 0.9) insights.push({ type: 'danger', icon: '⚠️', text: 'Atenção: estás perto do limite do teu rendimento!' })
  if (income > 0 && total < income * 0.6) insights.push({ type: 'ok', icon: '✅', text: 'Bom trabalho! Estás dentro do orçamento este mês.' })

  const transport = catTotals.find(c => c.id === 'transporte')
  if (transport && total > 0 && transport.total / total > 0.25) {
    insights.push({ type: 'info', icon: '🚕', text: 'Transporte está alto esta semana. Considera alternativas.' })
  }

  insights.push({ type: 'tip', icon: '💡', text: 'Pequenos gastos somem muito. Regista tudo, sem excepção.' })

  return insights.slice(0, 4)
}
