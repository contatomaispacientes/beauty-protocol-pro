# Plano de Melhorias — Luz Skin

## 1. Navegação — Bottom Nav Mobile
- Criar `src/components/BottomNav.tsx` com 5 itens principais: **Analisar**, **Armário**, **Calendário**, **Chat Luz**, **Dashboard**.
- Renderizar apenas em telas `< md` (usando `useIsMobile`).
- Esconder `AppSidebar` em mobile (mantendo em desktop).
- Adicionar padding-bottom no `DashboardLayout` para não cobrir conteúdo.

## 2. Questionário Obrigatório no Primeiro Acesso
- Adicionar coluna `questionnaire_completed boolean default false` em `profiles` (migração).
- Em `ProtectedRoute`, se usuário logado (patient) e `questionnaire_completed = false`, redirecionar para `/questionnaire` (exceto se já estiver lá).
- Ao finalizar questionário, marcar `questionnaire_completed = true`.

## 3. Análise de Produto — Melhorias
**Página `src/pages/Products.tsx` + função `analyze-product`:**
- **Foto oficial do produto**: nova função edge `fetch-product-image` que usa Firecrawl (search) para buscar imagem oficial do produto pelo nome. Exibir na análise quando disponível.
  - Requer conector Firecrawl (perguntarei ao ativar).
- **Gestante — resposta direta**: alterar enum do schema `safe_for_pregnant` para `["Sim","Não"]` (removendo "Consultar médico"). Ajustar system prompt para IA decidir com base nos ingredientes conhecidos.
- **Adicionar ao Armário**: botão no card de resultado que insere em `user_products` (usando dados da análise).
- **Histórico de pesquisas**: 
  - Nova tabela `product_search_history` (id, user_id, product_name, brand, image_url, analysis jsonb, created_at) + RLS + GRANTs.
  - Salvar automaticamente cada análise bem-sucedida.
  - Seção "Pesquisas recentes" abaixo do formulário exibindo últimas 10, com clique para reabrir análise.
- **Compatibilidade com pele do usuário**: passar respostas do questionário (via `profiles` ou tabela de respostas) no prompt e adicionar campo `compatibility_with_user` no schema retornado (`Compatível` / `Parcialmente` / `Não recomendado` + justificativa).

## 4. Meu Armário — Análise Inteligente
Em `src/pages/Cabinet.tsx`:
- Nova função edge `analyze-cabinet` que recebe lista de produtos do usuário + perfil do questionário e retorna:
  - Produtos **redundantes** (mesma função).
  - Se rotina está **completa** (limpeza / hidratação / proteção solar / tratamento).
  - Sugestões de ajuste.
  - Compatibilidade geral com o perfil.
- Botão "Analisar meu armário" que exibe insights em card.

## 5. Blog "Dicas Luz Skin"
- Nova tabela `blog_posts` (id, slug, title, excerpt, content markdown, cover_image, author, published boolean, created_at) + RLS (leitura pública de publicados, escrita admin) + GRANTs.
- Página pública `/blog` (lista) e `/blog/:slug` (artigo, com ReactMarkdown).
- Painel super-admin `SuperAdminBlog.tsx`: CRUD manual + botão "Gerar com IA" que chama nova edge function `generate-blog-post` (Gemini) com input de tema; admin revisa antes de publicar.
- Link "Dicas Luz Skin" no footer/menu público e no bottom nav do dashboard (item extra ou dentro do dashboard).

## 6. Chat com IA → "Chat Luz"
- Renomear label em todos os menus (sidebar, bottom nav, dashboard).
- Atualizar título/header em `src/pages/Chat.tsx` para "Chat Luz".
- Rota `/chat` mantida.

## 7. Calendário — Responsividade
Em `src/pages/CalendarPage.tsx`:
- Grade semanal → visualização em lista/cards empilhados em mobile (`< md`).
- Botões de ação em coluna no mobile.
- Reduzir padding e ajustar tipografia mobile-first.

## 8. Diminuir passos da rotina / UI mais limpa
- Em `Routine`/`Cabinet`: agrupar em accordion por período (AM/PM), colapsados por padrão.
- Remover cards duplicados; usar densidade menor.

## Itens NÃO incluídos (conforme sua indicação)
- "Trocar minha rotina para produtos" — adiado até você decidir.

## Detalhes técnicos

**Migrações:**
```sql
ALTER TABLE profiles ADD COLUMN questionnaire_completed boolean NOT NULL DEFAULT false;

CREATE TABLE public.product_search_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  brand text,
  image_url text,
  analysis jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.product_search_history TO authenticated;
GRANT ALL ON public.product_search_history TO service_role;
ALTER TABLE public.product_search_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own history" ON product_search_history FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text,
  content text NOT NULL,
  cover_image text,
  author text,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT ALL ON public.blog_posts TO service_role;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read published" ON blog_posts FOR SELECT USING (published OR has_role(auth.uid(),'super_admin'));
CREATE POLICY "super admin manage" ON blog_posts FOR ALL TO authenticated
  USING (has_role(auth.uid(),'super_admin')) WITH CHECK (has_role(auth.uid(),'super_admin'));
```

**Edge functions novas:**
- `fetch-product-image` (Firecrawl search → primeira imagem oficial)
- `analyze-cabinet` (Gemini 2.5 flash, recebe lista + perfil)
- `generate-blog-post` (Gemini 2.5 flash, gera markdown a partir de tema)

**Conector necessário:** Firecrawl (para buscar imagem oficial do produto). Perguntarei confirmação antes de linkar.

## Ordem de execução sugerida
1. Migrações (profiles + tabelas novas)
2. Bottom nav + gate do questionário
3. Chat Luz (rename simples)
4. Análise de produto (foto oficial, gestante, adicionar armário, histórico, compatibilidade)
5. Análise do armário
6. Blog + painel super-admin
7. Responsividade calendário + limpeza UI
