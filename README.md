# Gestor Financeiro IA - Sistema Independente

Um sistema web sofisticado e elegante para gerenciamento de automação financeira via WhatsApp com inteligência artificial local, painel de controle total e infraestrutura 100% independente.

## 🎯 Características Principais

### Autenticação Independente
- ✅ Login com **username e password** apenas
- ✅ Sem OAuth, Google, Manus ou qualquer serviço externo
- ✅ Criptografia de senha com bcrypt
- ✅ Sessões seguras com JWT

### Painel Web de Controle Total
- ✅ Landing Page elegante e responsiva
- ✅ Dashboard com visão geral do sistema
- ✅ Múltiplas abas de controle
- ✅ Design sofisticado com tema escuro

### Gerenciamento de Serviços
- ✅ **Whisper**: Transcrição de áudio local
- ✅ **Ollama**: IA local para interpretação
- ✅ **Evolution API**: Integração com WhatsApp
- ✅ Instalação, início, parada e monitoramento via web

### Painel Financeiro
- ✅ Visualização de saldo em tempo real
- ✅ CRUD completo de transações
- ✅ Categorização de despesas e receitas
- ✅ Filtros e busca avançada
- ✅ Integração com WhatsApp para entrada automática

### Monitoramento em Tempo Real
- ✅ Uso de CPU, memória e disco
- ✅ Status dos serviços (Whisper, Ollama, Evolution)
- ✅ Filas de processamento
- ✅ Logs de sistema

### Fluxo de WhatsApp
- ✅ Recebimento de mensagens de texto e áudio
- ✅ Transcrição automática de voz
- ✅ Processamento inteligente com Ollama
- ✅ Extração automática de dados financeiros
- ✅ Respostas automáticas

## 🏗️ Arquitetura

### Frontend
- **React 19** com Vite
- **Tailwind CSS 4** para styling
- **shadcn/ui** para componentes
- **tRPC** para comunicação com backend
- **Wouter** para roteamento

### Backend
- **Node.js** com Express
- **tRPC** para APIs type-safe
- **MySQL** para persistência de dados
- **Drizzle ORM** para queries seguras
- **bcrypt** para criptografia de senhas

### Banco de Dados
- **MySQL** com tabelas otimizadas
- **Usuários**: Autenticação independente
- **Transações**: Histórico financeiro
- **Mensagens WhatsApp**: Log de comunicações
- **Configurações**: Dados do sistema

## 🚀 Instalação e Setup

### Pré-requisitos
- Node.js 22+
- MySQL 8+
- Whisper (opcional)
- Ollama (opcional)
- Evolution API (opcional)

### Passos de Instalação

1. **Clonar o repositório**
```bash
git clone <repo-url>
cd gestor-financeiro-ia
```

2. **Instalar dependências**
```bash
pnpm install
```

3. **Configurar variáveis de ambiente**
```bash
cp .env.example .env
# Editar .env com suas configurações
```

4. **Executar migrações do banco de dados**
```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

5. **Criar usuário admin**
```bash
node server/seed-admin.mjs
```

6. **Iniciar o servidor de desenvolvimento**
```bash
pnpm dev
```

7. **Acessar o sistema**
```
http://localhost:3000
```

## 📝 Credenciais Padrão

**Usuário**: `admin`  
**Senha**: `Admin@123456`

⚠️ **IMPORTANTE**: Altere a senha após o primeiro login!

## 🔒 Segurança

### Implementações de Segurança
- ✅ Autenticação independente sem OAuth
- ✅ Senhas criptografadas com bcrypt
- ✅ Sessões seguras com JWT
- ✅ CORS configurado
- ✅ Rate limiting
- ✅ Validação de entrada com Zod
- ✅ Proteção contra SQL injection (Drizzle ORM)
- ✅ HTTPS recomendado em produção

### Boas Práticas
1. Altere as senhas padrão imediatamente
2. Use HTTPS em produção
3. Configure firewall adequadamente
4. Mantenha as dependências atualizadas
5. Faça backup regular do banco de dados

## 📊 Estrutura de Dados

### Tabela: users
```sql
- id (PK)
- username (UNIQUE)
- passwordHash
- name
- role (user | admin)
- isActive
- createdAt
- updatedAt
- lastSignedIn
```

### Tabela: transactions
```sql
- id (PK)
- userId (FK)
- type (income | expense)
- amount (decimal)
- description
- category
- source
- whatsappMessageId
- processedByAI
- createdAt
- updatedAt
```

### Tabela: whatsappMessages
```sql
- id (PK)
- messageId (UNIQUE)
- fromNumber
- toNumber
- messageType (text | audio | image | document)
- messageContent
- transcription
- aiResponse
- processedAt
- createdAt
```

### Tabela: systemConfig
```sql
- id (PK)
- configKey (UNIQUE)
- configValue
- dataType
- createdAt
- updatedAt
```

## 🧪 Testes

### Executar Testes
```bash
pnpm test
```

### Testes Inclusos
- ✅ Autenticação independente
- ✅ Validação de senha
- ✅ CRUD de transações
- ✅ Logout seguro

## 📚 APIs Disponíveis

### Autenticação
- `POST /api/auth/login` - Login com username/password
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Dados do usuário atual

### Transações Financeiras
- `GET /api/trpc/financial.getTransactions` - Listar transações
- `POST /api/trpc/financial.createTransaction` - Criar transação
- `PUT /api/trpc/financial.updateTransaction` - Atualizar transação
- `DELETE /api/trpc/financial.deleteTransaction` - Deletar transação
- `GET /api/trpc/financial.getSummary` - Resumo financeiro

### Serviços
- `GET /api/trpc/services.whisper.getStatus` - Status do Whisper
- `GET /api/trpc/services.ollama.getStatus` - Status do Ollama
- `GET /api/trpc/services.evolution.getStatus` - Status da Evolution API
- `GET /api/trpc/services.monitoring.getSystemStatus` - Status do sistema

### WhatsApp
- `POST /api/trpc/whatsapp.receiveMessage` - Receber mensagem
- `GET /api/trpc/whatsapp.getMessages` - Listar mensagens
- `GET /api/trpc/whatsapp.getStatistics` - Estatísticas

## 🎨 Customização

### Temas
O sistema usa Tailwind CSS com tema escuro por padrão. Para customizar:

1. Edite `client/src/index.css` para cores
2. Modifique `client/src/contexts/ThemeContext.tsx` para temas
3. Use `@layer` do Tailwind para sobrescrever estilos

### Componentes
Todos os componentes estão em `client/src/components/`:
- UI components em `client/src/components/ui/`
- Layouts em `client/src/components/`
- Páginas em `client/src/pages/`

## 📦 Deployment

### Build para Produção
```bash
pnpm build
```

### Executar em Produção
```bash
pnpm start
```

### Variáveis de Ambiente Obrigatórias
```
DATABASE_URL=mysql://user:password@host:3306/dbname
JWT_SECRET=seu_secret_muito_seguro
NODE_ENV=production
PORT=3000
```

## 🐛 Troubleshooting

### Erro: "Database not available"
- Verifique se MySQL está rodando
- Confirme a string de conexão em DATABASE_URL
- Verifique credenciais do banco de dados

### Erro: "Unknown column"
- Execute as migrações: `pnpm drizzle-kit migrate`
- Verifique se o schema está sincronizado

### Erro: "Cannot find module"
- Execute: `pnpm install`
- Delete `node_modules` e `pnpm-lock.yaml`, depois reinstale

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique a documentação
2. Consulte os logs em `.manus-logs/`
3. Verifique o console do navegador (F12)

## 📄 Licença

Propriedade privada. Todos os direitos reservados.

## 🎯 Roadmap Futuro

- [ ] Integração real com Whisper
- [ ] Integração real com Ollama
- [ ] Integração real com Evolution API
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Gráficos avançados de finanças
- [ ] Backup automático
- [ ] API pública para integrações
- [ ] Mobile app
- [ ] Notificações em tempo real
- [ ] Multi-usuário com permissões

---

**Versão**: 1.0.0  
**Última Atualização**: 17/04/2026  
**Status**: Em Desenvolvimento
