# VARIABLE — loja (Next.js + Supabase + Vercel)

## Instalação
1. Supabase: crie o projeto e rode `supabase/schema.sql` no SQL Editor.
2. Authentication > Users: crie seu usuário. Depois rode:
   `insert into admins select id from auth.users where email='SEU@EMAIL.COM';`
3. Copie `.env.example` para `.env.local` (este fica só no seu computador, nunca no Git) e preencha URL e anon key (Project Settings > API).
4. `npm install && npm run dev` — admin em `/admin`.
5. Vercel: suba no GitHub, importe o repositório e adicione as 2 variáveis de ambiente.

## Já tinha o banco criado? (IMPORTANTE nesta versão)
Rode **uma vez** `supabase/update_v4.sql` no SQL Editor. Ele só adiciona a coluna do "Em breve" e libera
categorias novas; não apaga nada.

## Onde mudar as coisas — `main.config.js`
Arquivo central: dados padrão da loja, **categorias** (ex.: Bonés), links fixos do menu, regras das fotos,
textos do "Em breve", cores prontas e limite de estoque baixo. Textos também podem ser trocados em Admin > Site.

## Admin (`/admin`)
- **Início:** resumo e alertas (esgotado, estoque baixo, sem foto).
- **Produtos:** busca, filtros por categoria/situação, liga/desliga "Na loja" e "Em breve" direto na lista,
  seleção em massa, **Excluir todos** (pede para digitar EXCLUIR TUDO) e editor em 5 passos com pré-visualização.
- **Fotos inteligentes:** toda foto enviada vira 1200×1500 (4:5). Parecida com 4:5 → preenche; paisagem/quadrada → aparece inteira
  sobre o fundo da própria foto. Fotos antigas também se ajustam sozinhas na loja.
- **"Em breve":** produto com selo e sem compra (botão "Quero ser avisado" no WhatsApp). Categorias e coleções
  sem produtos mostram um bloco "Em breve" em vez de ficar vazias.
