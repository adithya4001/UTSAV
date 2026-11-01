Standalone Vercel edition of the current browser-only hackathon prototype. Builds the same introduction, auth screens and organiser components with Vite. No Cloudflare or Supabase backend is deployed. Demo accounts and event data are scoped to the deployment origin in browser storage. Existing accounts on the chatgpt.site URL do not transfer.

Build from repository root:

node node_modules/vite/bin/vite.js build --config deployment/vercel/vite.config.mjs
cp deployment/vercel/vercel.json deployment/vercel/dist/vercel.json

Deploy the contents of deployment/vercel/dist as a static Vercel project. Route rewrites preserve direct login/register/workspace links.
