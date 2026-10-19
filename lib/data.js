import { cache } from 'react';
import { sb } from './supabase';
import { MAIN } from '@/main.config';

// Campo vazio no admin → usa o padrão do main.config.js
const withDefaults = (data = {}) => {
  const out = { ...data };
  for (const [k, v] of Object.entries(MAIN.loja)) if (out[k] === undefined || out[k] === null || String(out[k]).trim() === '') out[k] = v;
  return out;
};

// cache() = a mesma consulta roda uma vez por requisição (layout + página dividem o resultado)
export const getSite = cache(async () => {
  const [s, c] = await Promise.all([sb.from('settings').select('data').eq('id', 1).single(), sb.from('collections').select('*').eq('active', true).order('sort')]);
  return { s: withDefaults(s.data?.data), cols: c.data || [] };
});
export const getProducts = cache(async () => {
  const { data } = await sb.from('products').select('*').eq('active', true).order('created_at', { ascending: false });
  return data || [];
});
