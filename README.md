# ChicStar - Loja de Joias Online

Olá! Este é o projeto da ChicStar, uma loja de joias online que desenvolvi com muito carinho. Aqui você encontra um sistema completo de login, cadastro e gerenciamento de produtos, tudo funcionando de forma integrada entre frontend e backend.

## Como está organizado o projeto

```
App_estudafacil/
├── frontend/                    # Parte visual do site
│   ├── ChicStar.html           # Página principal
│   ├── css/
│   │   └── style.css           # Estilos e cores do site
│   ├── js/
│   │   └── app.js              # JavaScript que faz tudo funcionar
│   └── img/                    # Todas as imagens
│       ├── logo.png
│       ├── logotratada.png
│       ├── anelparalanding.png
│       ├── Produto_1.png
│       ├── Produto_2.png
│       └── Produto_3.png
├── backend/                     # Servidor que roda por trás
│   ├── server.js               # Arquivo principal do servidor
│   ├── package.json            # Lista de dependências
│   ├── routes/                 # Rotas da API (ainda vou implementar)
│   ├── middleware/             # Middlewares (ainda vou implementar)
│   ├── models/                 # Modelos de dados (ainda vou implementar)
│   └── database.json           # Banco de dados (cria sozinho quando roda)
├── README.md                   # Este arquivo aqui
└── INSTALACAO.md              # Como instalar e rodar
```

## O que já funciona

### Login e Cadastro
- Sistema de login completo e funcional
- Cadastro de novos clientes com validação
- Tokens JWT para manter a sessão segura (dura 7 dias)
- Opção "Lembrar de mim" que salva no navegador
- Logout que limpa tudo certinho

### Área do Cliente
- Perfil do usuário onde pode editar os dados
- Menu dropdown com opções de navegação
- Contadores de pedidos e favoritos
- Validação em tempo real nos formulários

### Produtos
- Catálogo que carrega os produtos do servidor
- Sistema de favoritos por usuário
- Botões para comprar e favoritar
- Funciona bem em celular, tablet e computador

### Visual
- Design bonito com cores douradas e marrons
- Modais elegantes para login, cadastro e perfil
- Notificações que aparecem quando você faz alguma ação
- Animações suaves e responsivo para todos os dispositivos

## Como rodar o projeto

### O que você precisa ter instalado
- Node.js (versão 14 ou mais recente)
- npm (vem junto com o Node.js)

### Passo a passo para rodar

1. **Entre na pasta do backend**
   ```bash
   cd backend
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Rode o servidor**
   ```bash
   # Para usar normalmente
   npm start
   
   # Para desenvolvimento (recarrega sozinho quando você muda algo)
   npm run dev
   ```

4. **Acesse o site**
   - Site: http://localhost:3000
   - API: http://localhost:3000/api

## Rotas da API

Se você quiser entender como o backend funciona, aqui estão as rotas que implementei:

### Login e Cadastro
- `GET /api/verify-token` - Verifica se o token ainda é válido
- `POST /api/cadastro` - Cadastra um novo cliente
- `POST /api/login` - Faz o login do usuário
- `GET /api/cliente/:email` - Busca os dados de um cliente
- `PUT /api/cliente/:email` - Atualiza o perfil do cliente

### Produtos
- `GET /api/produtos` - Lista todos os produtos
- `GET /api/produto/:id` - Busca um produto específico

### Favoritos
- `POST /api/favoritos/:email` - Adiciona produto aos favoritos
- `DELETE /api/favoritos/:email/:produtoId` - Remove produto dos favoritos

### Pedidos
- `POST /api/pedido/:email` - Cria um novo pedido
- `GET /api/pedidos/:email` - Lista os pedidos do cliente

## Segurança

Tomei alguns cuidados para deixar o sistema seguro:

- **Senhas criptografadas**: Uso bcrypt para não salvar senhas em texto puro
- **Tokens JWT**: Sistema de autenticação que expira em 7 dias
- **Validação de dados**: Todos os dados que entram são validados
- **CORS configurado**: Controle de acesso entre diferentes domínios
- **Middleware de autenticação**: Proteção das rotas que precisam de login

## Banco de Dados

Por enquanto estou usando um arquivo JSON simples (`backend/database.json`) que é criado automaticamente quando você roda o projeto pela primeira vez. A estrutura é assim:

```json
{
  "clientes": [],
  "produtos": [
    {
      "id": 1,
      "nome": "Anel Diamante",
      "descricao": "Elegância atemporal com brilho excepcional",
      "preco": 2500.00,
      "imagem": "img/Produto_1.png",
      "categoria": "aneis",
      "estoque": 5
    }
  ],
  "pedidos": [],
  "configuracoes": {
    "descontoBoasVindas": 10,
    "codigoDesconto": "WELCOME10"
  }
}
```

*Nota: Futuramente pretendo migrar para um banco de dados real como PostgreSQL ou MongoDB.*

## Como usar o site

### Se você ainda não tem conta:
1. Acesse http://localhost:3000
2. Clique em "Entrar" para fazer login
3. Ou clique em "Cadastrar-se" para criar uma conta nova
4. Quando se cadastrar, você ganha um desconto de boas-vindas!

### Se você já tem conta:
1. Seu nome aparece no topo da página
2. Clique no seu nome para ver o menu:
   - Meu Perfil (editar seus dados)
   - Meus Pedidos (ver o que você comprou)
   - Favoritos (produtos que você salvou)
   - Sair (fazer logout)
3. Você pode favoritar produtos e fazer pedidos

## Tecnologias que usei

### Frontend
- **HTML5**: Para estruturar as páginas
- **CSS3**: Para deixar tudo bonito com flexbox e grid
- **JavaScript ES6+**: Para fazer tudo funcionar de forma interativa
- **Google Fonts**: Fontes bonitas (Lora + Montserrat)

### Backend
- **Node.js**: Para rodar JavaScript no servidor
- **Express.js**: Framework que facilita criar APIs
- **bcrypt**: Para criptografar senhas
- **jsonwebtoken**: Para criar tokens de autenticação
- **cors**: Para permitir acesso entre diferentes domínios

## Funciona em qualquer dispositivo

O site foi feito para funcionar bem em:
- **Computador**: Layout completo com todas as funcionalidades
- **Tablet**: Layout adaptado para telas médias
- **Celular**: Interface otimizada para mobile

## O que ainda quero implementar

Tenho algumas ideias para melhorar ainda mais o projeto:
- **Sistema de pagamento**: Integrar com gateways como PagSeguro ou Mercado Pago
- **Email marketing**: Enviar newsletters automáticas
- **Painel admin**: Área para gerenciar produtos e pedidos
- **Relatórios**: Analytics de vendas e comportamento dos usuários
- **Login social**: Entrar com Google, Facebook, etc.
- **App mobile**: Versão nativa para Android e iOS

## Problemas que podem aparecer

Se algo não estiver funcionando, tente essas soluções:

1. **Erro de porta ocupada**
   ```bash
   # Mude a porta no arquivo backend/server.js ou rode assim:
   PORT=3001 npm start
   ```

2. **Erro nas dependências**
   ```bash
   # Reinstale tudo:
   cd backend
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Problema com o banco de dados**
   ```bash
   # Delete o arquivo para recriar:
   cd backend
   rm database.json
   npm start
   ```

4. **Modal não abre**
   Verifique se o arquivo `frontend/js/app.js` está sendo carregado corretamente no HTML.

## Contato

Se tiver alguma dúvida ou sugestão:
- **Email**: suporte@chicstar.com
- **GitHub**: [Criar issue](https://github.com/chicstar/app-estudafacil/issues)

## Licença

Este projeto está sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## Quer contribuir?

Contribuições são muito bem-vindas! Se quiser ajudar:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---
