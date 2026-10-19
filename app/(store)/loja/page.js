import Link from 'next/link';
import { getSite, getProducts } from '@/lib/data';
import Card from '@/components/Card';
import ComingSoon from '@/components/ComingSoon';
import { MAIN } from '@/main.config';
import { CATS, TYPES } from '@/lib/util';

export default async function Shop({ searchParams }) {
  const [{ s, cols }, all] = await Promise.all([getSite(), getProducts()]); const { c, t } = searchParams;
  const col = cols.find(x => x.slug === c); let ps = all;
  if (col) ps = ps.filter(p => p.collection_id === col.id); if (t) ps = ps.filter(p => p.type === t);
  const nome = col?.name || TYPES[t];
  return (
    <div className="shop">
      <aside><b>Peças</b><Link href="/loja" className={!c && !t ? 'on' : ''}>Todas</Link>
        {CATS.map(k => <Link key={k.id} href={`/loja?t=${k.id}`} className={t === k.id ? 'on' : ''}>{k.nome}{!all.some(p => p.type === k.id) && <em>{MAIN.emBreve.selo}</em>}</Link>)}
        {cols.length > 0 && <b>Coleções</b>}{cols.map(x => <Link key={x.id} href={`/loja?c=${x.slug}`} className={c === x.slug ? 'on' : ''}>{x.name}</Link>)}</aside>
      <section><h2>{nome || 'Todas as peças'}</h2>{ps.length > 0 && <p className="mut">{ps.length} {ps.length === 1 ? 'peça' : 'peças'}</p>}
        {ps.length ? <div className="grid g3">{ps.map(p => <Card key={p.id} p={p} logo={s.logo_text} />)}</div>
          : <div style={{ marginTop: 24 }}><ComingSoon type={t} nome={nome} wa={s.whatsapp} /></div>}</section>
    </div>
  );
}
