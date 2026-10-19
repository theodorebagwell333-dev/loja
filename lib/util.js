import { MAIN } from '@/main.config';

export const brl = n => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// ── Categorias (vêm do main.config.js) ──
export const CATS = MAIN.categorias.filter(c => c.ativa !== false);
export const TYPES = Object.fromEntries(CATS.map(c => [c.id, c.nome]));
export const catOf = id => MAIN.categorias.find(c => c.id === id);
export const shapeOf = id => catOf(id)?.forma || id;
export const PRINTS = MAIN.estampas;

// ── Estado do produto ──
export const isSoon = p => !!p?.coming_soon;
export const stockTotal = p => Object.values(p?.sizes || {}).reduce((a, b) => a + (Number(b) || 0), 0);
export const soldOut = p => !isSoon(p) && stockTotal(p) <= 0;

export const slugify = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
export const fill = (t, nome) => String(t || '').replaceAll('{nome}', nome || '');

// número do WhatsApp da loja (o valor do admin vence; o antigo placeholder é ignorado)
export const waNumber = n => { const d = String(n || '').replace(/\D/g, ''); return d && d !== '5511999999999' ? d : MAIN.loja.whatsapp; };
export const waLink = (n, msg) => `https://wa.me/${waNumber(n)}${msg ? `?text=${encodeURIComponent(msg)}` : ''}`;
