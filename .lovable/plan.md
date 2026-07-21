
## Objetivo

Na Dashboard do usuário (`src/pages/Dashboard.tsx`), adicionar 3 novas seções logo **acima** da "Dica da Luz", cada uma com filtro de período (Hoje / 7d / 30d / 90d):

1. **Mais pesquisados** — produtos com mais buscas no período.
2. **Melhor avaliados** — produtos com mais estrelas no período (média das reviews criadas no período, com mínimo de avaliações para entrar no ranking).
3. **Top da comunidade** — usuários que mais pesquisaram + avaliaram no período.

## UX

- Cada seção: título + tabs de período (`Hoje | 7d | 30d | 90d`, default `7d`) + carrossel horizontal com snap (mesmo padrão do carrossel "Dica da Luz").
- Cards de produto: imagem, nome, marca, estrelas + média, contagem de avaliações. Clique → `/produtos/:productId`.
- Cards de usuário: avatar/inicial, `display_name`, badge com nº de pesquisas e nº de avaliações. Sem link (perfil público está fora de escopo).
- Loading: skeletons. Vazio: mensagem discreta ("Sem dados neste período ainda").
- Ordem final da Dashboard: Hero → Score/Rotina → **Mais pesquisados** → **Melhor avaliados** → **Top da comunidade** → Dica da Luz → resto.

## Dados

Consultas por período (`since = now - N dias`, exceto "Hoje" = início do dia local):

- **Mais pesquisados**: `product_search_history` agrupado por `product_id` (quando existir) no período. Depois `products.select('id,name,brand,image_url,avg_rating,reviews_count').in('id', topIds)`. Ordena pelo count desshown do agrupamento. Limite 12.
- **Melhor avaliados**: `product_reviews` no período, agregado por `product_id` no cliente (média + count). Filtro mínimo 3 reviews no período para evitar produto com 1 review 5★ liderando. Ordena por média desc, empate por count desc. Join com `products` como acima. Limite 12.
- **Top da comunidade**: agregação no cliente combinando `product_search_history` (count por `user_id`) e `product_reviews` (count por `user_id`) no período. Score = `searches + reviews*2`. Depois `profiles.select('user_id,display_name,avatar_url').in('user_id', topIds)`. Limite 10.

Todas as leituras usam o cliente Supabase; RLS atual das tabelas permite leitura autenticada (verificado durante a implementação — se alguma tabela restringir por `user_id`, a query volta com dados só do próprio usuário e o ranking fica inviável; nesse caso trato via ajuste de policy na fase de build). Para não bloquear o plano, isso será verificado como primeiro passo do build.

## Implementação técnica

Novos arquivos:

- `src/components/dashboard/PeriodTabs.tsx` — tabs controladas (Hoje/7d/30d/90d), retorna `since: Date`.
- `src/components/dashboard/TopSearchedProducts.tsx`
- `src/components/dashboard/TopRatedProducts.tsx`
- `src/components/dashboard/TopCommunityUsers.tsx`
- `src/hooks/useCommunityRankings.ts` — 3 hooks (`useTopSearched`, `useTopRated`, `useTopUsers`) que aceitam `since` e devolvem `{ data, loading }`. Cache simples por período no `useState` do componente pai; sem React Query para manter o padrão atual do projeto.

Alterações:

- `src/pages/Dashboard.tsx` — importar e renderizar as 3 seções acima do bloco "Dica da Luz". Sem mexer em nada mais.

## Fora do escopo

- Página pública de perfil de usuário.
- Filtro por categoria de produto.
- Paginação (limite fixo de 10-12 por seção).
- Cache/materialized view no banco (agregação feita no cliente por enquanto — se ficar lento com escala, migramos para RPC).
