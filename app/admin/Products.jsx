'use client';
import { useEffect, useMemo, useState } from 'react';
import { sb } from '@/lib/supabase';
import { MAIN } from '@/main.config';
import { CATS, TYPES, brl, isSoon, soldOut, stockTotal } from '@/lib/util';
import Garment from '@/components/Garment';
import Photo from '@/components/Photo';
import Editor, { novoProduto, erro } from './Editor';
import { Ic, Switch, Page, useUi } from './ui';

const FILTROS = [
  ['todos', 'Todos'], ['venda', 'À venda'], ['soon', 'Em breve'], ['oculto', 'Ocultos'],
  ['esgotado', 'Esgotados'], ['baixo', 'Estoque baixo'], ['semfoto', 'Sem foto'],
];
const passa = (p, f) => ({
  todos: true, venda: p.active && !isSoon(p) && !soldOut(p), soon: isSoon(p), oculto: !p.active,
  esgotado: soldOut(p), baixo: !isSoon(p) && !soldOut(p) && stockTotal(p) <= MAIN.estoqueBaixo, semfoto: !p.images?.length,
}[f]);

export default function Products({ pre, logo, cols, reloadKey }) {
  const { toast, confirm } = useUi();
  const [list, setList] = useState(null); const [colList, setColList] = useState(cols || []);
  const [q, setQ] = useState(''); const [cat, setCat] = useState('todas'); const [st, setSt] = useState(pre?.filtro || 'todos');
  const [sel, setSel] = useState(new Set()); const [ed, setEd] = useState(null);

  const load = async () => {
    const [p, c] = await Promise.all([sb.from('products').select('*').order('created_at', { ascending: false }), sb.from('collections').select('*').order('sort')]);
    if (p.error) toast('Não consegui carregar os produtos: ' + p.error.message, 'err');
    setList(p.data || []); setColList(c.data || []);
  };
  useEffect(() => { load(); }, [reloadKey]);
  useEffect(() => { if (pre?.novo) setEd(novoProduto(pre.cat)); }, [pre]);

  const colName = id => colList.find(c => c.id === id)?.name;
  const base = list || [];
  const visiveis = useMemo(() => base.filter(p => (cat === 'todas' || p.type === cat) && passa(p, st) && (!q.trim() || (p.name + ' ' + (TYPES[p.type] || '') + ' ' + (p.color_name || '')).toLowerCase().includes(q.trim().toLowerCase()))), [base, cat, st, q]);
  const contaCat = id => base.filter(p => p.type === id).length;
  const todosSel = visiveis.length > 0 && visiveis.every(p => sel.has(p.id));

  async function patch(ids, data, ok) {
    let { error } = await sb.from('products').update(data).in('id', ids);
    // banco sem a coluna coming_soon: "liberar" não precisa dela
    if (error && /coming_soon/.test(error.message) && data.coming_soon === false) { const { coming_soon, ...resto } = data; ({ error } = await sb.from('products').update(resto).in('id', ids)); }
    if (error) return toast(erro(error.message), 'err');
    if (ok) toast(ok); setSel(new Set()); load();
  }
  async function excluir(ids, titulo, texto) {
    if (!(await confirm({ title: titulo, text: texto, confirmLabel: 'Excluir', danger: true }))) return;
    const { error } = await sb.from('products').delete().in('id', ids);
    if (error) return toast('Não consegui excluir: ' + error.message, 'err');
    toast(ids.length > 1 ? `${ids.length} produtos excluídos.` : 'Produto excluído.'); setSel(new Set()); load();
  }
  async function excluirTodos() {
    const ok = await confirm({ title: `Excluir TODOS os ${base.length} produtos?`, text: 'Isso apaga o catálogo inteiro da loja e não dá para desfazer. Coleções e pedidos não são afetados.', confirmLabel: 'Excluir tudo', danger: true, typeToConfirm: 'EXCLUIR TUDO' });
    if (!ok) return;
    const { error } = await sb.from('products').delete().not('id', 'is', null);
    if (error) return toast('Não consegui excluir: ' + error.message, 'err');
    toast('Todos os produtos foram excluídos.'); setSel(new Set()); setQ(''); setCat('todas'); setSt('todos'); load();
  }
  const duplicar = p => { const { id, created_at, ...r } = p; setEd({ ...r, slug: '', name: p.name + ' (cópia)' }); };
  const alterna = id => setSel(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  if (ed) return <Editor key={ed.id || 'novo'} initial={ed} cols={colList} logo={logo} onClose={() => setEd(null)} onSaved={() => { setEd(null); load(); }} />;

  const ids = [...sel];
  return (
    <Page title="Produtos" sub={list ? `${base.length} no catálogo · ${base.filter(p => p.active && !isSoon(p)).length} à venda · ${base.filter(isSoon).length} em breve` : 'Carregando…'}
      actions={<>
        <button className="ad-btn danger-o" onClick={excluirTodos} disabled={!base.length} title="Apaga todos os produtos do catálogo"><Ic n="trash" s={16} />Excluir todos</button>
        <button className="ad-btn primary" onClick={() => setEd(novoProduto(cat !== 'todas' ? cat : undefined))}><Ic n="plus" s={16} />Novo produto</button></>}>

      <div className="ad-tools">
        <label className="ad-search"><Ic n="search" s={16} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nome, cor ou categoria" aria-label="Buscar produtos" />{q && <button onClick={() => setQ('')} aria-label="Limpar busca"><Ic n="x" s={14} /></button>}</label>
        <div className="ad-chips" role="tablist" aria-label="Categoria">
          <button className={cat === 'todas' ? 'on' : ''} onClick={() => setCat('todas')}>Todas <em>{base.length}</em></button>
          {CATS.map(c => <button key={c.id} className={cat === c.id ? 'on' : ''} onClick={() => setCat(c.id)}>{c.nome} <em>{contaCat(c.id)}</em></button>)}
        </div>
        <div className="ad-chips sub" aria-label="Situação">{FILTROS.map(([k, n]) => { const c = base.filter(p => passa(p, k)).length; return (k === 'todos' || c > 0 || st === k) && <button key={k} className={st === k ? 'on' : ''} onClick={() => setSt(k)}>{n}{k !== 'todos' && <em>{c}</em>}</button>; })}</div>
      </div>

      {sel.size > 0 && (
        <div className="ad-bulk" role="region" aria-label="Ações em massa">
          <b>{sel.size} selecionado{sel.size > 1 ? 's' : ''}</b>
          <button onClick={() => patch(ids, { active: true, coming_soon: false }, 'Produtos à venda.')}>Colocar à venda</button>
          <button onClick={() => patch(ids, { active: true, coming_soon: true }, 'Marcados como "Em breve".')}>Marcar "Em breve"</button>
          <button onClick={() => patch(ids, { active: false }, 'Produtos ocultados.')}>Ocultar</button>
          <button className="del" onClick={() => excluir(ids, `Excluir ${ids.length} produto${ids.length > 1 ? 's' : ''}?`, 'Não dá para desfazer.')}>Excluir</button>
          <button className="x" onClick={() => setSel(new Set())} aria-label="Limpar seleção"><Ic n="x" s={16} /></button>
        </div>)}

      {list && !base.length && (
        <div className="ad-empty"><Ic n="shirt" s={34} /><h3>Nenhum produto ainda</h3><p>Crie o primeiro. Leva menos de um minuto — foto, nome, preço e estoque.</p>
          <button className="ad-btn primary" onClick={() => setEd(novoProduto())}><Ic n="plus" s={16} />Criar primeiro produto</button></div>)}
      {list && base.length > 0 && !visiveis.length && (
        <div className="ad-empty"><Ic n="search" s={30} /><h3>Nada encontrado</h3><p>Nenhum produto bate com esse filtro.</p><button className="ad-btn" onClick={() => { setQ(''); setCat('todas'); setSt('todos'); }}>Limpar filtros</button></div>)}

      {visiveis.length > 0 && (
        <div className="ad-list" role="table" aria-label="Produtos">
          <div className="ad-lh" role="row"><label className="ck"><input type="checkbox" checked={todosSel} onChange={() => setSel(todosSel ? new Set() : new Set(visiveis.map(p => p.id)))} aria-label="Selecionar todos" /></label><span>Produto</span><span>Preço</span><span>Estoque</span><span>Na loja</span><span>Em breve</span><span /></div>
          {visiveis.map(p => (
            <div className={'ad-lr' + (sel.has(p.id) ? ' sel' : '') + (!p.active ? ' off' : '')} role="row" key={p.id}>
              <label className="ck"><input type="checkbox" checked={sel.has(p.id)} onChange={() => alterna(p.id)} aria-label={`Selecionar ${p.name}`} /></label>
              <button className="pr" onClick={() => setEd({ ...p })} title="Editar">
                <span className="th">{p.images?.[0] ? <Photo src={p.images[0]} /> : <Garment type={p.type} color={p.color} logo={logo} print={p.print} />}</span>
                <span className="nm"><b>{p.name}</b><small>{TYPES[p.type] || p.type}{colName(p.collection_id) ? ' · ' + colName(p.collection_id) : ''} · {p.color_name}</small>
                  <span className="bd">{!p.active && <i className="b off">Oculto</i>}{isSoon(p) && <i className="b bs">Em breve</i>}{soldOut(p) && p.active && <i className="b out">Esgotado</i>}{!p.images?.length && <i className="b nof">Sem foto</i>}{p.featured && <i className="b st">Destaque</i>}</span></span>
              </button>
              <span className="pc" data-l="Preço">{isSoon(p) && !Number(p.price) ? '—' : brl(p.price)}</span>
              <span className="sk" data-l="Estoque">{Object.entries(p.sizes || {}).map(([k, v]) => <i key={k} className={v <= 0 ? 'z' : v <= 2 ? 'l' : ''}>{k} <b>{v}</b></i>)}</span>
              <span className="sw1" data-l="Na loja"><Switch on={p.active} onChange={v => patch([p.id], { active: v }, v ? 'Visível na loja.' : 'Oculto da loja.')} label={`${p.name}: visível na loja`} /></span>
              <span className="sw1" data-l="Em breve"><Switch on={isSoon(p)} onChange={v => patch([p.id], { coming_soon: v }, v ? 'Marcado como "Em breve".' : 'Liberado para venda.')} label={`${p.name}: em breve`} /></span>
              <span className="ac">
                <button onClick={() => setEd({ ...p })} aria-label="Editar" title="Editar"><Ic n="edit" s={16} /></button>
                <button onClick={() => duplicar(p)} aria-label="Duplicar" title="Duplicar"><Ic n="copy" s={16} /></button>
                <a href={`/produto/${p.slug}`} target="_blank" rel="noopener" aria-label="Ver na loja" title="Ver na loja"><Ic n="link" s={16} /></a>
                <button className="del" onClick={() => excluir([p.id], `Excluir "${p.name}"?`, 'Não dá para desfazer.')} aria-label="Excluir" title="Excluir"><Ic n="trash" s={16} /></button>
              </span>
            </div>))}
        </div>)}
    </Page>
  );
}
