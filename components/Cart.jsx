'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import Logo from './Logo';
import { sb } from '@/lib/supabase';
import { MAIN } from '@/main.config';
import { brl, waNumber, TYPES } from '@/lib/util';
const Ctx = createContext(null);
export const useCart = () => useContext(Ctx);
export function CartProvider({ children }) {
  const [items, set] = useState([]); const [open, setOpen] = useState(false);
  useEffect(() => { try { set(JSON.parse(localStorage.getItem('cart') || '[]')); } catch {} }, []);
  useEffect(() => { localStorage.setItem('cart', JSON.stringify(items)); }, [items]);
  const add = it => { set(c => { const i = c.findIndex(x => x.id === it.id && x.size === it.size); if (i < 0) return [...c, { ...it, qty: 1 }]; const n = [...c]; n[i].qty++; return n; }); setOpen(true); };
  const inc = (i, d) => set(c => c.map((x, k) => (k === i ? { ...x, qty: x.qty + d } : x)).filter(x => x.qty > 0));
  const total = items.reduce((a, x) => a + x.price * x.qty, 0);
  return <Ctx.Provider value={{ items, add, inc, total, open, setOpen, clear: () => set([]), count: items.reduce((a, x) => a + x.qty, 0) }}>{children}</Ctx.Provider>;
}
export function Header({ s, cols }) {
  const { count, setOpen } = useCart(); const [m, setM] = useState(false);
  return (
    <header className="hd">
      <div className="hl"><button className="burger" onClick={() => setM(!m)}>Menu</button>
        <nav className={m ? 'open' : ''} onClick={() => setM(false)}>
          <Link href="/loja">Loja</Link>{MAIN.menu.filter(id => TYPES[id]).map(id => <Link key={id} href={`/loja?t=${id}`}>{TYPES[id]}</Link>)}{cols.map(c => <Link key={c.id} href={`/loja?c=${c.slug}`}>{c.name}</Link>)}
        </nav></div>
      <Link href="/" aria-label={s.store_name}><Logo s={s} /></Link>
      <button className="bag" onClick={() => setOpen(true)}>Sacola ({count})</button>
    </header>
  );
}
export function Drawer({ wa }) {
  const { open, setOpen, items, inc, total, clear } = useCart(); const [busy, setBusy] = useState(false);
  async function finish() {
    setBusy(true);
    const lines = items.map(i => `${i.qty}x ${i.name} (${i.color_name}, tam. ${i.size}) - ${brl(i.price * i.qty)}${i.slug ? `\n${location.origin}/produto/${i.slug}` : ''}`).join('\n\n');
    const msg = `Olá! Quero finalizar este pedido:\n\n${lines}\n\nTotal: ${brl(total)}`;
    try { await sb.from('orders').insert({ customer: { origem: 'whatsapp' }, items, total }); } catch {}
    localStorage.removeItem('cart'); clear();
    window.location.href = `https://wa.me/${waNumber(wa)}?text=${encodeURIComponent(msg)}`;
  }
  return (
    <>
      {open && <div className="veil" onClick={() => setOpen(false)} />}
      <aside className={'drawer' + (open ? ' on' : '')}>
        <div className="row"><b>Sua sacola</b><button onClick={() => setOpen(false)}>Fechar</button></div>
        {!items.length && <p className="mut">Sua sacola está vazia. Escolha uma peça no drop.</p>}
        {items.map((x, i) => (
          <div className="line" key={i}><div><b>{x.name}</b><br /><small>{x.color_name} · {x.size}</small></div>
            <div className="qty"><button onClick={() => inc(i, -1)}>−</button>{x.qty}<button onClick={() => inc(i, 1)}>+</button></div><span>{brl(x.price * x.qty)}</span></div>
        ))}
        <div className="row tot"><span>Total</span><b>{brl(total)}</b></div>
        {!!items.length && <button className="btn" disabled={busy} onClick={finish}>{busy ? 'Abrindo WhatsApp…' : 'Finalizar pelo WhatsApp'}</button>}
      </aside>
    </>
  );
}
