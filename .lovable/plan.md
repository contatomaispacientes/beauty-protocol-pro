## Remover a Análise de Pele

A compatibilidade dos produtos passará a ser feita apenas com base no questionário "Entenda sua pele".

### Alterações

1. **Rota e página**
   - Remover `SkinAnalysis` de `src/App.tsx` (import + rota `/skin-analysis`).
   - Excluir `src/pages/SkinAnalysis.tsx`.

2. **Navegação**
   - `src/components/AppSidebar.tsx`: remover item "Análise de Pele".
   - `src/pages/Dashboard.tsx`: remover atalho "Análise IA / Scan facial" das ações rápidas.
   - Verificar `BottomNav.tsx` (já não referencia, mas confirmar).

3. **Edge function**
   - Excluir `supabase/functions/analyze-skin/` e sua entrada em `supabase/config.toml`.

4. **Super Admin / Features**
   - Remover a feature `skin_analysis` de `src/pages/super-admin/SuperAdminFeatures.tsx` para não aparecer mais como toggle.

5. **Mensagem ao usuário**
   - Nenhuma alteração no questionário — ele já é a única fonte de perfil de pele.
   - A análise de produtos (`/products`) continua usando as respostas do questionário para julgar compatibilidade (já implementado).

### Não incluso
- Nenhuma mudança em banco de dados (colunas do questionário permanecem).
- Nenhum ajuste nas funções `analyze-product` / `analyze-cabinet`, que já dependem apenas do questionário.
