import Link from 'next/link';
import Garment from './Garment';
import Photo from './Photo';
import { MAIN } from '@/main.config';
import { brl, soldOut, isSoon } from '@/lib/util';

// preview=true → usado no admin (não é link)
export default function Card({ p, logo, preview = false }) {
  const soon = isSoon(p), out = soldOut(p), img = p.images?.[0];
  const body = (
    <>
      <div className="ph">
        {img ? <><Photo src={img} alt={p.name} />{p.images[1] && <div className="b"><Photo src={p.images[1]} alt="" /></div>}</> : <Garment type={p.type} color={p.color} logo={logo} print={p.print} />}
        {soon && <><div className="soonv" /><span className="soonc">{MAIN.emBreve.selo}</span></>}
        {out && <i>Esgotado</i>}
      </div>
      <h3>{p.name || 'Nome do produto'}</h3>
      <span>{soon ? MAIN.emBreve.selo : brl(p.price)}</span>
    </>
  );
  return preview ? <div className="card">{body}</div> : <Link href={`/produto/${p.slug}`} className="card">{body}</Link>;
}
