import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create client - works even without env vars (falls back to localStorage only)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export const isSupabaseEnabled = !!supabase

// ─── Auth helpers ───────────────────────────────────────────────────────────

export async function signInWithMagicLink(email) {
  if (!supabase) throw new Error('Supabase not configured')
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin }
  })
  if (error) throw error
}

export async function signOut() {
  if (!supabase) return
  await supabase.auth.signOut()
}

export async function getSession() {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session
}

// ─── User profile ────────────────────────────────────────────────────────────

export async function upsertUserProfile(userId, { name, income }) {
  if (!supabase) return
  const { error } = await supabase
    .from('users')
    .upsert({ id: userId, name, income }, { onConflict: 'id' })
  if (error) throw error
}

export async function getUserProfile(userId) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) return null
  return data
}

// ─── Expenses ────────────────────────────────────────────────────────────────

export async function fetchExpenses(userId, monthsBack = 3) {
  if (!supabase) return []
  const from = new Date()
  from.setMonth(from.getMonth() - monthsBack)
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .gte('date', from.toISOString().split('T')[0])
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function insertExpense(userId, { amount, category, note, date }) {
  if (!supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase
    .from('expenses')
    .insert({ user_id: userId, amount, category, note: note || null, date })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteExpense(expenseId) {
  if (!supabase) return
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', expenseId)
  if (error) throw error
}

// ─── Savings ─────────────────────────────────────────────────────────────────

export async function fetchSavings(userId) {
  if (!supabase) return null
  const { data } = await supabase
    .from('savings')
    .select('*')
    .eq('user_id', userId)
    .single()
  return data
}

export async function upsertSavings(userId, { current_amount, goal_amount }) {
  if (!supabase) return
  const { error } = await supabase
    .from('savings')
    .upsert({ user_id: userId, current_amount, goal_amount, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
  if (error) throw error
}

// ─── Offline queue sync ──────────────────────────────────────────────────────

const QUEUE_KEY = 'sf_offline_queue'

export function queueExpense(expense) {
  const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')
  queue.push({ ...expense, _queued_at: Date.now() })
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
}

export async function flushOfflineQueue(userId) {
  if (!supabase || !navigator.onLine) return 0
  const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')
  if (!queue.length) return 0

  let synced = 0
  const remaining = []

  for (const item of queue) {
    try {
      await insertExpense(userId, item)
      synced++
    } catch {
      remaining.push(item)
    }
  }

  localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining))
  return synced
}

export function getOfflineQueueCount() {
  return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]').length
}
