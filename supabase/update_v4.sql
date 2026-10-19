-- ATUALIZAÇÃO v4 — rode UMA vez no Supabase > SQL Editor. Não apaga nada.
-- 1) Produto "Em breve" (aparece na loja com selo, sem botão de compra)
alter table products add column if not exists coming_soon bool default false;
-- 2) Categorias agora são definidas em main.config.js (ex.: Bonés, ou qualquer nova).
--    Remove a trava antiga que só aceitava uma lista fixa de tipos.
alter table products drop constraint if exists products_type_check;
-- 3) Garante a coluna da estampa (versões antigas não tinham)
alter table products add column if not exists print text default 'chest';
