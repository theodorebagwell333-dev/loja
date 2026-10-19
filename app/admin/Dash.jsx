'use client';
import { useEffect, useState } from 'react';
import { sb } from '@/lib/supabase';
import { MAIN } from '@/main.config';
import { brl, isSoon, soldOut, stockTotal } from '@/lib/util';
import { Ic, Page } from './ui';

export default function Dash({ go, name }) {
  const [d, setD] = useState(null);
  useEffect(() => { (async () => {
    const [p, o] = await Promise.all([sb.from('products').select('id,name,sizes,images,active,coming_soon'), sb.from('orders').select('total,status')]);
    const ps = p.data || [], os = o.data || [];
    setD({
      total: ps.length, venda: ps.filter(x => x.active && !isSoon(x)).length, soon: ps.filter(isSoon).length,
      novos: os.filter(x => x.status === 'novo').length, pedidos: os.length, rev: os.filter(x => x.status !== 'cancelado').reduce((a, x) => a + Number(x.total || 0), 0),
      esgotado: ps.filter(x => x.active && soldOut(x)), baixo: ps.filter(x => x.active && !isSoon(x) && !soldOut(x) && stockTotal(x) <= MAIN.estoqueBaixo), semfoto: ps.filter(x => !x.images?.length),
    });
  })(); }, []);
  const Item = ({ icon, t, list, filtro, tone }) => !!list?.length && (
    <button className={'ad-att ' + tone} onClick={() => go('Produtos', { filtro })}>
      <Ic n={icon} s={20} /><span><b>{list.length} {t}</b><small>{list.slice(0, 3).map(x => x.name).join(', ')}{list.length > 3 ? '…' : ''}</small></span><Ic n="right" s={16} /></button>);
  return (
    <Page title={`Olá${name ? ', ' + name : ''}`} sub="O que está acontecendo na sua loja hoje.">
      <div className="ad-stats">
        <button onClick={() => go('Produtos', { filtro: 'venda' })}><b>{d?.venda ?? '–'}</b><span>À venda</span></button>
        <button onClick={() => go('Produtos', { filtro: 'soon' })}><b>{d?.soon ?? '–'}</b><span>Em breve</span></button>
        <button onClick={() => go('Pedidos')}><b>{d?.novos ?? '–'}</b><span>Pedidos novos</span></button>
        <button onClick={() => go('Pedidos')}><b>{d ? brl(d.rev) : '–'}</b><span>Faturamento</span></button>
      </div>

      <div className="ad-two">
        <section className="ad-card"><header><div><h3>Precisa de atenção</h3></div></header>
          <div className="ad-atts">
            {d && !d.esgotado.length && !d.baixo.length && !d.semfoto.length && <p className="ad-note"><Ic n="check" s={15} /> Tudo certo por aqui: nada esgotado, nenhum estoque baixo e todos os produtos têm foto.</p>}
            <Item icon="out" t="esgotado(s)" list={d?.esgotado} filtro="esgotado" tone="red" />
            <Item icon="alert" t="com estoque baixo" list={d?.baixo} filtro="baixo" tone="amber" />
            <Item icon="image" t="sem foto" list={d?.semfoto} filtro="semfoto" tone="gray" />
          </div></section>
        <section className="ad-card"><header><div><h3>Atalhos</h3></div></header>
          <div className="ad-quickgrid">
            <button onClick={() => go('Produtos', { novo: true })}><Ic n="plus" /><b>Novo produto</b><small>Foto, preço e estoque</small></button>
            <button onClick={() => go('Produtos', { novo: true, cat: 'bone' })}><Ic n="shirt" /><b>Novo boné</b><small>Já na categoria Bonés</small></button>
            <button onClick={() => go('Site')}><Ic n="sliders" /><b>Textos da loja</b><small>Título, avisos, contato</small></button>
            <a href="/" target="_blank" rel="noopener"><Ic n="link" /><b>Ver a loja</b><small>Abre em outra aba</small></a>
          </div></section>
      </div>
    </Page>
  );
}
