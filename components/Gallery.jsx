'use client';
import { useState } from 'react';
import Photo from './Photo';
export default function Gallery({ images, alt }) {
  const [i, setI] = useState(0);
  return (
    <div className="gal"><div className="ph"><Photo key={images[i]} src={images[i]} alt={alt} priority /></div>
      {images.length > 1 && <div className="th">{images.map((u, k) => <button key={k} className={k === i ? 'on' : ''} onClick={() => setI(k)} aria-label={`Foto ${k + 1}`}><Photo src={u} /></button>)}</div>}</div>
  );
}
