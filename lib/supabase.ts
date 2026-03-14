import { createClient } from '@supabase/supabase-js';

// Fallback keeps cloud sync alive even when Vercel env vars are missing.
const DEFAULT_SUPABASE_URL = 'https://dklvrekamyvtugmbjjnn.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrbHZyZWthbXl2dHVnbWJqam5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5NDAyMTIsImV4cCI6MjA4NDUxNjIxMn0.T9jnmYNIZpaqySM7P8nmL-RAkyV5jgrHmLImf1IJlJY';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Skipping sync until env vars are set.');
}

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
