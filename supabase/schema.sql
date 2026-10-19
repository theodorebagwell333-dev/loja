-- Rode no Supabase > SQL Editor (banco novo). Se você já tem banco, rode só supabase/update_v4.sql
create table settings(id int primary key default 1, data jsonb not null default '{}');
create table collections(id uuid primary key default gen_random_uuid(), name text not null, slug text unique not null, sort int default 0, active bool default true);
create table products(id uuid primary key default gen_random_uuid(), slug text unique not null, name text not null, description text default '',
 price numeric(10,2) not null, type text not null, -- categorias ficam em main.config.js (sem trava no banco)
 color text default '#0d0d0d', color_name text default 'Preto', collection_id uuid references collections(id) on delete set null,
 images text[] default '{}', print text default 'chest', sizes jsonb default '{"P":10,"M":10,"G":10,"GG":10}', active bool default true, coming_soon bool default false, featured bool default false, created_at timestamptz default now());
create table orders(id uuid primary key default gen_random_uuid(), customer jsonb, items jsonb, total numeric(10,2), status text default 'novo', created_at timestamptz default now());
create table admins(user_id uuid primary key references auth.users(id) on delete cascade);

create function is_admin() returns bool language sql security definer stable as $$ select exists(select 1 from admins where user_id=auth.uid()) $$;

alter table settings enable row level security; alter table collections enable row level security; alter table products enable row level security;
alter table orders enable row level security; alter table admins enable row level security;
create policy "read" on settings for select using (true);
create policy "read" on collections for select using (true);
create policy "read" on products for select using (active or is_admin());
create policy "admin" on settings for all using (is_admin()) with check (is_admin());
create policy "admin" on collections for all using (is_admin()) with check (is_admin());
create policy "admin" on products for all using (is_admin()) with check (is_admin());
create policy "buy" on orders for insert with check (true);
create policy "admin" on orders for all using (is_admin()) with check (is_admin());
create policy "self" on admins for select using (user_id=auth.uid());

insert into storage.buckets(id,name,public) values('products','products',true) on conflict do nothing;
create policy "img read" on storage.objects for select using (bucket_id='products');
create policy "img admin" on storage.objects for all using (bucket_id='products' and is_admin()) with check (bucket_id='products' and is_admin());

insert into settings(id,data) values(1,'{"store_name":"VARIABLE","logo_text":"VARIABLE","tagline":"each expression has its own value","logo_url":"","announcement":"Frete grátis acima de R$ 299 · Drop 01 já disponível","hero_title":"Cada expressão tem o seu valor.","hero_subtitle":"Básicos em preto, cinza e off white, com corte e acabamento.","hero_cta":"Ver a coleção","accent":"#8d877d","whatsapp":"5517992372615","instagram":"https://instagram.com/","footer_text":"© 2026 VARIABLE. Todos os direitos reservados."}');
insert into collections(name,slug,sort) values('ESSENCIAIS','essenciais',1),('MONOGRAMA','monograma',2),('EXPRESSÃO','expressao',3);

insert into products(slug,name,description,price,type,color,color_name,collection_id,print,sizes,featured)
select lower(regexp_replace(translate(v.n,'ÇçãáâéêíóôõúÁÉ','CcaaaeeiooouAE'),'[^a-zA-Z0-9]+','-','g')),v.n,'Algodão premium com acabamento refinado. Edite esta descrição no painel.',v.p,v.t,v.c,v.cn,(select id from collections where slug=v.col),v.pr,
 case when v.t in ('bone','bolsa') then '{"Único":15}'::jsonb else '{"P":10,"M":10,"G":10,"GG":10}'::jsonb end, v.f
from (values
('Camiseta Essencial Preta',129,'camiseta','#0d0d0d','Preto','essenciais',true,'chest'),
('Camiseta Essencial Off White',129,'camiseta','#ebe8e1','Off White','essenciais',true,'chest'),
('Camiseta Oversized Taupe',169,'camiseta','#8d877d','Taupe','essenciais',false,'chest'),
('Camiseta Monograma Preta',139,'camiseta','#0d0d0d','Preto','monograma',false,'mark'),
('Camiseta Monograma Off White',139,'camiseta','#ebe8e1','Off White','monograma',false,'mark'),
('Camiseta Monograma Cinza Mescla',139,'camiseta','#9a9a9c','Cinza Mescla','monograma',false,'mark'),
('Camiseta Nome Chumbo',149,'camiseta','#3a3a3c','Chumbo','expressao',false,'word'),
('Camiseta Nome Branca',149,'camiseta','#f5f5f5','Branca','expressao',false,'word'),
('Camiseta Grande V Preta',159,'camiseta','#0d0d0d','Preto','expressao',true,'big'),
('Camiseta Grande V Areia',159,'camiseta','#cfc6b4','Areia','expressao',false,'big'),
('Camiseta Slogan Off White',149,'camiseta','#ebe8e1','Off White','expressao',false,'tag'),
('Camiseta Slogan Grafite',149,'camiseta','#2b2b2d','Grafite','expressao',false,'tag'),
('Regata Essencial Preta',109,'regata','#0d0d0d','Preto','essenciais',false,'chest'),
('Regata Monograma Off White',109,'regata','#ebe8e1','Off White','monograma',false,'mark'),
('Manga Longa Essencial Preta',169,'manga_longa','#0d0d0d','Preto','essenciais',false,'chest'),
('Manga Longa Monograma Cinza',169,'manga_longa','#a7a7a9','Cinza','monograma',false,'mark'),
('Moletom Monograma Preto',299,'blusa','#0d0d0d','Preto','monograma',true,'mark'),
('Moletom Grande V Cinza',319,'blusa','#a7a7a9','Cinza Claro','expressao',false,'big'),
('Blusa Canguru Chumbo',279,'blusa','#3a3a3c','Chumbo','essenciais',false,'chest'),
('Blusa Nome Off White',289,'blusa','#ebe8e1','Off White','expressao',false,'word'),
('Jaqueta Corta-vento Preta',349,'jaqueta','#0d0d0d','Preto','essenciais',false,'mark'),
('Jaqueta Coach Cinza',369,'jaqueta','#6f6f72','Cinza','monograma',false,'mark'),
('Shorts Moletom Preto',169,'shorts','#0d0d0d','Preto','essenciais',false,'mark'),
('Shorts Tactel Cinza',149,'shorts','#6f6f72','Cinza','expressao',false,'word'),
('Shorts Off White Essencial',159,'shorts','#ebe8e1','Off White','essenciais',false,'mark'),
('Calça Jogger Chumbo',239,'calca','#3a3a3c','Chumbo','monograma',false,'mark'),
('Calça Cargo Preta',279,'calca','#0d0d0d','Preto','essenciais',false,'mark'),
('Calça Wide Off White',259,'calca','#ebe8e1','Off White','expressao',false,'word'),
('Boné Monograma Preto',129,'bone','#0d0d0d','Preto','monograma',false,'big'),
('Boné Monograma Off White',129,'bone','#ebe8e1','Off White','monograma',false,'big'),
('Boné Nome Cinza',129,'bone','#8e8e90','Cinza','expressao',false,'word'),
('Ecobag Off White',79,'bolsa','#ebe8e1','Off White','essenciais',false,'big'),
('Ecobag Preta',79,'bolsa','#0d0d0d','Preto','essenciais',false,'chest'),
('Camiseta Lisa Preta',119,'camiseta','#0d0d0d','Preto','essenciais',false,'none'),
('Camiseta Lisa Off White',119,'camiseta','#ebe8e1','Off White','essenciais',false,'none'),
('Camiseta Lisa Cinza Mescla',119,'camiseta','#9a9a9c','Cinza Mescla','essenciais',false,'none'),
('Camiseta Lisa Chumbo',119,'camiseta','#3a3a3c','Chumbo','essenciais',false,'none'),
('Camiseta Lisa Areia',119,'camiseta','#cfc6b4','Areia','essenciais',false,'none'),
('Camiseta Lisa Azul Marinho',119,'camiseta','#1c2433','Azul Marinho','essenciais',false,'none'),
('Camiseta Lisa Verde Militar',119,'camiseta','#4a5240','Verde Militar','essenciais',false,'none'),
('Camiseta Lisa Bordô',119,'camiseta','#5a1f2b','Bordô','essenciais',false,'none'),
('Regata Lisa Off White',99,'regata','#ebe8e1','Off White','essenciais',false,'none'),
('Regata Lisa Chumbo',99,'regata','#3a3a3c','Chumbo','essenciais',false,'none'),
('Manga Longa Lisa Off White',149,'manga_longa','#ebe8e1','Off White','essenciais',false,'none'),
('Manga Longa Lisa Preta',149,'manga_longa','#0d0d0d','Preto','essenciais',false,'none'),
('Moletom Liso Preto',259,'blusa','#0d0d0d','Preto','essenciais',false,'none'),
('Moletom Liso Cinza Mescla',259,'blusa','#9a9a9c','Cinza Mescla','essenciais',false,'none'),
('Moletom Liso Azul Marinho',259,'blusa','#1c2433','Azul Marinho','essenciais',false,'none'),
('Jaqueta Lisa Areia',329,'jaqueta','#cfc6b4','Areia','essenciais',false,'none'),
('Shorts Liso Chumbo',139,'shorts','#3a3a3c','Chumbo','essenciais',false,'none'),
('Shorts Liso Areia',139,'shorts','#cfc6b4','Areia','essenciais',false,'none'),
('Calça Lisa Preta',219,'calca','#0d0d0d','Preto','essenciais',false,'none'),
('Calça Lisa Areia',229,'calca','#cfc6b4','Areia','essenciais',false,'none'),
('Boné Liso Preto',109,'bone','#0d0d0d','Preto','essenciais',false,'none'),
('Boné Liso Areia',109,'bone','#cfc6b4','Areia','essenciais',false,'none'),
('Boné Liso Azul Marinho',109,'bone','#1c2433','Azul Marinho','essenciais',false,'none'),
('Ecobag Lisa Areia',59,'bolsa','#cfc6b4','Areia','essenciais',false,'none'),
('Camiseta Grande V Azul Marinho',159,'camiseta','#1c2433','Azul Marinho','expressao',false,'big'),
('Camiseta Monograma Verde Militar',139,'camiseta','#4a5240','Verde Militar','monograma',false,'mark')
) as v(n,p,t,c,cn,col,f,pr);

-- Depois de criar seu usuário em Authentication > Users, torne-o admin:
-- insert into admins select id from auth.users where email='SEU@EMAIL.COM';
