import { Cormorant_Garamond, Montserrat } from 'next/font/google';
import './globals.css';
const h = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--f-h' });
const b = Montserrat({ subsets: ['latin'], weight: ['400', '600'], variable: '--f-b' });
export default function Root({ children }) {
  return <html lang="pt-BR"><body className={`${h.variable} ${b.variable}`}>{children}</body></html>;
}
