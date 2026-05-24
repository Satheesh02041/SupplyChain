import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isValidUrl = (str) => {
  try {
    new URL(str);
    return true;
  } catch (_) {
    return false;
  }
};

const finalUrl = isValidUrl(supabaseUrl) ? supabaseUrl : 'https://placeholder-project-url.supabase.co';
const finalKey = supabaseAnonKey || 'placeholder-anon-key';

export const isSupabaseConfigured = 
  isValidUrl(supabaseUrl) && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your_supabase_project_url_here') &&
  !supabaseAnonKey.includes('your_supabase_anon_key_here');

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase URL or Anon Key is missing or invalid in your .env file.\n' +
    'Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY correctly.\n' +
    'Falling back to demo mode / local storage mock data.'
  );
}

export const supabase = createClient(finalUrl, finalKey);
