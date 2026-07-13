## Diário da Pele — aba dentro do Calendário

Espaço privado onde o usuário registra como sua pele está em um determinado dia. Só o próprio usuário vê.

### Escopo escolhido
Formato **completo mas enxuto**: cada anotação tem data, estado da pele (Boa / Neutra / Ruim), texto livre e tags rápidas opcionais. Sem foto (fotos já ficam na Timeline, evitamos duplicação).

### Backend (Lovable Cloud)
Nova tabela `skin_diary_entries`:
- `user_id` (dono, obrigatório)
- `entry_date` (data do registro, default hoje)
- `mood` (enum: `good` | `neutral` | `bad`)
- `note` (texto, até 2000 caracteres)
- `tags` (array de texto, ex: "oleosidade", "acne", "vermelhidão")

Regras de acesso:
- Só o próprio usuário pode ver, criar, editar e apagar suas anotações.
- Índice por `(user_id, entry_date desc)` para listagem rápida.

### Frontend

**1. `src/pages/CalendarPage.tsx`** — adicionar Tabs no topo:
- Aba **"Agenda"** (conteúdo atual da página).
- Aba **"Diário da Pele"** (nova).

**2. Novo componente `src/components/SkinDiary.tsx`**:
- Cabeçalho curto explicando o propósito ("Anote como sua pele está hoje…").
- Botão "Nova anotação" que abre um `Dialog` com:
  - Seletor de data (shadcn DatePicker, default hoje).
  - Três botões grandes de humor da pele: 🙂 Boa · 😐 Neutra · 😕 Ruim (visual com cores do design system).
  - Campo de tags rápidas (chips clicáveis pré-definidos + input livre).
  - Textarea "O que você observou?" com contador.
  - Botão salvar / cancelar; validação via zod (mood obrigatório, note ≤ 2000).
- Lista cronológica (mais recente primeiro) agrupada por mês, cada item mostrando: data formatada em pt-BR, ícone/cor do humor, tags como badges e o texto. Ações de editar/excluir por item.
- Estado vazio ilustrado com Sparkles + call-to-action.
- Estado de carregamento com skeletons.

**3. Card no Dashboard (opcional, leve)**:
- Pequeno atalho "Como sua pele está hoje?" com os três emojis que abre direto o diálogo de nova anotação já com data = hoje. *(Confirmar se quer esse atalho — se não, removo.)*

### Fora de escopo
- Sem fotos no diário (fica na Timeline).
- Sem análise por IA das anotações neste momento.
- Sem visualização por admin/clínica.
- Sem alterações em rotas, menu lateral ou BottomNav (acesso é pela aba do Calendário).

### Detalhes técnicos
- Migration cria a tabela, GRANTs para `authenticated` + `service_role`, RLS habilitado, políticas escopadas a `auth.uid() = user_id` para SELECT/INSERT/UPDATE/DELETE, trigger `updated_at`.
- Validação com `zod` no cliente antes do insert/update.
- Datas armazenadas como `date` (sem timezone) para representar o dia registrado pelo usuário.
