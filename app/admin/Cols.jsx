'use client';
import { useEffect, useState } from 'react';
import { sb } from '@/lib/supabase';
import { slugify } from '@/lib/util';
import { Ic, Switch, Page, useUi } from './ui';

export default function Cols() {
  const { toast, confirm } = useUi();
  const [list, setList] = useState(null); const [n, setN] = useState(''); const [count, setCount] = useState({});
  const load = async () => {
    const [c, p] = await Promise.all([sb.from('collections').select('*').order('sort'), sb.from('products').select('collection_id')]);
    setList(c.data || []); const k = {}; (p.data || []).forEach(x => { if (x.collection_id) k[x.collection_id] = (k[x.collection_id] || 0) + 1; }); setCount(k);
  };
  useEffect(() => { load(); }, []);
  const upd = async (c, patch, ok) => { const { error } = await sb.from('collections').update(patch).eq('id', c.id); if (error) return toast(error.message, 'err'); if (ok) toast(ok); load(); };
  async function mover(i, d) {
    const j = i + d; if (j < 0 || j >= list.length) return;
    const a = list[i], b = list[j];
    await Promise.all([sb.from('collections').update({ sort: j + 1 }).eq('id', a.id), sb.from('collections').update({ sort: i + 1 }).eq('id', b.id)]); load();
  }
  async function criar() {
    if (!n.trim()) return;
    const { error } = await sb.from('collections').insert({ name: n.trim().toUpperCase(), slug: slugify(n), sort: (list?.length || 0) + 1 });
    if (error) return toast(/duplicate|unique/i.test(error.message) ? 'Já existe uma coleção com esse nome.' : error.message, 'err');
    setN(''); toast('Coleção criada.'); load();
  }
  return (
    <Page title="Coleções" sub="Agrupe as peças em drops. A ordem aqui é a ordem no site. Coleção sem peças aparece como “Em breve”.">
      <div className="ad-add"><input value={n} onChange={e => setN(e.target.value)} onKeyDown={e => e.key === 'Enter' && criar()} placeholder="Nome da nova coleção (ex.: Drop 02)" aria-label="Nome da nova coleção" /><button className="ad-btn primary" onClick={criar}><Ic n="plus" s={16} />Criar coleção</button></div>
      {list && !list.length && <div className="ad-empty"><Ic n="layers" s={32} /><h3>Nenhuma coleção</h3><p>Crie a primeira acima.</p></div>}
      <div className="ad-cols">{list?.map((c, i) => (
        <div className={'ad-col' + (c.active ? '' : ' off')} key={c.id}>
          <div className="mv"><button onClick={() => mover(i, -1)} disabled={i === 0} aria-label="Subir"><Ic n="up" s={14} /></button><button onClick={() => mover(i, 1)} disabled={i === list.length - 1} aria-label="Descer"><Ic n="down" s={14} /></button></div>
          <input defaultValue={c.name} onBlur={e => e.target.value.trim() && e.target.value !== c.name && upd(c, { name: e.target.value.trim() }, 'Nome atualizado.')} aria-label="Nome da coleção" />
          <span className="cn">{count[c.id] || 0} peça{(count[c.id] || 0) === 1 ? '' : 's'}</span>
          <span className="sw1"><Switch on={c.active} onChange={v => upd(c, { active: v })} label={`${c.name}: visível`} /><small>{c.active ? 'Visível' : 'Oculta'}</small></span>
          <button className="ad-ib del" aria-label="Excluir coleção" title="Excluir" onClick={async () => { if (await confirm({ title: `Excluir a coleção "${c.name}"?`, text: 'As peças dela não são apagadas, só ficam sem coleção.', confirmLabel: 'Excluir', danger: true })) { await sb.from('collections').delete().eq('id', c.id); toast('Coleção excluída.'); load(); } }}><Ic n="trash" s={16} /></button>
        </div>))}</div>
    </Page>
  );
}
