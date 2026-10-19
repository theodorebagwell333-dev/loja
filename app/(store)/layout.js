import Link from 'next/link';
import { getSite } from '@/lib/data';
import { waNumber } from '@/lib/util';
import { CartProvider, Header, Drawer } from '@/components/Cart';
export const dynamic = 'force-dynamic';
export async function generateMetadata() { const { s } = await getSite(); return { title: s.store_name || 'VARIABLE', description: s.hero_subtitle }; }
export default async function Layout({ children }) {
  const { s, cols } = await getSite();
  return (
    <CartProvider><div style={{ '--ac': s.accent || '#b5b5b5' }}>
      {s.announcement && <div className="ann">{s.announcement}</div>}
      <Header s={s} cols={cols} />
      <main>{children}</main>
      <footer><div><b>{s.store_name}</b><br />{s.tagline}<br /><small>{s.footer_text}</small></div>
        <div><a href={s.instagram}>Instagram</a> · <a href={`https://wa.me/${waNumber(s.whatsapp)}`}>WhatsApp</a> · <Link href="/admin">Admin</Link></div></footer>
      <Drawer wa={s.whatsapp} />
    </div></CartProvider>
  );
}
