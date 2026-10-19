export function Mark({ color = '#0d0d0d', ...p }) {
  return (<svg viewBox="0 0 100 90" fill={color} aria-hidden="true" {...p}><path d="M2 3H31L49 56Q51 62 55 56L63 42L71 48L57 74Q49 85 41 74Z" /><path d="M98 3Q79 4 73 15L58 44L65 47Q82 36 98 3Z" /></svg>);
}
export default function Logo({ s = {}, color = '#0d0d0d' }) {
  if (s.logo_url) return <img src={s.logo_url} alt={s.store_name} className="logoimg" />;
  return <span className="logo"><Mark color={color} className="lm" /><b>{s.logo_text || 'VARIABLE'}</b></span>;
}
