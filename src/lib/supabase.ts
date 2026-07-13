import { createBrowserClient } from "@supabase/ssr";

function getSupabaseCredentials() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && key) {
    return { url, key };
  }

  // Placeholder credentials allow production builds when env vars are injected at deploy time.
  return {
    url: "https://placeholder.supabase.co",
    key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder",
  };
}

const { url: supabaseUrl, key: supabaseAnonKey } = getSupabaseCredentials();

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

export const BASE_CURRENCY_KEY = "enso_base_currency";
