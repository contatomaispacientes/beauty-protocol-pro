## 1. Artigos "Dicas Luz Skin" dentro do dashboard

Hoje o card "Dicas Luz Skin" leva o usuário para `/blog` (sai do dashboard). Vou trocar por uma seção embutida no próprio Dashboard:

- Buscar os últimos 6 posts publicados de `blog_posts` direto no `Dashboard.tsx`.
- Renderizar um carrossel horizontal (scroll-snap, mesmo estilo já usado na seção atual) com título, cover, excerpt e data — sem sair da página.
- Cada card abre o artigo dentro de um `Dialog`/`Sheet` (modal) exibindo o conteúdo completo do post, mantendo o usuário no dashboard.
- Remover a navegação para `/blog` a partir do dashboard. A rota `/blog` continua existindo (institucional/SEO), mas deixa de ser o destino do card.

## 2. Histórico persistente do Chat Luz

Hoje `Chat.tsx` guarda mensagens apenas em `useState` — ao sair da página, tudo se perde. Vou persistir por usuário no backend.

### Backend (migration)
Criar duas tabelas em `public`:

- `chat_conversations` — `id uuid pk`, `user_id uuid` (FK `auth.users`), `title text`, `created_at`, `updated_at`.
- `chat_messages` — `id uuid pk`, `conversation_id uuid` (FK cascade), `user_id uuid`, `role text ('user'|'assistant')`, `content text`, `created_at`.

Com `GRANT` para `authenticated`/`service_role` e RLS: usuário só lê/insere/atualiza/deleta linhas onde `user_id = auth.uid()`. Trigger `update_updated_at_column` em `chat_conversations`.

### Frontend (`src/pages/Chat.tsx`)
- Sidebar (drawer no mobile) listando conversas do usuário, ordenadas por `updated_at`, com botão "Nova conversa" e ícone de lixeira por item (delete permanente com confirmação).
- Ao abrir a página: carregar lista; selecionar a mais recente ou criar uma nova automaticamente se não houver nenhuma.
- Ao selecionar uma conversa: carregar `chat_messages` daquela conversa.
- Ao enviar: se não houver conversa ativa, criar uma (título = primeiras ~40 chars da mensagem); inserir a mensagem do usuário; após o stream completar, inserir a mensagem final do assistente; atualizar `updated_at` da conversa.
- Botão "Limpar chat" vira "Excluir esta conversa" (remove do banco + volta para nova).
- Manter o streaming SSE atual sem mudanças.

### Nota técnica
Não altero a edge function `skincare-chat` (ela permanece stateless, recebendo o array de mensagens do cliente — o cliente já envia todo o histórico da conversa ativa).
