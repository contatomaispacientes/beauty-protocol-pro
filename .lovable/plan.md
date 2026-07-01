## Objetivo

Duas features novas para o paciente:
1. **Meu Armário** — cadastro dos produtos que a pessoa usa (manual ou foto do rótulo com IA).
2. **Meu Calendário** — substitui o "Prontuário Digital". Rotinas AM/PM recorrentes + ajustes por dia, com check-in diário e opção de gerar via IA.

## 1. Meu Armário

Nova rota `/cabinet` (item "Meu Armário" no sidebar, ícone de frasco).

**Cadastro de produto** — dialog com dois modos:
- **Manual**: nome, marca, categoria (limpeza, hidratante, protetor solar, sérum, tratamento, tônico, esfoliante, outro), ativos principais (texto livre), momento de uso (AM/PM/ambos), notas.
- **Foto do rótulo**: câmera ou upload → envia para nova edge function `identify-product` (Gemini 2.5 Flash multimodal) que retorna JSON estruturado (nome, marca, categoria, ativos, sugestão AM/PM). Usuário confere e edita antes de salvar.

Lista dos produtos em cards com filtros por categoria e momento. Ações: editar, marcar como "acabou / arquivar", excluir. Foto do produto opcional (bucket `patient-photos`, path `<user_id>/cabinet/`, signed URL).

## 2. Meu Calendário (substitui Prontuário)

Nova rota `/calendar` — o item "Prontuário" do sidebar vira "Meu Calendário" (ícone calendar). Rotas `/timeline` continuam funcionando internamente (não removemos código médico ainda) mas somem do menu do paciente. Admin continua vendo o histórico do paciente pelo painel dele.

**Modelo híbrido**:
- **Rotina base recorrente**: passos AM e PM, cada passo referenciando um produto do armário (ou texto livre), com ordem e horário sugerido. Dias da semana em que aplica.
- **Ajustes por dia**: adicionar/pular passo pontual numa data específica (ex.: máscara na quarta).

**UI**:
- Topo: seletor mês/semana (view semanal padrão em mobile, mensal em desktop).
- Dia selecionado mostra timeline vertical com blocos AM e PM, cada passo com checkbox, produto, horário. Checar marca `completed_at`.
- Barra de progresso do dia + streak (dias consecutivos com AM+PM completos).
- Botão "Gerar com IA" abre modal com escolha:
  - **Usar meu armário + perfil**: IA (edge function `generate-routine`) monta rotina AM/PM com os produtos cadastrados + respostas do questionário. Usuário revisa e aceita.
  - **Sugestão genérica de passos**: IA devolve estrutura de passos (limpeza → tônico → sérum → hidratante → FPS) sem produtos; usuário vincula produtos do armário depois.
- Botão "Editar rotina base" para configurar manualmente sem IA.

## Dados (backend)

Nova migration com quatro tabelas + GRANTs + RLS (padrão `patient_id = auth.uid()`):

- `user_products` — armário. Campos: patient_id, name, brand, category, key_ingredients, moment (am/pm/both), notes, image_url, is_archived.
- `skincare_routines` — rotina base do usuário (1 por usuário, upsert). Campos: patient_id, name, active_weekdays (int[]), created_by_ai (bool).
- `skincare_routine_steps` — passos da rotina base. Campos: routine_id, moment (am/pm), order_index, product_id (fk user_products, nullable), custom_label, suggested_time (time).
- `skincare_calendar_events` — ajustes pontuais + logs de check-in. Campos: patient_id, event_date (date), moment, step_id (nullable — null = ajuste extra), product_id (nullable), custom_label, is_skipped (bool), completed_at (timestamptz).

Check diário grava um `skincare_calendar_events` com `completed_at` referenciando o `step_id` da rotina base (ou o próprio evento pontual).

## Edge functions

- `identify-product` — recebe imagem (base64 ou signed URL), chama `google/gemini-2.5-flash-image` via Lovable AI, devolve JSON estruturado. CORS + validação Zod. Aviso de que não substitui leitura de bula.
- `generate-routine` — recebe modo (`from_cabinet` | `generic`) + lista de produtos do armário + resumo do perfil, chama `google/gemini-3-flash-preview` com structured output, devolve passos AM/PM. Inclui disclaimer médico obrigatório.

## Frontend

- `src/pages/Cabinet.tsx` (nova) + `src/components/cabinet/AddProductDialog.tsx`, `ProductCard.tsx`.
- `src/pages/Calendar.tsx` (nova) + `src/components/calendar/DayView.tsx`, `RoutineEditor.tsx`, `AIRoutineDialog.tsx`.
- `src/components/AppSidebar.tsx`: remove "Prontuário", adiciona "Meu Armário" e "Meu Calendário".
- `src/App.tsx`: rotas `/cabinet` e `/calendar` protegidas. Mantém `/timeline` para compatibilidade (sem link no menu do paciente).
- `src/pages/Dashboard.tsx`: card "Prontuário" vira "Meu Calendário" e adiciona card "Meu Armário". Mostra progresso do dia (X/Y passos concluídos) no hero.

Visual segue design system atual (blush & cream, Cormorant + Karla).

## Escopo fora deste plano

- Notificações push de lembrete (fica para depois).
- Estatísticas/relatórios avançados de aderência.
- Compartilhar rotina com clínica.
