## Alterações no Dashboard

**Arquivo**: `src/pages/Dashboard.tsx`

### 1. Renomear a dica
- Trocar o rótulo "Dica da Dra. Luz" por **"Dica da Luz"** no bloco existente (mantendo estilo e citação).

### 2. Nova seção "Artigos do Dica Luz" (abaixo da dica)
Carrossel horizontal inspirado no cartão "Descubra vinícolas" da referência: cards grandes com imagem de capa ocupando o fundo, gradiente escuro na base, badge circular no topo esquerdo e título/meta sobrepostos.

**Layout**
- Cabeçalho com título `Artigos do Dica Luz` (font-display italic) + link `Ver todos →` para `/blog`.
- Scroll horizontal (`overflow-x-auto snap-x`) com cards de ~280×340px, cantos arredondados (`rounded-3xl`), sombra suave.
- Cada card (`<Link to={/blog/${slug}}>`):
  - `cover_image` como background (`object-cover`), fallback com gradiente `from-primary/20 to-accent/20` + ícone Sparkles.
  - Círculo branco no canto superior esquerdo (~56px) com ícone Sparkles em `text-primary` (equivalente ao logo da vinícola).
  - Gradiente `from-black/80 via-black/40 to-transparent` na metade inferior.
  - Sobreposto na base: título (serif, branco, 2 linhas máx) e linha meta com autor · data formatada em pt-BR.
- Estado vazio: esconder a seção se não houver posts publicados.
- Estado de carregamento: skeleton com 2 cards em pulse.

**Dados**
- Fetch em `useEffect`: `supabase.from("blog_posts").select("id,slug,title,cover_image,author,created_at").eq("published", true).order("created_at",{ascending:false}).limit(6)`.
- Estado local `posts` + `loadingPosts` (não bloqueia o restante do dashboard).

### Fora de escopo
- Sem mudanças em rotas, `BottomNav`, páginas de blog ou Edge Functions.
- Sem alterações em outros arquivos.
