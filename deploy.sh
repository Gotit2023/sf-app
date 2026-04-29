#!/bin/bash
# SF App — Deploy helper
# Usage: bash deploy.sh

set -e

echo "🇦🇴 SF — Sistema de Sobrevivência Financeira"
echo "================================================"
echo ""

# Check .env.local exists
if [ ! -f ".env.local" ]; then
  echo "⚠️  .env.local not found."
  echo "   Run: cp .env.example .env.local"
  echo "   Then fill in your Supabase credentials."
  echo ""
fi

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔨 Building for production..."
npm run build

echo ""
echo "✅ Build complete! Output in dist/"
echo ""
echo "📋 Next steps:"
echo "   1. Deploy to Vercel:  npx vercel"
echo "   2. Or Netlify:        npx netlify deploy --prod --dir=dist"
echo ""
echo "   Remember to set these env vars in your hosting dashboard:"
echo "   - VITE_SUPABASE_URL"
echo "   - VITE_SUPABASE_ANON_KEY"
echo ""
echo "🗄️  Database: Run schema.sql in your Supabase SQL editor"
echo ""
