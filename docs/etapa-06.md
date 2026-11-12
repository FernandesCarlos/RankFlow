# RankFlow — Etapa 06

## Objetivo
Introduzir backend persistente, autenticação por identidade Codeforces e consulta de dados reais, substituindo gradualmente os mocks.

## Arquitetura
- Mobile: React Native, Expo e TypeScript.
- Backend: Python 3.12, FastAPI e SQLAlchemy.
- Banco: PostgreSQL 16.
- Identidade: OpenID Connect do Codeforces; o aplicativo não solicita senha do Codeforces.
- Sessão RankFlow: JWT emitido pelo backend após troca de ticket de uso único.

## Fluxo de autenticação implementado no backend
1. O app abre `GET /api/auth/codeforces/login` no navegador do sistema.
2. O Codeforces autentica e redireciona para o callback configurado.
3. O backend obtém claims OIDC, cria/atualiza o usuário e gera ticket aleatório de uso único com validade de dois minutos.
4. Redireciona para `rankflow://auth/callback?ticket=...`.
5. O app troca o ticket em `POST /api/auth/codeforces/exchange` e recebe JWT próprio.

## Endpoints
- `GET /health`
- `GET /api/auth/codeforces/login`
- `GET /api/auth/codeforces/callback`
- `POST /api/auth/codeforces/exchange`
- `GET /api/users/me` (Bearer JWT)
- `GET /api/codeforces/users/{handle}`
- `GET /api/codeforces/users/{handle}/rating`
- `GET /api/codeforces/users/{handle}/submissions?count=100`
- `GET /api/codeforces/problems?tags=dp&min_rating=1200&max_rating=1800&limit=100`

## Configuração local
1. Copie `backend/.env.example` para `backend/.env`.
2. Registre um cliente OpenID Connect no Codeforces e informe Client ID, Client Secret e a callback URL exatamente como registrada.
3. Preencha segredos JWT e sessão com valores aleatórios fortes.
4. Execute `docker compose up --build`.
5. Teste `http://localhost:8000/health` e `http://localhost:8000/docs`.

## Segurança e limitações
- Segredos ficam somente no backend; nunca no bundle mobile.
- Ticket é armazenado como hash, expira em dois minutos e é consumido uma vez.
- JWT deve ser armazenado pelo app em SecureStore (integração mobile pendente).
- Chamadas públicas Codeforces são centralizadas no backend, serializadas com intervalo de aproximadamente dois segundos e cache de 60 segundos em memória.
- Em produção: HTTPS obrigatório, secrets fortes, CORS restrito, migrations (Alembic), rate limiting por usuário/IP, limpeza periódica de tickets e armazenamento persistente de cache.

## Pendências mobile e produto
- Implementar callback deep-link no Expo e troca do ticket.
- Substituir AsyncStorage de sessão por SecureStore.
- Remover perfil mock inicial e alimentar Home/Perfil/Estatísticas via API.
- Buscar problemas reais no gerador de treinos.
- Persistir amigos, treinos, participantes e placares próprios do RankFlow no PostgreSQL.
- Corrigir telas de cadastro/recuperação, que não fazem sentido como autenticação separada se a identidade for somente Codeforces.
