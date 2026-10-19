import { shapeOf } from '@/lib/util';
const P = {
  camiseta: 'M60 20 L85 12 Q100 28 115 12 L140 20 L180 55 L160 80 L142 68 L142 205 L58 205 L58 68 L40 80 L20 55 Z',
  regata: 'M74 12 Q100 52 126 12 L142 14 Q138 70 146 100 L146 205 L54 205 L54 100 Q62 70 58 14 Z',
  manga_longa: 'M60 20 L85 12 Q100 28 115 12 L140 20 L186 60 L186 196 L166 196 L150 98 L142 104 L142 205 L58 205 L58 104 L50 98 L34 196 L14 196 L14 60 Z',
  blusa: 'M62 18 L84 8 Q100 30 116 8 L138 18 L186 60 L186 192 L164 192 L150 100 L148 205 L52 205 L50 100 L36 192 L14 192 L14 60 Z',
  jaqueta: 'M62 18 L84 8 L100 22 L116 8 L138 18 L186 60 L186 192 L164 192 L150 100 L148 205 L52 205 L50 100 L36 192 L14 192 L14 60 Z',
  shorts: 'M48 30 L152 30 L162 160 L108 160 L100 96 L92 160 L38 160 Z',
  calca: 'M52 20 L148 20 L158 208 L108 208 L100 80 L92 208 L42 208 Z',
  bone: 'M45 128 Q45 58 100 58 Q155 58 155 128 Z M38 128 L162 128 Q192 130 196 146 Q150 134 38 138 Z',
  bolsa: 'M40 72 H160 L168 205 H32 Z',
};
const BRIM = 'M38 128 L162 128 Q192 130 196 146 Q150 134 38 138 Z';
const NECK = { inner: 'M85 12 Q100 7 115 12 Q100 28 85 12Z', rib: 'M85 12 Q100 28 115 12' };
const ARM = ['M50 100 Q44 56 62 18', 'M150 100 Q156 56 138 18'];
const TOPF = ['M72 118 Q88 130 82 165', 'M128 108 Q116 142 126 180', 'M96 172 Q104 186 116 190'];
const D = {
  camiseta: { ...NECK, seams: ['M58 68 Q53 44 60 20', 'M142 68 Q147 44 140 20', 'M27 58 L44 79', 'M173 58 L156 79', 'M60 198 H140'], folds: TOPF },
  regata: { inner: 'M74 12 Q100 8 126 12 Q100 52 74 12Z', rib: 'M74 12 Q100 52 126 12', seams: ['M54 100 Q62 70 58 14', 'M146 100 Q138 70 142 14', 'M56 198 H144'], folds: TOPF },
  manga_longa: { ...NECK, seams: ['M58 104 Q53 60 60 20', 'M142 104 Q147 60 140 20', 'M14 186 H35', 'M165 186 H186', 'M60 198 H140'], folds: TOPF },
  blusa: { inner: 'M84 8 Q100 2 116 8 Q100 30 84 8Z', rib: 'M84 8 Q100 30 116 8', seams: [...ARM, 'M62 150 L138 150 L146 190 L54 190 Z', 'M52 195 H148', 'M14 182 H36', 'M164 182 H186'], folds: TOPF },
  jaqueta: { inner: 'M84 8 Q100 4 116 8 L100 22Z', rib: 'M84 8 L100 22 L116 8', zip: 'M100 22 V205', seams: [...ARM, 'M52 196 H148', 'M14 182 H36', 'M164 182 H186'], folds: TOPF },
  shorts: { seams: ['M48 44 H153', 'M92 30 V52', 'M108 30 V52', 'M40 150 H92', 'M108 150 H160'], folds: ['M60 60 Q66 100 58 140', 'M140 60 Q134 100 142 140'] },
  calca: { seams: ['M52 32 H148', 'M100 20 V66', 'M43 198 H92', 'M108 198 H158'], folds: ['M64 100 Q70 150 62 195', 'M136 100 Q130 150 138 195'] },
  bone: { seams: ['M100 58 V128', 'M72 64 Q66 100 70 128', 'M128 64 Q134 100 130 128'], folds: ['M70 76 Q85 66 100 70'] },
  bolsa: { seams: ['M34 194 H166'], folds: ['M50 100 Q60 150 48 195', 'M150 100 Q140 150 152 195'] },
};
const POS = { camiseta: [100, 84, 15], regata: [100, 88, 14], manga_longa: [100, 84, 15], blusa: [100, 86, 15], jaqueta: [100, 90, 15], shorts: [100, 62, 11], calca: [100, 54, 11], bone: [100, 104, 11], bolsa: [100, 132, 17] };
const TOPS = ['camiseta', 'regata', 'manga_longa', 'blusa', 'jaqueta'];
const lum = h => { const n = parseInt((h || '#000').slice(1), 16); return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; };
// Peça escura -> logo cinza; peça clara -> logo preta
export const logoColor = c => (lum(c) < 0.45 ? '#9b9b9e' : '#0d0d0d');
const Mk = ({ x, y, w, c }) => (
  <svg x={x - w / 2} y={y} width={w} height={w * 0.9} viewBox="0 0 100 90"><g fill={c}><path d="M2 3H31L49 56Q51 62 55 56L63 42L71 48L57 74Q49 85 41 74Z" /><path d="M98 3Q79 4 73 15L58 44L65 47Q82 36 98 3Z" /></g></svg>
);
export default function Garment({ type = 'camiseta', color = '#0d0d0d', logo = 'VARIABLE', print = 'chest', tagline = 'each expression has its own value' }) {
  type = P[shapeOf(type)] ? shapeOf(type) : 'camiseta';
  const [x, y, fs] = POS[type]; const c = logoColor(color); const d = D[type]; const cp = 'gv-' + type;
  const T = (t, yy, s, w = 500, ls = 0.12) => <text x={x} y={yy} textAnchor="middle" fontSize={s} fontWeight={w} letterSpacing={s * ls} fill={c} fontFamily="Montserrat, Arial, sans-serif">{t}</text>;
  let art = null;
  if (print === 'mark') art = <Mk x={TOPS.includes(type) ? x + 26 : x} y={y - fs * 1.3} w={fs * 1.1} c={c} />;
  else if (print === 'word') art = T(logo, y, fs * 0.8, 600, 0.14);
  else if (print === 'big') art = <Mk x={x} y={y - fs * 2.3} w={fs * 4.2} c={c} />;
  else if (print === 'tag') art = <><Mk x={x} y={y - fs * 1.8} w={fs * 1.2} c={c} />{T(logo, y, fs * 0.6)}{T(tagline, y + fs * 0.7, fs * 0.24, 400, 0.04)}</>;
  else if (print === 'chest') art = <><Mk x={x} y={y - fs * 1.9} w={fs * 1.6} c={c} />{T(logo, y + 2, fs * 0.62)}</>;
  return (
    <svg viewBox="0 0 200 220" className="garment" role="img" aria-label={type}>
      <defs>
        <clipPath id={cp}><path d={P[type]} /></clipPath>
        <linearGradient id="gv-sh" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stopColor="#000" stopOpacity=".32" /><stop offset=".22" stopColor="#000" stopOpacity="0" /><stop offset=".5" stopColor="#fff" stopOpacity=".12" /><stop offset=".78" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".36" /></linearGradient>
        <linearGradient id="gv-sv" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".1" /><stop offset="1" stopColor="#000" stopOpacity=".16" /></linearGradient>
        <filter id="gv-bl"><feGaussianBlur stdDeviation="3.2" /></filter>
        <filter id="gv-sd" x="-20%" y="-300%" width="140%" height="700%"><feGaussianBlur stdDeviation="4" /></filter>
        <filter id="gv-tx" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4" /><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .5 -.15" /></filter>
      </defs>
      <ellipse cx="100" cy={type === 'bone' ? 150 : 212} rx={type === 'bone' ? 72 : 64} ry="5" fill="#000" opacity=".24" filter="url(#gv-sd)" />
      {type === 'bolsa' && <path d="M70 74 V48 Q70 26 100 26 Q130 26 130 48 V74" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />}
      {d.inner && <><path d={d.inner} fill={color} /><path d={d.inner} fill="#000" opacity=".4" /></>}
      <path d={P[type]} fill={color} />
      <g clipPath={`url(#${cp})`}>
        <rect width="200" height="220" fill="url(#gv-sh)" /><rect width="200" height="220" fill="url(#gv-sv)" />
        <rect width="200" height="220" fill="none" filter="url(#gv-tx)" opacity=".5" />
        {type === 'bone' && <path d={BRIM} fill="#000" opacity=".24" />}
        <g filter="url(#gv-bl)">{d.folds.map((f, i) => <g key={i}><path d={f} stroke="#000" strokeOpacity=".07" strokeWidth="7" fill="none" strokeLinecap="round" /><path d={f} transform="translate(5 -2)" stroke="#fff" strokeOpacity=".08" strokeWidth="4" fill="none" strokeLinecap="round" /></g>)}</g>
      </g>
      <path d={P[type]} fill="none" stroke="#000" strokeOpacity=".4" strokeWidth="1" strokeLinejoin="round" />
      {d.seams.map((s, i) => <path key={i} d={s} fill="none" stroke="#000" strokeOpacity=".3" strokeWidth=".9" strokeDasharray="2 1.6" />)}
      {d.rib && <path d={d.rib} fill="none" stroke="#000" strokeOpacity=".24" strokeWidth="4" strokeLinecap="round" />}
      {d.zip && <path d={d.zip} stroke="#000" strokeOpacity=".5" strokeWidth="1.8" />}
      {type === 'bone' && <circle cx="100" cy="58" r="3" fill="#000" opacity=".35" />}
      {art}
    </svg>
  );
}
