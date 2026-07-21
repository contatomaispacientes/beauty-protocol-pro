## Objetivo

Transformar o painel do Super Admin em um verdadeiro dashboard de analytics da plataforma, mostrando distribuições dos usuários (tipo de pele, sensibilidade, objetivos, faixa etária, gênero, região), crescimento de cadastros, produtos mais pesquisados e mais avaliados, e ranking dos usuários mais ativos — tudo com filtro de período.

## O que será construído

Reformular `SuperAdminDashboard.tsx` (rota `/super-admin`) e enriquecer `SuperAdminStats.tsx` (`/super-admin/stats`) para oferecer:

**KPIs no topo**
- Total de usuários
- Novos usuários no período
- Total de produtos analisados
- Total de avaliações
- Total de mensagens no Chat Luz
- Usuários que completaram o onboarding (%)

**Filtro global de período**: Hoje / 7d / 30d / 90d / Todos (aplicado às seções temporais).

**Gráficos de perfil dos usuários** (a partir de `profiles.questionnaire_answers` + colunas `age`, `gender`, `region`)
- Pizza: distribuição por tipo de pele (seca, oleosa, mista, normal, sensível)
- Barras: nível de sensibilidade
- Barras horizontais: principais objetivos de skincare
- Barras: faixa etária
- Pizza: gênero
- Barras horizontais: top regiões

**Atividade da plataforma**
- Linha: novos cadastros por dia (dentro do período)
- Linha/área: pesquisas de produto por dia
- Barras: avaliações publicadas por dia

**Rankings (respeitando o período)**
- Top 10 produtos mais pesquisados (usa `get_top_searched_products`)
- Top 10 produtos melhor avaliados (usa `get_top_rated_products`)
- Top 10 usuários mais ativos (usa `get_top_community_users`) com nome, nº de pesquisas, nº de avaliações e score

Cada card de produto no ranking abre `/produtos/:id`.

## Detalhes técnicos

- Todos os componentes usam `SuperAdminLayout` e são renderizados apenas para `super_admin` (rota já protegida).
- Leitura direta via `supabase-js` — o super_admin já tem policies de SELECT em `profiles`, `products`, `product_reviews`, `product_search_history`, `chat_messages`. Não são necessárias novas policies nem migrations.
- Reaproveita as RPCs existentes `get_top_searched_products`, `get_top_rated_products`, `get_top_community_users` para os rankings; para o filtro "Todos" passamos um `_since` bem antigo (ex.: `1970-01-01`).
- Parsing das respostas do questionário: `questionnaire_answers` é JSONB — extraímos campos como `skin_type`, `sensitivity`, `goals[]`, `age_range`, `budget`, `pregnant`, etc.; contagens feitas no cliente (volume esperado é pequeno; se crescer, migramos para RPC agregada).
- Gráficos com `recharts` + `ChartContainer` já usados em `AdminReports`, mantendo a paleta `--primary/--accent/--secondary` (Mauve & Wine).
- Novo componente `src/components/super-admin/PlatformAnalytics.tsx` centraliza a lógica; `SuperAdminDashboard.tsx` mostra KPIs + Analytics resumido, e `SuperAdminStats.tsx` mostra a versão completa com todos os gráficos e rankings.
- Sem mudanças de schema, sem novas edge functions.

## Fora do escopo

- Exportação CSV/PDF dos relatórios (posso adicionar depois se quiser).
- Segmentar analytics por tenant/clínica (foco agora é plataforma inteira).
