'use client';
import { useState } from 'react';
import { useCart } from '@/components/Cart';
import { MAIN } from '@/main.config';
import { fill, isSoon, waLink } from '@/lib/util';
import { ordenarTamanhos } from '@/lib/tamanhos';

export default function Buy({ p, wa }) {
  const [size, setSize] = useState(''); const { add } = useCart();
  if (isSoon(p)) {
    const E = MAIN.emBreve;
    return (
      <div className="soonbox"><small className="soon-eye"><i className="dot" />{E.chamada}</small>
        <b>{E.selo}</b><p>{E.textoProduto}</p>
        <a className="btn" href={waLink(wa, fill(E.mensagemWhatsApp, p.name))} target="_blank" rel="noopener">{E.botaoAvisar}</a></div>
    );
  }
  const sizes = p.sizes || {};
  const ok = Object.values(sizes).some(v => v > 0);
  return (
    <>
      <b>Tamanho</b>
      <div className="sz">{ordenarTamanhos(Object.keys(sizes)).map(k => <button key={k} disabled={sizes[k] <= 0} className={size === k ? 'on' : ''} onClick={() => setSize(k)}>{k}</button>)}</div>
      <button className="btn" disabled={!ok || !size} style={{ width: '100%', opacity: !ok || !size ? .5 : 1 }}
        onClick={() => add({ id: p.id, slug: p.slug, name: p.name, price: p.price, color_name: p.color_name, size })}>{ok ? (size ? 'Adicionar à sacola' : 'Escolha um tamanho') : 'Esgotado'}</button>
    </>
  );
}
