// Create E2E test contractor accounts directly via admin API
const fs = require('fs');
const content = fs.readFileSync('.env.local', 'utf8');
const lines = content.split('\n');
const env = {};
lines.forEach(line => {
  const [k, ...v] = line.split('=');
  if (k) env[k.trim()] = v.join('=').trim();
});

// Use service role key for admin operations
const sbAdminUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const sbAdminKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY;

if (!sbAdminKey) {
  console.log('No service role key found!');
  console.log('Available keys:', Object.keys(env).filter(k => k.includes('KEY') || k.includes('SECRET')));
  process.exit(1);
}

const { createClient } = require('@supabase/supabase-js');
const sbAdmin = createClient(sbAdminUrl, sbAdminKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

(async () => {
  const timestamp = Date.now();
  const contractors = [
    { name: 'Victor Ren', email: `victor.ren.e2e.${timestamp}@gmail.com` },
    { name: 'Nadia Flores', email: `nadia.flores.e2e.${timestamp}@gmail.com` },
  ];

  for (const c of contractors) {
    console.log(`\nCreating ${c.name} (${c.email})...`);
    
    // Create auth user directly with admin API
    const { data: user, error } = await sbAdmin.auth.admin.createUser({
      email: c.email,
      password: 'TradeSourceTest2026!',
      email_confirm: true, // skip email confirmation
      user_metadata: { full_name: c.name, role: 'contractor' }
    });
    
    if (error) {
      console.log('  Error:', error.message);
    } else {
      console.log('  Created:', user.user.email, '- ID:', user.user.id);
      
      // Also create a contractor_applications record
      const { error: appErr } = await sbAdmin
        .from('contractor_applications')
        .upsert([{
          email: c.email,
          name: c.name,
          company: c.name + ' Painting',
          status: 'approved',
          auth_user_id: user.user.id,
          verified_license: true,
          verified_insurance: true,
          verified_w9: true,
        }], { onConflict: 'email' });
      
      console.log('  Application record:', appErr ? appErr.message : 'created/updated');
    }
  }
  
  // List existing approved contractors to find any we can use
  console.log('\n--- Looking for existing approved contractors ---');
  const { data: existing } = await sbAdmin
    .from('contractor_applications')
    .select('email, name, status, auth_user_id')
    .eq('status', 'approved')
    .limit(5);
  
  if (existing && existing.length > 0) {
    existing.forEach(c => console.log('Approved:', c.email, c.name, c.auth_user_id ? '(has auth)' : '(no auth)'));
  } else {
    console.log('No approved contractors found');
  }
})().catch(console.error);