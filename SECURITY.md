# Guia de Segurança - Gestor Financeiro IA

## 🔐 Princípios de Segurança

Este documento descreve as práticas de segurança implementadas no Gestor Financeiro IA e recomendações para manutenção segura do sistema.

## 🛡️ Segurança Implementada

### Autenticação
- **Independência Total**: Sem OAuth, Google, Manus ou serviços externos
- **Criptografia de Senha**: bcrypt com salt de 10 rounds
- **Sessões JWT**: Token seguro com expiração configurável
- **Proteção de Cookies**: HttpOnly, Secure, SameSite

### Validação de Dados
- **Zod Schema Validation**: Validação de entrada em todas as APIs
- **Type Safety**: TypeScript garante tipos corretos
- **SQL Injection Prevention**: Drizzle ORM com prepared statements

### Autorização
- **Role-Based Access Control**: Usuários e admins
- **Protected Procedures**: tRPC procedures com autenticação obrigatória
- **User Isolation**: Cada usuário só vê seus dados

## 🔑 Gerenciamento de Credenciais

### Senhas
1. **Requisitos Mínimos**:
   - Mínimo 8 caracteres
   - Pelo menos 1 letra maiúscula
   - Pelo menos 1 número
   - Pelo menos 1 caractere especial

2. **Alteração de Senha**:
   - Altere a senha padrão imediatamente após o primeiro login
   - Use senhas únicas e complexas
   - Nunca compartilhe suas credenciais

3. **Recuperação de Senha**:
   - Não há função de "esqueci a senha" por design (sistema independente)
   - Admin pode resetar senha de usuários via SQL direto
   - Mantenha backup seguro das credenciais

### Variáveis de Ambiente
1. **JWT_SECRET**:
   - Mínimo 32 caracteres aleatórios
   - Regenere periodicamente
   - Nunca commit no repositório

2. **DATABASE_URL**:
   - Use credenciais fortes do MySQL
   - Não exponha em logs
   - Use SSL/TLS para conexão

## 🚀 Deployment Seguro

### Pré-Deployment
1. Altere todas as senhas padrão
2. Gere novos JWT_SECRET
3. Configure HTTPS/SSL
4. Ative firewall
5. Configure rate limiting
6. Revise variáveis de ambiente

### Produção
1. Use HTTPS obrigatoriamente
2. Configure CORS restritivamente
3. Ative logs de segurança
4. Implemente monitoramento
5. Faça backups regulares
6. Use VPN para acesso admin

### Banco de Dados
1. Use credenciais fortes
2. Restrinja acesso por IP
3. Ative SSL/TLS
4. Faça backups criptografados
5. Implemente replicação
6. Monitore acessos

## 🔍 Monitoramento de Segurança

### Logs a Monitorar
- Tentativas de login falhadas
- Acessos não autorizados
- Modificações de dados sensíveis
- Erros de banco de dados
- Atividades de admin

### Alertas Recomendados
- Múltiplas tentativas de login falhadas
- Acesso de IP desconhecido
- Alteração de configurações críticas
- Erros de conexão com banco de dados
- Uso anormal de recursos

## 🛡️ Proteção contra Ataques Comuns

### SQL Injection
- ✅ Drizzle ORM com prepared statements
- ✅ Validação de entrada com Zod
- ✅ Nunca concatene queries

### XSS (Cross-Site Scripting)
- ✅ React escapa conteúdo por padrão
- ✅ Sanitização de entrada
- ✅ Content Security Policy recomendada

### CSRF (Cross-Site Request Forgery)
- ✅ SameSite cookies
- ✅ CORS configurado
- ✅ Token validation em mutações

### Brute Force
- ✅ Rate limiting recomendado
- ✅ Bloqueio temporário após tentativas
- ✅ Logs de tentativas

## 📋 Checklist de Segurança

Antes de colocar em produção:

- [ ] Senha admin alterada
- [ ] JWT_SECRET gerado novo
- [ ] HTTPS/SSL configurado
- [ ] Firewall ativo
- [ ] Backup do banco de dados
- [ ] Logs de segurança ativados
- [ ] Rate limiting configurado
- [ ] CORS restritivo
- [ ] Variáveis de ambiente seguras
- [ ] Acesso SSH restrito
- [ ] Monitoramento ativo
- [ ] Plano de resposta a incidentes

## 🚨 Resposta a Incidentes

### Suspeita de Comprometimento
1. Isole o servidor imediatamente
2. Faça backup dos logs
3. Revise acessos recentes
4. Altere todas as senhas
5. Regenere JWT_SECRET
6. Analise logs de banco de dados
7. Verifique integridade de dados

### Vazamento de Credenciais
1. Altere senha do usuário imediatamente
2. Revise atividades do usuário
3. Revise logs de acesso
4. Considere reset de JWT_SECRET
5. Notifique o usuário

### Ataque de Força Bruta
1. Identifique IP atacante
2. Bloqueie IP no firewall
3. Revise tentativas de login
4. Implemente rate limiting mais restritivo
5. Considere 2FA

## 📚 Recursos Adicionais

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [MySQL Security](https://dev.mysql.com/doc/refman/8.0/en/security.html)

## 📞 Suporte de Segurança

Para relatar vulnerabilidades:
1. NÃO publique em issues públicas
2. Contate administrador diretamente
3. Forneça detalhes técnicos
4. Aguarde confirmação e patch

---

**Última Atualização**: 17/04/2026  
**Versão**: 1.0.0
