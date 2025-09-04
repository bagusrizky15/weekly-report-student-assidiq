import { createClient } from "@supabase/supabase-js"
import { SupabaseClient } from "@supabase/supabase-js"

// Only initialize if we're on the server and have the required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabaseAdmin: SupabaseClient | null = null;

if (typeof window === 'undefined' && supabaseUrl && supabaseRoleKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseRoleKey)
}

export { supabaseAdmin }
