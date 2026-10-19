# Fotos reais e modelos

O site já mostra fotos reais no lugar do render quando o produto tem imagens
(1ª = principal, 2ª = aparece ao passar o mouse, todas na galeria do produto).

## Formato
As fotos enviadas pelo admin são ajustadas sozinhas para 4:5 (1200×1500). Foto muito diferente (paisagem, quadrada) aparece inteira, sem cortar. Fotos enviadas por script também se ajustam na loja.

## Como enviar
- **Um por um:** Admin > Produtos > Editar > "Fotos reais".
- **Em lote:** coloque os arquivos em `fotos/` com o slug do produto no nome
  (`camiseta-essencial-preta.jpg`, `camiseta-essencial-preta-2.jpg`) e rode:
  `SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/importar-fotos.mjs`
  (a service role key fica em Project Settings > API; NUNCA coloque no .env público nem no Git).

## Como conseguir as fotos
1. **Fotografar** uma peça-piloto de cada modelo (melhor resultado e zero risco).
2. **Gerar com IA** (Midjourney, Flux, Ideogram, Gemini, ChatGPT...) peças lisas em modelo.
   Prompt base: "fashion e-commerce photo, [homem/mulher] wearing a plain [oversized black t-shirt],
   neutral beige studio background, soft natural light, full body, 85mm, minimalist premium streetwear".
   IA erra logo e texto: gere a peça LISA e aplique a logo VARIABLE depois (Photoshop, Canva, Photopea ou Placeit).
3. **Mockups prontos** (Placeit, Mockup World) com sua logo em PNG transparente.

Os slugs estão em Admin > Produtos (ou no SQL de seed).
