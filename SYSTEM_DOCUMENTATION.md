# Documentação Completa do Sistema - Gestor Financeiro IA

## Índice
1. [Visão Geral do Sistema](#visão-geral-do-sistema)
2. [Arquitetura e Tecnologias](#arquitetura-e-tecnologias)
3. [Estrutura de Arquivos](#estrutura-de-arquivos)
4. [Descrição Detalhada dos Componentes](#descrição-detalhada-dos-componentes)
5. [Como Fazer Alterações](#como-fazer-alterações)
6. [O Que Falta Fazer](#o-que-falta-fazer)
7. [Troubleshooting](#troubleshooting)

---

## Visão Geral do Sistema

O **Gestor Financeiro IA** é um sistema web completo para gerenciamento de finanças com integração de inteligência artificial local, automação via WhatsApp e controle total de infraestrutura. O sistema foi desenvolvido com autenticação independente (sem OAuth, Google ou Manus) e roda 100% na sua VPS usando aaPanel.

### Principais Características

- **Autenticação Independente**: Login com username e password, sem dependência de serviços externos
- **Landing Page Elegante**: Apresentação sofisticada do sistema com design moderno
- **Dashboard Completo**: Visão geral do sistema com múltiplas abas funcionais
- **Painel Financeiro**: CRUD completo de transações com visualização de saldo
- **Gerenciamento de Serviços**: Instalação e controle de Whisper, Ollama e Evolution API
- **Monitoramento em Tempo Real**: Visualização de CPU, memória, disco e status dos serviços
- **Fluxo de WhatsApp**: Recebimento e processamento de mensagens de texto e áudio
- **Banco de Dados MySQL**: Persistência completa de dados

---

## Arquitetura e Tecnologias

### Stack Tecnológico

| Camada | Tecnologia | Descrição |
|--------|-----------|-----------|
| **Frontend** | React 19 | Framework JavaScript para interface |
| **Styling** | Tailwind CSS 4 | Framework CSS utilitário |
| **Componentes** | shadcn/ui | Biblioteca de componentes reutilizáveis |
| **Backend** | Node.js + Express | Runtime JavaScript para servidor |
| **RPC** | tRPC 11 | Framework type-safe para APIs |
| **Database** | MySQL | Banco de dados relacional |
| **ORM** | Drizzle | Object-Relational Mapping |
| **Autenticação** | JWT + bcrypt | Tokens seguros e criptografia de senhas |
| **Roteamento** | Wouter | Router leve para React |
| **Build** | Vite | Bundler rápido para frontend |

### Arquitetura Geral

```
┌─────────────────────────────────────────────────────────────┐
│                    Navegador do Usuário                      │
│                   (https://gestor.nossoapp.top)              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Nginx Reverse Proxy                       │
│              (Porta 80/443 → Porta 3000)                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Node.js Application                        │
│                   (PM2 Cluster Mode)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Frontend (React + Vite)                              │   │
│  │ - Landing Page                                       │   │
│  │ - Login Page                                         │   │
│  │ - Dashboard com múltiplas abas                       │   │
│  │ - Painel Financeiro                                  │   │
│  │ - Configurações (Whisper, Ollama, Evolution API)    │   │
│  │ - Monitoramento                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Backend (Express + tRPC)                             │   │
│  │ - Autenticação (Login/Logout)                        │   │
│  │ - APIs Financeiras (CRUD Transações)                │   │
│  │ - APIs de Serviços (Whisper, Ollama, Evolution)     │   │
│  │ - APIs de Monitoramento                              │   │
│  │ - APIs de WhatsApp                                   │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
    ┌─────────┐    ┌─────────┐    ┌──────────┐
    │  MySQL  │    │ Whisper │    │  Ollama  │
    │Database │    │  Local  │    │  Local   │
    └─────────┘    └─────────┘    └──────────┘
         │
         ▼
    ┌──────────────────┐
    │ Evolution API    │
    │ (WhatsApp)       │
    └──────────────────┘
```

---

## Estrutura de Arquivos

### Diretório Principal

```
/www/wwwroot/gestor.nossoapp.top/
├── client/                          # Frontend React
│   ├── src/
│   │   ├── pages/                   # Páginas principais
│   │   │   ├── Home.tsx             # Landing page
│   │   │   ├── Login.tsx            # Página de login
│   │   │   ├── Dashboard.tsx        # Dashboard principal
│   │   │   ├── FinancialConnected.tsx # Painel financeiro
│   │   │   ├── SettingsConnected.tsx  # Configurações (Whisper, Ollama, Evolution)
│   │   │   ├── Monitoring.tsx       # Monitoramento do sistema
│   │   │   └── NotFound.tsx         # Página 404
│   │   ├── components/              # Componentes reutilizáveis
│   │   │   ├── DashboardLayout.tsx  # Layout do dashboard
│   │   │   ├── ErrorBoundary.tsx    # Tratamento de erros
│   │   │   └── ui/                  # Componentes shadcn/ui
│   │   ├── contexts/                # React contexts
│   │   │   └── ThemeContext.tsx     # Contexto de tema
│   │   ├── hooks/                   # Custom hooks
│   │   │   └── useAuth.tsx          # Hook de autenticação
│   │   ├── lib/                     # Utilitários
│   │   │   ├── trpc.ts             # Cliente tRPC
│   │   │   └── const.ts            # Constantes
│   │   ├── App.tsx                  # Componente raiz
│   │   ├── main.tsx                 # Ponto de entrada
│   │   └── index.css                # Estilos globais
│   ├── public/                      # Arquivos estáticos
│   │   ├── favicon.ico
│   │   └── robots.txt
│   ├── index.html                   # HTML principal
│   └── vite.config.ts               # Configuração Vite
│
├── server/                          # Backend Node.js
│   ├── routers/                     # Routers tRPC
│   │   ├── financial.ts             # APIs de transações
│   │   ├── services.ts              # APIs de Whisper, Ollama, Evolution
│   │   ├── whatsapp.ts              # APIs de WhatsApp
│   │   └── monitoring.ts            # APIs de monitoramento
│   ├── _core/                       # Código central
│   │   ├── index.ts                 # Servidor Express
│   │   ├── context.ts               # Contexto tRPC
│   │   ├── trpc.ts                  # Configuração tRPC
│   │   ├── auth.ts                  # Lógica de autenticação
│   │   ├── authRoutes.ts            # Rotas de autenticação
│   │   ├── env.ts                   # Variáveis de ambiente
│   │   ├── cookies.ts               # Gerenciamento de cookies
│   │   ├── llm.ts                   # Integração com LLM
│   │   ├── voiceTranscription.ts    # Integração com Whisper
│   │   ├── imageGeneration.ts       # Geração de imagens
│   │   ├── map.ts                   # Integração com mapas
│   │   └── notification.ts          # Sistema de notificações
│   ├── db.ts                        # Funções de banco de dados
│   ├── routers.ts                   # Agregador de routers
│   ├── auth.test.ts                 # Testes de autenticação
│   ├── auth.independent.test.ts     # Testes de auth independente
│   └── seed-admin.mjs               # Script para criar admin
│
├── drizzle/                         # Banco de dados
│   ├── schema.ts                    # Definição de tabelas
│   ├── 0001_young_sauron.sql        # Migration SQL
│   └── migration.sql                # Migration limpa
│
├── shared/                          # Código compartilhado
│   ├── const.ts                     # Constantes
│   └── types.ts                     # Tipos TypeScript
│
├── dist/                            # Build de produção
│   ├── public/                      # Frontend compilado
│   │   ├── index.html
│   │   ├── assets/
│   │   │   ├── index-*.css
│   │   │   └── index-*.js
│   │   └── favicon.ico
│   └── index.js                     # Backend compilado
│
├── package.json                     # Dependências do projeto
├── pnpm-lock.yaml                   # Lock file do pnpm
├── tsconfig.json                    # Configuração TypeScript
├── vite.config.ts                   # Configuração Vite
├── drizzle.config.ts                # Configuração Drizzle
│
├── README.md                        # Guia principal
├── SECURITY.md                      # Guia de segurança
├── DEPLOYMENT.md                    # Guia de deployment
├── API_DOCUMENTATION.md             # Documentação de API
└── SYSTEM_DOCUMENTATION.md          # Este arquivo
```

---

## Descrição Detalhada dos Componentes

### 1. Frontend - Páginas Principais

#### **Home.tsx** (Landing Page)
**Localização**: `client/src/pages/Home.tsx`

**Propósito**: Página inicial que apresenta o sistema para novos usuários.

**Conteúdo**:
- Hero section com título e descrição
- Três cards apresentando principais features (Gestão Financeira, IA Local, WhatsApp Automation)
- Botões de CTA (Call-to-Action): "Começar Agora" e "Saiba Mais"
- Design responsivo com tema escuro elegante

**Como Alterar**:
```typescript
// Mudar título
<h1 className="text-5xl font-bold text-cyan-400">
  Novo Título Aqui
</h1>

// Mudar descrição
<p className="text-xl text-gray-300">
  Nova descrição aqui
</p>

// Mudar cor dos botões
<Button className="bg-cyan-500 hover:bg-cyan-600">
  Novo Texto
</Button>
```

#### **Login.tsx** (Página de Login)
**Localização**: `client/src/pages/Login.tsx`

**Propósito**: Interface para autenticação de usuários.

**Campos**:
- Username (texto)
- Password (senha)
- Botão "Entrar"
- Link para voltar à home

**Como Alterar**:
```typescript
// Mudar placeholder do username
<Input placeholder="Novo placeholder aqui" />

// Mudar mensagem de erro
toast.error("Nova mensagem de erro");

// Mudar texto do botão
<Button>Novo Texto do Botão</Button>
```

#### **Dashboard.tsx** (Painel Principal)
**Localização**: `client/src/pages/Dashboard.tsx`

**Propósito**: Centro de controle principal com múltiplas abas.

**Abas Disponíveis**:
1. **Visão Geral**: Cards com saldo, serviços ativos, mensagens processadas, status
2. **Serviços**: Gerenciamento de Whisper, Ollama, Evolution API
3. **Financeiro**: CRUD de transações
4. **Monitoramento**: Métricas de sistema em tempo real
5. **Configurações**: Configuração de serviços

**Como Alterar**:
```typescript
// Adicionar nova aba
<TabsList>
  <TabsTrigger value="nova-aba">Nova Aba</TabsTrigger>
</TabsList>

<TabsContent value="nova-aba">
  {/* Conteúdo da nova aba */}
</TabsContent>
```

#### **FinancialConnected.tsx** (Painel Financeiro)
**Localização**: `client/src/pages/FinancialConnected.tsx`

**Propósito**: Gerenciamento completo de transações financeiras.

**Funcionalidades**:
- Visualização de saldo total
- Listagem de transações com paginação
- Adição de nova transação
- Edição de transação existente
- Exclusão de transação
- Filtros por tipo (income/expense)

**Como Alterar**:
```typescript
// Mudar limite de paginação
const limit = 50; // Altere este número

// Mudar categorias disponíveis
const categories = ["vendas", "salário", "despesa", ...];

// Mudar formato de moeda
new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
}).format(amount);
```

#### **SettingsConnected.tsx** (Configurações)
**Localização**: `client/src/pages/SettingsConnected.tsx`

**Propósito**: Interface para configurar Whisper, Ollama e Evolution API.

**Funcionalidades por Serviço**:

**Whisper**:
- Instalar/Desinstalar
- Iniciar/Parar
- Selecionar modelo (tiny, base, small, medium, large)
- Selecionar idioma
- Configurar limite de áudio
- Testar transcrição

**Ollama**:
- Instalar/Desinstalar
- Iniciar/Parar
- Listar modelos instalados
- Baixar novo modelo
- Remover modelo
- Configurar temperatura (0-1)
- Configurar limite de tokens
- Configurar timeout

**Evolution API**:
- Configurar URL da API
- Configurar chave de API
- Testar conexão
- Exibir QR Code
- Ver status de conexão
- Reconectar

**Como Alterar**:
```typescript
// Mudar modelo padrão do Whisper
const defaultModel = "base"; // Altere para outro modelo

// Mudar temperatura padrão do Ollama
const defaultTemperature = 0.7; // Altere este valor

// Mudar URL padrão da Evolution API
const defaultEvolutionUrl = "http://localhost:8080";
```

#### **Monitoring.tsx** (Monitoramento)
**Localização**: `client/src/pages/Monitoring.tsx`

**Propósito**: Visualizar métricas de sistema em tempo real.

**Métricas Exibidas**:
- Uso de CPU (%)
- Uso de Memória (%)
- Uso de Disco (%)
- Uptime do sistema
- Status de cada serviço (Whisper, Ollama, Evolution API)
- Filas de processamento (mensagens, transcrições, processamento IA)

**Como Alterar**:
```typescript
// Mudar intervalo de atualização (em ms)
const refreshInterval = 5000; // 5 segundos

// Mudar cores dos indicadores
const cpuColor = cpu > 80 ? "red" : "green";
```

### 2. Backend - APIs tRPC

#### **financial.ts** (APIs Financeiras)
**Localização**: `server/routers/financial.ts`

**Endpoints Disponíveis**:

```typescript
// Listar transações
trpc.financial.list.useQuery({ limit, offset, type, startDate, endDate })

// Criar transação
trpc.financial.create.useMutation()

// Atualizar transação
trpc.financial.update.useMutation()

// Deletar transação
trpc.financial.delete.useMutation()

// Obter saldo total
trpc.financial.getBalance.useQuery()
```

**Como Alterar**:
```typescript
// Adicionar novo campo à transação
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  description: text("description"),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  type: mysqlEnum("type", ["income", "expense"]),
  category: varchar("category", { length: 50 }),
  // Novo campo
  tags: text("tags"), // Adicione esta linha
  createdAt: timestamp("createdAt").defaultNow(),
});

// Depois execute: pnpm drizzle-kit generate
```

#### **services.ts** (APIs de Serviços)
**Localização**: `server/routers/services.ts`

**Endpoints Whisper**:
```typescript
trpc.services.whisper.getStatus.useQuery()
trpc.services.whisper.install.useMutation()
trpc.services.whisper.start.useMutation()
trpc.services.whisper.stop.useMutation()
trpc.services.whisper.transcribe.useMutation()
```

**Endpoints Ollama**:
```typescript
trpc.services.ollama.getStatus.useQuery()
trpc.services.ollama.install.useMutation()
trpc.services.ollama.start.useMutation()
trpc.services.ollama.stop.useMutation()
trpc.services.ollama.getModels.useQuery()
trpc.services.ollama.downloadModel.useMutation()
trpc.services.ollama.removeModel.useMutation()
```

**Endpoints Evolution API**:
```typescript
trpc.services.evolution.getStatus.useQuery()
trpc.services.evolution.configure.useMutation()
trpc.services.evolution.testConnection.useMutation()
trpc.services.evolution.getQRCode.useQuery()
trpc.services.evolution.reconnect.useMutation()
trpc.services.evolution.getMessageLogs.useQuery()
```

**Como Alterar**:
```typescript
// Mudar comando de instalação do Whisper
const installCommand = "pip install openai-whisper"; // Altere este comando

// Mudar porta padrão do Ollama
const ollamaPort = 11434; // Altere este número

// Mudar timeout de conexão
const connectionTimeout = 10000; // 10 segundos
```

#### **whatsapp.ts** (APIs de WhatsApp)
**Localização**: `server/routers/whatsapp.ts`

**Endpoints Disponíveis**:
```typescript
trpc.whatsapp.sendMessage.useMutation()
trpc.whatsapp.getMessages.useQuery()
trpc.whatsapp.processMessage.useMutation()
```

#### **monitoring.ts** (APIs de Monitoramento)
**Localização**: `server/routers/monitoring.ts`

**Endpoints Disponíveis**:
```typescript
trpc.monitoring.getSystemStatus.useQuery()
trpc.monitoring.getServiceLogs.useQuery()
trpc.monitoring.getMetrics.useQuery()
```

### 3. Banco de Dados

#### **schema.ts** (Definição de Tabelas)
**Localização**: `drizzle/schema.ts`

**Tabelas Criadas**:

```typescript
// Tabela de usuários
users {
  id: int (PK)
  username: varchar(50) - UNIQUE
  passwordHash: text
  name: text
  role: enum('user', 'admin')
  isActive: boolean
  createdAt: timestamp
  updatedAt: timestamp
}

// Tabela de transações
transactions {
  id: int (PK)
  userId: int (FK)
  description: text
  amount: decimal(10,2)
  type: enum('income', 'expense')
  category: varchar(50)
  createdAt: timestamp
}

// Tabela de mensagens WhatsApp
messages {
  id: int (PK)
  userId: int (FK)
  from: varchar(20)
  to: varchar(20)
  text: text
  type: enum('incoming', 'outgoing')
  status: enum('pending', 'sent', 'failed')
  createdAt: timestamp
}

// Tabela de configurações
configurations {
  id: int (PK)
  userId: int (FK)
  key: varchar(100)
  value: text
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Como Alterar**:
```typescript
// Adicionar nova tabela
export const newTable = mysqlTable("new_table", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow(),
});

// Depois execute:
// pnpm drizzle-kit generate
// Revise o arquivo SQL gerado
// Execute: pnpm drizzle-kit migrate
```

### 4. Autenticação

#### **auth.ts** (Lógica de Autenticação)
**Localização**: `server/_core/auth.ts`

**Funções Principais**:
```typescript
// Fazer hash de senha
hashPassword(password: string): Promise<string>

// Verificar senha
verifyPassword(password: string, hash: string): Promise<boolean>

// Gerar token JWT
generateToken(user: User): string

// Verificar token JWT
verifyToken(token: string): User | null
```

**Como Alterar**:
```typescript
// Mudar algoritmo de hash
const saltRounds = 12; // Altere este número (mais alto = mais seguro, mais lento)

// Mudar tempo de expiração do token
const tokenExpiration = "24h"; // Altere este valor
```

---

## Como Fazer Alterações

### Alterando a Landing Page

**Arquivo**: `client/src/pages/Home.tsx`

**Passo 1**: Abra o arquivo no editor
```bash
nano /www/wwwroot/gestor.nossoapp.top/client/src/pages/Home.tsx
```

**Passo 2**: Localize o texto que deseja alterar
```typescript
<h1 className="text-5xl font-bold text-cyan-400">
  Gestão Financeira Inteligente
</h1>
```

**Passo 3**: Altere o texto
```typescript
<h1 className="text-5xl font-bold text-cyan-400">
  Seu Novo Título Aqui
</h1>
```

**Passo 4**: Salve o arquivo (Ctrl+X, depois Y, depois Enter no nano)

**Passo 5**: Compile a aplicação
```bash
cd /www/wwwroot/gestor.nossoapp.top
pnpm build
```

**Passo 6**: Copie os arquivos compilados
```bash
cp -r dist/public/* /www/wwwroot/gestor.nossoapp.top/
```

**Passo 7**: Reinicie a aplicação
```bash
pm2 restart gestor-financeiro
```

### Alterando Cores do Sistema

**Arquivo**: `client/src/index.css`

**Localizar**:
```css
@layer base {
  :root {
    --background: 222 84% 5%;
    --foreground: 210 40% 96%;
    --primary: 198 93% 60%;
    /* ... mais cores ... */
  }
}
```

**Alterar**: Mude os valores HSL para as cores desejadas

### Adicionando Novo Campo a Transações

**Passo 1**: Edite `drizzle/schema.ts`
```typescript
export const transactions = mysqlTable("transactions", {
  // ... campos existentes ...
  notes: text("notes"), // Novo campo
});
```

**Passo 2**: Gere a migration
```bash
cd /www/wwwroot/gestor.nossoapp.top
pnpm drizzle-kit generate
```

**Passo 3**: Revise o arquivo SQL gerado em `drizzle/`

**Passo 4**: Execute a migration
```bash
pnpm drizzle-kit migrate
```

**Passo 5**: Atualize o frontend para usar o novo campo
```typescript
// Em FinancialConnected.tsx
<Input 
  placeholder="Notas"
  value={newTransaction.notes}
  onChange={(e) => setNewTransaction({...newTransaction, notes: e.target.value})}
/>
```

**Passo 6**: Compile e reinicie
```bash
pnpm build
cp -r dist/public/* /www/wwwroot/gestor.nossoapp.top/
pm2 restart gestor-financeiro
```

---

## O Que Falta Fazer

### 1. Persistência de Estado dos Serviços

**Problema**: Quando você atualiza a página, o sistema pede para instalar novamente os serviços.

**Causa**: O estado está apenas em memória (RAM), não é salvo no banco de dados.

**Solução**:

**Passo 1**: Adicione tabela de configurações de serviços
```typescript
// Em drizzle/schema.ts
export const serviceConfigurations = mysqlTable("service_configurations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id),
  serviceName: varchar("serviceName", { length: 50 }), // whisper, ollama, evolution
  status: varchar("status", { length: 20 }), // installed, running, stopped
  config: json("config"), // Armazena configurações em JSON
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").onUpdateNow(),
});
```

**Passo 2**: Atualize o backend para salvar no banco
```typescript
// Em server/routers/services.ts
export const servicesRouter = router({
  whisper: router({
    install: protectedProcedure.mutation(async ({ ctx }) => {
      // Instalar Whisper
      await exec("pip install openai-whisper");
      
      // Salvar no banco de dados
      await db.insert(serviceConfigurations).values({
        userId: ctx.user.id,
        serviceName: "whisper",
        status: "installed",
        config: { model: "base", language: "pt-BR" },
      });
      
      return { success: true };
    }),
    
    getStatus: protectedProcedure.query(async ({ ctx }) => {
      // Buscar do banco de dados
      const config = await db.query.serviceConfigurations.findFirst({
        where: and(
          eq(serviceConfigurations.userId, ctx.user.id),
          eq(serviceConfigurations.serviceName, "whisper")
        ),
      });
      
      return config || { status: "not_installed" };
    }),
  }),
});
```

**Passo 3**: Atualize o frontend para usar o novo endpoint
```typescript
// Em SettingsConnected.tsx
const { data: whisperStatus } = trpc.services.whisper.getStatus.useQuery();

// Agora whisperStatus virá do banco de dados
```

### 2. Corrigir Botões que Não Funcionam

**Problema**: Botões de "Testar Transcrição", "Configurar", "Parar" não funcionam.

**Causa**: Os endpoints estão retornando erros ou não estão implementados corretamente.

**Solução**:

**Passo 1**: Verifique os logs do servidor
```bash
pm2 logs gestor-financeiro
```

**Passo 2**: Procure por erros relacionados aos serviços

**Passo 3**: Implemente os endpoints corretamente

```typescript
// Em server/routers/services.ts
export const servicesRouter = router({
  whisper: router({
    transcribe: protectedProcedure
      .input(z.object({ audioUrl: z.string() }))
      .mutation(async ({ input }) => {
        try {
          // Verificar se Whisper está instalado
          const whisperPath = await exec("which whisper");
          if (!whisperPath) {
            throw new Error("Whisper não está instalado");
          }
          
          // Fazer a transcrição
          const result = await exec(`whisper "${input.audioUrl}" --language pt`);
          
          return {
            success: true,
            transcription: result.stdout,
          };
        } catch (error) {
          return {
            success: false,
            error: error.message,
          };
        }
      }),
  }),
});
```

### 3. Implementar Fluxo Completo de WhatsApp

**O que falta**:
- Receber mensagens de WhatsApp
- Transcrever áudio automaticamente
- Processar com regras ou IA
- Extrair dados financeiros
- Enviar resposta automática

**Como Implementar**:

**Passo 1**: Configure o webhook da Evolution API
```typescript
// Em server/_core/index.ts
app.post("/webhook/whatsapp", async (req, res) => {
  const message = req.body;
  
  // Salvar mensagem no banco
  await db.insert(messages).values({
    from: message.from,
    to: message.to,
    text: message.text,
    type: "incoming",
    status: "pending",
  });
  
  // Se for áudio, transcrever
  if (message.type === "audio") {
    const transcription = await trpc.services.whisper.transcribe({
      audioUrl: message.audioUrl,
    });
    
    // Processar com IA
    const response = await trpc.services.ollama.chat({
      message: transcription,
    });
    
    // Extrair dados financeiros
    const financialData = await extractFinancialData(response);
    
    // Salvar transação se houver
    if (financialData) {
      await db.insert(transactions).values(financialData);
    }
    
    // Enviar resposta
    await trpc.services.evolution.sendMessage({
      to: message.from,
      text: response,
    });
  }
  
  res.json({ success: true });
});
```

**Passo 2**: Configure a URL do webhook na Evolution API
```
https://gestor.nossoapp.top/webhook/whatsapp
```

### 4. Adicionar Página de Teste

**O que fazer**:
- Criar página para testar cada serviço
- Testar APIs sem passar pelo frontend
- Verificar status em tempo real
- Ver logs de erro

**Como Criar**:

Veja a próxima seção "Página de Teste".

### 5. Adicionar Rate Limiting

**Por que**: Proteger contra ataques de força bruta

**Como Implementar**:
```bash
npm install express-rate-limit
```

```typescript
// Em server/_core/index.ts
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo 100 requisições por IP
  message: "Muitas requisições, tente novamente mais tarde",
});

app.use("/api/", limiter);
```

### 6. Adicionar Testes Automatizados

**Por que**: Garantir que tudo funciona corretamente

**Como Implementar**:
```bash
npm install vitest
```

```typescript
// Em server/services.test.ts
import { describe, it, expect } from "vitest";
import { trpc } from "./routers";

describe("Services", () => {
  it("should install Whisper", async () => {
    const result = await trpc.services.whisper.install();
    expect(result.success).toBe(true);
  });
  
  it("should get Whisper status", async () => {
    const status = await trpc.services.whisper.getStatus();
    expect(status).toBeDefined();
  });
});
```

Depois execute:
```bash
pnpm test
```

---

## Troubleshooting

### Problema: Página em Branco ao Acessar o Sistema

**Causa**: Arquivos CSS/JS não estão sendo servidos

**Solução**:
```bash
# Verifique se os arquivos existem
ls -la /www/wwwroot/gestor.nossoapp.top/

# Se não existem, compile novamente
cd /www/wwwroot/gestor.nossoapp.top
pnpm build
cp -r dist/public/* ./

# Reinicie o servidor
pm2 restart gestor-financeiro
```

### Problema: Erro 401 ao Fazer Login

**Causa**: Credenciais incorretas ou usuário não existe

**Solução**:
```bash
# Verifique se o usuário admin existe
mysql -u root -p gestor_financeiro_ia -e "SELECT * FROM users WHERE username='admin';"

# Se não existir, crie
mysql -u root -p gestor_financeiro_ia -e "
INSERT INTO users (username, passwordHash, name, role, isActive) VALUES (
  'admin',
  '\$2b\$10\$...',  -- hash bcrypt de 'Admin@123456'
  'Administrator',
  'admin',
  1
);"
```

### Problema: Whisper/Ollama/Evolution API não Funcionam

**Causa**: Serviços não estão instalados ou não estão rodando

**Solução**:
```bash
# Verifique se Whisper está instalado
which whisper
pip list | grep whisper

# Se não estiver, instale
pip install openai-whisper

# Verifique se Ollama está rodando
curl http://localhost:11434/api/tags

# Se não estiver, inicie
ollama serve

# Verifique se Evolution API está rodando
curl http://localhost:8080/health
```

### Problema: Banco de Dados Não Conecta

**Causa**: Credenciais incorretas ou MySQL não está rodando

**Solução**:
```bash
# Verifique se MySQL está rodando
systemctl status mysql

# Se não estiver, inicie
systemctl start mysql

# Teste a conexão
mysql -h localhost -u gestor_user -p -e "USE gestor_financeiro_ia; SELECT 1;"

# Se der erro de permissão, resete a senha
mysql -u root -p -e "ALTER USER 'gestor_user'@'localhost' IDENTIFIED BY 'nova_senha';"
```

### Problema: Aplicação Travada ou Lenta

**Causa**: Muita memória sendo usada ou processo morto

**Solução**:
```bash
# Verifique status
pm2 status

# Verifique uso de memória
pm2 monit

# Reinicie se necessário
pm2 restart gestor-financeiro

# Veja os logs
pm2 logs gestor-financeiro
```

---

## Próximas Etapas Recomendadas

1. **Implementar Persistência de Estado** (Prioridade Alta)
2. **Corrigir Botões que Não Funcionam** (Prioridade Alta)
3. **Adicionar Página de Teste** (Prioridade Média)
4. **Implementar Fluxo Completo de WhatsApp** (Prioridade Média)
5. **Adicionar Rate Limiting** (Prioridade Baixa)
6. **Adicionar Testes Automatizados** (Prioridade Baixa)

---

## Suporte e Contato

Para dúvidas ou problemas, consulte:
- **README.md**: Guia geral do sistema
- **SECURITY.md**: Boas práticas de segurança
- **DEPLOYMENT.md**: Instruções de deployment
- **API_DOCUMENTATION.md**: Documentação de APIs
- **Logs**: `pm2 logs gestor-financeiro`

---

**Versão**: 1.0.0  
**Data**: 17 de Abril de 2026  
**Autor**: Manus AI
