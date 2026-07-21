## Problema

A página `/super-admin/stats` (e `/super-admin`) fica piscando e nunca carrega porque o componente `PlatformAnalytics` entra em loop de re-render:

- `const since = sinceOf(period)` roda a cada render e chama `new Date()`, gerando uma string ISO diferente a cada vez.
- O `useEffect(..., [since])` dispara em toda renderização → novo `setLoading(true)` + novos `setState` → novo render → novo `since` → repete.
- Isso combina com o replay (spinner `lucide-loader-circle` sendo adicionado repetidamente ao mesmo container) e com as chamadas duplicadas ao Supabase (`product_search_history`, `product_reviews`, RPCs `get_top_*`) com timestamps quase iguais.

## Correção

Em `src/components/super-admin/PlatformAnalytics.tsx`:

1. Substituir `const since = sinceOf(period);` por `const since = useMemo(() => sinceOf(period), [period]);` para que `since` só mude quando o período mudar.
2. Manter o restante da lógica intacta (dependências `useMemo`/`useEffect` continuam usando `since`, mas agora estável).

Sem outras mudanças — nenhum ajuste em rotas, auth ou dados.
