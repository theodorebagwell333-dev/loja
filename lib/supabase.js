import { createClient } from '@supabase/supabase-js';
// no-store: o site sempre mostra o que está no banco (sem cache do Next)
export const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'anon', { global: { fetch: (u, o) => fetch(u, { ...o, cache: 'no-store' }) } });
