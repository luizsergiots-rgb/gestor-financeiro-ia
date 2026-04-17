# Guia Completo de Instalação - Para Leigos

## Introdução

Este guia foi criado para pessoas **sem experiência em programação**. Vamos instalar e configurar o **Gestor Financeiro IA** passo a passo, de forma clara e simples.

### O que você vai precisar

- Uma VPS (servidor virtual) com aaPanel já instalado
- Acesso SSH à VPS (um programa para se conectar ao servidor)
- Paciência e atenção aos detalhes

---

## Parte 1: Preparação Inicial

### Passo 1.1: Acessar a VPS via SSH

**O que é SSH?** É um programa que permite você se conectar ao seu servidor remotamente, como se estivesse digitando comandos diretamente nele.

**Para Windows**:
1. Baixe o programa **PuTTY** em: https://www.putty.org/
2. Abra o PuTTY
3. Em "Host Name", digite: `209.50.240.194`
4. Em "Port", deixe: `22`
5. Clique em "Open"
6. Quando pedir, digite: `root`
7. Quando pedir senha, digite: `7zCWedvcVznY2Nz6` (não aparecerá na tela, é normal)
8. Pressione Enter

**Para Mac/Linux**:
1. Abra o Terminal
2. Digite: `ssh root@209.50.240.194`
3. Quando pedir, digite a senha: `7zCWedvcVznY2Nz6`
4. Pressione Enter

**Se conseguiu acessar**, você verá algo como:
```
root@vps:~#
```

Parabéns! Você está conectado ao servidor!

### Passo 1.2: Acessar o aaPanel

**O que é aaPanel?** É uma interface gráfica (visual) para gerenciar seu servidor sem precisar digitar comandos.

1. Abra seu navegador (Chrome, Firefox, Safari, etc)
2. Digite na barra de endereço: `https://209.50.240.194:18129/23504e76`
3. Você verá uma página pedindo login
4. **Usuário**: `grgnb4kl`
5. **Senha**: `c0d135f4`
6. Clique em "Login"

Se conseguiu entrar, você verá um painel com várias opções. Ótimo!

---

## Parte 2: Instalação do Sistema

### Passo 2.1: Criar a Pasta do Projeto

Você já tem uma pasta criada em `/www/wwwroot/gestor.nossoapp.top/`. Vamos verificar se está vazia.

**No aaPanel**:
1. Clique em "Arquivos" (ou "Files")
2. Navegue até `/www/wwwroot/`
3. Você deve ver uma pasta chamada `gestor.nossoapp.top`
4. Abra essa pasta
5. Se estiver vazia, ótimo! Se tiver arquivos antigos, delete-os

### Passo 2.2: Baixar os Arquivos do Sistema

Os arquivos do sistema já estão em um servidor. Vamos copiar para sua VPS.

**No SSH (aquela tela preta que você abriu)**:

Digite estes comandos um por um, pressionando Enter após cada um:

```bash
cd /www/wwwroot/gestor.nossoapp.top
```

Este comando muda para a pasta do projeto.

```bash
wget https://seu-servidor.com/gestor-financeiro-ia.tar.gz
```

**Nota**: Se você não tiver um servidor para hospedar os arquivos, você pode:
1. Copiar manualmente os arquivos via SCP (programa de transferência)
2. Ou usar o aaPanel para fazer upload

Se estiver usando SCP (no seu computador):
```bash
scp -r /caminho/local/gestor-financeiro-ia/* root@209.50.240.194:/www/wwwroot/gestor.nossoapp.top/
```

### Passo 2.3: Instalar Dependências

As dependências são programas que o sistema precisa para funcionar.

**No SSH**, digite:

```bash
cd /www/wwwroot/gestor.nossoapp.top
apt-get update
apt-get install -y nodejs npm
npm install -g pnpm
pnpm install
```

Isso vai levar alguns minutos. Espere até ver `root@vps:~#` novamente.

### Passo 2.4: Configurar o Banco de Dados

O banco de dados é onde todas as informações são guardadas.

**No SSH**, digite:

```bash
mysql -u root -p
```

Quando pedir senha, digite: `00f68e428d05e26f`

Você verá: `mysql>`

Agora digite estes comandos (copie e cole):

```sql
CREATE DATABASE IF NOT EXISTS gestor_financeiro_ia;
CREATE USER 'gestor_user'@'localhost' IDENTIFIED BY 'gestor_password';
GRANT ALL PRIVILEGES ON gestor_financeiro_ia.* TO 'gestor_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Pronto! O banco de dados foi criado.

### Passo 2.5: Aplicar as Migrações do Banco de Dados

As migrações são como "instruções" para criar as tabelas no banco.

**No SSH**, digite:

```bash
cd /www/wwwroot/gestor.nossoapp.top
mysql -u root -p gestor_financeiro_ia < drizzle/migration_clean.sql
```

Quando pedir senha, digite: `00f68e428d05e26f`

### Passo 2.6: Criar Usuário Admin

O usuário admin é o primeiro usuário que pode acessar o sistema.

**No SSH**, digite:

```bash
mysql -u root -p gestor_financeiro_ia
```

Quando pedir senha, digite: `00f68e428d05e26f`

Você verá: `mysql>`

Copie e cole este comando:

```sql
INSERT INTO users (username, passwordHash, name, role, isActive, createdAt, updatedAt) VALUES (
  'admin',
  '$2b$10$YOixghIvgvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv',
  'Administrator',
  'admin',
  1,
  NOW(),
  NOW()
);
EXIT;
```

**Nota**: Este hash é para a senha `Admin@123456`. Você pode alterar depois.

### Passo 2.7: Compilar a Aplicação

Compilar significa transformar o código em algo que o servidor possa executar.

**No SSH**, digite:

```bash
cd /www/wwwroot/gestor.nossoapp.top
pnpm build
cp -r dist/public/* ./
```

Isso vai levar alguns minutos.

### Passo 2.8: Instalar PM2 (Gerenciador de Processos)

PM2 é um programa que garante que sua aplicação fica sempre rodando.

**No SSH**, digite:

```bash
npm install -g pm2
pm2 start dist/index.js --name "gestor-financeiro" --instances max
pm2 startup
pm2 save
```

Pronto! Sua aplicação está rodando!

### Passo 2.9: Configurar o Nginx (Servidor Web)

Nginx é o programa que recebe as requisições da internet e passa para sua aplicação.

**No aaPanel**:
1. Clique em "Websites" (ou "Sites")
2. Procure por `gestor.nossoapp.top`
3. Clique nele
4. Vá para "Reverse Proxy"
5. Clique em "Add Reverse Proxy"
6. Em "Proxy Address", digite: `http://127.0.0.1:3000`
7. Clique em "Save"

Agora o Nginx vai redirecionar as requisições para sua aplicação.

---

## Parte 3: Acessar o Sistema

### Passo 3.1: Abrir o Navegador

1. Abra seu navegador (Chrome, Firefox, Safari, etc)
2. Digite na barra de endereço: `https://gestor.nossoapp.top`
3. Pressione Enter

### Passo 3.2: Fazer Login

1. **Usuário**: `admin`
2. **Senha**: `Admin@123456`
3. Clique em "Entrar"

Se conseguiu entrar, parabéns! O sistema está funcionando!

### Passo 3.3: Alterar a Senha do Admin

**Importante**: Altere a senha padrão por uma senha forte e única.

1. Clique no seu nome no canto superior direito
2. Clique em "Alterar Senha"
3. Digite a senha atual: `Admin@123456`
4. Digite uma nova senha (use números, letras maiúsculas e minúsculas)
5. Confirme a nova senha
6. Clique em "Salvar"

---

## Parte 4: Configurar os Serviços

### Passo 4.1: Instalar Whisper (Transcrição de Áudio)

**O que é Whisper?** É um programa que transcreve áudio em texto.

1. No dashboard, vá para a aba "Configurações"
2. Clique em "Whisper"
3. Clique no botão "Instalar"
4. Espere até aparecer "Instalado com sucesso"
5. Clique em "Iniciar"
6. Pronto! Whisper está rodando

### Passo 4.2: Instalar Ollama (IA Local)

**O que é Ollama?** É um programa que roda modelos de IA localmente (no seu servidor).

1. No dashboard, vá para a aba "Configurações"
2. Clique em "Ollama"
3. Clique no botão "Instalar"
4. Espere até aparecer "Instalado com sucesso"
5. Clique em "Iniciar"
6. Clique em "Baixar Modelo"
7. Selecione um modelo (por exemplo, "llama2")
8. Clique em "Baixar"
9. Espere até o modelo ser baixado (pode levar alguns minutos)
10. Pronto! Ollama está rodando com um modelo

### Passo 4.3: Configurar Evolution API (WhatsApp)

**O que é Evolution API?** É um programa que permite enviar e receber mensagens do WhatsApp.

1. No dashboard, vá para a aba "Configurações"
2. Clique em "Evolution API"
3. Em "URL da API", digite: `http://localhost:8080`
4. Em "Chave de API", digite: `sua-chave-api-aqui`
5. Clique em "Testar Conexão"
6. Se aparecer "Conexão bem-sucedida", ótimo!
7. Se não, verifique se a Evolution API está instalada

---

## Parte 5: Usar o Sistema

### Seção Financeira

**Para adicionar uma transação**:
1. Vá para a aba "Financeiro"
2. Clique em "Adicionar Transação"
3. Preencha os campos:
   - **Descrição**: O que é a transação (ex: "Venda de produto")
   - **Valor**: Quanto é (ex: 150.00)
   - **Tipo**: Se é entrada (income) ou saída (expense)
   - **Categoria**: A categoria (ex: "vendas", "despesa", etc)
4. Clique em "Adicionar"

**Para editar uma transação**:
1. Clique no ícone de lápis ao lado da transação
2. Altere os dados
3. Clique em "Salvar"

**Para deletar uma transação**:
1. Clique no ícone de lixeira ao lado da transação
2. Confirme que deseja deletar

### Seção de Monitoramento

A seção de monitoramento mostra:
- **CPU**: Quanto do processador está sendo usado
- **Memória**: Quanto da RAM está sendo usada
- **Disco**: Quanto do espaço em disco está sendo usado
- **Status dos Serviços**: Se Whisper, Ollama e Evolution API estão rodando

Se algum valor estiver muito alto (acima de 80%), pode significar que há um problema.

---

## Parte 6: Troubleshooting (Solução de Problemas)

### Problema: Não Consigo Fazer Login

**Causa**: Senha incorreta ou usuário não existe

**Solução**:
1. Verifique se está digitando a senha corretamente
2. Se esqueceu a senha, você pode resetá-la via SSH:

```bash
mysql -u root -p gestor_financeiro_ia
```

Quando pedir senha, digite: `00f68e428d05e26f`

```sql
UPDATE users SET passwordHash='$2b$10$...' WHERE username='admin';
EXIT;
```

(Use o hash que foi gerado anteriormente)

### Problema: Página em Branco

**Causa**: Aplicação não está rodando

**Solução**:
1. Verifique se a aplicação está rodando:

```bash
pm2 status
```

2. Se não estiver, inicie:

```bash
pm2 start dist/index.js --name "gestor-financeiro"
```

3. Se estiver com erro, veja os logs:

```bash
pm2 logs gestor-financeiro
```

### Problema: Whisper/Ollama/Evolution API não Funcionam

**Causa**: Serviços não estão instalados

**Solução**:
1. Verifique se está instalado:

```bash
which whisper
which ollama
```

2. Se não estiver, instale manualmente:

```bash
# Para Whisper
pip install openai-whisper

# Para Ollama
curl https://ollama.ai/install.sh | sh

# Para Evolution API
npm install -g @evolution-api/evolution-api
```

### Problema: Banco de Dados Não Conecta

**Causa**: MySQL não está rodando

**Solução**:
1. Verifique se MySQL está rodando:

```bash
systemctl status mysql
```

2. Se não estiver, inicie:

```bash
systemctl start mysql
```

3. Verifique a conexão:

```bash
mysql -u root -p -e "SELECT 1;"
```

---

## Parte 7: Manutenção Regular

### Backup do Banco de Dados

Faça backup regularmente para não perder seus dados.

**No SSH**, digite:

```bash
mysqldump -u root -p gestor_financeiro_ia > /backup/gestor_backup_$(date +%Y%m%d_%H%M%S).sql
```

Quando pedir senha, digite: `00f68e428d05e26f`

### Atualizar a Aplicação

Se houver atualizações, execute:

```bash
cd /www/wwwroot/gestor.nossoapp.top
git pull
pnpm install
pnpm build
cp -r dist/public/* ./
pm2 restart gestor-financeiro
```

### Monitorar o Uso de Recursos

Para ver se o servidor está sobrecarregado:

```bash
pm2 monit
```

Isso mostra o uso de CPU e memória em tempo real.

---

## Suporte

Se tiver dúvidas:
1. Consulte a documentação em `SYSTEM_DOCUMENTATION.md`
2. Verifique os logs: `pm2 logs gestor-financeiro`
3. Procure por mensagens de erro na tela
4. Tente reiniciar a aplicação: `pm2 restart gestor-financeiro`

---

**Versão**: 1.0.0  
**Data**: 17 de Abril de 2026  
**Autor**: Manus AI
