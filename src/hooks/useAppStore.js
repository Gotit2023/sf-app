import { useState, useEffect, useCallback, useRef } from 'react'
import {
  supabase, isSupabaseEnabled,
  fetchExpenses, insertExpense, deleteExpense,
  fetchSavings, upsertSavings,
  getUserProfile, upsertUserProfile,
  queueExpense, flushOfflineQueue, getOfflineQueueCount
} from '../lib/supabase'

const LS = {
  user: 'sf_user',
  expenses: 'sf_expenses',
  savings: 'sf_savings',
  session: 'sf_session'
}

function lsGet(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback }
  catch { return fallback }
}
function lsSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}

export function useAppStore() {
  const [user, setUser] = useState(() => lsGet(LS.user, { name: 'Utilizador', income: 200000 }))
  const [session, setSession] = useState(null)
  const [expenses, setExpenses] = useState(() => lsGet(LS.expenses, []))
  const [savings, setSavings] = useState(() => lsGet(LS.savings, { current_amount: 0, goal_amount: 150000 }))
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [offlineCount, setOfflineCount] = useState(getOfflineQueueCount)
  const syncTimer = useRef(null)

  // ── Auth listener ──────────────────────────────────────────────
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session) loadRemoteData(data.session.user.id)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess)
      if (sess) loadRemoteData(sess.user.id)
    })
    return () => subscription.unsubscribe()
  }, [])

  // ── Online event: flush queue ─────────────────────────────────
  useEffect(() => {
    const handleOnline = async () => {
      if (session) {
        setSyncing(true)
        await flushOfflineQueue(session.user.id)
        setOfflineCount(0)
        await loadRemoteData(session.user.id)
        setSyncing(false)
      }
    }
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [session])

  // ── Load from Supabase ─────────────────────────────────────────
  async function loadRemoteData(userId) {
    try {
      setLoading(true)
      const [profile, remoteExpenses, remoteSavings] = await Promise.all([
        getUserProfile(userId),
        fetchExpenses(userId, 3),
        fetchSavings(userId)
      ])
      if (profile) { setUser(profile); lsSet(LS.user, profile) }
      if (remoteExpenses) { setExpenses(remoteExpenses); lsSet(LS.expenses, remoteExpenses) }
      if (remoteSavings) { setSavings(remoteSavings); lsSet(LS.savings, remoteSavings) }
    } catch (e) {
      console.warn('Remote load failed, using local data:', e.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Add expense ────────────────────────────────────────────────
  const addExpense = useCallback(async ({ amount, category, note = '' }) => {
    const date = new Date().toISOString().split('T')[0]
    const optimistic = {
      id: `local_${Date.now()}`,
      amount, category, note, date,
      created_at: new Date().toISOString(),
      _pending: true
    }

    // Optimistic update
    setExpenses(prev => {
      const next = [optimistic, ...prev]
      lsSet(LS.expenses, next)
      return next
    })

    if (session && navigator.onLine) {
      try {
        const saved = await insertExpense(session.user.id, { amount, category, note, date })
        setExpenses(prev => {
          const next = prev.map(e => e.id === optimistic.id ? saved : e)
          lsSet(LS.expenses, next)
          return next
        })
      } catch {
        queueExpense({ amount, category, note, date })
        setOfflineCount(getOfflineQueueCount())
      }
    } else if (session) {
      queueExpense({ amount, category, note, date })
      setOfflineCount(getOfflineQueueCount())
    }
  }, [session])

  // ── Delete expense ─────────────────────────────────────────────
  const removeExpense = useCallback(async (id) => {
    setExpenses(prev => {
      const next = prev.filter(e => e.id !== id)
      lsSet(LS.expenses, next)
      return next
    })
    if (session && !String(id).startsWith('local_')) {
      await deleteExpense(id).catch(console.warn)
    }
  }, [session])

  // ── Update savings ─────────────────────────────────────────────
  const updateSavings = useCallback(async (updates) => {
    const next = { ...savings, ...updates }
    setSavings(next)
    lsSet(LS.savings, next)
    if (session) {
      await upsertSavings(session.user.id, next).catch(console.warn)
    }
  }, [savings, session])

  // ── Update user profile ────────────────────────────────────────
  const updateUser = useCallback(async (updates) => {
    const next = { ...user, ...updates }
    setUser(next)
    lsSet(LS.user, next)
    if (session) {
      await upsertUserProfile(session.user.id, next).catch(console.warn)
    }
  }, [user, session])

  return {
    user, session, expenses, savings,
    loading, syncing, offlineCount,
    addExpense, removeExpense, updateSavings, updateUser,
    isAuthenticated: !!session,
    isSupabaseEnabled,
    reload: () => session && loadRemoteData(session.user.id)
  }
}
