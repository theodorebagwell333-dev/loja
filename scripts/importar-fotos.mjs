// Envia fotos reais da pasta ./fotos para o Supabase e liga cada uma ao produto.
// Nome do arquivo = slug do produto + opcional "-2", "-3"...  Ex.: camiseta-essencial-preta.jpg, camiseta-essencial-preta-2.jpg
// Uso:  SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/importar-fotos.mjs
import { createClient } from '@supabase/supabase-js';
import { readdirSync, readFileSync } from 'fs';
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const por = {};
for (const f of readdirSync('fotos').filter(f => /\.(jpe?g|png|webp)$/i.test(f)).sort()) {
  const slug = f.replace(/\.[^.]+$/, '').replace(/-\d+$/, ''); (por[slug] ||= []).push(f);
}
for (const [slug, files] of Object.entries(por)) {
  const urls = [];
  for (const f of files) {
    const path = `${Date.now()}-${f}`;
    const { error } = await sb.storage.from('products').upload(path, readFileSync('fotos/' + f), { contentType: f.endsWith('png') ? 'image/png' : f.endsWith('webp') ? 'image/webp' : 'image/jpeg' });
    if (error) { console.log('ERRO', f, error.message); continue; }
    urls.push(sb.storage.from('products').getPublicUrl(path).data.publicUrl);
  }
  const { data, error } = await sb.from('products').update({ images: urls }).eq('slug', slug).select('id');
  console.log(error || !data?.length ? `Produto não encontrado: ${slug}` : `OK ${slug} (${urls.length} foto(s))`);
}
