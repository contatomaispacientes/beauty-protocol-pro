## Objetivo
Adicionar um botão/banner de "Adicionar à Tela de Início" para usuários de iPhone (Safari), já que o iOS não exibe o prompt nativo de instalação de PWA.

## O que será feito

1. **Novo componente `IOSInstallPrompt.tsx`**
   - Detecta se o usuário está no iOS Safari (`/iPad|iPhone|iPod/.test(navigator.userAgent)` + checagem de `standalone`).
   - Não exibe se o app já estiver instalado (`window.navigator.standalone === true` ou `display-mode: standalone`).
   - Mostra um banner fixo na parte inferior da tela com:
     - Ícone do app LUZ
     - Texto: "Instale o LUZ no seu iPhone"
     - Instruções visuais: toque em **Compartilhar** (ícone) → **Adicionar à Tela de Início**
     - Botão "X" para fechar
   - Salva no `localStorage` (`luz-ios-install-dismissed`) quando o usuário fecha, para não reaparecer por X dias (ex: 7 dias).

2. **Novo componente `InstallAppButton.tsx`** (Android/Desktop)
   - Captura o evento `beforeinstallprompt` (Chrome/Edge/Android).
   - Mostra um botão "Instalar app" no Dashboard quando o evento estiver disponível.
   - Em iOS, abre um modal com as mesmas instruções do banner.

3. **Integração**
   - Renderizar `<IOSInstallPrompt />` no `App.tsx` (global, aparece em todas as páginas após login).
   - Adicionar `<InstallAppButton />` no `Dashboard.tsx`, próximo ao topo (visível mas discreto).

4. **Design**
   - Glassmorphism consistente com a plataforma (Playfair/Inter, cores do tema LUZ).
   - Mobile-first, animação de slide-up via Framer Motion.
   - Usa tokens semânticos do `index.css` (sem cores hardcoded).

## Arquivos

**Criados:**
- `src/components/IOSInstallPrompt.tsx`
- `src/components/InstallAppButton.tsx`
- `src/hooks/usePWAInstall.ts` (lógica de detecção iOS/standalone/beforeinstallprompt)

**Editados:**
- `src/App.tsx` (montar o banner global)
- `src/pages/Dashboard.tsx` (botão de instalar)

Nenhuma mudança no manifest, service worker ou backend.
