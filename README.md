# RankFlow

Aplicativo mobile para programação competitiva, desenvolvido com React Native, Expo, Expo Router e TypeScript. O projeto está evoluindo de um protótipo com dados demonstrativos para uma aplicação com backend e integração real com o Codeforces.

## Funcionalidades

- Acompanhamento de desempenho e estatísticas competitivas.
- Criação de treinos personalizados.
- Amigos, perfis e placares de competições próprias.
- Integração com a API pública do Codeforces.
- Autenticação de identidade via OpenID Connect do Codeforces (em implementação).

## Tecnologias

- Mobile: React Native, Expo e TypeScript.
- Backend: Python, FastAPI e SQLAlchemy.
- Banco de dados: PostgreSQL 16.
- Integração externa: Codeforces API e OpenID Connect.
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
2. Configure `JWT_SECRET` e `SESSION_SECRET` com segredos aleatórios fortes.
3. Registre uma aplicação OpenID Connect nas configurações do Codeforces e preencha `CODEFORCES_CLIENT_ID`, `CODEFORCES_CLIENT_SECRET` e a callback URL cadastrada em `CODEFORCES_CALLBACK_URL`.
4. Inicie os serviços:
   ```bash
   docker compose up --build
   ```
5. Verifique:
   - API: http://localhost:8000/health
   - Swagger: http://localhost:8000/docs

## Executar o aplicativo mobile

Em outro terminal, na raiz do projeto:

```bash
npm ci
npm start
```

A integração de login mobile, callback deep link e armazenamento seguro da sessão ainda precisa ser concluída. O backend desta etapa já disponibiliza o fluxo OIDC e a troca do ticket por JWT.

## API inicial

- `GET /api/auth/codeforces/login`
- `GET /api/auth/codeforces/callback`
- `POST /api/auth/codeforces/exchange`
- `GET /api/users/me`
- `GET /api/codeforces/users/{handle}`
- `GET /api/codeforces/users/{handle}/rating`
- `GET /api/codeforces/users/{handle}/submissions`
- `GET /api/codeforces/problems`

## Documentação

- [Proposta do projeto](docs/proposta.md)
- [Etapa 03 — UX e navegação](docs/etapa-03.md)
- [Etapa 04 — Persistência local](docs/etapa-04.md)
- [Etapa 06 — Backend e Codeforces](docs/etapa-06.md)

## Estado atual

A Etapa 06 está em andamento. O backend inicial, o banco PostgreSQL, os endpoints de consulta Codeforces e o fluxo OIDC foram adicionados. A integração mobile completa e a substituição dos mocks nas telas ainda estão pendentes.