// ═══════════════════════════════════════════════════════════════════════
//  MAIN — o arquivo central da loja.
//  Quase tudo que você quer mudar no dia a dia está aqui, num lugar só.
//  Salvou? O site e o admin acompanham. (Textos também podem ser trocados
//  em Admin > Site; o que você salvar lá tem prioridade sobre este arquivo.)
// ═══════════════════════════════════════════════════════════════════════

export const MAIN = {
  // ── 1. DADOS PADRÃO DA LOJA ─────────────────────────────────────────
  // Usados quando o campo correspondente estiver vazio em Admin > Site.
  loja: {
    store_name: 'VARIABLE',
    logo_text: 'VARIABLE',
    tagline: 'each expression has its own value',
    announcement: 'Frete grátis acima de R$ 299 · Drop 01 já disponível',
    hero_title: 'Cada expressão tem o seu valor.',
    hero_subtitle: 'Básicos em preto, cinza e off white, com corte e acabamento.',
    hero_cta: 'Ver a coleção',
    accent: '#8d877d',
    whatsapp: '5517992372615', // só números, com 55
    instagram: 'https://instagram.com/',
    footer_text: '© 2026 VARIABLE. Todos os direitos reservados.',
  },

  // ── 2. CATEGORIAS (tipos de peça) ───────────────────────────────────
  // id       → nome interno (sem acento, sem espaço). NÃO mude de uma categoria que já tem produtos.
  // nome     → como aparece no site
  // forma    → desenho usado quando o produto ainda não tem foto:
  //            camiseta | regata | manga_longa | blusa | jaqueta | shorts | calca | bone | bolsa
  // tamanhos → tamanhos sugeridos no admin ao criar um produto dessa categoria
  // estoque  → quantidade inicial sugerida por tamanho
  // ativa    → false esconde a categoria do site e do admin
  categorias: [
    { id: 'camiseta', nome: 'Camisetas', forma: 'camiseta', tamanhos: ['P', 'M', 'G', 'GG'], estoque: 10 },
    { id: 'regata', nome: 'Regatas', forma: 'regata', tamanhos: ['P', 'M', 'G', 'GG'], estoque: 10 },
    { id: 'manga_longa', nome: 'Mangas longas', forma: 'manga_longa', tamanhos: ['P', 'M', 'G', 'GG'], estoque: 10 },
    { id: 'blusa', nome: 'Blusas', forma: 'blusa', tamanhos: ['P', 'M', 'G', 'GG'], estoque: 10 },
    { id: 'jaqueta', nome: 'Jaquetas', forma: 'jaqueta', tamanhos: ['P', 'M', 'G', 'GG'], estoque: 10 },
    { id: 'shorts', nome: 'Shorts', forma: 'shorts', tamanhos: ['P', 'M', 'G', 'GG'], estoque: 10 },
    { id: 'calca', nome: 'Calças', forma: 'calca', tamanhos: ['P', 'M', 'G', 'GG'], estoque: 10 },
    { id: 'bone', nome: 'Bonés', forma: 'bone', tamanhos: ['Único'], estoque: 15 },
    { id: 'bolsa', nome: 'Bolsas', forma: 'bolsa', tamanhos: ['Único'], estoque: 15 },
    // Exemplo para criar uma categoria nova (tire as barras):
    // { id: 'meia', nome: 'Meias', forma: 'camiseta', tamanhos: ['Único'], estoque: 20 },
  ],

  // Categorias que ganham link fixo no menu do topo (além de "Loja" e das coleções).
  menu: ['bone'],

  // ── 3. FOTOS (sistema inteligente) ──────────────────────────────────
  // Toda foto enviada pelo admin é ajustada para esta proporção.
  // Foto parecida com a proporção → corta de leve (preenche).
  // Foto muito diferente (paisagem, quadrada, etc.) → aparece INTEIRA, sobre o fundo da própria foto.
  fotos: {
    largura: 1200,
    altura: 1500, // 1200×1500 = proporção 4:5, a mesma dos cards do site
    qualidade: 0.86,
    tolerancia: 0.22, // até 22% de diferença de proporção ainda corta; acima disso mostra inteira
    focoVertical: 0.35, // ao cortar, mantém mais o topo (rostos/gola). 0.5 = centro
  },

  // ── 4. "EM BREVE" ───────────────────────────────────────────────────
  // {nome} vira o nome da categoria / produto automaticamente.
  emBreve: {
    selo: 'Em breve',
    chamada: 'Novidade a caminho',
    textoGeral: 'Estamos preparando as próximas peças com todo o cuidado. Chega logo por aqui.',
    textoCategoria: '{nome} estão a caminho. Estamos finalizando cada detalhe para o lançamento.',
    textoProduto: 'Esta peça ainda não está à venda. Quer ser avisado quando chegar?',
    botaoAvisar: 'Quero ser avisado',
    mensagemWhatsApp: 'Olá! Quero ser avisado quando "{nome}" chegar.',
    botaoVoltar: 'Ver outras peças',
  },

  // ── 5. ADMIN ────────────────────────────────────────────────────────
  estoqueBaixo: 5, // peça com somatório de estoque igual ou menor que isso aparece como "estoque baixo"

  // Cores prontas (clique para escolher no admin)
  cores: [
    { nome: 'Preto', hex: '#0d0d0d' },
    { nome: 'Grafite', hex: '#2b2b2d' },
    { nome: 'Chumbo', hex: '#3a3a3c' },
    { nome: 'Cinza', hex: '#6f6f72' },
    { nome: 'Cinza Mescla', hex: '#9a9a9c' },
    { nome: 'Off White', hex: '#ebe8e1' },
    { nome: 'Branco', hex: '#f5f5f5' },
    { nome: 'Areia', hex: '#cfc6b4' },
    { nome: 'Taupe', hex: '#8d877d' },
    { nome: 'Azul Marinho', hex: '#1c2433' },
    { nome: 'Verde Militar', hex: '#4a5240' },
    { nome: 'Bordô', hex: '#5a1f2b' },
  ],

  // Estampas do desenho (só aparecem enquanto o produto não tem foto real)
  estampas: {
    none: 'Sem estampa (lisa)',
    chest: 'Logo + nome no peito',
    mark: 'Monograma pequeno',
    word: 'Nome em destaque',
    big: 'Monograma grande',
    tag: 'Logo + slogan',
  },
};
