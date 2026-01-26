import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Creamos un cliente que sabe que está en el navegador
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
