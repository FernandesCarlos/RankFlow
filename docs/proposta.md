# RankFlow

Aplicativo mobile voltado para **programação competitiva**, com foco no acompanhamento de desempenho, criação de treinos personalizados, comparação entre usuários e realização de competições.

## Sobre o projeto

Plataformas de programação competitiva possuem uma grande quantidade de dados sobre problemas, submissões e competidores, mas nem sempre apresentam essas informações de forma simples, organizada e visual.

O **RankFlow** busca reunir essas informações em uma aplicação mobile, permitindo que os usuários acompanhem sua evolução, analisem estatísticas, comparem desempenho com amigos e participem de treinos e competições personalizadas.

Inicialmente, o RankFlow utilizará o **Codeforces** como principal plataforma para obtenção de dados. Futuramente, a proposta é expandir a aplicação para outras plataformas de programação competitiva, como **AtCoder** e **beecrowd**, permitindo que o usuário acompanhe seu desempenho em diferentes serviços por meio de uma única aplicação.

---

## Problema

Plataformas de programação competitiva disponibilizam muitas informações sobre usuários, problemas, submissões e competições, porém esses dados ficam distribuídos em diferentes páginas e nem sempre são apresentados de maneira simples e visual.

Além disso, criar treinos personalizados, comparar o desempenho entre amigos e acompanhar competições próprias pode exigir diferentes ferramentas ou processos manuais.

O RankFlow busca centralizar essas funcionalidades em uma única aplicação mobile.

---

## Público-alvo

O aplicativo é voltado para:

* Pessoas interessadas em programação competitiva;
* Competidores de maratonas de programação;
* Usuários de plataformas como Codeforces;
* Pessoas que desejam acompanhar sua evolução em algoritmos e resolução de problemas;
* Grupos que desejam realizar treinos e competições entre amigos.

---

## Objetivo

O principal objetivo do RankFlow é facilitar o treinamento em programação competitiva por meio de uma aplicação mobile que reúna informações de desempenho e ferramentas voltadas para treinamento e competição.

Entre os principais recursos estão:

* Estatísticas de desempenho;
* Análise de desempenho por tags;
* Histórico de evolução e rating;
* Comparação entre usuários;
* Criação de treinos personalizados;
* Competições entre amigos;
* Acompanhamento de placares.

---

## Funcionalidades previstas

Entre as principais funcionalidades estão:

* Cadastro e autenticação de usuários;
* Vinculação de uma conta do Codeforces;
* Consulta de informações do perfil de um competidor;
* Visualização do rating atual e histórico de rating;
* Visualização da quantidade de problemas resolvidos;
* Estatísticas de desempenho por tags;
* Identificação dos assuntos com melhor e pior desempenho;
* Acompanhamento de amigos;
* Busca de usuários;
* Criação de treinos personalizados;
* Filtro de problemas por dificuldade;
* Filtro de problemas por tags;
* Seleção de participantes;
* Criação de competições personalizadas;
* Acompanhamento do placar das competições.

---

# Telas previstas

## Início

A tela inicial apresentará um resumo do perfil e do desempenho recente do usuário.

Entre as principais informações poderão estar:

* Handle;
* Classificação do competidor;
* Rating atual;
* Maior rating alcançado;
* Quantidade de problemas resolvidos;
* Streak de treinamento;
* Participação em competições;
* Evolução recente do desempenho.

---

## Amigos

A tela de amigos permitirá buscar e acompanhar outros competidores.

Ela poderá apresentar:

* Campo de busca por handle;
* Lista de amigos;
* Rating;
* Classificação;
* Informações sobre atividades recentes.

---

## Criar treino

A tela de criação de treino permitirá configurar uma sessão personalizada de treinamento.

O usuário poderá definir:

* Participantes;
* Faixa de dificuldade;
* Quantidade de problemas;
* Tags;
* Critérios para seleção dos problemas.

Após a configuração, o sistema poderá selecionar problemas compatíveis com os critérios escolhidos.

---

## Placar

A tela de placar apresentará o desempenho dos participantes durante uma competição ou treino.

Poderão ser exibidos:

* Posição;
* Participantes;
* Pontuação;
* Problemas resolvidos;
* Tempo restante;
* Atualizações da competição.

---

## Estatísticas

A área de estatísticas permitirá analisar o desempenho do usuário com maior profundidade.

Poderá apresentar informações como:

* Desempenho por tags;
* Evolução do rating;
* Histórico de competições;
* Problemas resolvidos;
* Pontos fortes e assuntos que precisam de mais treinamento.

---

## Perfil

A tela de perfil reunirá informações do usuário e sua conta competitiva.

Poderá apresentar:

* Nome;
* Handle;
* Rating;
* Classificação;
* Estatísticas gerais;
* Conta do Codeforces vinculada.

---

# Fluxo básico de navegação

A aplicação contará com uma navegação principal entre as áreas de:

```text
Início
│
├── Perfil
├── Estatísticas
│
├── Amigos
│
├── Criar treino
│
└── Placar
```

O fluxo para criação de um treino poderá seguir a sequência:

```text
Configurar treino
      ↓
Selecionar participantes
      ↓
Definir dificuldade e tags
      ↓
Selecionar problemas
      ↓
Iniciar competição
      ↓
Placar
```

Também haverá um fluxo de autenticação e vinculação de conta para permitir que o usuário associe seu perfil do RankFlow a uma conta de uma plataforma de programação competitiva.

---

# Tecnologias

## Desenvolvimento mobile

O aplicativo será desenvolvido utilizando:

* **React Native**
* **Expo**
* **TypeScript**

O React Native permitirá desenvolver uma aplicação mobile para Android e iOS utilizando uma base de código compartilhada.

O **Expo** será utilizado para facilitar a configuração, desenvolvimento, execução e testes da aplicação.

O **TypeScript** será utilizado para auxiliar na organização do código e na definição de tipos.

---

## Backend

O backend será desenvolvido utilizando:

* **Python**
* **FastAPI**

O FastAPI será responsável pela construção da API utilizada para comunicação entre o aplicativo, o banco de dados e serviços externos.

Entre as responsabilidades previstas para o backend estão:

* Gerenciamento de usuários;
* Gerenciamento de amigos;
* Criação e gerenciamento de treinos e competições;
* Comunicação com o banco de dados;
* Integração com plataformas externas;
* Processamento das estatísticas;
* Atualização das informações utilizadas pela aplicação.

---

## Banco de dados

O banco de dados previsto para o projeto é:

* **PostgreSQL**

O PostgreSQL será responsável principalmente pelo armazenamento persistente dos dados próprios da aplicação, como:

* Usuários;
* Contas vinculadas;
* Amigos;
* Treinos;
* Competições;
* Participantes;
* Problemas selecionados;
* Resultados.

---

# Integração com APIs externas

Inicialmente, será utilizada a **API pública do Codeforces** para obter dados relacionados aos usuários e à programação competitiva.

Entre os dados que poderão ser utilizados estão:

* Perfil do usuário;
* Rating;
* Histórico de rating;
* Submissões;
* Problemas;
* Tags;
* Competições.

Essas informações poderão ser utilizadas para gerar estatísticas e auxiliar na criação de treinos personalizados.

Futuramente, outras plataformas poderão ser integradas, desde que ofereçam meios adequados de acesso aos dados.

---

# Forma prevista de armazenamento de dados

Os dados poderão ser divididos em três grupos principais:

```text
Dados do RankFlow
├── Usuários
├── Amigos
├── Treinos
├── Competições
├── Participantes
└── Resultados

Dados externos
├── Perfil
├── Rating
├── Histórico
├── Submissões
├── Problemas
└── Tags

Dados processados
├── Desempenho por tags
├── Evolução de rating
├── Desempenho por dificuldade
└── Estatísticas gerais
```

Os dados próprios do RankFlow serão armazenados no PostgreSQL.

Os dados provenientes de plataformas externas poderão ser consultados conforme necessário, enquanto informações utilizadas com frequência poderão futuramente utilizar mecanismos de cache.

As estatísticas poderão ser calculadas pelo backend a partir das informações obtidas dessas plataformas.

---

# Arquitetura inicial

A arquitetura prevista para o projeto será:

```text
                Codeforces API
                      │
                      ▼
React Native + Expo ─► FastAPI
                      │
                      ▼
                  PostgreSQL
```

O aplicativo desenvolvido com **React Native e Expo** será responsável principalmente pela interface e interação com o usuário.

O **FastAPI** será responsável pelas regras de negócio, processamento das informações, comunicação com APIs externas e acesso ao banco de dados.

O **PostgreSQL** será responsável pela persistência dos dados próprios da aplicação.

Futuramente, poderão ser adicionadas integrações com outras plataformas de programação competitiva.

---

# Repositório

```text
https://github.com/FernandesCarlos/RankFlow
```

---

# Estrutura inicial de diretórios

Uma organização inicial prevista para o projeto é:

```text
RankFlow/
│
├── src/
│   ├── app/
│   ├── components/
│   ├── services/
│   └── theme/
│
├── docs/
├── README.md
├── package.json
└── .gitignore
```

A estrutura poderá ser expandida conforme novas funcionalidades forem adicionadas ao projeto.
