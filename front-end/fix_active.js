
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.log('Missing env vars');
  process.exit(1);
}

async function run() {
  const res = await fetch(supabaseUrl + '/rest/v1/products?is_active=eq.false', {
    method: 'PATCH',
    headers: {
      'apikey': supabaseKey,
      'Authorization': 'Bearer ' + supabaseKey,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ is_active: true })
  });
  
  if (!res.ok) {
    console.error(await res.text());
  } else {
    const data = await res.json();
    console.log('Updated', data.length, 'products to is_active=true');
  }
}

run();

