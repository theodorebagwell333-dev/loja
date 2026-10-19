'use client';
import { useEffect, useState } from 'react';
import { sb } from '@/lib/supabase';
import { brl } from '@/lib/util';
import { Page, useUi } from './ui';

const STATUS = [['novo', 'Novo'], ['pago', 'Pago'], ['enviado', 'Enviado'], ['entregue', 'Entregue'], ['cancelado', 'Cancelado']];

export default function Orders() {
  const { toast } = useUi(); const [list, setList] = useState(null); const [f, setF] = useState('todos');
  const load = async () => setList((await sb.from('orders').select('*').order('created_at', { ascending: false })).data || []);
  useEffect(() => { load(); }, []);
  const shown = (list || []).filter(o => f === 'todos' || o.status === f);
  return (
    <Page title="Pedidos" sub="Os pedidos chegam pelo WhatsApp; aqui você acompanha o andamento.">
      <div className="ad-chips sub">{[['todos', 'Todos'], ...STATUS].map(([k, n]) => <button key={k} className={f === k ? 'on' : ''} onClick={() => setF(k)}>{n}<em>{k === 'todos' ? list?.length ?? 0 : (list || []).filter(o => o.status === k).length}</em></button>)}</div>
      {list && !shown.length && <div className="ad-empty"><h3>Nenhum pedido {f !== 'todos' ? 'nesse status' : 'ainda'}</h3><p>Quando alguém finalizar uma compra, ela aparece aqui.</p></div>}
      <div className="ad-orders">{shown.map(o => (
        <article className="ad-order" key={o.id}>
          <header><div><b>{new Date(o.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</b>
            {(o.customer?.nome || o.customer?.telefone) && <small>{[o.customer?.nome, o.customer?.telefone].filter(Boolean).join(' · ')}</small>}</div>
            <select className={'st ' + o.status} value={o.status} onChange={async e => { await sb.from('orders').update({ status: e.target.value }).eq('id', o.id); toast('Status atualizado.'); load(); }} aria-label="Status do pedido">{STATUS.map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select></header>
          <ul>{o.items?.map((i, k) => <li key={k}><span>{i.qty}× {i.name}</span><small>{[i.color_name, i.size].filter(Boolean).join(' · ')}</small><em>{brl(i.price * i.qty)}</em></li>)}</ul>
          {o.customer?.endereco && <p className="ad-note">{o.customer.endereco}{o.customer.cep ? `, ${o.customer.cep}` : ''}</p>}
          <footer><span>Total</span><b>{brl(o.total)}</b></footer>
        </article>))}</div>
    </Page>
  );
}
