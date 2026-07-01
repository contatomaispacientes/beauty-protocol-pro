# Corrigir erro "Resposta inesperada do servidor" no Chat

## Causa
O `supabase.functions.invoke()` não devolve um `ReadableStream` para respostas SSE (`text/event-stream`) — ele tenta parsear como JSON/texto. Por isso o check `reader instanceof ReadableStream` falha e cai no fallback, que também não reconhece o formato e lança "Resposta inesperada do servidor". Isso já está documentado na memória do projeto: usar `fetch` nativo para SSE.

## Correção
Em `src/pages/Chat.tsx`, substituir `supabase.functions.invoke("skincare-chat", ...)` por um `fetch` direto para a Edge Function, lendo o body como stream SSE:

- URL: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/skincare-chat`
- Headers: `Authorization: Bearer <access_token da sessão atual>`, `apikey: VITE_SUPABASE_PUBLISHABLE_KEY`, `Content-Type: application/json`
- Ler `response.body.getReader()`, decodificar chunks, parsear linhas `data: {...}` e concatenar `choices[0].delta.content` na última mensagem do assistant (mesma lógica que já existe).
- Tratar status 429 (limite) e 402 (créditos) com toasts/mensagens amigáveis.
- Manter o restante da UI intacto.

Nenhuma mudança na Edge Function (`skincare-chat`) — ela já faz stream corretamente.

## Verificação
Enviar uma mensagem no `/chat` e confirmar que o texto aparece incremental sem erro.