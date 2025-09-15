import 'server-only';
import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error('SUPABASE: NEXT_PUBLIC_SUPABASE_URL is missing');
  if (!key) throw new Error('SUPABASE: SUPABASE_SERVICE_ROLE_KEY is missing');
  if (!url.startsWith('https://') || !url.includes('.supabase.co')) {
    throw new Error(`SUPABASE: URL looks wrong: ${url}`);
  }

  return createClient(url, key, { auth: { persistSession: false } });
}
