## Objetivo
Atualizar a identidade visual da LUZ para a nova paleta mauve/vinho enviada e reposicionar a **Análise de Produtos** como função principal da plataforma. Substituir o "Skin Health Score" (que hoje é um número fixo/decorativo) por uma **Pontuação da Rotina** real, calculada a partir dos check-ins do calendário de skincare.

---

## 1. Nova paleta de cores
Atualizar tokens em `src/index.css` (modo claro) com base na imagem enviada:

- Vinho profundo `#7a3d4e` → `--primary`
- Rosa empoeirado `#b78a92` → `--accent`
- Mauve claro `#dcccd0` → `--secondary`
- Cream rosé `#ebe2e2` → `--background`
- Tinta `#3a1f26` → `--foreground`

Tokens auxiliares (`--rose-soft`, `--peach`, `--sage`, `--lavender`, `--cream`) reajustados dentro da mesma família. Tipografia (Cormorant + Karla) e modo escuro permanecem.

---

## 2. Dashboard — Análise de Produtos como protagonista
Reordenar `src/pages/Dashboard.tsx`:

1. Header "Olá, {nome} — Sua pele hoje."
2. **Card hero "Escanear produto"** (grande, cor primária vinho) — CTA principal levando a `/products`, com texto tipo *"Descubra se um produto é ideal para você"* e botão "Escanear agora".
3. **Card da Pontuação da Rotina** (ver seção 3).
4. Grid "Plano de cuidados" (Manhã / Noite / Semanal) já existente — mantido.
5. Ações secundárias (Meu Armário, Meu Calendário, Análise IA, Questionário, Chat) em grid compacto abaixo.

Cards laterais (Análise IA, Questionário) deixam de ser "primary actions" e viram parte do grid secundário.

---

## 3. Pontuação da Rotina (substitui o Skin Health Score)
**Fonte de dados** (já existentes no banco, nada de migration):
- `skincare_routines` + `skincare_routine_steps` → passos ativos por dia da semana / momento (AM/PM).
- `skincare_calendar_events` → check-ins reais do usuário (`completed_at`).

**Regra de cálculo (janela dos últimos 7 dias, hoje inclusive):**
```
esperado  = soma dos passos AM+PM em cada dia em que a rotina está ativa
concluído = eventos com completed_at nos mesmos dias
score     = round( concluído / esperado * 100 )   // 0–100
```
Casos:
- Sem rotina configurada → score `—` e CTA "Criar sua rotina" apontando para `/calendar`.
- `esperado = 0` na janela → score `—` com texto "Ative sua rotina no calendário".
- Sequência (streak): dias consecutivos até hoje em que **todos** os passos previstos foram concluídos.

**UI do card:**
- Título: "Pontuação da rotina".
- Número grande 0–100 + anel circular animado (mantendo o visual atual).
- Linha secundária: `{concluído}/{esperado} passos nos últimos 7 dias`.
- Chip: `🔥 {streak} dias em sequência` quando ≥ 2.
- Link "Ver calendário" → `/calendar`.

Hook novo `useRoutineScore()` em `src/hooks/useRoutineScore.ts` para encapsular a query e o cálculo (reutilizável).

---

## 4. Ajustes menores para casar com a paleta
- Revisar componentes que usavam o rose antigo (`--rose-soft`, `--peach`) para garantir contraste com o novo vinho — nenhuma cor hardcoded será adicionada; só ajuste dos tokens.
- Sem mudanças em outras páginas além do Dashboard nesta rodada.

---

## Arquivos afetados
- `src/index.css` — nova paleta.
- `src/pages/Dashboard.tsx` — reordenação + card hero de produto + card de pontuação real.
- `src/hooks/useRoutineScore.ts` — novo hook de cálculo.

Sem migrations, sem edge functions novas, sem mudanças no calendário/armário.
