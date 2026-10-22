# Etapa 04 — Persistência de dados

## 1. Mecanismo de persistência utilizado

O RankFlow utiliza o **AsyncStorage** (`@react-native-async-storage/async-storage`) para armazenar dados localmente no dispositivo. O conteúdo persistido é serializado em JSON e salvo sob a chave:

```text
@rankflow:app-state:v1
```

A persistência é coordenada pelo contexto global da aplicação, em `src/state/AppContext.tsx`, para que diferentes telas possam consultar e atualizar o mesmo estado.

> **Escopo:** esta implementação é de persistência local. Os dados não são sincronizados entre dispositivos e não são enviados para um servidor ou banco de dados remoto.

## 2. Justificativa da escolha

O AsyncStorage foi escolhido porque:

- integra-se a aplicações React Native e Expo;
- oferece uma API assíncrona simples para gravar e recuperar valores;
- permite manter preferências e dados de demonstração entre sessões;
- não exige configurar um servidor ou banco de dados remoto para esta etapa;
- armazena objetos JavaScript serializados como JSON.

O AsyncStorage é apropriado para preferências e dados locais de uma aplicação de demonstração. Ele não deve ser tratado como banco de dados remoto, nem como armazenamento seguro para senhas ou segredos. Caso o RankFlow precise sincronizar informações entre dispositivos ou compartilhar resultados entre usuários, será necessário integrar um backend, por exemplo, Supabase.

## 3. Estrutura dos dados armazenados

O aplicativo reúne os dados persistidos em um objeto `PersistedAppState`, convertido para JSON antes de ser salvo.

Estrutura conceitual:

```ts
type PersistedAppState = {
  profile?: Partial<typeof mockProfile>;
  notifications?: Partial<typeof initialNotifications>;
  publicProfile?: boolean;
  trainingHistory?: CompletedTraining[];
};
```

Os campos são:

- **`profile`**: dados do perfil definidos pelo modelo `mockProfile`.
- **`notifications`**: preferências de notificações, como notificações semanais, de concursos, pontuação, resultados, amigos e convites.
- **`publicProfile`**: booleano que indica se o perfil é público.
- **`trainingHistory`**: lista de treinos concluídos.

Cada item de `trainingHistory` usa o tipo `CompletedTraining`, que estende `Training` e acrescenta:

- `id`: identificador do registro;
- `completedAt`: data e hora da conclusão em formato ISO;
- `results`: resultados dos participantes, incluindo participante, quantidade de problemas resolvidos e pontos.

A chave de armazenamento é declarada em `src/state/AppContext.tsx`:

```ts
const STORAGE_KEY = '@rankflow:app-state:v1';
```

O objeto completo é convertido em texto JSON com `JSON.stringify(data)` e recuperado com `JSON.parse(saved)`.

## 4. Operações de persistência implementadas

### 4.1 Criação

A função `completeTraining()` em `src/state/AppContext.tsx` cria um registro quando um treino é concluído. Ela gera um identificador, registra a data de conclusão, calcula os resultados e adiciona o treino ao início do histórico:

```ts
setTrainingHistory(current => [completed, ...current]);
```

### 4.2 Armazenamento

Um `useEffect` observa as mudanças em `profile`, `notifications`, `publicProfile` e `trainingHistory`. Depois que a leitura inicial termina (`hydrated === true`), ele grava o objeto no AsyncStorage:

```ts
await AsyncStorage.setItem(
  STORAGE_KEY,
  JSON.stringify(data)
);
```

O tratamento de erros registra no console falhas de gravação.

### 4.3 Recuperação

Outro `useEffect`, executado na inicialização do contexto, chama:

```ts
const saved = await AsyncStorage.getItem(STORAGE_KEY);
```

Se houver dados, o texto é convertido de JSON para objeto e os estados são restaurados. O sinalizador `hydrated` só é ativado no bloco `finally`, para impedir que a gravação automática inicial sobrescreva os dados antes da tentativa de recuperação terminar.

### 4.4 Atualização

As telas atualizam os estados compartilhados usando funções como `setProfile`, `setNotifications` e `setPublicProfile`. Como esses estados estão nas dependências do efeito de armazenamento, as alterações são gravadas no AsyncStorage automaticamente.

Por exemplo, a alteração de uma preferência de notificação atualiza o objeto `notifications`, e a mudança é persistida pelo efeito.

### 4.5 Remoção

A função `deleteTraining(id)` remove do estado o treino cujo identificador corresponde ao informado:

```ts
setTrainingHistory(current =>
  current.filter(item => item.id !== id)
);
```

A tela de histórico chama essa função após a confirmação do usuário. A mudança em `trainingHistory` aciona a gravação automática do novo histórico, sem o item excluído.

A remoção implementada é de um registro do histórico local. Ela não remove um registro de um servidor remoto.

## 5. Telas que utilizam os dados persistidos

Os dados são gerenciados centralmente em `src/state/AppContext.tsx`. As telas abaixo utilizam ou atualizam esses estados:

- **Perfil** — `src/app/perfil/index.tsx`: apresenta informações do perfil.
- **Editar perfil** — `src/app/perfil/editar.tsx`: permite alterar informações do perfil.
- **Configurações** — `src/app/(tabs)/configuracoes.tsx`: apresenta opções de configuração.
- **Notificações** — `src/app/configuracoes/notificacoes.tsx`: permite alterar preferências de notificações.
- **Plataformas** — `src/app/configuracoes/plataformas.tsx`: gerencia a interface relacionada às plataformas, embora os dados específicos dessa tela só são persistidos se forem incluídos em `PersistedAppState`.
- **Treino** — `src/app/(tabs)/treino.tsx`: inicia e conclui treinos; a conclusão adiciona registros ao histórico.
- **Histórico de treinos** — `src/app/treinos/historico.tsx`: lista os treinos concluídos e permite solicitar a exclusão de um item.
- **Resultado do treino** — `src/app/treinos/resultado.tsx`: consulta os resultados do treino selecionado no histórico.

Os caminhos devem corresponder aos arquivos existentes no repositório. Se algum caminho tiver sido alterado durante o desenvolvimento, atualize esta lista para refletir a estrutura final do projeto.

## 6. Instruções para execução e teste

### 6.1 Instalar a dependência

Na raiz do projeto, execute:

```bash
npx expo install @react-native-async-storage/async-storage
```

### 6.2 Iniciar o aplicativo

Para iniciar o servidor Expo:

```bash
npx expo start
```

Se estiver executando em um ambiente Docker, garanta que a porta do Metro esteja publicada e que o dispositivo ou navegador consiga alcançar o servidor. O comando e as portas podem variar conforme o `Dockerfile` ou o `docker-compose.yml` do projeto.

### 6.3 Testar as operações

1. **Criação:** abra a aba Treino, inicie e conclua um treino.
2. **Armazenamento:** confirme que o treino aparece no histórico. O efeito de persistência deve gravar a mudança no AsyncStorage.
3. **Recuperação:** atualize a página ou encerre e reabra a aplicação; confira se o treino continua listado.
4. **Atualização:** altere uma informação do perfil ou uma preferência de notificação e confirme que a interface mostra o novo valor.
5. **Remoção:** na tela Histórico de treinos, use o botão de exclusão e confirme a operação; confira que o treino removido deixa de aparecer.
6. **Persistência da remoção:** atualize ou reabra a aplicação e confirme que o treino excluído não reaparece.

### 6.4 Conferir erros

Verifique o terminal do Expo e o console do navegador/dispositivo. A implementação registra erros de leitura ou gravação com mensagens como:

```text
Erro ao carregar dados locais
Erro ao salvar dados locais
```

Se ocorrer uma falha, confira a instalação da dependência, o conteúdo salvo e se a inicialização terminou antes da gravação automática.

## 7. Verificação após encerramento e reabertura

O teste de persistência deve ser realizado sem limpar os dados do aplicativo ou do navegador entre as etapas.

Procedimento:

1. Inicie a aplicação e crie um treino concluído.
2. Aguarde a atualização do histórico e a gravação automática.
3. Encerre a aplicação ou feche a aba.
4. Reabra a aplicação no mesmo dispositivo e no mesmo ambiente de armazenamento.
5. Acesse Histórico de treinos e verifique se o registro continua presente.
6. Altere uma preferência persistida, encerre e reabra novamente; confirme que a alteração foi mantida.
7. Exclua um treino, encerre e reabra; confirme que ele continua ausente.

No navegador, use o mesmo navegador e a mesma origem (protocolo, host e porta). Limpar os dados do site, usar uma janela privada ou trocar de dispositivo pode remover ou tornar inacessível o armazenamento local.

## 8. Limitações conhecidas

- O AsyncStorage é local ao dispositivo/ambiente e não sincroniza dados entre dispositivos.
- Os dados podem ser perdidos se o armazenamento do aplicativo ou do navegador for apagado ou se o aplicativo for desinstalado.
- A autenticação, o treino em andamento, `verifiedHandle` e `verificationOrigin` não fazem parte do objeto persistido descrito nesta etapa.
- Na implementação atual, `signOut()` redefine o perfil e as preferências e limpa o histórico de treinos. Como esses estados são persistidos, a redefinição também pode ser salva. Se a intenção for preservar os dados pessoais após sair da sessão, esse comportamento precisa ser ajustado.
- O tratamento de erros atual registra falhas no console; não apresenta necessariamente uma mensagem de erro na interface.

## 9. Resumo

A Etapa 04 utiliza AsyncStorage para persistir localmente o perfil, as preferências de notificação, a privacidade do perfil e o histórico de treinos. A implementação demonstra criação, gravação, recuperação, atualização e remoção de registros, com verificação manual após a reabertura da aplicação.
