# RankFlow — Etapa 06: Integração com API externa

## Objetivo

Integrar o aplicativo a um serviço externo por HTTP para consultar dados reais de programação competitiva, substituindo os dados demonstrativos das telas de início, estatísticas, amigos e placar.

## Serviço utilizado

- **Serviço externo:** Codeforces API.
- **Base URL pública:** `https://codeforces.com/api`.
- **Protocolo:** HTTPS, método GET.
- **Camada intermediária:** API própria RankFlow (FastAPI), executada no backend.
- **Base URL local do backend:** `http://localhost:8000` (emulador/dispositivo físico deve usar o endereço de rede acessível à máquina que executa o backend).
- **Cliente mobile:** `src/services/codeforcesApi.ts`.
- **Integração servidor:** `backend/app/codeforces.py`.

O aplicativo mobile consulta o backend RankFlow. O backend consulta a API pública Codeforces, aplica cache em memória por 60 segundos e limita as chamadas externas para respeitar o intervalo entre requisições.

## Endpoints externos Codeforces utilizados

| Endpoint externo | Método | Parâmetros | Finalidade |
|---|---|---|---|
| `/user.info?handles={handle}` | GET | handle | Dados públicos do usuário, rating, rank e maior rating |
| `/user.rating?handle={handle}` | GET | handle | Histórico de contests e variações de rating |
| `/user.status?handle={handle}&from=1&count=1000` | GET | handle, from, count | Submissões recentes, vereditos, problemas e tags |

O formato de sucesso da API Codeforces usa `status: "OK"` e `result`. O backend devolve ao app o conteúdo de `result`. Quando a API externa retorna erro, o backend transforma a resposta em HTTP 404 (usuário inexistente) ou HTTP 502 (falha externa).

## Endpoints internos RankFlow utilizados pelo aplicativo

| Endpoint | Método | Entrada | Saída |
|---|---|---|---|
| `/api/codeforces/users/{handle}` | GET | Handle no caminho | Objeto de usuário Codeforces |
| `/api/codeforces/users/{handle}/rating` | GET | Handle no caminho | Lista de alterações de rating |
| `/api/codeforces/users/{handle}/submissions?count=1000` | GET | Handle e quantidade (1–1000) | Lista de submissões |
| `/health` | GET | — | `{"status":"ok"}` |

As consultas de perfil, rating e submissões são feitas em paralelo pelo cliente mobile. Para o ranking de amigos, o app consulta apenas perfil e submissões, pois o histórico de contests não é necessário para ordenar a lista. O backend controla a cadência das chamadas à Codeforces.

## Estrutura dos dados recebidos

### Usuário

Campos usados pelo aplicativo:
- `handle`: nome público;
- `rating`: rating atual (pode não existir para usuário unrated);
- `maxRating`: maior rating;
- `rank`: classificação atual;
- `maxRank`: melhor classificação.

### Histórico de rating

Cada item contém:
- `contestId` e `contestName`;
- `rank`: posição no contest;
- `ratingUpdateTimeSeconds`: instante Unix da atualização;
- `oldRating` e `newRating`.

### Submissões

Cada item contém:
- `id`, `contestId`, `creationTimeSeconds`;
- `verdict`: resultado da submissão;
- `problem`: `contestId`, `index`, `name`, `rating` e `tags`.

## Processamento no aplicativo

O cliente `getCodeforcesSummary(handle)` reúne os três retornos em um resumo:
- rating atual e máximo;
- quantidade de contests;
- rating dos últimos contests e variação acumulada nos últimos cinco;
- problemas aceitos distintos;
- quantidade de problemas resolvidos por tag;
- quantidade de submissões retornadas.

Uma submissão conta como resolvida quando `verdict === "OK"`. O problema é deduplicado pela combinação do identificador do contest e índice do problema. A quantidade de problemas resolvidos é calculada a partir das até 1000 submissões mais recentes, portanto é uma estimativa baseada nessa amostra, não o total histórico completo da conta.

## Telas integradas

- **Início:** consulta perfil, rating, maior rating, problemas resolvidos, contests e evolução recente.
- **Estatísticas:** consulta histórico de rating e submissões aceitas para construir distribuição de problemas por tag.
- **Amigos:** permite cadastrar um handle. Antes de adicioná-lo, consulta o endpoint de usuário para validar a existência da conta. Os handles são persistidos localmente via AsyncStorage.
- **Placar:** consulta os amigos cadastrados e ordena por rating decrescente; em caso de empate, por problemas resolvidos decrescente. O placar das sessões de treino RankFlow permanece em uma tela separada.

A API pública do Codeforces não fornece uma lista de amigos do usuário para esta funcionalidade. Por isso, o cadastro é feito pelo próprio usuário, informando os handles públicos que deseja acompanhar.

## Fluxo de comunicação

1. A tela inicia a consulta e apresenta o estado de carregamento.
2. O cliente mobile chama os endpoints internos RankFlow por HTTP GET.
3. O backend consulta a API Codeforces por HTTPS GET.
4. O backend retorna os dados públicos em JSON.
5. O cliente calcula os indicadores e apresenta os resultados.
6. No cadastro de amigo, o app valida o handle com a API antes de persistir a lista local.
7. O botão de atualização refaz as consultas; respostas recentes podem ser atendidas pelo cache do backend.

## Estados tratados

- **Carregamento:** placeholder e mensagem contextual durante as requisições.
- **Sucesso:** apresentação de perfil, rating, estatísticas e ranking.
- **Erro:** mensagem de conexão, HTTP ou usuário não encontrado; a tela permite tentar novamente.
- **Ausência de dados:** mensagens específicas para conta sem contests, sem submissões aceitas ou lista de amigos vazia.
- **Dados parciais:** no ranking, amigos cujas consultas falham são omitidos e a interface informa que nem todos foram carregados.

## Persistência

A lista de handles de amigos é salva em AsyncStorage no estado `@rankflow:app-state:v1`, junto dos demais dados locais do aplicativo. Os dados de rating e submissões são consultados novamente no backend; não são armazenados como cópia permanente no dispositivo.

## Configuração e execução

1. Copie `backend/.env.example` para `backend/.env`.
2. Configure os segredos exigidos pelo backend, sem versioná-los.
3. Inicie banco e API:
   ```bash
   docker compose up --build
   ```
4. Verifique `http://localhost:8000/health` e a documentação interativa em `http://localhost:8000/docs`.
5. Copie `.env.example` para `.env` na raiz do projeto e configure `EXPO_PUBLIC_API_URL`. Exemplo para execução no mesmo computador: `http://localhost:8000`. Em dispositivo físico, use o IP local do computador na rede.
6. Inicie o aplicativo:
   ```bash
   npm install
   npx expo start
   ```
7. Abra Início, Estatísticas, Amigos e Placar. Cadastre um handle público real na tela Amigos e atualize o ranking.

## Segurança e limitações

- Não são necessárias chaves de API para consultar os endpoints públicos usados nesta etapa.
- Não coloque credenciais ou tokens no aplicativo mobile.
- Use HTTPS e uma URL pública segura para ambientes de produção.
- O backend usa timeout, cache e serialização de chamadas para reduzir carga na API externa.
- A contagem de problemas resolvidos considera apenas as até 1000 submissões mais recentes consultadas.
- A lista de amigos é local ao dispositivo nesta implementação; ainda não há sincronização dessa lista entre usuários/dispositivos.

## Escopo e pendências

A integração de consulta pública Codeforces está implementada para as telas descritas. O fluxo de autenticação OIDC Codeforces documentado anteriormente no projeto permanece separado e a autenticação mobile completa (deep link, troca de ticket e armazenamento seguro do JWT) ainda depende de configuração e integração específicas. A lista de amigos também pode ser migrada para persistência no backend em uma etapa posterior.
