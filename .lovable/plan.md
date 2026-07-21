
## Objetivo

Transformar o cadastro em uma jornada guiada de 12 telas idêntica ao mockup enviado, unificando `Signup` + `Questionnaire` num único wizard mobile-first com o visual LUZ (Cormorant Garamond, mauve/wine sobre creme, progress bar fina, botões pill grandes, cards de opção com estado selecionado wine).

## Fluxo (12 passos)

1. **Boas-vindas** — logo LUZ SKIN, headline serif ("Decisões mais inteligentes para uma pele mais saudável"), subheadline, botão "Começar", link "Já tem conta? Entrar".
2. **Criar conta** — botões Google / Apple / E-mail (Apple oculto quando não configurado). Ao escolher e-mail, expande campos email + senha inline.
3. **Sobre você** — nome, data de nascimento (Shadcn Datepicker), gênero (pills Feminino / Masculino / Prefiro não dizer).
4. **Sua pele** — tipo (Oleosa/Seca/Mista/Normal com ícone de gota), sensibilidade (Baixa/Moderada/Alta), preocupações (chips multi-select).
5. **Seus objetivos** — checklist múltipla (Controlar acne, Clarear manchas, Reduzir oleosidade, Melhorar textura e poros, Prevenir envelhecimento, Hidratar e fortalecer) + select de prazo (Curto / Médio / Longo prazo).
6. **Sua rotina atual** — checklist de produtos que já usa (Limpeza, Tônico, Sérum, Hidratante, Protetor solar, Tratamento, Óleo facial, Nenhum).
7. **Preferências** — faixa de investimento (Econômico / Intermediário / Premium) e frequência de uso (Todos os dias / Algumas vezes na semana / Quando for comprar).
8. **Permissões** — Câmera / Notificações / Localização (opcional). Toggles visuais; ao continuar, dispara `Notification.requestPermission()` (as demais são solicitadas em contexto real).
9-11. **Tour rápido** — 3 slides com dots: (9) Escaneie produtos + foto `product-scan`, (10) Compatibilidade 96% (semicírculo animado), (11) Progresso +28% (mini gráfico Recharts).
12. **Pronto!** — "Tudo pronto, {nome}!", círculo com Skin Score inicial (calculado a partir das respostas: base 60 + bônus por rotina/protetor/hidratação, teto 95), lista de features desbloqueadas, CTA "Ir para meu dashboard".

## Arquitetura técnica

Novo layout de onboarding, isolado do `DashboardLayout`:

- `src/pages/onboarding/OnboardingFlow.tsx` — rota `/onboarding`. Máquina de passos controlada (`currentStep`, `setStep`), estado central `OnboardingData`, persiste rascunho em `localStorage` (`luz.onboarding.draft`) para não perder progresso.
- `src/components/onboarding/OnboardingShell.tsx` — moldura mobile-first (max-w-sm, safe-area, header com progress bar fina e botão voltar, footer sticky com CTA "Continuar/Próximo").
- `src/components/onboarding/OptionPill.tsx`, `OptionCard.tsx`, `Checklist.tsx` — primitivos visuais reutilizados pelas telas.
- `src/pages/onboarding/steps/*.tsx` — um arquivo por tela (12 componentes stateless que recebem `data`, `update`, `next`, `back`).

## Integrações

- **Passos 1-2** rodam sem sessão. No passo 2, ao concluir e-mail/OAuth, chama `supabase.auth.signUp` (ou `signInWithOAuth`) e continua. Google usa redirect com `redirectTo: ${origin}/onboarding?step=3`; ao voltar autenticado, o flow retoma do passo 3 usando o rascunho salvo.
- **Passos 3-7** só editam estado local + rascunho.
- **Passo 8** dispara permissões suportadas no browser.
- **Passo 12** grava tudo em `profiles`:
  - `display_name`, `phone` (se houver), `age` (derivada da data), `gender`, `region` reaproveitados quando aplicável.
  - `questionnaire_completed = true`, `questionnaire_answers` = objeto completo com `skin_type`, `sensitivity`, `concerns`, `goals`, `timeframe`, `current_routine`, `allergies` (mantém compat com telas atuais que já leem essa chave).
  - Novo campo derivado no cliente: `initial_skin_score` guardado dentro de `questionnaire_answers` para mostrar no Dashboard.

## Alterações em rotas e telas existentes

- `src/App.tsx`: adicionar rota `/onboarding`; redirecionar `/signup` → `/onboarding` (mantém backlinks antigos).
- `src/components/ProtectedRoute.tsx`: quando o usuário está logado e `questionnaire_completed=false`, redireciona para `/onboarding?step=3` (retomada), não mais para `/questionnaire`.
- `src/pages/Questionnaire.tsx`: mantém como página acessível pelo dashboard para editar respostas (mesmo modelo antigo, sem alteração visual pesada nesta iteração).
- `src/pages/Login.tsx`: sem alteração de layout; muda apenas o link "Criar conta" para `/onboarding`.
- Remoção do seletor "Paciente / Clínica" (feature já foi descontinuada em rodadas anteriores) — todo cadastro é consumer.

## Design tokens

Reaproveita 100% do tema atual (mauve `#7a3d4e` primário, background creme `#faf5f2`, Cormorant Garamond display, Karla body). Adiciona apenas:

- `.step-progress` — barra 3px, radius full, track `bg-muted`, fill `bg-primary`.
- `.option-pill` — variantes `default` (border muted, bg card) e `selected` (bg primary, text primary-foreground).
- Nenhuma cor hardcoded; tudo via tokens em `src/index.css`.

## Fora do escopo

- Editor de foto de perfil no onboarding.
- Envio real de SMS/verificação de telefone.
- Persistência das preferências de investimento/frequência em coluna dedicada — por enquanto ficam dentro de `questionnaire_answers`.
- Redesign do `Questionnaire.tsx` de edição posterior (fica para próxima iteração se o usuário quiser).
