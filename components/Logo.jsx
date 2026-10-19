// V oficial da marca (vetorizado a partir de LOGO_CORRETA.jpg). Usado também nas estampas das peças.
export const MARK_PATH = 'M100.0 7.0L97.9 7.7L94.2 9.5L89.9 12.1L85.8 15.4L80.8 20.8L78.2 24.6L75.4 29.6L72.5 36.3L67.1 50.0L77.9 38.2L85.5 30.8L88.8 28.2L93.0 25.2L96.9 23.0L100.0 21.6ZM0.1 3.6L0.0 17.3L5.4 17.4L7.8 17.6L9.8 18.2L13.2 20.0L14.7 21.4L15.4 22.3L17.6 27.3L34.5 71.7L36.3 75.7L38.3 78.5L41.1 81.2L45.0 83.8L49.6 85.7L53.4 86.4L57.0 86.5L59.2 86.2L62.4 85.4L66.0 83.8L69.0 81.7L72.0 78.6L74.6 74.4L85.8 48.3L89.6 40.3L93.6 32.6L87.2 38.3L78.3 46.7L68.5 56.7L66.4 59.3L64.7 62.0L63.1 65.2L61.8 68.7L60.7 70.6L59.4 71.7L57.9 72.4L55.7 72.5L54.0 72.3L51.7 71.1L50.2 69.7L48.0 66.1L30.9 20.4L28.8 15.9L26.9 12.9L24.2 10.0L22.1 8.3L19.6 6.8L16.9 5.7L12.4 4.4L8.4 3.8L4.5 3.5Z';

export function Mark({ color = '#0d0d0d', ...p }) {
  return (<svg viewBox="0 0 100 90" fill={color} aria-hidden="true" {...p}><path d={MARK_PATH} /></svg>);
}

const lum = h => { let x = (h || '#000').replace('#', ''); if (x.length === 3) x = x.split('').map(c => c + c).join(''); const n = parseInt(x, 16); return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; };

// Logo oficial (imagem com fundo transparente em /public).
// color claro (ex.: '#fff') → usa a versão branca.  full → inclui o slogan.
// Se existir s.logo_url (Admin > Site), ele tem prioridade.
export default function Logo({ s = {}, color = '#0d0d0d', full = false, height = 'clamp(22px, 3.2vw, 32px)' }) {
  const alt = s.store_name || 'VARIABLE';
  const light = lum(color) > 0.6;
  if (s.logo_url) return <img src={s.logo_url} alt={alt} className="logoimg" style={{ height, width: 'auto', display: 'block', maxWidth: 'none' }} />;
  const src = full ? (light ? '/logo-branca.png' : '/logo.png') : (light ? '/logo-header-branca.png' : '/logo-header.png');
  return <img src={src} alt={alt} className="logoimg" width={1511} height={full ? 439 : 310} style={{ height, width: 'auto', display: 'block', maxWidth: 'none' }} />;
}
