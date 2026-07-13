## Foto de produto no card "Analisar um produto"

**Arquivo:** `src/pages/Dashboard.tsx` (card do hero, linhas ~113-138).

### O que muda
- Gerar uma imagem de referência (mão segurando um frasco de sérum branco em fundo transparente, estilo minimalista/editorial) via ferramenta de imagem, salva em `src/assets/product-scan.png` (PNG transparente para se integrar ao fundo bordô do card).
- No card atual:
  - Trocar o ícone `ScanLine` decorativo grande do canto inferior direito pela nova imagem.
  - Posicionar a imagem absolutamente à direita (`absolute right-0 bottom-0`), com altura próxima da altura do card (~200px), transbordando ligeiramente para fora à direita, mantendo o efeito "produto entrando na cena" da referência.
  - Manter os cantos de mira (ScanLine) atrás do produto, com opacidade baixa, para reforçar o tema "escanear".
  - Ajustar o `max-w-[75%]` do bloco de texto para `max-w-[62%]` ou `max-w-[58%]` para não sobrepor o produto.
  - Adicionar um leve gradiente `from-primary via-primary/95 to-transparent` do lado esquerdo para garantir contraste do texto sobre a imagem em telas menores.
- `alt` descritivo: "Frasco de sérum sendo analisado".

### Fora de escopo
- Sem mudanças em rotas, no botão "Escanear agora" ou em outras seções do Dashboard.
- Sem edição em BottomNav, AppSidebar ou páginas de produtos.

### Detalhes técnicos
- Imagem importada como asset ES6 comum: `import productScan from "@/assets/product-scan.png"`.
- Mobile-first: em telas <640px reduzir a altura do produto (`h-40 sm:h-48 md:h-56`) para não competir com o botão.
