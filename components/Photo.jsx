'use client';
import { useEffect, useRef, useState } from 'react';
import { MAIN } from '@/main.config';

// Foto inteligente: ocupa o espaço do pai (que define a proporção).
// • Foto parecida com a proporção da loja (4:5) → preenche o quadro (corta de leve).
// • Foto muito diferente (paisagem, quadrada…) → aparece INTEIRA, sobre uma versão desfocada dela mesma.
// Assim nenhuma foto sai esticada, cortada demais ou com bordas feias.
const ALVO = MAIN.fotos.largura / MAIN.fotos.altura;

export default function Photo({ src, alt = '', priority = false }) {
  const [fit, setFit] = useState('cover');
  const ref = useRef(null);
  const julgar = im => {
    if (!im?.naturalWidth) return;
    const r = im.naturalWidth / im.naturalHeight;
    setFit(Math.abs(r - ALVO) / ALVO > MAIN.fotos.tolerancia ? 'contain' : 'cover');
  };
  // imagem que já carregou antes da hidratação não dispara onLoad
  useEffect(() => { if (ref.current?.complete) julgar(ref.current); }, [src]);
  return (
    <div className={'pho ' + fit}>
      {fit === 'contain' && <img className="bg" src={src} alt="" aria-hidden="true" />}
      <img ref={ref} className="im" src={src} alt={alt} loading={priority ? 'eager' : 'lazy'} decoding="async" onLoad={e => julgar(e.currentTarget)} />
    </div>
  );
}
