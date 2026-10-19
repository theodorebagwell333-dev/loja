import Link from 'next/link';
import { getSite, getProducts } from '@/lib/data';
import Garment from '@/components/Garment';
import Photo from '@/components/Photo';
import Card from '@/components/Card';
import DropTabs from '@/components/DropTabs';
import ComingSoon from '@/components/ComingSoon';
import { Mark } from '@/components/Logo';
import { MAIN } from '@/main.config';
import { CATS } from '@/lib/util';

export default async function Home() {
  const [{ s, cols }, ps] = await Promise.all([getSite(), getProducts()]); const logo = s.logo_text;
  const feat = (ps.filter(p => p.featured).length ? ps.filter(p => p.featured) : ps).slice(0, 2);
  return (
    <>
      <section className="hero">
        <div className="ht"><h1>{s.hero_title}</h1><p>{s.hero_subtitle}</p><div><Link className="btn" href="/loja">{s.hero_cta}</Link></div></div>
        <div className="hp">{feat.length ? feat.map(p => p.images?.[0] ? <div key={p.id} className="himg"><Photo src={p.images[0]} alt={p.name} priority /></div> : <Garment key={p.id} type={p.type} color={p.color} logo={logo} print={p.print} />) : <Mark color="#cfc9bb" className="hmark" />}</div>
      </section>
      <section className="sec"><div className="sh"><h2>Novidades</h2>{ps.length > 0 && <Link href="/loja">Ver tudo</Link>}</div>
        {ps.length ? <div className="grid">{ps.slice(0, 8).map(p => <Card key={p.id} p={p} logo={logo} />)}</div> : <ComingSoon wa={s.whatsapp} showBack={false} />}</section>
      <section className="man"><Mark color="#8f8f93" className="mm" /><h2>{s.tagline}</h2></section>
      {cols.length > 0 && <DropTabs cols={cols} products={ps} logo={logo} wa={s.whatsapp} />}
      <section className="sec"><h2>Por peça</h2>
        <div className="cl">{CATS.map(c => { const n = ps.filter(p => p.type === c.id).length; return (
          <Link key={c.id} href={`/loja?t=${c.id}`}><span>{c.nome}</span>{n > 0 ? <small>{n} {n > 1 ? 'peças' : 'peça'}</small> : <small className="pill">{MAIN.emBreve.selo}</small>}</Link>); })}</div></section>
    </>
  );
}
