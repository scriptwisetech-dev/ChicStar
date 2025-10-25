# Instruções de Instalação - ChicStar

## Guia Rápido de Instalação

### 1. Instalar Node.js
- Baixe e instale o Node.js em: https://nodejs.org/
- Versão recomendada: 16.x ou superior

### 2. Navegar para a Pasta Backend
```bash
cd backend
```

### 3. Instalar Dependências
```bash
npm install
```

### 4. Executar o Sistema
```bash
npm start
```

### 5. Acessar o Sistema
- Site: http://localhost:3000
- API: http://localhost:3000/api

## Comandos Disponíveis

- `npm start` - Executa o servidor em modo produção
- `npm run dev` - Executa o servidor em modo desenvolvimento (com auto-reload)
- `npm test` - Executa os testes (quando implementados)

## Checklist de Instalação

- [ ] Node.js instalado (versão 14+)
- [ ] Navegou para a pasta `backend`
- [ ] Dependências instaladas (`npm install`)
- [ ] Servidor executando (`npm start`)
- [ ] Site acessível em http://localhost:3000
- [ ] Modal de login funcionando
- [ ] Modal de cadastro funcionando
- [ ] Sistema de autenticação funcionando
- [ ] Banco de dados criado automaticamente

## Problemas Comuns

### Erro: "Port already in use"
**Solução**: Altere a porta no arquivo `backend/server.js` ou use:
```bash
PORT=3001 npm start
```

### Erro: "Cannot find module"
**Solução**: Reinstale as dependências:
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Modal não abre
**Solução**: Verifique se o arquivo `frontend/js/app.js` está sendo carregado corretamente no HTML.

### Erro de caminho de arquivos
**Solução**: Certifique-se de estar executando o servidor da pasta `backend` e que a estrutura de pastas está correta.

## Suporte

Se encontrar problemas durante a instalação:
1. Verifique se todas as dependências foram instaladas
2. Confirme se a porta 3000 está disponível
3. Verifique os logs do console para erros específicos
4. Entre em contato: suporte@chicstar.com
