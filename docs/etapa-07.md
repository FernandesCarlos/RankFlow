# Etapa 07 — Estado global e recursos nativos

## Objetivo

A Etapa 07 amplia o RankFlow com estado compartilhado entre telas e integra recursos reais do dispositivo: galeria, notificações push com Firebase Cloud Messaging (FCM) e compartilhamento nativo de resultados. A identidade visual existente foi mantida.

## 1. Gerenciamento de estado global

### Mecanismo utilizado

O projeto utiliza **React Context API** com o hook próprio `useApp`, implementado em `src/state/AppContext.tsx`. O componente `AppProvider`, montado em `src/app/_layout.tsx`, envolve a navegação e disponibiliza o mesmo estado às telas descendentes.

A persistência é separada conforme a sensibilidade dos dados:

- **AsyncStorage:** preferências não sensíveis e dados de interface/treino que precisam permanecer disponíveis entre telas e reinicializações.
- **Expo SecureStore:** token JWT de autenticação, armazenado nas APIs seguras do sistema operacional (Keychain no iOS e Keystore no Android). Na primeira execução da versão nova, um token legado encontrado no AsyncStorage é migrado para o SecureStore e removido do armazenamento antigo.

### Estados globais identificados

| Estado | Uso compartilhado |
|---|---|
| `authenticated` e `hydrated` | Controlam a sessão e evitam exibir as telas antes da recuperação dos dados. |
| `profile` | Nome, handle, dados de conta e `avatarUrl`; a foto escolhida na galeria é exibida em diferentes telas. |
| `publicProfile` | Define se os dados básicos e o avatar podem ser consultados por outros competidores. |
| `notifications` | Guarda a opção de ativar notificações e preferências de avisos. |
| `training` | Mantém o treino atual/agendado acessível às telas de treino e acompanhamento. |
| `trainingHistory` | Compartilha o histórico entre acompanhamento e configurações. |
| `friendHandles` | Mantém a lista de amigos disponível às telas sociais e de ranking. |
| `notice` | Apresenta mensagens de sucesso e falha em telas diferentes. |

### Por que esses estados são globais?

Esses dados são usados por mais de uma tela e precisam manter consistência durante a navegação. Por exemplo, quando a foto é enviada na tela **Editar perfil**, `profile.avatarUrl` é atualizado no `AppContext`; os avatares da tela de perfil, Início, Treino e Placar passam a utilizar a mesma URL sem exigir que cada tela mantenha uma cópia independente.

O estado global também evita divergência entre a preferência de notificações, o perfil público, o treino atual e o histórico. A persistência local complementa o Context: o Context compartilha o estado em memória; AsyncStorage mantém os dados não sensíveis após reiniciar o aplicativo.

## 2. Recursos nativos utilizados

### 2.1 Galeria — foto de perfil

**Biblioteca:** `expo-image-picker`.

Fluxo:

1. O usuário abre **Perfil → Editar perfil → Selecionar foto da galeria**.
2. O aplicativo solicita a permissão de acesso à biblioteca de fotos quando necessário.
3. O seletor nativo do Android/iOS permite escolher e recortar a imagem.
4. A aplicação envia o arquivo como multipart para `POST /api/users/me/avatar`, autenticado com JWT.
5. O backend valida formato e tamanho (máximo de 5 MB), corrige a orientação EXIF, redimensiona para até 1024 × 1024 e converte para JPEG.
6. O arquivo é persistido no volume Docker `rankflow-media`; o endereço é salvo no registro do usuário em PostgreSQL.
7. O `avatarUrl` é atualizado no estado global e a imagem passa a aparecer também em perfis públicos do RankFlow.

A consulta pública usa `GET /api/users/public/{handle}`. A API só retorna avatar e dados básicos quando o perfil está público. A alteração de visibilidade é autenticada em `PUT /api/users/me/profile-visibility`.

**Permissões:** o sistema operacional apresenta a interface de seleção e controla o acesso à biblioteca. No iOS, o plugin configura a descrição de uso da biblioteca. No Android, o seletor de mídia do sistema evita solicitar acesso amplo a todo o armazenamento. O aplicativo não solicita acesso à câmera nem à localização.

**Falhas e indisponibilidade:**

- Permissão negada: a tela informa que o usuário pode habilitar o acesso nas configurações do dispositivo; a foto atual permanece.
- Seleção cancelada: nenhuma alteração é feita.
- Arquivo inválido, formato não aceito ou maior que 5 MB: o backend responde com erro HTTP apropriado e a tela mostra a mensagem.
- Backend indisponível ou falha de rede: a atualização não é aplicada ao estado global; o avatar anterior/iniciais continuam visíveis.
- Usuário sem sessão válida: o backend rejeita a requisição autenticada.

### 2.2 Notificações push — Firebase Cloud Messaging

**Bibliotecas:** `@react-native-firebase/app`, `@react-native-firebase/messaging` no aplicativo e `firebase-admin` no backend.

Fluxo:

1. O usuário abre **Configurações → Notificações** e ativa **Permitir notificações**.
2. O React Native Firebase solicita autorização ao sistema operacional.
3. Com autorização concedida, o aplicativo obtém o token FCM e o registra no backend em `POST /api/push/register`, associando-o à conta autenticada e à plataforma.
4. Ao criar um treino com início futuro, o backend grava lembretes na tabela `training_reminders`, programados para 15 minutos antes do início (ou imediatamente quando o treino for agendado para menos de 15 minutos no futuro).
5. O worker do backend verifica lembretes pendentes a cada 20 segundos e envia a mensagem pelo Firebase Admin SDK. O texto indica o tempo restante até o início.
6. Ao desativar notificações, o aplicativo remove somente o token FCM deste dispositivo em `DELETE /api/push/register`, enviando o token no corpo da requisição; os outros dispositivos da mesma conta continuam registrados.
7. A renovação do token FCM é observada pelo aplicativo e sincronizada com o backend. Mensagens recebidas em primeiro plano são apresentadas por um alerta; ao tocar em uma notificação, o aplicativo abre a área de Treino.

**Permissões e credenciais:**

- **Android 13 ou superior:** permissão de notificações `POST_NOTIFICATIONS), solicitada pelo sistema em tempo de execução. A configuração nativa declara essa permissão.
- **iOS:** autorização do usuário para alertas, sons e notificações; o app precisa de entitlement APNs compatível com o tipo de build.
- **Firebase Android/iOS:** os arquivos de configuração do aplicativo (`google-services.json` e `GoogleService-Info.plist`) precisam corresponder aos identificadores cadastrados no Firebase.
- **Backend:** a chave JSON da conta de serviço Firebase é usada exclusivamente pelo Firebase Admin SDK no servidor. Ela nunca deve ser incluída no aplicativo nem commitada no Git.

**Falhas e indisponibilidade:**

- Permissão negada ou provisória não concedida: o app mantém a opção desativada e informa como habilitar nas configurações do sistema.
- Falha ao obter token ou registrar no backend: a opção volta para desativada e uma mensagem de erro é apresentada.
- Token inválido/desregistrado: o backend registra a falha e remove tokens que o FCM identifica como não registrados.
- Credencial FCM ausente/inválida, rede indisponível ou falha do serviço: o lembrete é marcado como falho; o worker continua processando os demais.
- Treino sem dispositivo registrado: o lembrete é marcado como ignorado, sem interromper a criação do treino.
- Horário de início já passou: o lembrete não é enviado.

O processamento de lembretes roda no processo FastAPI. O worker recupera registros que ficaram em estado `sending` após reinício do processo. Em uma implantação com múltiplas instâncias, recomenda-se mover o worker para um serviço dedicado/fila de tarefas, mantendo o controle de concorrência no banco.

### 2.3 Compartilhamento — resultado do treino

**Recursos/bibliotecas:** API nativa `Share` do React Native, `expo-sharing` e `react-native-view-shot`.

Fluxo:

- **Texto e link:** o aplicativo usa a folha nativa de compartilhamento para enviar título do treino, colocação, problemas aceitos, penalidade e links do perfil RankFlow/Codeforces.
- **Imagem:** o componente de card de resultado é capturado como PNG e aberto na folha nativa de compartilhamento do sistema.

**Permissões:** não é solicitada permissão de câmera, galeria ou armazenamento. O sistema operacional controla os destinos de compartilhamento disponíveis.

**Falhas e indisponibilidade:** se a captura do card falhar ou o sistema não oferecer compartilhamento de arquivos, o aplicativo mostra uma mensagem. A opção de texto continua independente da geração do PNG. O cancelamento da folha nativa não altera os dados do treino.

## 3. Segurança e privacidade

- O JWT é guardado com Expo SecureStore, não no AsyncStorage.
- A API valida JWT nos endpoints de alteração de avatar, privacidade e registro/remoção de tokens FCM.
- Um usuário só pode substituir o próprio avatar: a identidade vem do token validado, não de um ID recebido no corpo da requisição.
- O endpoint público não expõe e-mail, senha ou token; apenas nome, handle, rating e avatar de perfis públicos.
- Arquivos de configuração Firebase e chaves de serviço são ignorados pelo Git.
- O Firebase Admin SDK e a chave privada FCM permanecem no backend.
- O backend redireciona HTTP para HTTPS quando `APP_ENV=production`; a URL pública configurada no aplicativo/backend deve usar HTTPS em produção.

## 4. Configuração para execução

### 4.1 Backend e PostgreSQL

1. Configure `backend/.env` a partir de `backend/.env.example`.
2. Configure:
   - `APP_ENV=development` durante desenvolvimento local; use `production` atrás de um proxy TLS em produção.
   - `PUBLIC_API_URL`: URL base pública da API, acessível pelo dispositivo. Em produção, use HTTPS.
   - `UPLOAD_DIR=/app/uploads`.
   - `FIREBASE_PROJECT_ID`: ID do projeto Firebase.
   - `FCM_SERVICE_ACCOUNT_FILE=/run/secrets/firebase-adminsdk.json`.
3. Crie `backend/secrets/` e coloque a chave JSON da conta de serviço Firebase em `backend/secrets/firebase-adminsdk.json). Não compartilhe nem versione esse arquivo.
4. Inicie os serviços:
   ```bash
   docker compose up --build
   ```
5. Verifique `/health) e a documentação em `/docs).

O Docker Compose mantém os uploads no volume `rankflow-media` e monta a pasta `backend/secrets` somente para leitura.

### 4.2 Firebase e build nativo

O FCM via React Native Firebase usa módulos nativos; **não funciona no Expo Go**. É necessário um development build.

1. Crie um projeto no Firebase e cadastre os aplicativos Android e iOS com os identificadores correspondentes ao app Expo.
2. Baixe `google-services.json` para a raiz do projeto e `GoogleService-Info.plist` para a raiz do projeto.
3. No Firebase Console, configure Cloud Messaging. Para iOS, associe também a chave/certificado APNs ao app iOS no Firebase.
4. Confira os identificadores Android/iOS em `app.json) e mantenha-os iguais aos cadastrados no Firebase.
5. Instale dependências e gere os projetos nativos:
   ```bash
   npm install
   npx expo prebuild --clean
   ```
6. Android:
   ```bash
   npx expo run:android
   npx expo start --dev-client
   ```
   iOS (em macOS com Xcode configurado):
   ```bash
   npx expo run:ios
   npx expo start --dev-client
   ```
7. Configure `EXPO_PUBLIC_API_URL` no arquivo `.env) da raiz para apontar ao backend. Em um celular físico, use o IP acessível do computador ou um domínio HTTPS, não `localhost) do próprio telefone.

Os arquivos de configuração nativos e as chaves de serviço estão no `.gitignore). Cada desenvolvedor/ambiente deve obtê-los no Firebase Console ou no gerenciador seguro de segredos.

## 5. Como testar a Etapa 07

### Estado global

1. Entre na conta e navegue entre Início, Perfil, Treino e Placar.
2. Altere a foto de perfil e confirme que a mesma imagem aparece nos avatares das outras telas.
3. Reinicie o app e confirme que preferências, perfil local e dados de treino persistidos foram recuperados.
4. Altere a visibilidade do perfil e consulte `GET /api/users/public/{handle}): perfil público retorna dados básicos/avatar; perfil privado retorna 404.

### Galeria

1. Abra Perfil → Editar perfil → Selecionar foto da galeria.
2. Conceda a permissão, selecione e confirme uma imagem.
3. Verifique a foto no perfil e no perfil de outro usuário RankFlow.
4. Repita negando a permissão, cancelando a seleção e tentando uma imagem inválida/maior que 5 MB.

### FCM

1. Execute um development build em dispositivo/emulador configurado no Firebase; Expo Go não serve para este teste.
2. Entre na conta, abra Configurações → Notificações e ative a opção geral.
3. Confirme no backend que o dispositivo foi registrado em `push_devices).
4. Crie um treino com início em aproximadamente 15 minutos e confira a linha pendente em `training_reminders).
5. Mantenha o backend ativo e aguarde a notificação. Teste Android e iOS separadamente; no iOS confirme APNs.
6. Desative a opção geral e verifique que os tokens daquela conta foram removidos.

### Compartilhamento

1. Finalize/abra um treino do qual seu handle participa e aguarde o placar real.
2. Use **Compartilhar como texto e link** e confira o resumo no menu nativo.
3. Use **Compartilhar card como imagem** e confira o PNG no menu nativo.
4. Cancele o menu e confirme que o resultado do treino não foi alterado.

### Verificações automatizadas

Na raiz do repositório:

```bash
npm run typecheck
npm test
```

No backend:

```bash
python -m compileall backend/app
```

## 6. Arquivos principais

- `src/state/AppContext.tsx`: estado global e persistência não sensível.
- `src/services/auth.ts`: migração e leitura segura do JWT.
- `src/services/profileApi.ts`: envio de avatar e leitura de perfil público.
- `src/services/pushNotifications.ts`: permissões, token FCM e registro no backend.
- `src/app/perfil/editar.tsx`: seleção de foto.
- `src/app/configuracoes/notificacoes.tsx`: ativação/desativação do push.
- `src/app/treinos/resultado.tsx`: compartilhamento em texto e imagem.
- `backend/app/notifications.py`: envio pelo Firebase Admin SDK.
- `backend/app/main.py`: endpoints de avatar/perfil, token FCM e worker de lembretes.
- `backend/app/models.py`: dispositivos e lembretes persistidos.
