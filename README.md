# AnhangueraGhost

Extensão para Chrome que automatiza a conclusão de aulas na plataforma Anhanguera, marcando visualizações e presenças automaticamente.

## 📋 Descrição

O **AnhangueraGhost** é uma extensão do Chrome desenvolvida para automatizar o processo de visualização de aulas na plataforma educacional Anhanguera. A extensão acessa automaticamente todas as disciplinas, unidades de aprendizado e objetos de aprendizado não concluídos, registrando interações de conteúdo, presenças e progresso.

## ⚙️ Como Funciona

### Fluxo de Execução

1. **Autenticação**: A extensão recupera o token de autenticação do IndexedDB (`hipotenusa` → `student-auth`)
2. **Obtenção de Dados do Usuário**: Busca informações do estudante autenticado via API GraphQL
3. **Listagem de Cursos**: Recupera todos os cursos matriculados do estudante
4. **Iteração sobre Disciplinas**: Para cada disciplina, itera sobre:
   - Unidades de aprendizado
   - Seções
   - Objetos de aprendizado (aulas/conteúdos)
5. **Conclusão Automática**: Para cada objeto não concluído, executa:
   - Criação de interação de conteúdo
   - Registro de presença
   - Adição de progresso

### Tecnologias Utilizadas

- **Chrome Extension API (Manifest V3)**: Service Worker e Script Injection
- **IndexedDB**: Armazenamento local do navegador
- **GraphQL API**: Comunicação com a API da Anhanguera (`https://graphql.ampli.com.br/`)
- **JavaScript ES6+**: Classes, async/await, Promises

## 🏗️ Estrutura do Projeto

```
AnhangueraGhost/
├── background.js      # Service Worker principal
├── manifest.json      # Configuração da extensão
└── README.md         # Documentação
```

## 📁 Componentes Principais

### 1. Classe `QueryBase`

Responsável por estruturar as requisições GraphQL.

**Métodos:**
- `constructor(operationName)`: Define o nome da operação
- `operation(query, variables)`: Retorna o objeto formatado para requisição GraphQL

### 2. Classe `API`

Gerencia todas as comunicações com a API GraphQL da Anhanguera.

**Métodos Principais:**

#### `constructor(token)`
- Configura a URL da API e headers de autenticação
- Formata o token como `Bearer {token}`

#### `post(body, no_pre)`
- Executa requisições POST para a API GraphQL
- Parâmetro `no_pre`: controla o nível de processamento da resposta
- Retorna dados processados ou dados diretos da API

#### `getMe()`
- Obtém informações do usuário autenticado
- Retorna dados do estudante (email, nome, personId, etc.)

#### `findCourse(studentId)`
- Lista todos os cursos matriculados do estudante
- Retorna array de cursos com seus detalhes

#### `getCourse(courseEnrollmentId)`
- Obtém informações detalhadas de um curso específico
- Retorna disciplinas, progresso, e estrutura completa do curso

#### `findLearningUnit(subjectEnrollmentId)`
- Lista unidades de aprendizado de uma disciplina
- Retorna seções, objetos de aprendizado e status de conclusão

#### `createContentInteraction(learningUnitEnrollmentId, sectionId, learningObjectId)`
- Cria registro de interação com conteúdo
- Marca o primeiro acesso ao conteúdo

#### `createManyAttendances(subjectEnrollmentId, learningUnitId, sectionId, learningObjectId)`
- Registra presença em aulas/conteúdos
- Gera UUID único para cada registro

#### `addProgress(externalId, objectId)`
- Adiciona progresso do estudante
- Registra a data de conclusão do objeto de aprendizado

### 3. Função `getTokenFromIndexedDB()`

Recupera o token de autenticação do IndexedDB.

**Funcionalidades:**
- Abre o banco de dados `hipotenusa`
- Busca na object store `student-auth`
- Suporta múltiplos formatos de armazenamento do token:
  - String direta
  - Objeto com propriedade `token`
  - Objeto com propriedade `value`
  - Busca em todos os registros se não encontrar pela chave

## 🚀 Como Usar

### Instalação

1. Clone ou baixe o repositório
2. Abra o Chrome e acesse `chrome://extensions/`
3. Ative o "Modo do desenvolvedor"
4. Clique em "Carregar sem compactação"
5. Selecione a pasta do projeto

### Uso

1. Acesse a plataforma Anhanguera e faça login
2. Navegue para qualquer página da plataforma
3. Clique no ícone da extensão na barra de ferramentas do Chrome
4. Aguarde o processamento (pode levar alguns minutos dependendo da quantidade de conteúdos)
5. Uma mensagem de confirmação será exibida quando concluído

## ⚠️ Considerações Importantes

### Permissões Necessárias

- **`scripting`**: Permite injetar scripts na página
- **`activeTab`**: Acesso à aba ativa do navegador

### Requisitos

- Navegador Chrome (ou Chromium-based)
- Sessão ativa na plataforma Anhanguera
- Token de autenticação válido no IndexedDB

### Limitações

- A extensão funciona apenas quando o usuário está logado na plataforma
- Requer que o token esteja armazenado no IndexedDB da página
- Processa apenas conteúdos não concluídos (`completed !== true`)
- Não automatiza atividades/avaliações, apenas visualizações de aulas

### Segurança

- O token de autenticação é obtido diretamente do navegador (não é armazenado pela extensão)
- Toda comunicação é feita via HTTPS
- A extensão opera apenas no contexto da página já autenticada

## 📝 Notas Técnicas

### Estrutura de Dados

- **IndexedDB**: Banco `hipotenusa`, Object Store `student-auth`, Chave `token`
- **API GraphQL**: Endpoint `https://graphql.ampli.com.br/`
- **Autenticação**: Header `Authorization: Bearer {token}`

### Processamento Assíncrono

- Utiliza `async/await` para gerenciamento assíncrono
- Processa múltiplas disciplinas e conteúdos em paralelo
- Logs detalhados no console para acompanhamento

## 🔄 Fluxo de Dados

```
1. Click no ícone da extensão
   ↓
2. Recupera token do IndexedDB
   ↓
3. Obtém dados do usuário (getMe)
   ↓
4. Lista cursos do estudante (findCourse)
   ↓
5. Para cada curso:
   ├─ Obtém detalhes (getCourse)
   ├─ Para cada disciplina:
   │   ├─ Lista unidades (findLearningUnit)
   │   ├─ Para cada unidade:
   │   │   ├─ Para cada seção:
   │   │   │   └─ Para cada objeto não concluído:
   │   │   │       ├─ createContentInteraction
   │   │   │       ├─ createManyAttendances
   │   │   │       └─ addProgress
   ↓
6. Exibe mensagem de conclusão
```

## 📊 Status do Projeto

- ✅ Autenticação via IndexedDB
- ✅ Integração com API GraphQL
- ✅ Automação de visualizações
- ✅ Registro de presenças
- ✅ Atualização de progresso
- ⚠️ Não automatiza atividades/avaliações

## 📄 Licença

Este projeto é fornecido "como está", sem garantias. Use por sua conta e risco.

## ⚖️ Aviso Legal

Esta extensão é uma ferramenta de automação educacional. O uso é de responsabilidade do usuário e deve estar em conformidade com os termos de uso da plataforma Anhanguera. O desenvolvedor não se responsabiliza por qualquer consequência do uso desta extensão.

