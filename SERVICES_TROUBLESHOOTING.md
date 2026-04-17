# Guia de Solução de Problemas - Whisper, Ollama e Evolution API

## Problema: Botões de Whisper, Ollama e Evolution API não funcionam

### Sintomas

- Clica no botão "Instalar" e nada acontece
- Clica em "Testar Transcrição" e nada acontece
- Clica em "Configurar" e nada acontece
- Clica em "Parar" e nada acontece
- Ao atualizar a página, pede para instalar novamente

### Causa Raiz

O problema ocorre porque:

1. **O backend não está respondendo corretamente** - Os endpoints tRPC não estão retornando dados
2. **Os serviços não estão instalados no servidor** - Whisper, Ollama ou Evolution API não existem
3. **Falta de persistência** - As configurações não estão sendo salvas no banco de dados
4. **Erros de conexão** - O frontend não consegue se comunicar com o backend

---

## Solução Passo a Passo

### Passo 1: Verificar se o Backend está Respondendo

#### 1.1: Acessar a Página de Diagnóstico

1. Vá para: `https://gestor.nossoapp.top/diagnostics`
2. Clique em "Run All Tests"
3. Verifique se "Backend Connection" está com status "success"

#### 1.2: Se o Backend Connection Falhar

**No SSH (terminal da VPS)**:

```bash
# Verificar se a aplicação está rodando
pm2 status

# Se não estiver rodando, inicie
pm2 start dist/index.js --name "gestor-financeiro"

# Ver logs de erro
pm2 logs gestor-financeiro
```

Se ver erros nos logs, procure por mensagens de erro e tente resolvê-las.

### Passo 2: Instalar os Serviços Manualmente

Se o backend estiver respondendo mas os botões não funcionam, é porque os serviços não estão instalados.

#### 2.1: Instalar Whisper

**No SSH**:

```bash
# Instalar Python e pip (se não tiver)
apt-get update
apt-get install -y python3 python3-pip

# Instalar Whisper
pip install openai-whisper

# Verificar se foi instalado
which whisper
whisper --version
```

Se vir um número de versão, Whisper foi instalado com sucesso.

#### 2.2: Instalar Ollama

**No SSH**:

```bash
# Baixar e instalar Ollama
curl https://ollama.ai/install.sh | sh

# Iniciar Ollama em background
ollama serve &

# Verificar se está rodando
curl http://localhost:11434/api/tags
```

Se receber uma resposta JSON, Ollama está rodando.

#### 2.3: Instalar Evolution API

**No SSH**:

```bash
# Instalar Node.js (se não tiver)
apt-get install -y nodejs npm

# Instalar Evolution API globalmente
npm install -g @evolution-api/evolution-api

# Iniciar Evolution API em background
evolution-api &

# Verificar se está rodando
curl http://localhost:8080/health
```

Se receber uma resposta, Evolution API está rodando.

### Passo 3: Corrigir o Backend para Persistência

O backend precisa ser atualizado para salvar as configurações no banco de dados.

#### 3.1: Atualizar o Schema do Banco de Dados

**No SSH**:

```bash
mysql -u root -p gestor_financeiro_ia
```

Quando pedir senha, digite: `00f68e428d05e26f`

Copie e cole estes comandos:

```sql
-- Criar tabela de configurações de serviços
CREATE TABLE IF NOT EXISTS service_configs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  service_name VARCHAR(50) NOT NULL UNIQUE,
  is_installed BOOLEAN DEFAULT FALSE,
  is_running BOOLEAN DEFAULT FALSE,
  config JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inserir configurações iniciais
INSERT IGNORE INTO service_configs (service_name, is_installed, is_running) VALUES
('whisper', FALSE, FALSE),
('ollama', FALSE, FALSE),
('evolution_api', FALSE, FALSE);

EXIT;
```

#### 3.2: Atualizar o Backend para Usar o Banco de Dados

Abra o arquivo `server/routers/services.ts` e procure pela função `whisper.install`. Você verá algo como:

```typescript
install: publicProcedure.mutation(async () => {
  // Simular instalação
  return { success: true, message: "Whisper installed" };
})
```

Altere para:

```typescript
install: publicProcedure.mutation(async ({ ctx }) => {
  try {
    // Executar comando de instalação
    const { execSync } = require('child_process');
    execSync('pip install openai-whisper', { stdio: 'inherit' });

    // Salvar no banco de dados
    const db = await getDb();
    if (db) {
      await db.insert(serviceConfigs).values({
        service_name: 'whisper',
        is_installed: true,
        is_running: false,
      }).onDuplicateKeyUpdate({
        set: { is_installed: true }
      });
    }

    return { success: true, message: "Whisper installed successfully" };
  } catch (error) {
    return { success: false, message: String(error) };
  }
})
```

### Passo 4: Testar Novamente

1. Compile a aplicação:

```bash
cd /www/wwwroot/gestor-financeiro-ia
pnpm build
```

2. Copie os arquivos para a VPS:

```bash
cp -r dist/public/* ./
pm2 restart gestor-financeiro
```

3. Acesse a página de Configurações e teste os botões novamente

### Passo 5: Se Ainda Não Funcionar

#### 5.1: Verificar os Logs

```bash
# Ver logs da aplicação
pm2 logs gestor-financeiro

# Ver logs de erro do Whisper
whisper --help

# Ver logs de erro do Ollama
ollama --version

# Ver logs de erro do Evolution API
evolution-api --version
```

#### 5.2: Verificar Portas

Os serviços usam portas específicas. Verifique se estão abertas:

```bash
# Whisper (não usa porta, é um comando)
which whisper

# Ollama (porta 11434)
netstat -tlnp | grep 11434

# Evolution API (porta 8080)
netstat -tlnp | grep 8080

# Aplicação Node.js (porta 3000)
netstat -tlnp | grep 3000
```

Se não ver nada, o serviço não está rodando.

#### 5.3: Reiniciar Tudo

```bash
# Parar tudo
pm2 stop all
pkill -f whisper
pkill -f ollama
pkill -f evolution-api

# Aguardar 5 segundos
sleep 5

# Iniciar tudo novamente
pm2 start dist/index.js --name "gestor-financeiro"
ollama serve &
evolution-api &
```

---

## Problema: Persistência (Pede para Instalar Novamente ao Atualizar)

### Causa

As configurações estão sendo salvas apenas no `localStorage` do navegador, não no banco de dados.

### Solução

#### Passo 1: Atualizar o Frontend

Abra `client/src/pages/SettingsConnected.tsx` e procure por `localStorage`. Remova todas as referências:

```typescript
// REMOVER ISTO:
localStorage.setItem('whisper_installed', 'true');
const isInstalled = localStorage.getItem('whisper_installed') === 'true';

// USAR ISTO EM SEU LUGAR:
// Chamar API do backend para verificar status
const { data: status } = await trpc.services.whisper.getStatus.useQuery();
```

#### Passo 2: Atualizar o Backend

Certifique-se de que o backend está salvando no banco de dados:

```typescript
// No arquivo server/routers/services.ts
getStatus: publicProcedure.query(async ({ ctx }) => {
  const db = await getDb();
  if (!db) {
    return { installed: false, running: false };
  }

  const result = await db.select().from(serviceConfigs)
    .where(eq(serviceConfigs.service_name, 'whisper'));

  if (result.length === 0) {
    return { installed: false, running: false };
  }

  return {
    installed: result[0].is_installed,
    running: result[0].is_running,
  };
})
```

#### Passo 3: Compilar e Fazer Deploy

```bash
cd /www/wwwroot/gestor-financeiro-ia
pnpm build
cp -r dist/public/* ./
pm2 restart gestor-financeiro
```

---

## Problema: Botão "Testar Transcrição" não Funciona

### Causa

O arquivo de áudio não está sendo enviado corretamente ou Whisper não está respondendo.

### Solução

#### Passo 1: Verificar se Whisper está Rodando

```bash
# Testar Whisper manualmente
echo "Hello world" | whisper --model base --language en -
```

Se receber um erro, Whisper não está instalado ou não está funcionando.

#### Passo 2: Verificar o Endpoint de Transcrição

No arquivo `server/routers/services.ts`, procure por `transcribe`:

```typescript
transcribe: publicProcedure
  .input(z.object({ audioUrl: z.string() }))
  .mutation(async ({ input }) => {
    try {
      const { execSync } = require('child_process');
      const result = execSync(`whisper "${input.audioUrl}" --model base --output_format json`, {
        encoding: 'utf-8'
      });
      return JSON.parse(result);
    } catch (error) {
      return { error: String(error) };
    }
  })
```

Se não existir, você precisa criar.

---

## Problema: Ollama Não Baixa Modelos

### Causa

Falta de espaço em disco ou conexão de internet lenta.

### Solução

#### Passo 1: Verificar Espaço em Disco

```bash
df -h
```

Se o disco estiver com mais de 90% de uso, delete arquivos antigos.

#### Passo 2: Verificar Conexão de Internet

```bash
ping google.com
```

Se não conseguir fazer ping, há problema de conexão.

#### Passo 3: Baixar Modelo Manualmente

```bash
ollama pull llama2
```

Aguarde até o modelo ser baixado completamente.

---

## Problema: Evolution API Não Conecta

### Causa

Evolution API não está instalada ou não está respondendo na porta 8080.

### Solução

#### Passo 1: Verificar se Evolution API está Rodando

```bash
curl http://localhost:8080/health
```

Se receber um erro, Evolution API não está rodando.

#### Passo 2: Instalar Evolution API

```bash
npm install -g @evolution-api/evolution-api
evolution-api &
```

#### Passo 3: Configurar Porta

Se a porta 8080 estiver em uso, altere para outra:

```bash
evolution-api --port 8081 &
```

Depois, altere a configuração no painel para `http://localhost:8081`.

---

## Checklist de Verificação

Antes de reportar um problema, verifique:

- [ ] Backend está rodando: `pm2 status`
- [ ] Banco de dados está conectado: `mysql -u root -p -e "SELECT 1;"`
- [ ] Whisper está instalado: `which whisper`
- [ ] Ollama está rodando: `curl http://localhost:11434/api/tags`
- [ ] Evolution API está rodando: `curl http://localhost:8080/health`
- [ ] Portas estão abertas: `netstat -tlnp`
- [ ] Logs não têm erros: `pm2 logs gestor-financeiro`
- [ ] Página de Diagnostics mostra tudo verde

---

## Comandos Úteis

```bash
# Ver status de tudo
pm2 status

# Ver logs em tempo real
pm2 logs gestor-financeiro

# Reiniciar aplicação
pm2 restart gestor-financeiro

# Parar aplicação
pm2 stop gestor-financeiro

# Iniciar aplicação
pm2 start dist/index.js --name "gestor-financeiro"

# Ver uso de recursos
pm2 monit

# Testar Whisper
whisper --model base --language en /caminho/para/audio.mp3

# Testar Ollama
curl http://localhost:11434/api/tags

# Testar Evolution API
curl http://localhost:8080/health

# Ver portas em uso
netstat -tlnp | grep LISTEN

# Ver espaço em disco
df -h

# Ver uso de memória
free -h

# Ver uso de CPU
top -b -n 1 | head -20
```

---

## Suporte

Se ainda tiver problemas:

1. Acesse a página de Diagnostics: `https://gestor.nossoapp.top/diagnostics`
2. Execute todos os testes
3. Verifique os logs: `pm2 logs gestor-financeiro`
4. Consulte este guia novamente
5. Se nada funcionar, reinicie o servidor: `reboot`

---

**Versão**: 1.0.0  
**Data**: 17 de Abril de 2026  
**Autor**: Manus AI
