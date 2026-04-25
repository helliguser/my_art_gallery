import { createClient } from '@supabase/supabase-js';

export async function createClient() {
  console.log('[supabase-server] Creating client with URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}