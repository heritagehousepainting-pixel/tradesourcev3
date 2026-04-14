// Manual env loader
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

(async () => {
  // Create fresh contractor accounts for E2E testing
  const timestamp = Date.now();
  const contractors = [
    { name: 'E2E Contractor A', email: `e2e.contractor.a.${timestamp}@gmail.com`, password: 'TradeSourceTest@2026!' },
    { name: 'E2E Contractor B', email: `e2e.contractor.b.${timestamp}@gmail.com`, password: 'TradeSourceTest@2026!' },
  ];

  const createdUsers = [];
  
  for (const c of contractors) {
    const { data, error } = await sb.auth.signUp({
      email: c.email,
      password: c.password,
      options: { 
        data: { 
          role: 'contractor', 
          full_name: c.name,
          created_via: 'e2e_test'
        } 
      }
    });
    console.log(`\n${c.name} (${c.email}):`);
    console.log('  Error:', error?.message || 'none');
    console.log('  User:', data.user?.email || 'none');
    console.log('  Confirmed:', data.user?.email_confirmed_at ? 'yes' : 'no - needs confirmation');
    
    if (!error && data.user) {
      createdUsers.push({ ...c, id: data.user.id });
    }
  }
  
  console.log('\n--- Created users (password: TradeSourceTest@2026!) ---');
  createdUsers.forEach(u => console.log(u.email));
  
  // Now try to sign in with the first one
  if (createdUsers.length > 0) {
    const u = createdUsers[0];
    const { data, error } = await sb.auth.signInWithPassword({ email: u.email, password: u.password });
    console.log('\nSign-in attempt:', error ? error.message : 'OK');
    console.log('Session:', data.session ? 'YES' : 'NO');
  }
})().catch(console.error);