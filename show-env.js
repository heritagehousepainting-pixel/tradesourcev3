const fs = require('fs');
const content = fs.readFileSync('.env.local', 'utf8');
const lines = content.split('\n');
const env = {};
lines.forEach(line => {
  const [k, ...v] = line.split('=');
  if (k) env[k.trim()] = v.join('=').trim();
});

// Show all non-empty env vars (masked values)
Object.keys(env).forEach(k => {
  const isKey = k.includes('KEY') || k.includes('SECRET') || k.includes('PASSWORD') || k.includes('URL');
  const val = env[k];
  console.log(k + ':', isKey ? val.slice(0,12) + '...' : val);
});