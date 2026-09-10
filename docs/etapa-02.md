# Etapa 02 - Implementação do Protótipo de Interface

## Objetivo da etapa

Nesta etapa foi implementada uma primeira versão visual e navegável do RankFlow. O foco está na camada de interface e na organização estrutural do aplicativo. Os dados apresentados são simulados e não existe dependência de persistência ou comunicação com servidor para demonstrar as telas.

## Telas implementadas

A aplicação possui uma tela inicial e diversas telas adicionais, organizadas pelo Expo Router.

### Autenticação

- **Boas-vindas** - apresentação do RankFlow e acesso às opções de login e cadastro.
- **Login** - entrada de usuário/e-mail e senha.
- **Cadastro** - criação visual de conta e acesso à verificação do Codeforces.
- **Recuperar senha** - formulário para informar o e-mail de recuperação.

### Navegação principal

- **Início** - resumo do perfil, rating, quantidade de problemas, streak, contests e desempenho recente.
- **Amigos** - busca por handle e lista de amigos com rating e atividade recente.
- **Criar treino** - seleção de participantes, dificuldade, quantidade de problemas e tags.
- **Placar ao vivo** - ranking dos participantes, pontuação, problemas e atualização recente.
- **Estatísticas** - visualização de desempenho por tags e evolução de rating.

### Perfil e configurações

- **Perfil** - dados do usuário, estatísticas rápidas, plataforma vinculada e atividades recentes.
- **Editar perfil** - edição visual de nome, usuário, e-mail, bio e handle do Codeforces.
- **Configurações** - opções de conta, preferências e aplicativo.
- **Plataformas conectadas** - visualização de Codeforces, AtCoder e beecrowd.
- **Notificações** - controles para tipos de notificações e horário silencioso.

### Verificação do Codeforces

- **Verificar conta** - entrada de handle e seleção da linguagem de submissão.
- **Conta encontrada** - confirmação dos dados simulados da conta localizada.
- **Verificação em andamento** - exibição do desafio e cronômetro.
- **Conta verificada** - confirmação da vinculação e resumo dos dados importados.
- **Falha na verificação** - resultado de tempo esgotado e opções para nova tentativa.

## Principais componentes utilizados

A interface utiliza componentes nativos do React Native, entre eles `View`, `Text`, `TextInput`, `Pressable`, `ScrollView`, `Switch` e `KeyboardAvoidingView`. A navegação entre telas é feita pelo Expo Router.

Também são usados componentes próprios do projeto para padronizar a experiência visual. A maior parte deles está em `src/components/ui.tsx`.

## Componentes reutilizáveis

Os componentes reutilizáveis principais são:

- **Screen** - estrutura base das telas, com rolagem, Safe Area, tratamento de teclado e adaptação de largura.
- **Header** - cabeçalho reutilizável com título, subtítulo, botão de retorno e conteúdo opcional à direita.
- **Title** - título de conteúdo com subtítulo opcional.
- **Field** - campo de entrada padronizado construído sobre `TextInput`.
- **PrimaryButton** - botão principal da aplicação.
- **OutlineButton** - botão secundário com contorno.
- **TextButton** - ação apresentada como texto, incluindo opção de ação de risco.
- **Card** - contêiner visual usado para agrupar informações.
- **InfoBox** - caixa de informação com variações de estado.
- **SectionTitle** - título padronizado para seções.
- **Stat** - apresentação reutilizável de valor e rótulo estatístico.
- **Avatar** - avatar baseado em iniciais.
- **Divider** - separador visual.
- **SettingRow** - linha reutilizável para menus de configuração.
- **ProgressBar** - barra de progresso reutilizável.

A separação desses elementos das telas reduz repetição de código e facilita a manutenção da identidade visual.

## Elementos de entrada de dados

O protótipo possui diferentes formas de entrada e interação com o usuário:

- campos de usuário/e-mail e senha no login;
- nome, e-mail, senha e confirmação no cadastro;
- e-mail na recuperação de senha;
- campo de busca de handle na tela de amigos;
- campos de edição de perfil;
- handle do Codeforces e escolha de linguagem no fluxo de verificação;
- seleção de quantidade de problemas e tags na criação de treino;
- switches nas configurações de notificações;
- botões, cards clicáveis, abas e menus para navegação.

Essas entradas são funcionais na camada local do protótipo, mesmo quando o resultado final ainda utiliza dados simulados.

## Componentes de interface compatíveis com o projeto

A interface foi construída de acordo com o objetivo do RankFlow de acompanhar treinamento e desempenho em programação competitiva. Por isso, foram priorizados componentes como cards de estatísticas, barras de progresso, ranking, indicadores de rating, lista de amigos, filtros de treino, tabs, badges de estado e informações de conta competitiva.

## Organização visual

A aplicação utiliza uma identidade consistente baseada em fundo claro, cards brancos, bordas discretas, azul como cor principal e cores de estado para sucesso, atenção e erro. As cores compartilhadas ficam em `src/theme/colors.ts`.

Os componentes reutilizáveis concentram estilos comuns de botões, campos, cards e cabeçalhos, reduzindo diferenças visuais entre telas.

## Adaptação a diferentes tamanhos de tela

A adaptação do layout é realizada principalmente no componente `Screen` e nas estruturas Flexbox das telas.

O componente `Screen` usa `useWindowDimensions()` para observar a largura atual do dispositivo. Em telas menores que 360 px o espaçamento horizontal é reduzido; em tamanhos intermediários é utilizado um espaçamento padrão; em telas maiores o espaçamento aumenta. A partir de 768 px, o conteúdo recebe uma largura máxima para evitar linhas excessivamente longas.

Além disso:

- `ScrollView` permite acesso ao conteúdo quando a altura disponível é pequena;
- `useSafeAreaInsets()` evita sobreposição com notch e barras do sistema;
- `KeyboardAvoidingView` ajuda a manter formulários utilizáveis com o teclado aberto;
- `flex: 1` distribui espaço de forma proporcional;
- `flexWrap` permite que cards, chips e botões quebrem para outra linha quando não houver largura suficiente;
- `flexBasis` e `minWidth` são usados em grupos de cards e controles para preservar legibilidade em telas estreitas;
- os layouts principais utilizam largura percentual em vez de depender de uma resolução fixa.

## Dados simulados e ausência de servidor

Os dados temporários estão centralizados em `src/mocks/`:

```text
src/mocks/
├── codeforces.ts
├── friends.ts
├── platforms.ts
├── profile.ts
├── ranking.ts
├── statistics.ts
├── training.ts
└── index.ts
```

Essa organização permite demonstrar toda a interface sem persistência ou servidor. `src/services/codeforces.ts` utiliza esses mocks para simular busca e verificação de conta. Em uma etapa futura, essa implementação poderá ser substituída por chamadas reais sem espalhar dados de teste pelas telas.

## Principais decisões de interface

Foi adotada navegação inferior para as áreas de uso mais frequente: Início, Amigos, Treino e Placar. Estatísticas é acessada a partir do conteúdo da aplicação, evitando aumentar a quantidade de itens na barra inferior.

As telas de autenticação ficam em um grupo de rotas `(auth)`, enquanto as telas principais ficam em `(tabs)`. Os grupos organizam a estrutura interna do projeto sem adicionar seus nomes às rotas públicas.

O fluxo do Codeforces foi separado em várias telas para apresentar cada etapa de maneira clara: entrada de dados, confirmação da conta, desafio, sucesso ou falha.

Os dados simulados foram separados das telas para deixar evidente a diferença entre interface, dados de demonstração e lógica de serviço.

Os ícones da barra de navegação utilizam `lucide-react-native` e `react-native-svg`. Essa escolha mantém os ícones vetoriais e evita depender da fonte `Ionicons.ttf` durante testes por tunnel.

## Instruções para execução

### Requisitos

- Node.js instalado;
- npm;
- Expo Go instalado no celular.

### Dependências

Na raiz do projeto:

```bash
npm install
npx expo install react-native-svg
npm install lucide-react-native
```

### Executar pelo tunnel

```bash
npx expo start --tunnel
```

Depois, abra o Expo Go no celular e leia o QR Code apresentado no terminal.

## Verificação do protótipo

Para testar o fluxo simulado de Codeforces:

- informe `naoexiste` para simular uma conta não encontrada;
- informe qualquer outro handle para simular uma conta encontrada;
- na etapa de verificação, pressione **Já enviei / Atualizar status** para simular sucesso;
- se o cronômetro chegar a zero, será apresentada a tela de falha.


## Link do repositório

```text
https://github.com/FernandesCarlos/RankFlow
```

## Capturas de tela

Clique aqui para visualizar as capturas de tela [Capturas de tela`](./capturas_de_telas/capturas_de_telas.md)
