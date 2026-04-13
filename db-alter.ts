import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

async function run() {
  console.log("Altering categories table...")
  const { error } = await supabaseAdmin.rpc('exec_sql', {
    sql: 'ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url text; ALTER TABLE categories DROP COLUMN IF EXISTS icon;'
  })
  
  if (error) {
    console.error("RPC exec_sql failed or not found. That's okay, user can run it manually limit.", error)
  } else {
    console.log("Success!")
  }
}

run()
