# Gestor Financeiro IA - TODO List

## Backend & Infrastructure
- [x] Autenticação independente (username/password) sem OAuth
- [x] Estrutura de banco de dados MySQL com tabelas de usuários, transações, configurações
- [x] API REST/tRPC para gerenciamento de usuários
- [ ] Integração com Evolution API para WhatsApp
- [ ] Sistema de gerenciamento de serviços (Whisper, Ollama) via backend
- [ ] Instalação automática de Whisper
- [ ] Instalação automática de Ollama
- [ ] API para controlar Whisper (iniciar, parar, listar modelos, transcrever)
- [ ] API para controlar Ollama (iniciar, parar, listar modelos, download, remoção)
- [ ] Lógica de fluxo de mensagens WhatsApp (receber, processar, responder)
- [ ] Integração com Whisper para transcrição de voz
- [ ] Integração com Ollama para interpretação de mensagens
- [ ] API para painel financeiro (CRUD de transações)
- [ ] API para visualização e gerenciamento de banco de dados
- [ ] Monitoramento de sistema (CPU, memória, status dos serviços)
- [ ] Sistema de logs para todas as operações

## Frontend - Landing Page
- [x] Design elegante e sofisticado da landing page
- [x] Apresentação do sistema
- [x] Acesso ao login
- [x] Responsividade completa

## Frontend - Painel Web
- [x] Layout principal do painel com navegação
- [x] Autenticação (login/logout) com username e password
- [x] Dashboard principal com visão geral do sistema
- [ ] Seção de Gerenciamento de Serviços
  - [ ] Instalação de Whisper
  - [ ] Instalação de Ollama
  - [ ] Status dos serviços (online/offline)
  - [ ] Iniciar/parar/reiniciar serviços
  - [ ] Visualização de logs
- [ ] Seção de Gerenciamento WhatsApp
  - [ ] Exibição de QR Code
  - [ ] Status da conexão
  - [ ] Reconexão
  - [ ] Logs de mensagens
- [ ] Seção de Gerenciamento de Voz (Whisper)
  - [ ] Instalação automática
  - [ ] Ativação/desativação
  - [ ] Seleção de modelo
  - [ ] Configuração de idioma
  - [ ] Limite de áudio
  - [ ] Teste de transcrição
  - [ ] Visualização de logs
- [ ] Seção de Gerenciamento de IA (Ollama)
  - [ ] Instalação automática
  - [ ] Início/parada do serviço
  - [ ] Listagem de modelos
  - [ ] Download de modelos
  - [ ] Remoção de modelos
  - [ ] Definição de regras de uso
  - [ ] Configuração de parâmetros (temperatura, limite, timeout)
- [ ] Seção de Testes de IA
  - [ ] Input para digitar frases
  - [ ] Exibição de resultado por regras
  - [ ] Exibição de resultado por IA
  - [ ] Exibição de resultado final
- [ ] Painel Financeiro
  - [ ] Visualização de saldo
  - [ ] Listagem de transações
  - [ ] Edição de transações
  - [ ] Exclusão de transações
  - [ ] Filtragem de transações
  - [ ] Adição manual de transações
- [ ] Gerenciamento de Banco de Dados
  - [ ] Visualização de tabelas
  - [ ] Edição de dados
  - [ ] Backup manual
  - [ ] Restore
- [ ] Monitoramento em Tempo Real
  - [ ] Uso de CPU
  - [ ] Uso de memória
  - [ ] Status da IA
  - [ ] Filas de processamento

## Design & UX
- [ ] Paleta de cores elegante e sofisticada
- [ ] Tipografia refinada
- [ ] Componentes visuais consistentes
- [ ] Animações e transições suaves
- [ ] Responsividade em todos os dispositivos
- [ ] Acessibilidade (WCAG)

## Segurança
- [ ] Validação de entradas
- [ ] Proteção contra erros
- [ ] Criptografia de senhas
- [ ] Sessões seguras
- [ ] CSRF protection
- [ ] Rate limiting

## Testes
- [ ] Testes unitários do backend
- [ ] Testes de integração
- [ ] Testes end-to-end
- [ ] Testes de autenticação
- [ ] Testes de fluxo de mensagens

## Deployment & Documentação
- [ ] Documentação do sistema
- [ ] Guia de instalação
- [ ] Guia de uso
- [ ] Documentação de API
