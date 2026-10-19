'use client';
import { useEffect, useState } from 'react';
import { sb } from '@/lib/supabase';
import { MAIN } from '@/main.config';
import { Mark } from '@/components/Logo';
import { Ic, UiProvider } from './ui';
import Dash from './Dash';
import Products from './Products';
import Cols from './Cols';
import Orders from './Orders';
import Site from './Site';
import './admin.css';

const ABAS = [
  ['Início', 'home', 'Visão geral'],
  ['Produtos', 'shirt', 'Peças, fotos e estoque'],
  ['Coleções', 'layers', 'Drops e ordem'],
  ['Pedidos', 'bag', 'Acompanhar vendas'],
  ['Site', 'sliders', 'Textos e contato'],
];

export default function Admin() {
  const [ok, setOk] = useState(null); const [who, setWho] = useState(null);
  const [tab, setTab] = useState('Início'); const [pre, setPre] = useState(null); const [site, setSite] = useState({});
  const check = async () => {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) { setWho(null); return setOk(false); }
    const { data, error } = await sb.from('admins').select('user_id').eq('user_id', session.user.id).maybeSingle();
    setWho({ email: session.user.email, id: session.user.id, err: error?.message });
    setOk(!!data);
    if (data) sb.from('settings').select('data').eq('id', 1).single().then(r => setSite({ ...MAIN.loja, ...Object.fromEntries(Object.entries(r.data?.data || {}).filter(([, v]) => String(v || '').trim())) }));
  };
  useEffect(() => { check(); }, []);
  const go = (t, p = null) => { setPre(p); setTab(t); window.scrollTo?.({ top: 0 }); };

  if (ok === null) return <div className="ad-boot">Carregando…</div>;
  if (!ok) return <Login onDone={check} who={who} />;

  const nome = who?.email?.split('@')[0];
  return (
    <UiProvider>
      <div className="ad">
        <aside className="ad-side">
          <div className="ad-brand"><Mark color="currentColor" className="m" /><span><b>{site.store_name || MAIN.loja.store_name}</b><small>Painel da loja</small></span></div>
          <nav aria-label="Menu do admin">{ABAS.map(([t, ic, d]) => (
            <button key={t} className={t === tab ? 'on' : ''} onClick={() => go(t)} aria-current={t === tab ? 'page' : undefined}><Ic n={ic} /><span><b>{t}</b><small>{d}</small></span></button>))}</nav>
          <div className="ad-foot">
            <a href="/" target="_blank" rel="noopener"><Ic n="link" s={16} />Ver a loja</a>
            <button onClick={async () => { await sb.auth.signOut(); setOk(false); }}><Ic n="out" s={16} />Sair</button>
            <small>{who?.email}</small>
          </div>
        </aside>
        <main className="ad-main">
          {tab === 'Início' && <Dash go={go} name={nome} />}
          {tab === 'Produtos' && <Products pre={pre} logo={site.logo_text || MAIN.loja.logo_text} />}
          {tab === 'Coleções' && <Cols />}
          {tab === 'Pedidos' && <Orders />}
          {tab === 'Site' && <Site />}
        </main>
      </div>
    </UiProvider>
  );
}

function Login({ onDone, who }) {
  const [e, setE] = useState(''); const [p, setP] = useState(''); const [m, setM] = useState('');
  const msg = x => x === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : x === 'Email not confirmed' ? 'E-mail não confirmado. No Supabase, vá em Authentication > Users e confirme o usuário (ou recrie com Auto Confirm User).' : /fetch/i.test(x) ? 'Não conectou ao Supabase. Confira o .env.local (URL e anon key) e reinicie o npm run dev.' : x;
  if (who) return (
    <div className="ad-login"><div className="box">
      <Mark color="currentColor" className="m" /><h1>Sem permissão de admin</h1>
      <p>Você entrou como <b>{who.email}</b>, mas esse usuário ainda não está na tabela <b>admins</b>.</p>
      {who.err && <p className="err">Erro do banco: {who.err}. Se disser que a tabela não existe, rode o schema.sql primeiro.</p>}
      <p>No Supabase, abra o SQL Editor, rode o comando abaixo e depois clique em “Tentar de novo”:</p>
      <textarea readOnly rows={3} onFocus={x => x.target.select()} value={`insert into admins(user_id) values ('${who.id}') on conflict do nothing;`} />
      <button className="ad-btn primary wide" onClick={onDone}>Tentar de novo</button>
      <button className="ad-btn ghost wide" onClick={async () => { await sb.auth.signOut(); onDone(); }}>Entrar com outro usuário</button></div></div>
  );
  return (
    <div className="ad-login"><form className="box" onSubmit={async ev => { ev.preventDefault(); setM(''); const { error } = await sb.auth.signInWithPassword({ email: e.trim(), password: p }); if (error) setM(msg(error.message)); else onDone(); }}>
      <Mark color="currentColor" className="m" /><h1>Entrar no admin</h1><p>Acesso restrito à equipe da loja.</p>
      <label className="ad-field"><span className="lb">E-mail</span><input type="email" autoComplete="username" required onChange={x => setE(x.target.value)} /></label>
      <label className="ad-field"><span className="lb">Senha</span><input type="password" autoComplete="current-password" required onChange={x => setP(x.target.value)} /></label>
      {m && <p className="err">{m}</p>}<button className="ad-btn primary wide">Entrar</button></form></div>
  );
}
