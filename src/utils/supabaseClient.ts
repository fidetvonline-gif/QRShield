import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;
let currentUrl: string = '';
let currentKey: string = '';

export function getSupabaseCredentials() {
  const url = (import.meta.env.VITE_SUPABASE_URL as string) || '';
  const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';
  return { url, key };
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getSupabaseCredentials();
  if (!url || !key || url.includes('MY_SUPABASE_URL') || key.includes('MY_SUPABASE_ANON_KEY')) return null;

  if (cachedClient && currentUrl === url && currentKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key);
    currentUrl = url;
    currentKey = key;
    return cachedClient;
  } catch (err) {
    console.error("Failed to initialize Supabase client:", err);
    return null;
  }
}
