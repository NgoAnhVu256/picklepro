import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

async function run() {
  console.log("Dropping columns rating and review_count from products...")
  const { error } = await supabaseAdmin.rpc('exec_sql', {
    sql: 'ALTER TABLE products DROP COLUMN IF EXISTS rating; ALTER TABLE products DROP COLUMN IF EXISTS review_count;'
  })
  
  if (error) {
    console.error("RPC exec_sql failed or not found. That's okay, user can run it manually in dashboard.", error)
  } else {
    console.log("Success!")
  }
}

run()
