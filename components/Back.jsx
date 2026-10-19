'use client';
import { useRouter } from 'next/navigation';
export default function Back() {
  const r = useRouter();
  return <button className="back" onClick={() => (window.history.length > 1 ? r.back() : r.push('/loja'))}>← Voltar</button>;
}
