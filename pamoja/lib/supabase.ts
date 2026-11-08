import { createBrowserClient } from '@supabase/ssr';
export const configured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
export function supabase(){
 if(!configured) throw new Error('Configure Supabase in .env.local first. See README.');
 return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}
