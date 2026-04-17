# Documentação da API - Gestor Financeiro IA

## Base URL
```
https://gestor.nossoapp.top/api
```

## Autenticação

Todas as requisições devem incluir o header de autenticação:
```
Authorization: Bearer {token}
```

O token é obtido automaticamente após o login e armazenado em cookies.

---

## Endpoints de Autenticação

### Login
**POST** `/auth/login`

**Body:**
```json
{
  "username": "admin",
  "password": "Admin@123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "admin",
    "name": "Administrator",
    "role": "admin"
  }
}
```

### Logout
**POST** `/auth/logout`

**Response (200):**
```json
{
  "success": true
}
```

### Obter Usuário Atual
**GET** `/auth/me`

**Response (200):**
```json
{
  "id": 1,
  "username": "admin",
  "name": "Administrator",
  "role": "admin"
}
```

---

## Endpoints Financeiros

### Listar Transações
**GET** `/trpc/financial.list`

**Query Parameters:**
- `limit` (number, default: 50) - Quantidade de registros
- `offset` (number, default: 0) - Offset para paginação
- `type` (string, optional) - Filtro por tipo (income/expense)
- `startDate` (string, optional) - Data inicial (ISO 8601)
- `endDate` (string, optional) - Data final (ISO 8601)

**Response (200):**
```json
{
  "transactions": [
    {
      "id": 1,
      "description": "Venda de produto",
      "amount": 150.00,
      "type": "income",
      "category": "vendas",
      "createdAt": "2026-04-17T10:00:00Z"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

### Criar Transação
**POST** `/trpc/financial.create`

**Body:**
```json
{
  "description": "Venda de produto",
  "amount": 150.00,
  "type": "income",
  "category": "vendas"
}
```

**Response (201):**
```json
{
  "id": 1,
  "description": "Venda de produto",
  "amount": 150.00,
  "type": "income",
  "category": "vendas",
  "createdAt": "2026-04-17T10:00:00Z"
}
```

### Atualizar Transação
**PUT** `/trpc/financial.update`

**Body:**
```json
{
  "id": 1,
  "description": "Venda de produto (atualizado)",
  "amount": 200.00,
  "type": "income",
  "category": "vendas"
}
```

**Response (200):**
```json
{
  "id": 1,
  "description": "Venda de produto (atualizado)",
  "amount": 200.00,
  "type": "income",
  "category": "vendas",
  "createdAt": "2026-04-17T10:00:00Z"
}
```

### Deletar Transação
**DELETE** `/trpc/financial.delete`

**Body:**
```json
{
  "id": 1
}
```

**Response (200):**
```json
{
  "success": true
}
```

### Obter Saldo Total
**GET** `/trpc/financial.getBalance`

**Response (200):**
```json
{
  "balance": 1500.00
}
```

---

## Endpoints de Serviços

### Whisper - Transcrição de Áudio

#### Status do Whisper
**GET** `/trpc/services.whisper.getStatus`

**Response (200):**
```json
{
  "status": "installed",
  "version": "1.0",
  "model": "base",
  "language": "pt-BR"
}
```

#### Instalar Whisper
**POST** `/trpc/services.whisper.install`

**Response (200):**
```json
{
  "success": true,
  "message": "Whisper instalado com sucesso"
}
```

#### Iniciar Whisper
**POST** `/trpc/services.whisper.start`

**Response (200):**
```json
{
  "success": true,
  "message": "Whisper pronto para uso"
}
```

#### Parar Whisper
**POST** `/trpc/services.whisper.stop`

**Response (200):**
```json
{
  "success": true,
  "message": "Whisper parado"
}
```

#### Transcrever Áudio
**POST** `/trpc/services.whisper.transcribe`

**Body:**
```json
{
  "audioUrl": "https://example.com/audio.mp3"
}
```

**Response (200):**
```json
{
  "success": true,
  "transcription": "Texto transcrito do áudio",
  "language": "pt-BR"
}
```

---

### Ollama - IA Local

#### Status do Ollama
**GET** `/trpc/services.ollama.getStatus`

**Response (200):**
```json
{
  "status": "running",
  "version": "1.0",
  "models": ["llama2", "mistral"],
  "memoryUsage": 2048
}
```

#### Instalar Ollama
**POST** `/trpc/services.ollama.install`

**Response (200):**
```json
{
  "success": true,
  "message": "Ollama instalado com sucesso"
}
```

#### Iniciar Ollama
**POST** `/trpc/services.ollama.start`

**Response (200):**
```json
{
  "success": true,
  "message": "Ollama iniciado"
}
```

#### Parar Ollama
**POST** `/trpc/services.ollama.stop`

**Response (200):**
```json
{
  "success": true,
  "message": "Ollama parado"
}
```

#### Listar Modelos
**GET** `/trpc/services.ollama.getModels`

**Response (200):**
```json
{
  "models": ["llama2", "mistral", "neural-chat"]
}
```

#### Baixar Modelo
**POST** `/trpc/services.ollama.downloadModel`

**Body:**
```json
{
  "modelName": "llama2"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Downloading model: llama2"
}
```

#### Remover Modelo
**POST** `/trpc/services.ollama.removeModel`

**Body:**
```json
{
  "modelName": "llama2"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Model removed: llama2"
}
```

---

### Evolution API - WhatsApp

#### Status da Evolution API
**GET** `/trpc/services.evolution.getStatus`

**Response (200):**
```json
{
  "status": "configured",
  "apiUrl": "http://localhost:8080",
  "connected": true,
  "lastSync": "2026-04-17T10:00:00Z"
}
```

#### Configurar Evolution API
**POST** `/trpc/services.evolution.configure`

**Body:**
```json
{
  "apiUrl": "http://localhost:8080",
  "apiKey": "sua-chave-api"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Evolution API configured"
}
```

#### Testar Conexão
**POST** `/trpc/services.evolution.testConnection`

**Response (200):**
```json
{
  "success": true,
  "message": "Connection successful",
  "status": "connected"
}
```

#### Obter QR Code
**GET** `/trpc/services.evolution.getQRCode`

**Response (200):**
```json
{
  "qrCode": "data:image/png;base64,...",
  "status": "waiting"
}
```

#### Reconectar
**POST** `/trpc/services.evolution.reconnect`

**Response (200):**
```json
{
  "success": true,
  "message": "Reconnecting..."
}
```

#### Obter Logs de Mensagens
**GET** `/trpc/services.evolution.getMessageLogs?limit=50&offset=0`

**Response (200):**
```json
{
  "messages": [
    {
      "id": 1,
      "from": "5511999999999",
      "to": "5511888888888",
      "text": "Olá, como posso ajudar?",
      "type": "incoming",
      "timestamp": "2026-04-17T10:00:00Z"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

---

### Monitoramento

#### Status do Sistema
**GET** `/trpc/services.monitoring.getSystemStatus`

**Response (200):**
```json
{
  "cpuUsage": 25.5,
  "memoryUsage": 45.2,
  "diskUsage": 60.0,
  "uptime": 86400,
  "services": {
    "whisper": "installed",
    "ollama": "running",
    "evolution": "configured"
  },
  "queues": {
    "messages": 5,
    "transcriptions": 2,
    "aiProcessing": 1
  }
}
```

#### Obter Logs de Serviço
**GET** `/trpc/services.monitoring.getServiceLogs?service=whisper&limit=100`

**Response (200):**
```json
{
  "service": "whisper",
  "logs": [
    {
      "timestamp": "2026-04-17T10:00:00Z",
      "level": "info",
      "message": "Whisper started successfully"
    }
  ],
  "limit": 100
}
```

---

## Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 200 | OK - Requisição bem-sucedida |
| 201 | Created - Recurso criado com sucesso |
| 400 | Bad Request - Requisição inválida |
| 401 | Unauthorized - Não autenticado |
| 403 | Forbidden - Sem permissão |
| 404 | Not Found - Recurso não encontrado |
| 500 | Internal Server Error - Erro do servidor |

---

## Exemplos de Uso

### JavaScript/TypeScript
```typescript
// Login
const loginResponse = await fetch('https://gestor.nossoapp.top/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'admin',
    password: 'Admin@123456'
  })
});

// Listar transações
const transactionsResponse = await fetch(
  'https://gestor.nossoapp.top/api/trpc/financial.list?limit=50&offset=0',
  {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
);
```

### cURL
```bash
# Login
curl -X POST https://gestor.nossoapp.top/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123456"}'

# Listar transações
curl -X GET "https://gestor.nossoapp.top/api/trpc/financial.list?limit=50&offset=0" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

---

## Rate Limiting

Atualmente não há rate limiting implementado. Recomenda-se implementar em produção.

---

## Versão da API
**v1.0.0** - 17 de Abril de 2026
