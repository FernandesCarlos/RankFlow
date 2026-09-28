# RankFlow

Aplicação de demonstração para programação competitiva, desenvolvida com **React Native, Expo, Expo Router e TypeScript**. A Etapa 3 completa os fluxos de navegação e aplica princípios de UX, Lei de Fitts e acessibilidade.

## Entrega da Etapa 3

- [Documentação completa: navegação, UX, acessibilidade e testes](docs/etapa-03.md)
- [Código da Etapa 3](https://github.com/FernandesCarlos/RankFlow/tree/feature/etapa-03)
- Tag exigida: `etapa-03`. Criada localmente; publicação remota pendente. Veja os comandos na documentação.
- [Documentação anterior — Etapa 2](docs/etapa-02.md)
- [Proposta do projeto](docs/proposta.md)

## Funcionalidades

- Boas-vindas, login, cadastro e recuperação de senha com validação e mensagens claras.
- Abas Início, Amigos, Treino, Placar e Configurações, com estado selecionado e histórico de retorno.
- Pilha de detalhes: estatísticas, perfil, edição, preferências, perfil de amigo e resultado do treino.
- Busca de amigos com estado vazio e abertura de perfil por rota dinâmica.
- Geração de lista demonstrativa com participantes, dificuldade, quantidade e tags escolhidos.
- Histórico de treinos concluídos na sessão, com resultados simulados por participante e reabertura por ID.
- Skeletons acessíveis durante o carregamento dos mocks e da consulta Codeforces.
- Edição de perfil e preferências compartilhadas durante a sessão.
- Fluxo Codeforces: consulta simulada, conta encontrada, verificação, sucesso/falha e retorno à origem preservando o cadastro.
- Controles com rótulos, papéis e estados acessíveis, foco visível, feedback de toque e mensagens de resultado.

**Escopo:** não há autenticação real, backend ou persistência após reiniciar. Login aceita usuário e senha fictícios não vazios. Cadastro, recuperação de senha, Codeforces, geração de problemas e placar são simulações; não enviam e-mails, submissões, convites ou notificações. Sair encerra e limpa a sessão. `Stack.Protected` organiza o acesso ao protótipo, não substitui autorização em um servidor.

## Executar

Use Node.js **22.13 ou superior** (validação realizada com Node 24), npm e Expo Go compatível com o SDK 57 do projeto, ou um development build compatível.

```bash
npm ci
npm start
```

Abra o QR Code no Expo Go. Para navegador:

```bash
npm run web
```

Para emulador Android ou simulador iOS, com o ambiente nativo configurado:

```bash
npm run android
npm run ios
```

Se precisar de túnel, use `npx expo start --tunnel`. Não é necessário reinstalar os ícones ou alterar as versões do lockfile.

### Docker com túnel

Com o Docker instalado e iniciado, execute na raiz do projeto:

```bash
docker build -t rankflow .
docker run --rm -it --init -p 8081:8081 --name rankflow rankflow
```

A imagem instala Node.js 22 e todas as dependências do lockfile, incluindo `@expo/ngrok`, e inicia `npx expo start --tunnel`. Não é necessário instalar Node ou npm no computador. Aguarde o túnel conectar e leia o QR Code no terminal com um Expo Go compatível com o SDK do projeto. O túnel requer conexão com a internet e permite acessar o servidor de desenvolvimento pelo celular em outra rede. Ele não gera um APK.

Use `Ctrl+C` para parar. O código é copiado para a imagem durante o build; depois de editar arquivos, refaça o build e execute o contêiner novamente. Arquivos `.env` não entram na imagem; se precisar de variáveis, passe `--env-file .env` ao `docker run`.

## Testar

```bash
npm run typecheck
npm test
npm run export:web
```

`npm test` executa validações/geração e testes das telas reais com o Expo Router. Os cenários incluem login, logout, estado preservado no retorno, perfil, treino, amigos, estatísticas, recuperação e Codeforces. Os testes ficam fora de `src/app`, para não virarem rotas.

O [roteiro manual](docs/etapa-03.md#roteiro-manual-em-aparelho) cobre TalkBack/VoiceOver, fonte ampliada, safe area, teclado e botão físico Voltar. Esses aspectos exigem conferência em dispositivo; testes de componentes não comprovam a experiência visual ou auditiva final.

## Pilha e router na prática

O `Stack` raiz, em [`src/app/_layout.tsx`](src/app/_layout.tsx), contém as abas e as telas de detalhe. Cada arquivo em `src/app` define uma rota. Não é necessário criar um segundo `NavigationContainer`.

```tsx
// Empilha a edição sobre o perfil.
router.push('/perfil/editar');

// Remove a tela atual e revela a anterior.
router.back();

// Troca uma etapa transitória pela conclusão.
router.replace({ pathname: '/codeforces/sucesso', params });

// Retorna à tela já existente, removendo as etapas intermediárias.
router.dismissTo('/(auth)/cadastro');
```

A aplicação usa `goBack(destino)` para verificar `router.canGoBack()` e oferecer retorno mesmo quando uma tela é aberta diretamente. Ao iniciar ou encerrar uma sessão, `Stack.Protected` remove do histórico as rotas que deixam de estar disponíveis.

## Estrutura

| Local | Responsabilidade |
| --- | --- |
| `src/app/(auth)` | Boas-vindas, login, cadastro, recuperação |
| `src/app/(tabs)` | Início, Amigos, Treino e Placar |
| `src/app/estatisticas.tsx` | Detalhe em pilha acessado pelo Início |
| `src/app/amigos/[handle].tsx` | Perfil do amigo identificado pela rota |
| `src/app/treinos/resultado.tsx` | Lista gerada e retorno à configuração do treino |
| `src/app/perfil`, `src/app/configuracoes` | Perfil e preferências |
| `src/app/codeforces` | Pilha de verificação simulada |
| `src/components` | Componentes visuais, controles acessíveis e estados vazios |
| `src/state/AppContext.tsx` | Estado em memória da sessão |
| `src/navigation/actions.ts` | Retorno com destino alternativo |
| `src/services` | Validação, geração e serviços simulados |
| `src/mocks`, `src/theme` | Dados iniciais e paleta |
| `tests` | Testes de domínio e navegação |

Os ícones usam `lucide-react-native` e `react-native-svg`.
