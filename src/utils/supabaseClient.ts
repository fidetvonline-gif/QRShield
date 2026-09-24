import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;
let currentUrl: string = '';
let currentKey: string = '';

export function getSupabaseCredentials() {
  const url = localStorage.getItem('qrshield_supabase_url') || '';
  const key = localStorage.getItem('qrshield_supabase_key') || '';
  return { url, key };
}

export function saveSupabaseCredentials(url: string, key: string) {
  localStorage.setItem('qrshield_supabase_url', url.trim());
  localStorage.setItem('qrshield_supabase_key', key.trim());
  cachedClient = null; // reset cache
}

export function clearSupabaseCredentials() {
  localStorage.removeItem('qrshield_supabase_url');
  localStorage.removeItem('qrshield_supabase_key');
  cachedClient = null;
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getSupabaseCredentials();
  if (!url || !key) return null;

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
