# Tarefas Faltantes - Guia Completo

Este documento lista tudo que ainda precisa ser feito no sistema e como fazer, passo a passo.

---

## 1. Corrigir Persistência de Configurações dos Serviços

### Problema Atual

Quando você clica em "Instalar" para Whisper, Ollama ou Evolution API, a instalação é simulada (não acontece de verdade). Além disso, ao atualizar a página, o sistema pede para instalar novamente porque não salva no banco de dados.

### O que Precisa ser Feito

1. **Criar tabela no banco de dados** para armazenar configurações dos serviços
2. **Atualizar o backend** para realmente instalar os serviços
3. **Atualizar o backend** para salvar configurações no banco
4. **Atualizar o frontend** para ler configurações do banco em vez de localStorage

### Como Fazer - Passo a Passo

#### Passo 1.1: Criar Tabela no Banco de Dados

**No SSH da VPS**:

```bash
mysql -u root -p gestor_financeiro_ia
```

Quando pedir senha, digite: `00f68e428d05e26f`

Copie e cole:

```sql
CREATE TABLE IF NOT EXISTS service_configs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  service_name VARCHAR(50) NOT NULL UNIQUE,
  is_installed BOOLEAN DEFAULT FALSE,
  is_running BOOLEAN DEFAULT FALSE,
  version VARCHAR(50),
  config JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT IGNORE INTO service_configs (service_name) VALUES
('whisper'),
('ollama'),
('evolution_api');

EXIT;
```

#### Passo 1.2: Atualizar o Schema do Drizzle

Abra o arquivo `/home/ubuntu/gestor-financeiro-ia/drizzle/schema.ts` e adicione:

```typescript
import { boolean, int, json, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const serviceConfigs = mysqlTable("service_configs", {
  id: int("id").autoincrement().primaryKey(),
  service_name: varchar("service_name", { length: 50 }).notNull().unique(),
  is_installed: boolean("is_installed").default(false),
  is_running: boolean("is_running").default(false),
  version: varchar("version", { length: 50 }),
  config: json("config"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export type ServiceConfig = typeof serviceConfigs.$inferSelect;
export type InsertServiceConfig = typeof serviceConfigs.$inferInsert;
```

#### Passo 1.3: Atualizar o Backend para Realmente Instalar

Abra `/home/ubuntu/gestor-financeiro-ia/server/routers/services.ts` e procure por `whisper.install`. Altere para:

```typescript
install: publicProcedure.mutation(async ({ ctx }) => {
  try {
    const { execSync } = require('child_process');
    
    // Instalar Whisper
    console.log("Installing Whisper...");
    execSync('pip install -q openai-whisper', { stdio: 'inherit' });
    
    // Salvar no banco de dados
    const db = await getDb();
    if (db) {
      await db.insert(serviceConfigs).values({
        service_name: 'whisper',
        is_installed: true,
        is_running: false,
        version: '20240101', // Versão do Whisper
      }).onDuplicateKeyUpdate({
        set: { is_installed: true, version: '20240101' }
      });
    }

    return { 
      success: true, 
      message: "Whisper instalado com sucesso!",
      installed: true 
    };
  } catch (error) {
    console.error("Whisper installation error:", error);
    return { 
      success: false, 
      message: `Erro ao instalar: ${String(error)}`,
      installed: false 
    };
  }
})
```

Faça o mesmo para `ollama.install` e `evolution.install`.

#### Passo 1.4: Atualizar o Frontend para Ler do Banco

Abra `/home/ubuntu/gestor-financeiro-ia/client/src/pages/SettingsConnected.tsx` e procure por `localStorage`. Remova todas as referências e use os dados retornados pela API.

### Resultado Esperado

- Ao clicar "Instalar", o serviço é realmente instalado
- Ao atualizar a página, o sistema lembra que foi instalado
- Os botões de controle funcionam (Iniciar, Parar, Configurar)

---

## 2. Implementar Fluxo Completo de WhatsApp

### Problema Atual

O sistema recebe mensagens do WhatsApp mas não processa automaticamente.

### O que Precisa ser Feito

1. **Criar webhook** para receber mensagens do WhatsApp
2. **Processar mensagens** com Whisper (se for áudio) e Ollama (se precisar IA)
3. **Extrair dados financeiros** das mensagens
4. **Responder ao usuário** automaticamente

### Como Fazer - Passo a Passo

#### Passo 2.1: Criar Tabela para Armazenar Mensagens

**No SSH**:

```bash
mysql -u root -p gestor_financeiro_ia
```

```sql
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phone_number VARCHAR(20),
  message_text TEXT,
  is_audio BOOLEAN DEFAULT FALSE,
  audio_url VARCHAR(500),
  processed BOOLEAN DEFAULT FALSE,
  extracted_data JSON,
  response_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

EXIT;
```

#### Passo 2.2: Criar Endpoint para Webhook

Abra `/home/ubuntu/gestor-financeiro-ia/server/routers/whatsapp.ts` e adicione:

```typescript
import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";

export const whatsappRouter = router({
  webhook: publicProcedure
    .input(z.object({
      phone: z.string(),
      message: z.string(),
      audioUrl: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Se for áudio, transcrever com Whisper
        let messageText = input.message;
        if (input.audioUrl) {
          const { execSync } = require('child_process');
          const result = execSync(`whisper "${input.audioUrl}" --output_format json --quiet`, {
            encoding: 'utf-8'
          });
          const parsed = JSON.parse(result);
          messageText = parsed.text;
        }

        // Processar com Ollama para extrair dados financeiros
        const { invokeLLM } = await import("../_core/llm");
        const response = await invokeLLM({
          messages: [{
            role: "user",
            content: `Extraia dados financeiros desta mensagem: "${messageText}". Retorne em JSON: {tipo: 'entrada' ou 'saída', valor: número, descrição: string}`
          }]
        });

        // Salvar no banco
        const db = await getDb();
        if (db) {
          const data = JSON.parse(response.choices[0].message.content);
          
          // Adicionar transação
          await db.insert(transactions).values({
            user_id: 1, // ID do usuário
            description: data.descrição,
            amount: data.valor,
            type: data.tipo,
            category: 'whatsapp',
          });

          // Responder ao usuário
          // (Aqui você chamaria a Evolution API para enviar mensagem)
        }

        return { success: true, message: "Mensagem processada" };
      } catch (error) {
        console.error("WhatsApp webhook error:", error);
        return { success: false, message: String(error) };
      }
    })
});
```

#### Passo 2.3: Configurar Evolution API para Enviar Webhook

Na página de Configurações, configure a URL do webhook:

```
https://gestor.nossoapp.top/api/trpc/whatsapp.webhook
```

### Resultado Esperado

- Mensagens do WhatsApp são recebidas automaticamente
- Áudio é transcrito com Whisper
- Dados financeiros são extraídos com Ollama
- Transações são criadas automaticamente
- Usuário recebe resposta no WhatsApp

---

## 3. Implementar Filtragem Avançada de Transações

### Problema Atual

O painel financeiro mostra todas as transações, mas não há filtros avançados.

### O que Precisa ser Feito

1. **Adicionar filtros** por data, categoria, tipo
2. **Adicionar busca** por descrição
3. **Adicionar ordenação** por data, valor
4. **Adicionar paginação** para melhor performance

### Como Fazer - Passo a Passo

#### Passo 3.1: Atualizar o Backend

Abra `/home/ubuntu/gestor-financeiro-ia/server/routers/financial.ts` e adicione:

```typescript
list: publicProcedure
  .input(z.object({
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    category: z.string().optional(),
    type: z.enum(['income', 'expense']).optional(),
    search: z.string().optional(),
    limit: z.number().default(10),
    offset: z.number().default(0),
  }))
  .query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];

    let query = db.select().from(transactions);

    if (input.startDate) {
      query = query.where(gte(transactions.created_at, input.startDate));
    }
    if (input.endDate) {
      query = query.where(lte(transactions.created_at, input.endDate));
    }
    if (input.category) {
      query = query.where(eq(transactions.category, input.category));
    }
    if (input.type) {
      query = query.where(eq(transactions.type, input.type));
    }
    if (input.search) {
      query = query.where(like(transactions.description, `%${input.search}%`));
    }

    return query.limit(input.limit).offset(input.offset);
  })
```

#### Passo 3.2: Atualizar o Frontend

Abra `/home/ubuntu/gestor-financeiro-ia/client/src/pages/FinancialConnected.tsx` e adicione:

```typescript
const [filters, setFilters] = useState({
  startDate: undefined,
  endDate: undefined,
  category: undefined,
  type: undefined,
  search: '',
});

const { data: transactions } = trpc.financial.list.useQuery(filters);
```

### Resultado Esperado

- Usuário pode filtrar transações por data
- Usuário pode filtrar por categoria e tipo
- Usuário pode buscar por descrição
- Interface é mais responsiva com paginação

---

## 4. Implementar Backup e Restore do Banco de Dados

### Problema Atual

Não há interface para fazer backup do banco de dados.

### O que Precisa ser Feito

1. **Criar endpoint** para fazer backup
2. **Criar endpoint** para fazer restore
3. **Adicionar interface** no painel

### Como Fazer - Passo a Passo

#### Passo 4.1: Criar Endpoints

Abra `/home/ubuntu/gestor-financeiro-ia/server/routers/database.ts` (crie se não existir):

```typescript
import { publicProcedure, router } from "../_core/trpc";

export const databaseRouter = router({
  backup: publicProcedure.mutation(async () => {
    try {
      const { execSync } = require('child_process');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `/backup/gestor_backup_${timestamp}.sql`;
      
      execSync(`mysqldump -u root -p00f68e428d05e26f gestor_financeiro_ia > ${filename}`);
      
      return { success: true, filename, message: "Backup criado com sucesso" };
    } catch (error) {
      return { success: false, message: String(error) };
    }
  }),

  restore: publicProcedure
    .input(z.object({ filename: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const { execSync } = require('child_process');
        execSync(`mysql -u root -p00f68e428d05e26f gestor_financeiro_ia < ${input.filename}`);
        
        return { success: true, message: "Restore concluído com sucesso" };
      } catch (error) {
        return { success: false, message: String(error) };
      }
    }),

  listBackups: publicProcedure.query(async () => {
    try {
      const { execSync } = require('child_process');
      const files = execSync('ls -la /backup/ | grep gestor_backup', { encoding: 'utf-8' });
      return { success: true, backups: files.split('\n').filter(f => f) };
    } catch (error) {
      return { success: true, backups: [] };
    }
  })
});
```

#### Passo 4.2: Adicionar Interface

Crie `/home/ubuntu/gestor-financeiro-ia/client/src/pages/Database.tsx` com botões para backup/restore.

### Resultado Esperado

- Usuário pode fazer backup com um clique
- Usuário pode restaurar backup com um clique
- Lista de backups disponíveis é mostrada

---

## 5. Implementar Testes Automatizados

### Problema Atual

Não há testes para garantir que o sistema funciona corretamente.

### O que Precisa ser Feito

1. **Criar testes** para autenticação
2. **Criar testes** para transações financeiras
3. **Criar testes** para serviços
4. **Executar testes** automaticamente

### Como Fazer - Passo a Passo

#### Passo 5.1: Criar Testes de Autenticação

Abra `/home/ubuntu/gestor-financeiro-ia/server/auth.test.ts` e adicione:

```typescript
import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

describe("Authentication", () => {
  it("should login with correct credentials", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: { headers: {} } as any,
      res: {} as any,
    });

    const result = await caller.auth.login({
      username: "admin",
      password: "Admin@123456",
    });

    expect(result.success).toBe(true);
  });

  it("should fail with incorrect password", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: { headers: {} } as any,
      res: {} as any,
    });

    const result = await caller.auth.login({
      username: "admin",
      password: "wrongpassword",
    });

    expect(result.success).toBe(false);
  });
});
```

#### Passo 5.2: Executar Testes

**No SSH**:

```bash
cd /www/wwwroot/gestor-financeiro-ia
pnpm test
```

### Resultado Esperado

- Testes são executados automaticamente
- Erros são detectados antes de fazer deploy
- Sistema é mais confiável

---

## 6. Melhorias de UX/UI

### Problema Atual

Algumas telas precisam de melhorias visuais e de usabilidade.

### O que Precisa ser Feito

1. **Adicionar animações** nas transições
2. **Melhorar responsividade** em celulares
3. **Adicionar dark mode** (já existe, mas pode melhorar)
4. **Adicionar tooltips** para ajudar usuários

### Como Fazer - Passo a Passo

#### Passo 6.1: Adicionar Animações

Abra qualquer arquivo `.tsx` e adicione:

```typescript
import { motion } from "framer-motion";

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Seu conteúdo aqui
</motion.div>
```

#### Passo 6.2: Melhorar Responsividade

Use Tailwind CSS com breakpoints:

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Conteúdo responsivo */}
</div>
```

### Resultado Esperado

- Interface mais fluida e moderna
- Melhor experiência em celulares
- Usuários entendem melhor como usar o sistema

---

## 7. Implementar Notificações em Tempo Real

### Problema Atual

Usuário não recebe notificações quando algo importante acontece.

### O que Precisa ser Feito

1. **Criar sistema** de notificações
2. **Adicionar notificações** para transações
3. **Adicionar notificações** para status dos serviços
4. **Adicionar notificações** para erros

### Como Fazer - Passo a Passo

#### Passo 7.1: Criar Tabela de Notificações

**No SSH**:

```bash
mysql -u root -p gestor_financeiro_ia
```

```sql
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  title VARCHAR(255),
  message TEXT,
  type ENUM('info', 'success', 'warning', 'error'),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

EXIT;
```

#### Passo 7.2: Criar Endpoint

Abra `/home/ubuntu/gestor-financeiro-ia/server/routers/notifications.ts` (crie se não existir):

```typescript
export const notificationsRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db || !ctx.user) return [];

    return db.select().from(notifications)
      .where(eq(notifications.user_id, ctx.user.id))
      .orderBy(desc(notifications.created_at));
  }),

  markAsRead: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };

      await db.update(notifications)
        .set({ read: true })
        .where(eq(notifications.id, input.id));

      return { success: true };
    })
});
```

### Resultado Esperado

- Usuário recebe notificações em tempo real
- Notificações aparecem como toast ou badge
- Sistema é mais responsivo

---

## 8. Implementar Relatórios e Gráficos

### Problema Atual

Não há visualizações gráficas dos dados financeiros.

### O que Precisa ser Feito

1. **Criar gráficos** de receitas vs despesas
2. **Criar gráficos** por categoria
3. **Criar relatórios** mensais/anuais
4. **Exportar relatórios** em PDF

### Como Fazer - Passo a Passo

#### Passo 8.1: Adicionar Gráficos com Recharts

Abra `/home/ubuntu/gestor-financeiro-ia/client/src/pages/Financial.tsx` e adicione:

```typescript
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height={300}>
  <BarChart data={transactions}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="category" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Bar dataKey="amount" fill="#0891b2" />
  </BarChart>
</ResponsiveContainer>
```

#### Passo 8.2: Exportar para PDF

Use a biblioteca `jsPDF`:

```typescript
import jsPDF from 'jspdf';

const generateReport = () => {
  const doc = new jsPDF();
  doc.text('Relatório Financeiro', 10, 10);
  doc.save('relatorio.pdf');
};
```

### Resultado Esperado

- Usuário vê gráficos de suas finanças
- Pode exportar relatórios em PDF
- Toma decisões melhores com dados visuais

---

## Checklist de Implementação

Copie e cole este checklist em um documento para rastrear o progresso:

```
[ ] 1. Corrigir Persistência de Configurações
  [ ] 1.1 Criar tabela service_configs
  [ ] 1.2 Atualizar schema Drizzle
  [ ] 1.3 Atualizar backend para realmente instalar
  [ ] 1.4 Atualizar frontend para ler do banco

[ ] 2. Implementar Fluxo de WhatsApp
  [ ] 2.1 Criar tabela whatsapp_messages
  [ ] 2.2 Criar endpoint webhook
  [ ] 2.3 Configurar Evolution API

[ ] 3. Filtragem de Transações
  [ ] 3.1 Atualizar backend com filtros
  [ ] 3.2 Atualizar frontend com UI de filtros

[ ] 4. Backup e Restore
  [ ] 4.1 Criar endpoints
  [ ] 4.2 Adicionar interface

[ ] 5. Testes Automatizados
  [ ] 5.1 Criar testes
  [ ] 5.2 Executar testes

[ ] 6. Melhorias UX/UI
  [ ] 6.1 Adicionar animações
  [ ] 6.2 Melhorar responsividade

[ ] 7. Notificações em Tempo Real
  [ ] 7.1 Criar tabela
  [ ] 7.2 Criar endpoints

[ ] 8. Relatórios e Gráficos
  [ ] 8.1 Adicionar gráficos
  [ ] 8.2 Exportar para PDF
```

---

## Próximos Passos

1. **Escolha uma tarefa** da lista acima
2. **Siga o passo a passo** fornecido
3. **Teste a implementação**
4. **Faça deploy** na VPS
5. **Marque como concluída** no checklist

---

**Versão**: 1.0.0  
**Data**: 17 de Abril de 2026  
**Autor**: Manus AI
