# RankFlow

Aplicativo mobile para programação competitiva, desenvolvido com React Native, Expo, Expo Router e TypeScript. O projeto integra dados públicos do Codeforces por meio de um backend próprio.

## Funcionalidades

- Acompanhamento de rating atual e máximo.
- Histórico de contests e evolução de rating.
- Estatísticas de problemas resolvidos por tag.
- Cadastro local de amigos por handle público do Codeforces.
- Ranking dos amigos por rating e, em caso de empate, problemas resolvidos.
- Placar separado para sessões de treino criadas no RankFlow.
- Criação e agendamento de treinos personalizados.
- Estado global compartilhado entre telas via React Context API.
- Foto de perfil selecionada na galeria e sincronizada com a conta.
- Notificações push FCM para lembrar o início de treinos agendados.
- Compartilhamento nativo de resultados em texto/link ou card PNG.

## Tecnologias

- Mobile: React Native, Expo e TypeScript.
- Backend: Python, FastAPI, SQLAlchemy e HTTPX.
- Banco de dados: PostgreSQL 16.
- Serviço externo: API pública do Codeforces.
- Estado não sensível: AsyncStorage e React Context API.
- Token JWT: Expo SecureStore (Keychain/Keystore).
- Recursos nativos: Expo Image Picker, React Native Firebase Messaging, React Native Share, Expo Sharing e View Shot.
- Docker Compose para execução local.

## Estrutura

```text
RankFlow/
├── backend/       # API FastAPI e integração Codeforces
├── src/           # Aplicativo React Native
├── docs/          # Documentação por etapa
├── docker-compose.yml
└── package.json
```

## Executar o backend

1. Copie o arquivo de exemplo:
   ```bash
   cp backend/.env.example backend/.env
   ```
   No PowerShell:
   ```powershell
   Copy-Item backend/.env.example backend/.env
   ```
2. Preencha os segredos exigidos no arquivo local `backend/.env`. Não versione esse arquivo.
3. Inicie os serviços:
   ```bash
   docker compose up --build
   ```
4. Verifique:
   - API: http://localhost:8000/health
   - Swagger: http://localhost:8000/docs

## Executar o aplicativo mobile

1. Instale as dependências na raiz:
   ```bash
   npm install
   ```
2. Copie `.env.example` para `.env` na raiz e configure `EXPO_PUBLIC_API_URL` com a URL acessível do backend. Para simulador no mesmo computador, use `http://localhost:8000`. Em dispositivo físico, use o IP local do computador.
3. Para funcionalidades FCM, configure primeiro o Firebase conforme [Etapa 07](docs/etapa-07.md) e gere um development build (o Expo Go não inclui os módulos nativos do Firebase):
   ```bash
   npx expo prebuild --clean
   npx expo run:android
   npx expo start --dev-client
   ```
   Para desenvolvimento sem FCM, o Expo pode ser iniciado com `npx expo start`.

## Integração Codeforces

O aplicativo chama o backend RankFlow por HTTP. O backend consulta a base `https://codeforces.com/api` usando os métodos públicos:

- `GET /user.info?handles={handle}`
- `GET /user.rating?handle={handle}`
- `GET /user.status?handle={handle}&from=1&count=1000`

Endpoints internos:
- `GET /api/codeforces/users/{handle}`
- `GET /api/codeforces/users/{handle}/rating`
- `GET /api/codeforces/users/{handle}/submissions?count=1000`

As telas Início, Estatísticas, Amigos e Placar usam esses dados. O número de problemas resolvidos é calculado a partir das até 1000 submissões mais recentes, contando problemas distintos com veredito `OK`. Portanto, o valor representa a amostra consultada, não necessariamente o total histórico completo.

Na tela Amigos, o usuário cadastra handles manualmente. A lista fica persistida localmente via AsyncStorage. O ranking é ordenado por rating decrescente e, em caso de empate, por problemas resolvidos. O placar de treinos RankFlow permanece separado.

## Documentação

- [Proposta do projeto](docs/proposta.md)
- [Etapa 03 — UX e navegação](docs/etapa-03.md)
- [Etapa 04 — Persistência local](docs/etapa-04.md)
- [Etapa 06 — Integração com API externa](docs/etapa-06.md)
- [Etapa 07 — Estado global e recursos nativos](docs/etapa-07.md)

## Estado atual

A integração de consulta Codeforces está conectada às telas principais. A Etapa 07 adiciona galeria sincronizada, perfil público, FCM e compartilhamento nativo. A execução dessas integrações exige configurar as credenciais do Firebase e gerar um development build; os arquivos de credenciais não são versionados. A lista de amigos continua armazenada localmente nesta versão.
