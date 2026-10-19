'use client';
import { useState } from 'react';
import Link from 'next/link';
import Card from './Card';
import ComingSoon from './ComingSoon';
export default function DropTabs({ cols, products, logo, wa }) {
  const [a, setA] = useState(cols[0]?.id);
  const list = products.filter(p => p.collection_id === a).slice(0, 8);
  const col = cols.find(c => c.id === a);
  return (
    <section className="sec"><h2>Coleções</h2><div className="tabs">{cols.map(c => <button key={c.id} className={c.id === a ? 'on' : ''} onClick={() => setA(c.id)}>{c.name}</button>)}</div>
      {list.length ? <div className="grid">{list.map(p => <Card key={p.id} p={p} logo={logo} />)}</div>
        : <ComingSoon compact nome={col?.name} text={`A coleção ${col?.name || ''} está a caminho. Estamos finalizando cada detalhe para o lançamento.`} wa={wa} showBack={false} />}
      {list.length > 0 && col && <Link className="btn ghost" href={`/loja?c=${col.slug}`}>Ver coleção completa</Link>}
    </section>
  );
}
