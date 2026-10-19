import Link from 'next/link';
import { sb } from '@/lib/supabase';
import { getSite } from '@/lib/data';
import Garment from '@/components/Garment';
import Buy from './Buy';
import Back from '@/components/Back';
import Gallery from '@/components/Gallery';
import { brl, isSoon } from '@/lib/util';
import { MAIN } from '@/main.config';

export default async function Product({ params }) {
  const [{ s }, { data: p }] = await Promise.all([getSite(), sb.from('products').select('*').eq('slug', params.slug).eq('active', true).single()]);
  if (!p) return <div className="sec"><p>Peça não encontrada.</p><Link className="btn ghost" href="/loja">Ver a loja</Link></div>;
  const soon = isSoon(p);
  return (
    <><div className="bk"><Back /></div><div className="pd">
      {p.images?.length ? <Gallery images={p.images} alt={p.name} /> : <div className="gal"><div className="ph"><Garment type={p.type} color={p.color} logo={s.logo_text} print={p.print} tagline={s.tagline} /></div></div>}
      <div><h1>{p.name}</h1><div className="pr">{soon ? MAIN.emBreve.selo : brl(p.price)}</div><p className="mut">Cor: {p.color_name}</p>
        <Buy p={p} wa={s.whatsapp} /><p style={{ marginTop: 24 }}>{p.description}</p></div>
    </div></>
  );
}
