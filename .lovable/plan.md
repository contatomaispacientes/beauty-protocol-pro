
Criar uma página de detalhes do produto no estilo Vivino, acessível tanto pela Análise de Produto quanto pelo Armário, com resumo do produto + área rica de avaliações da comunidade (estrelas, distribuição, comentários) e formulário próprio.

## Roteamento

- Nova rota `/produtos/:productId` → `src/pages/ProductDetail.tsx`.
- A partir de `Products.tsx`: após analisar, botão "Ver avaliações" leva à página. Itens do histórico também abrem por lá.
- A partir de `Cabinet.tsx`: cada card do armário fica clicável (ou botão "Avaliar") e leva à página. Se o item do armário ainda não tem `product_id` na tabela pública `products`, fazemos um upsert por `normalized_key` (mesmo padrão de `Products.tsx`) na hora de abrir.

## Modelo de dados

Migration leve para conectar o armário ao catálogo:

- `ALTER TABLE public.user_products ADD COLUMN product_id uuid REFERENCES public.products(id) ON DELETE SET NULL;`
- Índice em `user_products.product_id`.
- Sem novos GRANTs (a tabela já tem RLS/GRANT). Nenhuma outra alteração de schema — `products` e `product_reviews` já existem com trigger de agregação.

## UI da página (inspirada nas telas Vivino enviadas)

Header do produto (card cheio):
- Imagem do produto grande à esquerda; à direita, bloco branco com nota média grande (ex.: `4,3`), fileira de estrelas, "133 avaliações".
- Abaixo: marca, nome do produto, categoria (badge).
- Se o usuário tem perfil preenchido: badge de "Compatível com seu perfil" (reaproveita `compatibility_with_user` quando disponível na análise; para itens vindos só do armário, mostramos apenas se o dado existir).

Ações rápidas (linha de botões redondos, como no Vivino):
- Avaliar (rola até o form)
- Adicionar ao armário / Remover do armário (toggle conforme estado)
- Compartilhar (Web Share API, fallback: copiar link)

Bloco "Sobre o produto":
- Lista de ativos principais + tags de segurança (gestantes, parabenos, pele sensível, etc.) — reutiliza os dados salvos em `product_search_history.analysis` quando existirem para o `product_id`, senão mostra apenas o que temos.

Bloco "Avaliações da comunidade" (evolução do componente atual):
- Nota média grande + estrelas + total.
- Barra de distribuição por nota (5→1) com contagens, calculada no cliente a partir das reviews.
- Formulário "Sua avaliação" (seletor de estrelas grande + textarea 500 chars + Publicar/Atualizar/Excluir).
- Lista de reviews com avatar/inicial, nome, data relativa ("Há 2 meses"), estrelas e comentário.
- Estado vazio: "Seja a primeira pessoa a avaliar".

## Componentização

- `src/pages/ProductDetail.tsx` — nova página, usa `DashboardLayout`.
- `src/components/ProductReviews.tsx` — extender para expor a distribuição de notas (barras 5→1) e datas relativas em pt-BR (util já em uso). O card mantém o formulário e a lista.
- Novo utilitário `src/lib/product-catalog.ts` com `getOrCreateProductId({ name, brand, category, image_url })` para reusar em Products, Cabinet e ProductDetail.

## Integrações

- `Products.tsx`: substituir a renderização inline de `<ProductReviews />` por um botão "Ver avaliações da comunidade" que navega para `/produtos/:productId` (mantém o resumo da análise na página atual).
- `Cabinet.tsx`: card do produto vira link; ao clicar, garante `product_id` (upsert) e navega. Adicionar ícone/estrela discreto no card mostrando `avg_rating` quando `product_id` já estiver preenchido (busca em lote via `in('id', ids)`).

## Validação e segurança

- Mantém `zod` para review (1–5 estrelas, comentário até 500 chars).
- Todas as leituras/gravações passam por RLS já existente (`auth.uid() = user_id` em `product_reviews`).
- Sem uso de `dangerouslySetInnerHTML`. Sanitização por limite de caracteres.

## Fora do escopo

- Curtidas/respostas em reviews, denúncias, upload de foto na review, filtros por nota, paginação infinita. Podem entrar em uma próxima iteração.
