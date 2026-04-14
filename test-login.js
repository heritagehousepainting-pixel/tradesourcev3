const fs = require('fs');
const content = fs.readFileSync('.env.local', 'utf8');
const lines = content.split('\n');
const env = {};
lines.forEach(line => {
  const [k, ...v] = line.split('=');
  if (k) env[k.trim()] = v.join('=').trim();
});

const { createClient } = require('@supabase/supabase-js');
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Test login with fresh credentials
(async () => {
  const creds = [
    { email: 'victor.ren.e2e.1776189081125@gmail.com', password: 'TradeSourceTest2026!' },
    { email: 'nadia.flores.e2e.1776189081125@gmail.com', password: 'TradeSourceTest2026!' },
  ];

  for (const c of creds) {
    const { data, error } = await sb.auth.signInWithPassword({ email: c.email, password: c.password });
    console.log(`${c.email}: ${error ? 'FAIL - ' + error.message : 'OK'}`);
    if (!error && data.session) {
      console.log('  Session:', data.session.access_token.slice(0, 20) + '...');
    }
  }
})().catch(console.error);