## Objetivo
Quando o app rodar em modo PWA instalado (standalone), pular toda a parte institucional e levar direto para a tela de login (ou dashboard se autenticado), com a tela de login redesenhada de forma app-like.

## Detecção PWA
- Novo hook `src/hooks/useIsPWA.ts`:
  - Retorna `true` se `window.matchMedia('(display-mode: standalone)').matches` OU `(navigator as any).standalone === true` (iOS).
  - Listener para mudanças de display-mode.

## Roteamento condicional
- Novo componente `src/components/PWAGate.tsx`:
  - Se `isPWA` e usuário acessar rota institucional (`/`, `/about`, `/professionals`, `/contact`) → `<Navigate to="/login" replace />`.
  - Se `isPWA` e autenticado em `/login` ou `/` → `<Navigate to="/dashboard" replace />`.
  - Caso contrário renderiza `children` normalmente.
- `src/App.tsx`: envolver as rotas institucionais com `<PWAGate>`.

## Tela de Login app-like
- `src/pages/Login.tsx` redesenhada:
  - Esconde `Navbar` quando `isPWA` (layout fullscreen).
  - Respeita safe-area do iPhone (`pt-[env(safe-area-inset-top)]`, idem bottom).
  - Topo: logo LUZ grande centralizada com glow suave.
  - Saudação em Playfair ("Bem-vindo de volta").
  - Card glassmorphism, inputs `h-12` touch-friendly, botão primário full-width.
  - Links discretos: "Esqueci minha senha" e "Criar conta".
  - Background com gradiente sutil usando tokens semânticos (sem cores hardcoded).
- `src/pages/Signup.tsx` e `src/pages/ForgotPassword.tsx`: aplicar mesmo tratamento (esconder Navbar em PWA, safe-area, layout consistente).

## Arquivos

**Criados:**
- `src/hooks/useIsPWA.ts`
- `src/components/PWAGate.tsx`

**Editados:**
- `src/App.tsx`
- `src/pages/Login.tsx`
- `src/pages/Signup.tsx`
- `src/pages/ForgotPassword.tsx`

Sem mudanças no manifest, backend, lógica de auth ou demais páginas autenticadas.
