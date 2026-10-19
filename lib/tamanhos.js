import { MAIN } from '@/main.config';

// Ordena tamanhos na ordem definida em main.config.js (ordemTamanhos): PP, P, M, G, GG...
export function ordenarTamanhos(lista = []) {
  const ordem = MAIN.ordemTamanhos || ['PP', 'P', 'M', 'G', 'GG'];
  const norm = (t) => String(t).trim().toUpperCase();
  const pos = (t) => {
    const i = ordem.findIndex((o) => norm(o) === norm(t));
    return i === -1 ? 999 : i;
  };
  return [...lista].sort((a, b) => {
    const d = pos(a) - pos(b);
    if (d !== 0) return d;
    const na = parseFloat(a), nb = parseFloat(b);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    return String(a).localeCompare(String(b));
  });
}
