import { MAIN } from '@/main.config';

// Sistema inteligente de fotos: transforma qualquer foto no formato da loja (4:5 por padrão).
//  modo 'auto'  → parecida com 4:5: preenche (corta de leve). Muito diferente: mostra inteira sobre o fundo da própria foto.
//  modo 'fill'  → sempre preenche (corta o que sobrar)
//  modo 'fit'   → sempre mostra a foto inteira
export const MODOS = [
  ['auto', 'Automático (recomendado)'],
  ['fill', 'Preencher (corta as bordas)'],
  ['fit', 'Mostrar inteira'],
];

const { largura: W, altura: H, qualidade, tolerancia, focoVertical } = MAIN.fotos;

// cor média da borda da foto → fundo "invisível" quando a foto aparece inteira
function corDaBorda(bmp) {
  const n = 40, c = document.createElement('canvas'); c.width = c.height = n;
  const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(bmp, 0, 0, n, n);
  const d = x.getImageData(0, 0, n, n).data; let r = 0, g = 0, b = 0, q = 0;
  for (let i = 0; i < n; i++) for (const [px, py] of [[i, 0], [i, n - 1], [0, i], [n - 1, i]]) { const k = (py * n + px) * 4; r += d[k]; g += d[k + 1]; b += d[k + 2]; q++; }
  return `rgb(${Math.round(r / q)},${Math.round(g / q)},${Math.round(b / q)})`;
}

export async function prepararFoto(file, modo = 'auto') {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') return { blob: file, acao: 'original' };
  const bmp = await createImageBitmap(file);
  const alvo = W / H, r = bmp.width / bmp.height;
  const inteira = modo === 'fit' || (modo === 'auto' && Math.abs(r - alvo) / alvo > tolerancia);
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d'); x.imageSmoothingQuality = 'high';
  if (inteira) {
    x.fillStyle = corDaBorda(bmp); x.fillRect(0, 0, W, H);
    const k = Math.min(W / bmp.width, H / bmp.height), w = bmp.width * k, h = bmp.height * k;
    x.drawImage(bmp, (W - w) / 2, (H - h) / 2, w, h);
  } else {
    const k = Math.max(W / bmp.width, H / bmp.height), sw = W / k, sh = H / k;
    x.drawImage(bmp, (bmp.width - sw) / 2, (bmp.height - sh) * focoVertical, sw, sh, 0, 0, W, H);
  }
  bmp.close?.();
  const blob = await new Promise(res => c.toBlob(b => res(b), 'image/webp', qualidade));
  if (!blob) return { blob: file, acao: 'original' };
  return { blob, acao: inteira ? 'inteira' : Math.abs(r - alvo) / alvo < 0.03 ? 'ok' : 'cortada' };
}
