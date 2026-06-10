# Plano: Simplificar plataforma LUZ — foco no usuário final

## Objetivo
Remover funcionalidades de **vínculo com clínica**, **agendamentos** e **colorimetria/maquiagem** da experiência do paciente, mantendo o foco em suporte à saúde da pele (questionário, análise por IA, rotina, análise de produtos, chat IA, prontuário/timeline).

## O que será removido da experiência do paciente

### 1. Colorimetria e Maquiagem
- Remover rota `/colorimetry` do `App.tsx`
- Remover item "Colorimetria e Maquiagem" do menu lateral (`AppSidebar.tsx`)
- Remover card "Colorimetria e Maquiagem" do `Dashboard.tsx`
- Excluir o arquivo `src/pages/Colorimetry.tsx`

### 2. Agendamentos
- Remover rota `/appointments` do `App.tsx`
- Remover item "Agendamentos" do menu lateral
- Excluir `src/pages/Appointments.tsx`

### 3. Vínculo com Clínica / "Minhas Clínicas"
- Remover o `JoinClinicCard` do Dashboard do paciente
- Excluir o componente `src/components/JoinClinicCard.tsx`
- A página do paciente deixa de pedir/exibir códigos de convite de clínica

## O que será mantido (não muda)

- **Painéis Admin e Super Admin** continuam funcionando normalmente (gestão de clínicas, pacientes, convites, agendamentos administrativos, feature toggles, branding etc.). Apenas a experiência do **paciente** é simplificada.
- Funcionalidades do paciente preservadas: Questionário, Análise de Pele (IA), Minha Rotina, Análise de Produtos, Chat com IA, Prontuário Digital (Timeline).
- Banco de dados: **nenhuma alteração de schema**. Tabelas `tenants`, `tenant_patients`, `appointments`, `tenant_invite_codes` permanecem (ainda usadas pelo Admin/Super Admin). Apenas o paciente deixa de interagir com elas via UI.
- Edge function `join-clinic` permanece no projeto (não é chamada pela UI do paciente, mas não atrapalha).

## Detalhes técnicos

Arquivos editados:
- `src/App.tsx` — remover imports e rotas de `Colorimetry` e `Appointments`
- `src/components/AppSidebar.tsx` — remover entradas de Colorimetria e Agendamentos do array `mainItems`/`toolItems`
- `src/pages/Dashboard.tsx` — remover card de Colorimetria do `quickActions` e remover `<JoinClinicCard />`

Arquivos excluídos:
- `src/pages/Colorimetry.tsx`
- `src/pages/Appointments.tsx`
- `src/components/JoinClinicCard.tsx`

## Fora de escopo
- Não mexer no Super Admin Feature Toggles (as chaves `colorimetry` e `appointments` podem continuar listadas lá para uso administrativo futuro; me avise se quiser removê-las também).
- Não remover tabelas do banco.
