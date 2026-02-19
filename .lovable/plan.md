

# DermAI - Plataforma Inteligente de Análise de Pele e Colorimetria

## Visão Geral
Plataforma completa que combina inteligência artificial, questionário dermatológico e colorimetria para oferecer análise personalizada de pele, rotinas de skincare e paleta de cores ideal — atendendo tanto consumidores finais quanto profissionais de estética.

---

## 1. Autenticação e Perfil do Usuário
- Cadastro/login com e-mail e senha
- Perfil com dados pessoais (idade, gênero, região)
- Tipo de conta: consumidor final ou profissional de estética
- Dashboard personalizado com histórico de análises e evolução da pele

## 2. Questionário Inteligente de Pele
- Questionário interativo e objetivo com perguntas sobre:
  - Tipo de pele (oleosa, seca, mista, normal, sensível)
  - Rotina atual de cuidados
  - Condições clínicas (acne, rosácea, melasma, etc.)
  - Exposição solar e hábitos de vida
  - Alergias e sensibilidades conhecidas
- Lógica adaptativa: perguntas mudam conforme as respostas anteriores
- Resultado gera um perfil dermatológico preliminar

## 3. Análise de Pele por IA (Selfie e Câmera)
- Upload de selfie ou captura ao vivo pela câmera
- Análise com IA para identificar:
  - **Tipo de pele** e nível de hidratação aparente
  - **Características clínicas**: acne, manchas, rugas, poros dilatados, olheiras
  - **Tom de pele** (classificação Fitzpatrick) e **subtom** (quente, frio, neutro)
  - **Possíveis lesões**: diferenciação entre benignas e suspeitas (com disclaimer médico claro)
- Relatório visual com marcações na imagem e explicações acessíveis
- ⚠️ Aviso claro: "Esta análise não substitui consulta dermatológica"

## 4. Rotina de Skincare Personalizada
- Com base nos resultados do questionário + análise de imagem, gera:
  - Rotina matinal e noturna simplificada (3-5 passos)
  - Recomendação de categorias de produtos (limpeza, hidratação, proteção solar, tratamento)
  - Sugestões de produtos disponíveis no mercado nacional e importado
  - Nível de prioridade para cada produto
- Filtros por faixa de preço e preferência (vegano, cruelty-free, farmácia, etc.)
- **Ajuste automático de rotina**: a IA reavalia periodicamente os resultados e sugere mudanças na rotina conforme evolução da pele, mudanças de estação ou novas análises

## 5. Análise de Produtos (NOVO)
- O usuário pode pesquisar ou inserir o nome de um produto cosmético
- A IA identifica os **principais princípios ativos** do produto e explica:
  - O que cada ativo faz (ex: ácido hialurônico = hidratação profunda)
  - Para qual tipo de pele é indicado
  - Possíveis contraindicações ou combinações a evitar
- Avaliação rápida: o produto é adequado para o perfil de pele do usuário?
- Ajuda a tomar decisões de compra mais conscientes

## 6. Chat com IA (NOVO)
- Chat integrado com inteligência artificial para o usuário tirar dúvidas a qualquer momento
- Perguntas sobre ingredientes, rotina, produtos, cuidados específicos
- A IA responde com base no perfil dermatológico do usuário e suas análises anteriores
- Respostas em linguagem acessível, com opção de modo técnico para profissionais
- Streaming em tempo real das respostas

## 7. Acompanhamento Mensal com Dermatologista (NOVO)
- Sistema de agendamento para consultas mensais de acompanhamento
- Profissionais cadastrados podem receber solicitações de pacientes
- Antes da consulta, a plataforma gera um relatório resumido com:
  - Evolução da pele ao longo do mês (comparativo de fotos)
  - Rotina seguida e aderência
  - Mudanças observadas pela IA
- Notificações/lembretes para o acompanhamento mensal
- Histórico de consultas e anotações do profissional

## 8. Colorimetria e Paleta de Cores
- Análise do tom e subtom de pele para determinar a estação pessoal (primavera, verão, outono, inverno)
- Paleta de cores ideal que valoriza o tom de pele
- Recomendações de maquiagem com base na paleta:
  - Base e corretivo (tom ideal)
  - Batom, blush, sombra e contorno
  - Sugestões de marcas nacionais e importadas com shades específicos
- Visualização interativa da paleta de cores

## 9. Painel Profissional (para esteticistas/dermatologistas)
- Interface adaptada com linguagem técnica
- Possibilidade de cadastrar clientes e acompanhar evolução
- Relatórios mais detalhados com termos clínicos
- Comparativo de fotos ao longo do tempo (antes/depois)
- Gerenciamento de agenda e acompanhamentos mensais

## 10. Design e Experiência
- Interface limpa, moderna e elegante com tons neutros e suaves
- Totalmente responsiva (mobile-first)
- Navegação por etapas claras: Questionário → Análise → Resultados → Rotina → Colorimetria
- Linguagem acessível para leigos, com opção de modo técnico para profissionais

## 11. Infraestrutura
- **Backend com Lovable Cloud**: banco de dados para usuários, análises, histórico, agendamentos
- **Lovable AI**: análise de imagens, chat, análise de produtos e geração de recomendações
- **Armazenamento**: fotos dos usuários salvas com segurança
- **Autenticação**: login seguro com perfis, papéis (consumidor/profissional) e permissões

