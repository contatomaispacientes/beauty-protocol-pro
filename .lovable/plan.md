## Botão "Analisar" centralizado e destacado no BottomNav

Reordenar a navegação inferior (mobile) para que "Analisar" fique no centro, elevado e maior — estilo botão de câmera do app de referência.

### Ordem dos 5 itens (esquerda → direita)
1. Início (Dashboard)
2. Armário
3. **Analisar** — botão central destacado
4. Calendário
5. Chat Luz

### Estilo do botão central
- Círculo grande (~64px) com `bg-primary` e ícone `ScanLine` (ou câmera) em `primary-foreground`.
- Elevado acima da barra (`-translate-y-1/2`) com sombra suave e anel branco/background para separar da barra.
- Sem label embaixo (ou label pequeno "Analisar" logo abaixo do círculo).
- Estado ativo: leve escala/brilho.

### Estrutura
- `BottomNav.tsx`: manter `grid grid-cols-5` para os 4 itens laterais e renderizar o item central em posição absoluta centralizada, ou como célula do grid contendo o círculo elevado.
- Aumentar levemente o `padding-top` da nav para acomodar o botão elevado sem cortar.
- Manter apenas no mobile (`md:hidden`) e o padding-bottom para safe-area do iOS.

### Fora de escopo
- Nenhuma mudança em rotas, sidebar desktop, ou lógica das páginas.
