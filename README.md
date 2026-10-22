# RankFlow

Aplicação de demonstração para **programação competitiva**, desenvolvida com React Native, Expo, Expo Router e TypeScript. O RankFlow permite explorar treinos, acompanhar resultados simulados, visualizar estatísticas e interagir com outros participantes em uma interface com foco em usabilidade e acessibilidade.

## Funcionalidades

- **Autenticação demonstrativa:** telas de boas-vindas, login, cadastro e recuperação de senha.
- **Treinos:** geração de listas demonstrativas de problemas com filtros e configurações.
- **Histórico de treinos:** consulta de treinos concluídos e visualização de resultados.
- **Placar e estatísticas:** visualização de informações e desempenho simulado.
- **Amigos:** busca de participantes e visualização de perfis.
- **Perfil e configurações:** edição de informações pessoais e preferências.
- **Integração demonstrativa com Codeforces:** fluxo simulado de consulta e verificação de conta.
- **Navegação e acessibilidade:** rotas organizadas, feedback visual, estados de carregamento e controles acessíveis.

## Tecnologias

- React Native
- Expo e Expo Router
- TypeScript
- AsyncStorage para persistência local dos dados implementados
- lucide-react-native e react-native-svg
- Docker para execução em ambiente conteinerizado
- Jest e ferramentas de teste configuradas no projeto

## Requisitos

- Node.js 22.13 ou superior
- npm
- Expo Go compatível com o SDK utilizado pelo projeto, ou um development build compatível

## Como executar

Clone o repositório e acesse a pasta do projeto:

```bash
git clone https://github.com/FernandesCarlos/RankFlow.git
cd RankFlow
```

Instale as dependências e inicie o Expo:

```bash
npm ci
npm start
```

Leia o QR Code com o Expo Go compatível com o projeto.

Para executar no navegador:

```bash
npm run web
```

Para iniciar em um emulador ou simulador configurado:

```bash
npm run android
npm run ios
```

### Executar com Docker

Com o Docker instalado e em execução, utilize:

```bash
docker build -t rankflow .
docker run --rm -it --init -p 8081:8081 --name rankflow rankflow
```

A configuração do contêiner inicia o servidor Expo usando túnel. Aguarde a conexão e siga as instruções exibidas no terminal para abrir o aplicativo. O túnel requer conexão com a internet e não gera um APK.

A validação em dispositivos físicos também é recomendada para conferir navegação, acessibilidade, teclado, áreas seguras da tela e comportamento do botão Voltar.

## Limitações

O RankFlow é um protótipo demonstrativo. Não possui backend ou autenticação real. A geração de problemas, o placar, os resultados e os fluxos de Codeforces utilizam dados ou comportamentos simulados.

Os dados persistidos localmente dependem das funcionalidades implementadas no armazenamento do aplicativo. A persistência local não equivale à sincronização entre dispositivos ou a um serviço remoto.

## Documentação

A documentação detalhada está disponível na pasta [`docs/`](docs/):

- [Proposta do projeto](docs/proposta.md)
- [Documentação de navegação, UX, acessibilidade e testes](docs/etapa-03.md)
- [Documentação de persistência local](docs/etapa-04.md)

Consulte esses arquivos para conhecer as decisões de implementação, os fluxos da aplicação, os procedimentos de teste e os detalhes técnicos.

## Estrutura do projeto

```text
src/
├── app/         # Telas e rotas do Expo Router
├── components/  # Componentes reutilizáveis
├── mocks/       # Dados demonstrativos
├── navigation/  # Ações auxiliares de navegação
├── services/    # Serviços e regras de negócio
├── state/       # Estado compartilhado da aplicação
└── theme/       # Tema e identidade visual
docs/            # Documentação do projeto
tests/           # Testes automatizados
```

## Repositório

Código-fonte: [github.com/FernandesCarlos/RankFlow](https://github.com/FernandesCarlos/RankFlow)