'use client';
import { useEffect, useState } from 'react';
import { sb } from '@/lib/supabase';
import { MAIN } from '@/main.config';
import { Card, Field, Page, useUi } from './ui';

// [campo, rótulo, ajuda, largo?]
const GRUPOS = [
  ['Marca', 'Nome, logo e cor da loja.', [
    ['store_name', 'Nome da loja'], ['logo_text', 'Texto da logo', 'Também vai estampado nas peças sem foto.'], ['tagline', 'Slogan', null, true],
    ['logo_url', 'Logo oficial (link da imagem)', 'Deixe VAZIO para usar a logo oficial do site (recomendado). Só preencha para trocar por outra imagem.', true], ['accent', 'Cor de destaque', null, 'color'],
  ]],
  ['Página inicial', 'O que aparece no topo da loja.', [
    ['announcement', 'Faixa de aviso (topo da página)', 'Deixe vazio para esconder.', true], ['hero_title', 'Título principal', null, true], ['hero_subtitle', 'Subtítulo', null, true], ['hero_cta', 'Texto do botão'],
  ]],
  ['Contato e rodapé', 'Como o cliente fala com você.', [
    ['whatsapp', 'WhatsApp', 'Só números, com 55. Ex.: 5517999999999'], ['instagram', 'Link do Instagram'], ['footer_text', 'Texto do rodapé', null, true],
  ]],
];

export default function Site() {
  const { toast } = useUi(); const [d, setD] = useState(null); const [sujo, setSujo] = useState(false);
  useEffect(() => { sb.from('settings').select('data').eq('id', 1).single().then(r => setD(r.data?.data || {})); }, []);
  if (!d) return <Page title="Textos da loja"><p className="ad-note">Carregando…</p></Page>;
  const set = (k, v) => { setD(x => ({ ...x, [k]: v })); setSujo(true); };
  async function salvar() {
    const { error } = await sb.from('settings').upsert({ id: 1, data: d });
    if (error) return toast('Não salvou: ' + error.message, 'err');
    setSujo(false); toast('Alterações salvas. Já valem na loja.');
  }
  return (
    <Page title="Textos da loja" sub="Campo vazio usa o padrão do arquivo main.config.js."
      actions={<button className="ad-btn primary" onClick={salvar} disabled={!sujo}>{sujo ? 'Salvar alterações' : 'Tudo salvo'}</button>}>
      {GRUPOS.map(([t, h, campos]) => (
        <Card key={t} title={t} hint={h}>
          <div className="ad-grid">{campos.map(([k, l, hint, tipo]) => (
            <Field key={k} label={l} hint={hint} full={tipo === true}>
              {tipo === 'color'
                ? <div className="ad-colorrow"><input type="color" value={/^#[0-9a-f]{6}$/i.test(d[k] || MAIN.loja[k]) ? (d[k] || MAIN.loja[k]) : '#8d877d'} onChange={e => set(k, e.target.value)} /><input value={d[k] || ''} onChange={e => set(k, e.target.value)} placeholder={MAIN.loja[k]} /></div>
                : <input value={d[k] || ''} onChange={e => set(k, e.target.value)} placeholder={MAIN.loja[k] || ''} />}
            </Field>))}</div>
        </Card>))}
      <div className="ad-savebar"><button className="ad-btn primary" onClick={salvar} disabled={!sujo}>{sujo ? 'Salvar alterações' : 'Tudo salvo'}</button></div>
    </Page>
  );
}
