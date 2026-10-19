'use client';
import { useRef, useState } from 'react';
import { sb } from '@/lib/supabase';
import { MAIN } from '@/main.config';
import { CATS, PRINTS, catOf, slugify } from '@/lib/util';
import Preview from '@/components/Card';
import Photo from '@/components/Photo';
import { prepararFoto, MODOS } from './photos';
import { Ic, Switch, Field, Card, Page, useUi } from './ui';

// tamanhos sugeridos para a categoria (vêm do main.config.js)
export const sizesDe = type => { const c = catOf(type) || CATS[0]; return Object.fromEntries((c?.tamanhos || ['Único']).map(t => [t, c?.estoque ?? 10])); };
export const novoProduto = (type = 'camiseta') => ({ name: '', description: '', price: '', type, print: 'chest', color: '#0d0d0d', color_name: 'Preto', collection_id: '', images: [], sizes: sizesDe(type), active: true, coming_soon: false, featured: false });

export const erro = m => /coming_soon/.test(m) ? 'Falta a coluna "coming_soon" no banco. Rode supabase/update_v4.sql no SQL Editor do Supabase.'
  : /products_type_check/.test(m) ? 'Essa categoria não existe no banco. Rode supabase/update_v4.sql no SQL Editor.'
  : /print/.test(m) && /column/i.test(m) ? 'Falta a coluna "print" no banco. Rode supabase/update_v4.sql.'
  : /row-level security|permission/i.test(m) ? 'Seu usuário não é admin (tabela admins).' : m;

export default function Editor({ initial, cols, logo, onClose, onSaved }) {
  const { toast } = useUi();
  const [f, setF] = useState({ ...initial, price: initial.price ?? '', sizes: { ...(initial.sizes || {}) } });
  const [modo, setModo] = useState('auto'); const [busy, setBusy] = useState(false); const [drag, setDrag] = useState(false);
  const orig = useRef(initial); const nameRef = useRef(null);
  const novo = !initial.id;
  const up = patch => setF(x => ({ ...x, ...patch }));
  const status = !f.active ? 'oculto' : f.coming_soon ? 'soon' : 'venda';
  const setStatus = s => up({ active: s !== 'oculto', coming_soon: s === 'soon' });

  function trocaCategoria(type) {
    const intacto = JSON.stringify(f.sizes) === JSON.stringify(sizesDe(f.type)); // só troca os tamanhos se ainda forem os sugeridos
    up({ type, ...(intacto ? { sizes: sizesDe(type) } : {}) });
  }

  // ── fotos ──
  async function enviar(files) {
    files = [...files].filter(x => x.type.startsWith('image/')); if (!files.length) return;
    setBusy(true); const urls = []; let cortadas = 0, inteiras = 0, falhas = 0;
    for (const file of files) {
      try {
        const { blob, acao } = await prepararFoto(file, modo);
        const ext = (blob.type.split('/')[1] || 'jpg').replace('+xml', '');
        const path = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
        const { error } = await sb.storage.from('products').upload(path, blob, { contentType: blob.type });
        if (error) { falhas++; toast('Erro no envio: ' + error.message + (/bucket|not found/i.test(error.message) ? ' (rode a parte de storage do schema.sql)' : /policy|security|permission/i.test(error.message) ? ' (seu usuário precisa estar na tabela admins)' : ''), 'err'); continue; }
        urls.push(sb.storage.from('products').getPublicUrl(path).data.publicUrl);
        if (acao === 'cortada') cortadas++; if (acao === 'inteira') inteiras++;
      } catch (e) { falhas++; toast('Não consegui ler essa foto: ' + e.message, 'err'); }
    }
    setBusy(false);
    if (urls.length) { setF(x => ({ ...x, images: [...x.images, ...urls] })); toast(`${urls.length} foto${urls.length > 1 ? 's' : ''} adicionada${urls.length > 1 ? 's' : ''} e ajustada${urls.length > 1 ? 's' : ''} ao formato da loja${inteiras ? ` (${inteiras} aparece${inteiras > 1 ? 'm' : ''} inteira${inteiras > 1 ? 's' : ''})` : cortadas ? ' (cortadas de leve)' : ''}.`); }
  }
  const mover = (i, d) => setF(x => { const a = [...x.images], j = i + d; if (j < 0 || j >= a.length) return x; [a[i], a[j]] = [a[j], a[i]]; return { ...x, images: a }; });
  const principal = i => setF(x => ({ ...x, images: [x.images[i], ...x.images.filter((_, k) => k !== i)] }));
  const remover = i => setF(x => ({ ...x, images: x.images.filter((_, k) => k !== i) }));

  // ── estoque ──
  const [novoTam, setNovoTam] = useState('');
  const setQ = (k, v) => up({ sizes: { ...f.sizes, [k]: Math.max(0, Number(v) || 0) } });
  const delTam = k => { const s = { ...f.sizes }; delete s[k]; up({ sizes: s }); };
  const addTam = () => { const k = novoTam.trim(); if (k && !(k in f.sizes)) up({ sizes: { ...f.sizes, [k]: 10 } }); setNovoTam(''); };

  // ── salvar ──
  async function salvar() {
    if (!f.name?.trim()) { toast('Dê um nome para o produto.', 'err'); return nameRef.current?.focus(); }
    if (!(Number(f.price) > 0) && f.coming_soon !== true) { toast('Informe um preço maior que zero (ou marque "Em breve").', 'err'); return; }
    setBusy(true);
    const { id, created_at, ...rest } = f;
    const row = { ...rest, price: Number(f.price) || 0, slug: f.slug || slugify(f.name), collection_id: f.collection_id || null };
    if (id) row.id = id;
    // só manda coming_soon quando faz diferença (evita erro se o banco ainda não tem a coluna)
    if (!row.coming_soon && !(id && 'coming_soon' in orig.current)) delete row.coming_soon;
    let { error } = await sb.from('products').upsert(row);
    if (error?.code === '23505' && !id) ({ error } = await sb.from('products').upsert({ ...row, slug: row.slug + '-' + Math.random().toString(36).slice(2, 5) }));
    setBusy(false);
    if (error) return toast('Não salvou: ' + erro(error.message), 'err');
    toast(novo ? 'Produto criado.' + (f.active ? (f.coming_soon ? ' Aparece na loja como "Em breve".' : ' Já está na loja.') : '') : 'Alterações salvas.');
    onSaved();
  }

  return (
    <Page title={novo ? 'Novo produto' : 'Editar produto'} sub={novo ? 'Preencha de cima para baixo. O que você muda aparece no cartão ao lado.' : f.name}
      actions={<><button className="ad-btn ghost" onClick={onClose}>Cancelar</button><button className="ad-btn primary" onClick={salvar} disabled={busy}>{busy ? 'Aguarde…' : 'Salvar produto'}</button></>}>
      <div className="ad-edit">
        <div className="ad-edit-main">
          <Card n="1" title="Fotos" hint={`Envie quantas quiser. A 1ª é a principal, a 2ª aparece ao passar o mouse. A loja ajusta tudo para ${MAIN.fotos.largura}×${MAIN.fotos.altura} (4:5) sozinha.`}
            right={<select className="ad-sel" value={modo} onChange={e => setModo(e.target.value)} title="Como ajustar as fotos enviadas">{MODOS.map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>}>
            <div className={'ad-drop' + (drag ? ' on' : '')} onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={e => { e.preventDefault(); setDrag(false); enviar(e.dataTransfer.files); }}>
              <Ic n="image" s={26} /><b>{busy ? 'Enviando e ajustando…' : 'Arraste as fotos aqui'}</b><span>ou clique para escolher</span>
              <input type="file" multiple accept="image/*" disabled={busy} onChange={e => { enviar(e.target.files); e.target.value = ''; }} aria-label="Escolher fotos" />
            </div>
            {f.images.length > 0 && <div className="ad-photos">{f.images.map((u, i) => (
              <div className="ad-photo" key={u}>
                <Photo src={u} />
                <span className="tag">{i === 0 ? 'Principal' : i === 1 ? 'Ao passar o mouse' : ''}</span>
                <div className="bar">
                  <button onClick={() => mover(i, -1)} disabled={i === 0} aria-label="Mover para trás"><Ic n="left" s={14} /></button>
                  <button onClick={() => principal(i)} disabled={i === 0} aria-label="Tornar principal" title="Tornar principal"><Ic n="star" s={14} /></button>
                  <button onClick={() => mover(i, 1)} disabled={i === f.images.length - 1} aria-label="Mover para frente"><Ic n="right" s={14} /></button>
                  <button className="rm" onClick={() => remover(i)} aria-label="Remover foto" title="Remover"><Ic n="x" s={14} /></button>
                </div>
              </div>))}</div>}
            {!f.images.length && <p className="ad-note">Sem foto, a loja mostra um desenho da peça. Dá para publicar assim e colocar as fotos depois.</p>}
          </Card>

          <Card n="2" title="Informações">
            <div className="ad-grid">
              <Field label="Nome" full><input ref={nameRef} value={f.name} onChange={e => up({ name: e.target.value })} placeholder="Ex.: Camiseta Essencial Preta" /></Field>
              <Field label="Preço (R$)"><input type="number" inputMode="decimal" min="0" step="0.01" value={f.price} onChange={e => up({ price: e.target.value })} placeholder="129" /></Field>
              <Field label="Categoria"><select value={f.type} onChange={e => trocaCategoria(e.target.value)}>{CATS.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}{!catOf(f.type) && <option value={f.type}>{f.type}</option>}</select></Field>
              <Field label="Coleção"><select value={f.collection_id || ''} onChange={e => up({ collection_id: e.target.value })}><option value="">Sem coleção</option>{cols.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
              <Field label="Descrição" full><textarea rows={3} value={f.description} onChange={e => up({ description: e.target.value })} placeholder="Tecido, caimento, cuidados…" /></Field>
            </div>
          </Card>

          <Card n="3" title="Cor" hint="Toque numa cor pronta ou escolha qualquer uma.">
            <div className="ad-swatches">{MAIN.cores.map(c => <button key={c.hex} type="button" className={f.color.toLowerCase() === c.hex ? 'on' : ''} style={{ '--c': c.hex }} onClick={() => up({ color: c.hex, color_name: c.nome })} title={c.nome} aria-label={c.nome} />)}
              <label className="ad-pick" title="Outra cor"><input type="color" value={f.color} onChange={e => up({ color: e.target.value })} /><span>Outra</span></label></div>
            <div className="ad-grid" style={{ marginTop: 12 }}><Field label="Nome da cor"><input value={f.color_name} onChange={e => up({ color_name: e.target.value })} /></Field></div>
          </Card>

          <Card n="4" title="Estoque" hint="Quantidade disponível por tamanho. Tamanho com 0 aparece riscado na loja.">
            <div className="ad-sizes">{Object.entries(f.sizes).map(([k, v]) => (
              <div className={'ad-size' + (v <= 0 ? ' zero' : '')} key={k}><b>{k}</b>
                <div><button onClick={() => setQ(k, v - 1)} aria-label={`Menos ${k}`}>−</button><input type="number" min="0" value={v} onChange={e => setQ(k, e.target.value)} aria-label={`Estoque ${k}`} /><button onClick={() => setQ(k, v + 1)} aria-label={`Mais ${k}`}>+</button></div>
                <button className="x" onClick={() => delTam(k)} aria-label={`Remover ${k}`}><Ic n="x" s={14} /></button></div>))}
              <div className="ad-size add"><input value={novoTam} onChange={e => setNovoTam(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTam()} placeholder="Novo tamanho" aria-label="Novo tamanho" /><button className="ad-btn sm" onClick={addTam}>Adicionar</button></div></div>
            <div className="ad-quick"><button className="ad-link" onClick={() => up({ sizes: sizesDe(f.type) })}>Usar tamanhos sugeridos para {catOf(f.type)?.nome?.toLowerCase() || 'esta categoria'}</button></div>
          </Card>

          <Card n="5" title="Publicação" hint="Escolha como este produto aparece na loja.">
            <div className="ad-seg" role="radiogroup" aria-label="Situação">
              {[['venda', 'À venda', 'Aparece e pode ser comprado'], ['soon', 'Em breve', 'Aparece com selo, sem compra'], ['oculto', 'Oculto', 'Não aparece na loja']].map(([k, t, d]) => (
                <button key={k} role="radio" aria-checked={status === k} className={status === k ? `on s-${k}` : `s-${k}`} onClick={() => setStatus(k)}><b>{t}</b><span>{d}</span></button>))}
            </div>
            <div className="ad-row"><Switch on={f.featured} onChange={v => up({ featured: v })} label="Destaque na home" /><span>Destaque na página inicial (aparece no topo da home)</span></div>
          </Card>

          <details className="ad-card ad-adv"><summary>Avançado</summary>
            <div className="ad-grid">
              <Field label="Estampa do desenho" hint="Só vale enquanto o produto não tem foto."><select value={f.print || 'chest'} onChange={e => up({ print: e.target.value })}>{Object.entries(PRINTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field>
              <Field label="Endereço (slug)" hint={novo ? 'Gerado do nome. Deixe vazio.' : 'Mudar quebra links já compartilhados.'}><input value={f.slug || ''} onChange={e => up({ slug: slugify(e.target.value) })} placeholder={slugify(f.name) || 'automático'} /></Field>
            </div>
          </details>
        </div>

        <aside className="ad-edit-side">
          <div className="ad-sticky">
            <p className="ad-eyebrow">Como aparece na loja</p>
            <div className="ad-prev"><Preview preview p={{ ...f, price: Number(f.price) || 0 }} logo={logo} /></div>
            <p className="ad-note">{f.images.length ? `${f.images.length} foto${f.images.length > 1 ? 's' : ''}` : 'Sem foto — mostrando o desenho'} · {Object.values(f.sizes).reduce((a, b) => a + b, 0)} em estoque</p>
            <button className="ad-btn primary wide" onClick={salvar} disabled={busy}>{busy ? 'Aguarde…' : 'Salvar produto'}</button>
            <button className="ad-btn ghost wide" onClick={onClose}>Cancelar</button>
          </div>
        </aside>
      </div>
    </Page>
  );
}
