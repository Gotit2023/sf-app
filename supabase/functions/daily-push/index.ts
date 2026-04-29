// supabase/functions/daily-push/index.ts
// Deploy with: supabase functions deploy daily-push
// Schedule in Supabase Dashboard → Edge Functions → Schedules
// Cron: 0 18 * * *  (6pm UTC = 7pm WAT Angola time)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_PUBLIC  = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_SUBJECT = 'mailto:admin@sf-angola.app'

const CHALLENGES = [
  'Evita gastar em algo desnecessário hoje.',
  'Regista cada kz que gastas — mesmo o pequeno.',
  'Antes de comprar: preciso mesmo disto?',
  'Leva comida de casa. Poupa em transporte e comida.',
  'Define um limite de gastos para hoje e cumpre-o.',
  'Identifica um gasto desta semana que foi desnecessário.',
  'Faz uma lista antes de ir às compras. Não desvies.',
]

Deno.serve(async (req) => {
  // Verify this is called by Supabase cron (add auth header check in prod)
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('subscription')

  if (error) return new Response(JSON.stringify({ error }), { status: 500 })

  const challenge = CHALLENGES[new Date().getDay() % CHALLENGES.length]
  let sent = 0

  for (const { subscription } of subscriptions) {
    try {
      await sendWebPush(subscription, {
        title: 'SF — Desafio do dia 💡',
        body: challenge,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        url: '/'
      })
      sent++
    } catch (e) {
      console.error('Push failed:', e)
    }
  }

  return new Response(JSON.stringify({ sent, total: subscriptions.length }), {
    headers: { 'Content-Type': 'application/json' }
  })
})

async function sendWebPush(subscription: any, payload: object) {
  // Use web-push library or implement VAPID signing
  // For production, use: https://esm.sh/web-push
  const webpush = await import('https://esm.sh/web-push@3')
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE)
  await webpush.sendNotification(subscription, JSON.stringify(payload))
}
