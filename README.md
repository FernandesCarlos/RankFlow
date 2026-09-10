# RankFlow

Protótipo mobile do RankFlow desenvolvido com React Native, Expo e Expo Router. Nesta etapa, o foco é a camada visual e estrutural da aplicação: telas navegáveis, componentes reutilizáveis, entradas de dados e adaptação do layout a diferentes tamanhos de tela.

O RankFlow é uma aplicação voltada para programação competitiva. O protótipo permite visualizar desempenho, amigos, treinos, placar, estatísticas, perfil e o fluxo de vinculação de uma conta do Codeforces.

## Tecnologias

- React Native
- Expo
- Expo Router
- TypeScript
- `react-native-svg`
- `lucide-react-native`

Os ícones usam `lucide-react-native`, evitando a dependência da fonte `Ionicons.ttf` durante a execução via tunnel.

## Estrutura principal

```text
src/
├── app/                 # telas e rotas do Expo Router
│   ├── (auth)/          # boas-vindas, login, cadastro e recuperação de senha
│   ├── (tabs)/          # início, amigos, treino, placar e estatísticas
│   ├── codeforces/      # fluxo de verificação de conta
│   ├── configuracoes/   # configurações, plataformas e notificações
│   └── perfil/          # perfil e edição de perfil
├── components/
│   └── ui.tsx           # componentes reutilizáveis de interface
├── mocks/               # dados simulados da Etapa 2
├── services/            # lógica simulada de serviços
└── theme/               # cores e tema visual
```

## Telas implementadas

O protótipo possui 19 telas navegáveis:

1. Boas-vindas
2. Login
3. Cadastro
4. Recuperar senha
5. Início
6. Amigos
7. Criar treino
8. Placar ao vivo
9. Estatísticas
10. Perfil
11. Editar perfil
12. Configurações
13. Plataformas conectadas
14. Notificações
15. Verificar conta do Codeforces
16. Conta encontrada
17. Verificação em andamento
18. Conta verificada
19. Falha na verificação

## Componentes reutilizáveis

Os principais componentes compartilhados ficam em `src/components/ui.tsx`:

- `Screen`
- `Header`
- `Title`
- `Field`
- `PrimaryButton`
- `OutlineButton`
- `TextButton`
- `Card`
- `InfoBox`
- `SectionTitle`
- `Stat`
- `Avatar`
- `Divider`
- `SettingRow`
- `ProgressBar`

Isso evita repetir estrutura e estilos em cada tela e mantém a interface consistente.

## Dados simulados

A Etapa 2 não depende de backend nem persistência. Os dados usados na interface ficam centralizados em:

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

`src/services/codeforces.ts` simula as operações necessárias para demonstrar o fluxo de verificação do Codeforces.

## Adaptação do layout

A base das telas foi preparada para diferentes tamanhos de dispositivo por meio de:

- `useWindowDimensions()` para ajustar espaçamento horizontal conforme a largura disponível;
- largura máxima de conteúdo em telas maiores;
- `ScrollView` para impedir perda de conteúdo em telas menores;
- `Safe Area` para respeitar barras, recortes e notch do aparelho;
- `KeyboardAvoidingView` para reduzir sobreposição do teclado;
- Flexbox (`flex`, `flexGrow`, `flexBasis` e `flexWrap`) em grupos de cards, botões e chips;
- componentes sem largura fixa para a estrutura principal da tela.

## Como executar

Com Node.js e o Expo Go instalados, entre na pasta do projeto e execute:

```bash
npm install
npx expo install react-native-svg
npm install lucide-react-native
```

Para iniciar usando tunnel:

```bash
npx expo start --tunnel
```

Abra o Expo Go no celular e leia o QR Code exibido pelo terminal.

## Teste do fluxo Codeforces

O fluxo ainda é simulado para fins de protótipo:

- `naoexiste` simula um handle não encontrado;
- qualquer outro handle simula uma conta encontrada;
- `Já enviei / Atualizar status` simula uma submissão detectada;
- se o cronômetro terminar, o fluxo segue para a tela de falha.

## Documentação da Etapa 2

A documentação específica da entrega está em:

```text
docs/etapa-02.md
```

Ela descreve telas, componentes, entradas de dados, responsividade, decisões de interface, execução e os passos para criar a tag Git `etapa-02`.
