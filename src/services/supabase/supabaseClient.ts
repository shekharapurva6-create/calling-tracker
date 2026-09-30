import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseAnonKey.includes('your-supabase-anon-key')
  );
};

// Returns normalized list of the 2 authorized Admin email addresses from env vars
export const getAuthorizedAdminEmails = (): string[] => {
  const email1 = (import.meta.env.VITE_ADMIN_EMAIL_1 || '').trim().toLowerCase();
  const email2 = (import.meta.env.VITE_ADMIN_EMAIL_2 || '').trim().toLowerCase();
  
  const emails: string[] = [];
  if (email1) emails.push(email1);
  if (email2) emails.push(email2);
  return emails;
};

export const isAuthorizedAdminEmail = (email: string): boolean => {
  const clean = email.trim().toLowerCase();
  if (!clean) return false;
  const authorized = getAuthorizedAdminEmails();
  // If no env vars configured yet, fallback to the authorized admin email
  if (authorized.length === 0) {
    return clean === 'nexaigen0@gmail.com';
  }
  return authorized.includes(clean);
};

export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);
