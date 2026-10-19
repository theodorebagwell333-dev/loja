'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

// ── ícones (traço simples) ──
const PATHS = {
  home: 'M3 10.5 12 3l9 7.5V21H3z M9 21v-6h6v6',
  shirt: 'M8 3 3 6l2 4 3-1v12h8V9l3 1 2-4-5-3a4 4 0 0 1-8 0z',
  layers: 'M12 3 3 8l9 5 9-5z M3 13l9 5 9-5',
  bag: 'M5 8h14l-1 13H6z M9 8V6a3 3 0 0 1 6 0v2',
  sliders: 'M4 7h10 M18 7h2 M4 17h2 M10 17h10 M14 5v4 M6 15v4',
  plus: 'M12 5v14 M5 12h14',
  trash: 'M4 7h16 M10 11v6 M14 11v6 M6 7l1 13h10l1-13 M9 7V4h6v3',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z M21 21l-5-5',
  x: 'M6 6l12 12 M18 6 6 18',
  check: 'M5 12l5 5 9-10',
  left: 'M15 5l-7 7 7 7',
  right: 'M9 5l7 7-7 7',
  up: 'M5 15l7-7 7 7',
  down: 'M5 9l7 7 7-7',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
  image: 'M4 5h16v14H4z M4 16l5-5 4 4 3-3 4 4 M9 9.5h.01',
  link: 'M14 4h6v6 M20 4l-9 9 M18 14v6H4V6h6',
  copy: 'M9 9h11v11H9z M5 15V4h11',
  edit: 'M4 20l4-1 11-11-3-3L5 16z',
  alert: 'M12 4 2 20h20z M12 10v4 M12 17h.01',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 7v5l3 2',
  out: 'M15 4h5v16h-5 M10 8l-4 4 4 4 M6 12h10',
};
export const Ic = ({ n, s = 18 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={PATHS[n]} /></svg>
);

// ── avisos (toast) e confirmações ──
const Ui = createContext(null);
export const useUi = () => useContext(Ui);

export function UiProvider({ children }) {
  const [toasts, setT] = useState([]); const [dlg, setDlg] = useState(null);
  const toast = useCallback((msg, kind = 'ok') => {
    const id = Math.random();
    setT(t => [...t, { id, msg, kind }]);
    setTimeout(() => setT(t => t.filter(x => x.id !== id)), kind === 'err' ? 8000 : 3200);
  }, []);
  const confirm = useCallback(o => new Promise(res => setDlg({ ...o, res })), []);
  const close = v => { dlg?.res(v); setDlg(null); };
  return (
    <Ui.Provider value={{ toast, confirm }}>
      {children}
      <div className="ad-toasts" role="status" aria-live="polite">{toasts.map(t => <div key={t.id} className={'ad-toast ' + t.kind}><Ic n={t.kind === 'err' ? 'alert' : 'check'} s={16} />{t.msg}</div>)}</div>
      {dlg && <Dialog d={dlg} onClose={close} />}
    </Ui.Provider>
  );
}

function Dialog({ d, onClose }) {
  const [txt, setTxt] = useState(''); const ref = useRef(null);
  const ok = !d.typeToConfirm || txt.trim().toUpperCase() === d.typeToConfirm.toUpperCase();
  useEffect(() => { ref.current?.focus(); const k = e => e.key === 'Escape' && onClose(false); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, []);
  return (
    <div className="ad-veil" onMouseDown={e => e.target === e.currentTarget && onClose(false)}>
      <div className="ad-dlg" role="dialog" aria-modal="true" aria-label={d.title}>
        {d.danger && <div className="ad-dlg-ic"><Ic n="alert" s={22} /></div>}
        <h3>{d.title}</h3>
        {d.text && <p>{d.text}</p>}
        {d.typeToConfirm && <label className="ad-field"><span>Para confirmar, digite <b>{d.typeToConfirm}</b></span><input ref={ref} value={txt} onChange={e => setTxt(e.target.value)} onKeyDown={e => e.key === 'Enter' && ok && onClose(true)} autoComplete="off" /></label>}
        <div className="ad-dlg-act">
          <button className="ad-btn ghost" onClick={() => onClose(false)} ref={d.typeToConfirm ? null : ref}>Cancelar</button>
          <button className={'ad-btn ' + (d.danger ? 'danger' : 'primary')} disabled={!ok} onClick={() => onClose(true)}>{d.confirmLabel || 'Confirmar'}</button>
        </div>
      </div>
    </div>
  );
}

// ── peças pequenas reutilizáveis ──
export const Switch = ({ on, onChange, label, disabled }) => (
  <button type="button" role="switch" aria-checked={!!on} aria-label={label} title={label} disabled={disabled} className={'ad-sw' + (on ? ' on' : '')} onClick={() => onChange(!on)}><i /></button>
);
export const Field = ({ label, hint, full, children }) => (
  <label className={'ad-field' + (full ? ' full' : '')}><span className="lb">{label}</span>{children}{hint && <small>{hint}</small>}</label>
);
export const Card = ({ title, hint, n, children, right }) => (
  <section className="ad-card">{(title || right) && <header><div>{title && <h3>{n && <em>{n}</em>}{title}</h3>}{hint && <p>{hint}</p>}</div>{right}</header>}{children}</section>
);
export const Page = ({ title, sub, actions, children }) => (
  <div className="ad-page"><header className="ad-ph"><div><h1>{title}</h1>{sub && <p>{sub}</p>}</div><div className="ad-ph-act">{actions}</div></header>{children}</div>
);
