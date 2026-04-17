# Guia de Deployment - Gestor Financeiro IA

Instruções completas para deploy do Gestor Financeiro IA em VPS com aaPanel.

## 📋 Pré-requisitos

- VPS com Ubuntu 22.04 LTS
- aaPanel instalado e configurado
- MySQL 8.0+
- Node.js 22+
- Domínio configurado (opcional)

## 🚀 Processo de Deployment

### 1. Preparação da VPS

#### 1.1 Atualizar Sistema
```bash
sudo apt-get update
sudo apt-get upgrade -y
```

#### 1.2 Instalar Node.js (se não estiver)
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pnpm
```

#### 1.3 Criar Usuário para Aplicação
```bash
sudo useradd -m -s /bin/bash gestor-app
sudo usermod -aG sudo gestor-app
```

### 2. Configurar Banco de Dados

#### 2.1 Criar Banco de Dados
```bash
mysql -u root -p
```

```sql
CREATE DATABASE gestor_financeiro_ia;
CREATE USER 'gestor_user'@'localhost' IDENTIFIED BY 'senha_muito_segura_aqui';
GRANT ALL PRIVILEGES ON gestor_financeiro_ia.* TO 'gestor_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 2.2 Aplicar Migrações
```bash
cd /www/wwwroot/gestor.nossoapp.top
pnpm install
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

### 3. Configurar Aplicação

#### 3.1 Variáveis de Ambiente
```bash
cd /www/wwwroot/gestor.nossoapp.top
cp .env.example .env
```

Edite `.env` com:
```
DATABASE_URL=mysql://gestor_user:senha_muito_segura_aqui@localhost:3306/gestor_financeiro_ia
JWT_SECRET=gere_uma_chave_aleatoria_muito_segura_aqui_com_32_caracteres_ou_mais
NODE_ENV=production
PORT=3000
```

#### 3.2 Criar Usuário Admin
```bash
node server/seed-admin.mjs
```

### 4. Build e Deploy

#### 4.1 Build da Aplicação
```bash
pnpm build
```

#### 4.2 Configurar PM2 (Process Manager)
```bash
sudo npm install -g pm2
pm2 start dist/index.js --name "gestor-financeiro"
pm2 save
pm2 startup
```

#### 4.3 Verificar Status
```bash
pm2 status
pm2 logs gestor-financeiro
```

### 5. Configurar Web Server (aaPanel)

#### 5.1 Criar Site no aaPanel
1. Acesse aaPanel: https://seu-ip:18129
2. Vá para "Website" → "Add Site"
3. Configure:
   - Domain: `gestor.nossoapp.top`
   - Root: `/www/wwwroot/gestor.nossoapp.top`
   - PHP: Desabilitar (Node.js)

#### 5.2 Configurar Reverse Proxy
1. No aaPanel, vá para "Website" → Seu Site
2. Clique em "Reverse Proxy"
3. Adicione:
   - Proxy Name: `nodejs`
   - Target URL: `http://127.0.0.1:3000`
   - Proxy Path: `/`

#### 5.3 Configurar SSL/TLS
1. No aaPanel, vá para "SSL"
2. Selecione seu domínio
3. Clique em "Let's Encrypt"
4. Configure auto-renew

### 6. Configurar Firewall

#### 6.1 Abrir Portas Necessárias
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw enable
```

#### 6.2 Configurar Fail2Ban (Proteção contra Brute Force)
```bash
sudo apt-get install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 7. Monitoramento e Logs

#### 7.1 Visualizar Logs
```bash
pm2 logs gestor-financeiro
tail -f /www/wwwroot/gestor.nossoapp.top/.manus-logs/devserver.log
```

#### 7.2 Configurar Rotação de Logs
```bash
sudo apt-get install -y logrotate
```

Crie `/etc/logrotate.d/gestor-financeiro`:
```
/www/wwwroot/gestor.nossoapp.top/.manus-logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 gestor-app gestor-app
    sharedscripts
}
```

### 8. Backup Automático

#### 8.1 Script de Backup
Crie `/home/gestor-app/backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/backups/gestor-financeiro"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="gestor_financeiro_ia"
DB_USER="gestor_user"
DB_PASS="senha_muito_segura_aqui"

mkdir -p $BACKUP_DIR

# Backup do banco de dados
mysqldump -u$DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup dos arquivos
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /www/wwwroot/gestor.nossoapp.top

# Manter apenas últimos 30 dias
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup concluído: $DATE"
```

#### 8.2 Agendar Backup
```bash
chmod +x /home/gestor-app/backup.sh
(crontab -l 2>/dev/null; echo "0 2 * * * /home/gestor-app/backup.sh") | crontab -
```

### 9. Verificação Final

#### 9.1 Testar Acesso
```bash
curl -I https://gestor.nossoapp.top
```

#### 9.2 Testar Login
1. Acesse https://gestor.nossoapp.top
2. Login com: `admin` / `Admin@123456`
3. Altere a senha imediatamente

#### 9.3 Verificar Banco de Dados
```bash
mysql -u gestor_user -p gestor_financeiro_ia
SELECT * FROM users;
```

## 🔄 Atualização da Aplicação

### Procedimento de Atualização
```bash
cd /www/wwwroot/gestor.nossoapp.top

# Parar aplicação
pm2 stop gestor-financeiro

# Fazer backup
cp -r . ../backup_$(date +%Y%m%d)

# Atualizar código
git pull origin main

# Instalar dependências
pnpm install

# Aplicar migrações
pnpm drizzle-kit migrate

# Build
pnpm build

# Reiniciar
pm2 start dist/index.js --name "gestor-financeiro"
```

## 🐛 Troubleshooting

### Erro: "Cannot connect to database"
```bash
# Verificar conexão MySQL
mysql -u gestor_user -p -h localhost -D gestor_financeiro_ia -e "SELECT 1;"

# Verificar variáveis de ambiente
cat .env | grep DATABASE_URL
```

### Erro: "Port 3000 already in use"
```bash
# Encontrar processo usando porta
lsof -i :3000

# Matar processo
kill -9 <PID>
```

### Erro: "SSL certificate error"
```bash
# Renovar certificado SSL
certbot renew --force-renewal

# Verificar certificado
openssl x509 -in /etc/letsencrypt/live/gestor.nossoapp.top/cert.pem -text -noout
```

### Aplicação lenta
```bash
# Verificar recursos
top
free -h
df -h

# Verificar logs
pm2 logs gestor-financeiro --lines 100
```

## 📊 Monitoramento Contínuo

### Verificar Status Regularmente
```bash
# Criar script de monitoramento
cat > /home/gestor-app/monitor.sh << 'EOF'
#!/bin/bash
echo "=== Status da Aplicação ==="
pm2 status

echo "=== Uso de Recursos ==="
free -h
df -h

echo "=== Conexão MySQL ==="
mysql -u gestor_user -p -e "SELECT COUNT(*) FROM gestor_financeiro_ia.users;"

echo "=== Logs Recentes ==="
tail -n 20 /www/wwwroot/gestor.nossoapp.top/.manus-logs/devserver.log
EOF

chmod +x /home/gestor-app/monitor.sh
```

## 🆘 Suporte

Para problemas durante o deployment:
1. Verifique logs: `pm2 logs gestor-financeiro`
2. Verifique conectividade: `curl localhost:3000`
3. Verifique banco de dados: `mysql -u gestor_user -p`
4. Revise variáveis de ambiente: `cat .env`

---

**Última Atualização**: 17/04/2026  
**Versão**: 1.0.0
