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
- AsyncStorage para persistência local e modo offline
- API REST em ASP.NET Core (C#) com PostgreSQL para sincronizar perfil e histórico de treinos
- Docker Compose para subir PostgreSQL e API
- lucide-react-native e react-native-svg
- Docker para execução em ambiente conteinerizado
- Jest e ferramentas de teste configuradas no projeto

## Backend (C# + PostgreSQL)

A Etapa 05 adiciona uma API REST em ASP.NET Core e persistência remota no PostgreSQL para perfil e histórico de treinos. A autenticação ainda é demonstrativa: o identificador remoto deriva do nome de usuário e não deve ser usado como identidade segura em produção.

Requisitos adicionais: Docker com Compose ou .NET 8 SDK e PostgreSQL 16.

Para subir o banco e a API:

```bash
docker compose -f docker-compose.backend.yml up --build
```

A API fica disponível em `http://localhost:5080`; verifique `http://localhost:5080/health`.

Configure a URL no frontend antes de iniciar o Expo. Crie um arquivo `.env.local` com:

```dotenv
EXPO_PUBLIC_API_URL=http://localhost:5080
```

Em emulador Android, use `http://10.0.2.2:5080`. Em dispositivo físico, use o endereço IP local do computador na mesma rede. Reinicie o Expo depois de alterar a variável. Sem essa variável, o aplicativo permanece em modo local com AsyncStorage.

Para encerrar os serviços:

```bash
docker compose -f docker-compose.backend.yml down
```

Para remover também os dados persistidos no volume do PostgreSQL (ação destrutiva):

```bash
docker compose -f docker-compose.backend.yml down -v
```

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

O RankFlow ainda é um protótipo demonstrativo. A Etapa 05 adiciona backend para perfil e histórico de treinos, mas não implementa autenticação real. A identificação por nome de usuário é apenas demonstrativa. A geração de problemas, os resultados dos participantes, o placar, amigos, estatísticas e os fluxos de Codeforces continuam utilizando dados ou comportamentos simulados. Preferências e notificações permanecem locais.

Os dados persistidos localmente dependem das funcionalidades implementadas no armazenamento do aplicativo. A persistência local não equivale à sincronização entre dispositivos ou a um serviço remoto.

## Documentação

A documentação detalhada está disponível na pasta [`docs/`](docs/):

- [Proposta do projeto](docs/proposta.md)
- [Documentação de navegação, UX, acessibilidade e testes](docs/etapa-03.md)
- [Documentação de persistência local](docs/etapa-04.md)
- [Backend e integração da Etapa 05](docs/etapa-05.md)

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