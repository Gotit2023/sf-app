# SF — Sistema de Sobrevivência Financeira 🇦🇴

> O teu coach financeiro pessoal. Simples. Rápido. Feito para Angola.

---

## Quick Start (5 minutes)

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

### 3. Run the app
```bash
npm run dev
# Open http://localhost:5173
# Works fully offline without Supabase
```

---

## Supabase Setup (cloud sync + auth)

1. Create project at https://app.supabase.com (free tier)
2. SQL Editor → New Query → paste `schema.sql` → Run
3. Settings → API → copy URL and anon key into `.env.local`
4. Authentication → URL Configuration → add your domain to Redirect URLs

---

## Build & Deploy

```bash
npm run build          # outputs to dist/

# Vercel (recommended)
npx vercel
# Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel dashboard

# Netlify
npx netlify deploy --prod --dir=dist
```

---

## Project Structure

```
src/
  components/   Logo.jsx, BottomNav.jsx
  screens/      Dashboard, AddExpense, Overview, Savings, Settings, AuthCallback
  hooks/        useAppStore.js   (central state + Supabase sync)
  lib/          supabase.js, utils.js
  App.jsx       root + routing
  index.css     design tokens + global styles
schema.sql      Supabase DB schema (run this first)
```

---

## Features

| Feature | Notes |
|---------|-------|
| Add expense (numpad) | Offline-first |
| Dashboard with daily totals | Live calculations |
| Monthly overview + pie chart | Chart.js |
| Emergency fund tracker | Savings goal |
| Daily challenge + insights | Pattern detection |
| WhatsApp share | Monthly summary |
| PWA / Add to home screen | manifest + SW |
| Offline support | localStorage queue |
| Magic link auth | No password |
| Cloud sync | Auto on reconnect |

---

## Tech Stack

React 18 + Vite · CSS Variables · Chart.js · Supabase · vite-plugin-pwa

Made with love for Angola 🇦🇴
