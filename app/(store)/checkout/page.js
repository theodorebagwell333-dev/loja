'use client';
import { useState } from 'react';
import { sb } from '@/lib/supabase';
import { useCart } from '@/components/Cart';
import { brl } from '@/lib/util';
export default function Checkout() {
  const { items, total, clear } = useCart(); const [f, setF] = useState({}); const [err, setErr] = useState('');
  const set = k => e => setF({ ...f, [k]: e.target.value });
  async function go(e) {
    e.preventDefault(); setErr('');
    const { error } = await sb.from('orders').insert({ customer: f, items, total });
    if (error) return setErr('Não foi possível registrar o pedido. Tente novamente.');
    const { data } = await sb.from('settings').select('data').eq('id', 1).single();
    const msg = `Pedido de ${f.nome}%0A${items.map(i => `${i.qty}x ${i.name} (${i.size})`).join('%0A')}%0ATotal: ${brl(total)}%0AEntrega: ${f.endereco}, ${f.cep}`;
    clear(); window.location.href = `https://wa.me/${data.data.whatsapp}?text=${msg}`;
  }
  if (!items.length) return <p className="sec">Sua sacola está vazia.</p>;
  return (
    <form className="form" onSubmit={go}><h2 style={{ fontSize: 40 }}>Finalizar compra</h2>
      <input required placeholder="Nome completo" onChange={set('nome')} /><input required type="email" placeholder="E-mail" onChange={set('email')} />
      <input required placeholder="WhatsApp" onChange={set('telefone')} /><input required placeholder="CEP" onChange={set('cep')} />
      <textarea required placeholder="Endereço completo" onChange={set('endereco')} />
      <b>Total: {brl(total)}</b>{err && <p style={{ color: '#a00' }}>{err}</p>}
      <button className="btn">Enviar pedido pelo WhatsApp</button></form>
  );
}
