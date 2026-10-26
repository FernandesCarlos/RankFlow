# Etapa 05 — Primeira versão funcional com backend

## 1. Objetivo e escopo

Esta etapa conecta o aplicativo React Native/Expo a uma API própria em C# (ASP.NET Core) com PostgreSQL. O foco do fluxo completo é criar/concluir um treino, consultar seu resultado no histórico e excluir um registro. O perfil também é sincronizado com o servidor.

A implementação mantém o AsyncStorage como persistência local e como modo de funcionamento quando a variável de API não está configurada. A geração de problemas e os resultados competitivos continuam demonstrativos.

## 2. Arquitetura

- **Frontend:** React Native, Expo Router e TypeScript.
- **Cliente HTTP:** `src/services/backend.ts`, que centraliza chamadas REST.
- **Estado da aplicação:** `src/state/AppContext.tsx`, que coordena armazenamento local e sincronização.
- **Backend:** ASP.NET Core Minimal API em `backend/RankFlow.Api`.
- **Banco:** PostgreSQL 16; acesso por Npgsql.
- **Execução local:** Docker Compose em `docker-compose.backend.yml`.

Tabelas criadas automaticamente na inicialização da API:

- `users`: identificador demonstrativo, perfil em JSONB e data de atualização.
- `trainings`: identificador, usuário, data de conclusão e registro do treino em JSONB.
- Índice para consultar o histórico de um usuário pela data de conclusão.

## 3. Fluxo de negócio completo: treino

1. Na aba **Treino**, o usuário seleciona participantes, dificuldade, quantidade e tags.
2. O formulário valida a quantidade de problemas, a faixa de dificuldade, as tags e os participantes.
3. O aplicativo gera a lista demonstrativa e abre a tela de resultado.
4. Ao concluir, cria um registro com identificador e data de conclusão e calcula resultados demonstrativos.
5. O registro é salvo no AsyncStorage e enviado para `POST /api/users/{userId}/trainings`, se o backend estiver configurado.
6. O histórico consulta os registros no estado compartilhado; na inicialização, o aplicativo busca os registros remotos e mescla treinos locais ainda não enviados.
7. Ao abrir um item, o aplicativo exibe problemas, participantes e resultados.
8. Ao excluir e confirmar, remove o item local e solicita `DELETE /api/users/{userId}/trainings/{trainingId}`.

A API usa upsert para tornar o envio repetido do mesmo identificador idempotente. A exclusão remota é restrita ao identificador de usuário demonstrativo e ao identificador do treino.

## 4. Fluxo de perfil

1. O usuário abre **Perfil** e **Editar perfil**.
2. O formulário valida nome, nome de usuário e e-mail.
3. Ao salvar, o estado é atualizado e persistido localmente.
4. Com a API habilitada, o perfil é consultado durante a sincronização inicial e as atualizações são enviadas por `PUT /api/users/{userId}/profile`.

O identificador remoto deriva do nome de usuário normalizado. É uma solução provisória para demonstração, não autenticação nem autorização de produção.

## 5. Outras funcionalidades

- Preferências de notificações e privacidade continuam persistidas no AsyncStorage.
- Navegação, configurações, amigos, placar, estatísticas e integração com Codeforces continuam disponíveis na interface.
- Dados de problemas, participantes, pontuação, ranking e Codeforces ainda são simulados; não são transformados em dados reais pela API desta etapa.

## 6. Como executar

### Opção A — API e PostgreSQL com Docker Compose

Pré-requisitos: Docker com Compose.

Na raiz do repositório:

```bash
docker compose -f docker-compose.backend.yml up --build
```

A API ficará em `http://localhost:5080`; o endpoint `/health` deve responder com status `ok`.

Para parar os serviços:

```bash
docker compose -f docker-compose.backend.yml down
```

Os dados ficam em um volume Docker chamado `rankflow_postgres`. Para apagar o volume e todos os dados do banco, use `docker compose -f docker-compose.backend.yml down -v`.

### Opção B — executar a API com .NET

Instale o .NET 8 SDK e tenha PostgreSQL disponível. Defina a variável de ambiente `ConnectionStrings__RankFlow` com a string de conexão desejada e execute:

```bash
cd backend/RankFlow.Api
dotnet restore
dotnet run
```

### Configurar o frontend

Crie `.env.local` na raiz do aplicativo:

```dotenv
EXPO_PUBLIC_API_URL=http://localhost:5080
```

- Navegador no mesmo computador: `http://localhost:5080`.
- Emulador Android: `http://10.0.2.2:5080`.
- Dispositivo físico: use o IP local do computador que executa a API; ambos devem estar na mesma rede.

Depois de mudar a variável, reinicie o servidor Expo. Sem `EXPO_PUBLIC_API_URL`, o aplicativo usa apenas o armazenamento local.

Instale as dependências do frontend e inicie o Expo:

```bash
npm ci
npm start
```

## 7. Endpoints disponíveis

| Método | Rota | Finalidade |
|---|---|---|
| GET | `/health` | Verificar a API |
| GET | `/api/users/{userId}/profile` | Consultar perfil |
| PUT | `/api/users/{userId}/profile` | Criar/atualizar perfil |
| GET | `/api/users/{userId}/trainings` | Consultar histórico |
| POST | `/api/users/{userId}/trainings` | Criar/atualizar treino concluído |
| DELETE | `/api/users/{userId}/trainings/{trainingId}` | Excluir treino |

## 8. Validação de entradas e feedback

- O formulário de treino valida quantidade entre 3 e 6, dificuldade entre 800 e 3500, mínimo menor ou igual ao máximo, pelo menos uma tag e pelo menos um participante.
- O formulário de perfil exige nome com pelo menos 3 caracteres, nome de usuário e e-mail válido.
- A API rejeita perfil que não seja objeto JSON, treino sem identificador e data de conclusão inválida.
- A tela mostra mensagens de validação e avisos de sincronização; quando a API está desligada ou não configurada, o fluxo local continua disponível.
- O endpoint `/health` permite conferir se a API está acessível.

## 9. Decisões técnicas e limitações

- **ASP.NET Core Minimal API:** mantém a API pequena e simples para a primeira versão.
- **PostgreSQL + JSONB:** guarda a estrutura variável do perfil e do treino sem exigir uma migração de esquema a cada campo novo. Os identificadores e a data do treino permanecem em colunas próprias para consulta.
- **AsyncStorage + API:** preserva a experiência local já existente e habilita sincronização quando o backend é configurado.
- **Sem credenciais reais:** a autenticação e a autorização não fazem parte desta entrega. O `userId` baseado em username é fácil de imitar e não deve proteger dados sensíveis em produção.
- **Sem fila de sincronização offline:** erros de API geram aviso, mas não existe mecanismo robusto de repetição automática ou resolução de conflitos.
- **Sem integração externa real:** os problemas, submissões, resultados, ranking e amigos ainda são dados demonstrativos.
- **CORS:** a configuração permite origens amplas para facilitar o desenvolvimento local; deve ser restringida antes de publicar o serviço.

## 10. Testes manuais recomendados

1. Subir API e banco com Docker Compose e verificar `/health`.
2. Iniciar o aplicativo com `EXPO_PUBLIC_API_URL` configurada.
3. Editar o perfil, salvar, reiniciar o aplicativo e confirmar que o perfil volta sincronizado.
4. Criar um treino com valores válidos, concluir e conferir que aparece no histórico.
5. Encerrar e reabrir o aplicativo; verificar a recuperação do histórico.
6. Abrir um resultado e conferir os problemas e pontuações demonstrativas.
7. Excluir um treino, confirmar e conferir que ele deixa de aparecer após reabrir.
8. Testar entradas inválidas no formulário de treino e perfil.
9. Parar a API e confirmar que o aplicativo mantém os dados locais e apresenta aviso quando uma sincronização falha.

## 11. Arquivos principais

- `backend/RankFlow.Api/Program.cs`: endpoints, inicialização de tabelas e acesso ao PostgreSQL.
- `backend/RankFlow.Api/RankFlow.Api.csproj`: dependência Npgsql.
- `backend/RankFlow.Api/Dockerfile`: imagem da API.
- `docker-compose.backend.yml`: API e PostgreSQL.
- `src/services/backend.ts`: cliente REST do frontend.
- `src/state/AppContext.tsx`: persistência e sincronização de perfil e histórico.
- `README.md`: visão geral e instruções para executar.

## 12. Tag de entrega

Após validar localmente, crie a tag na branch:

```bash
git checkout feature/etapa-05
git pull origin feature/etapa-05
git tag etapa-05
git push origin etapa-05
```

A tag deve ser criada somente depois de revisar e testar a versão final.
