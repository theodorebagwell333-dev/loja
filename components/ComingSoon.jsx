import Link from 'next/link';
import Garment from './Garment';
import { MAIN } from '@/main.config';
import { fill, waLink } from '@/lib/util';

// Bloco "Em breve": aparece no lugar de seções/categorias/coleções sem produtos.
// type → desenha a silhueta da categoria (ex.: boné). nome → usado no texto.
export default function ComingSoon({ type, nome, text, wa, compact = false, showBack = true }) {
  const E = MAIN.emBreve;
  const msg = fill(E.mensagemWhatsApp, nome || 'as novidades');
  return (
    <section className={'soon' + (compact ? ' sm' : '')} aria-label={E.selo}>
      <div className="soon-art" aria-hidden="true">
        <span className="ring" /><span className="ring" /><span className="ring" />
        <Garment type={type || 'camiseta'} color="#d3cec2" print="none" />
      </div>
      <div className="soon-tx">
        <small className="soon-eye"><i className="dot" />{E.chamada}</small>
        <h2>{E.selo}</h2>
        <p>{text || (nome ? fill(E.textoCategoria, nome) : E.textoGeral)}</p>
        <div className="soon-actions">
          {wa !== false && <a className="btn" href={waLink(wa, msg)} target="_blank" rel="noopener">{E.botaoAvisar}</a>}
          {showBack && <Link className="btn ghost" href="/loja">{E.botaoVoltar}</Link>}
        </div>
      </div>
    </section>
  );
}
