// ChicStar Backend - Servidor Principal
// sistema completo de autenticacao e gerenciamento

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'chicstar_secret_key_2025';

// middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// arquivo de banco de dados simples (JSON)
const DB_FILE = path.join(__dirname, 'database.json');

// inicializar banco de dados se nao existir
async function initDatabase() {
    try {
        await fs.access(DB_FILE);
    } catch (error) {
        // arquivo nao existe, criar com estrutura inicial
        const initialData = {
            clientes: [],
            produtos: [
                {
                    id: 1,
                    nome: 'Conjunto Flor de Versalhes',
                    descricao: 'Um conjunto dourado inspirado nos jardins reais de Versalhes. Três camadas de colares e brincos em formato de coração que irradiam sofisticação e encanto.',
                    preco: 2500.00,
                    imagem: 'img/Produto_1.png',
                    categoria: 'aneis',
                    estoque: 5
                },
                {
                    id: 2,
                    nome: 'Conjunto Amour Élégant',
                    descricao: 'Design minimalista e marcante. Corrente longa com corações delicadamente entrelaçados — símbolo de amor atemporal e elegância pura.',
                    preco: 1800.00,
                    imagem: 'img/Produto_2.png',
                    categoria: 'pulseiras',
                    estoque: 3
                },
                {
                    id: 3,
                    nome: 'Conjunto Império do Amor',
                    descricao: 'Um toque de realeza em cada detalhe. Correntes douradas com corações e pedras brilhantes que refletem luxo e romantismo.',
                    preco: 3200.00,
                    imagem: 'img/Produto_3.png',
                    categoria: 'colares',
                    estoque: 2
                }
            ],
            pedidos: [],
            configuracoes: {
                descontoBoasVindas: 10,
                codigoDesconto: 'WELCOME10'
            }
        };
        
        await fs.writeFile(DB_FILE, JSON.stringify(initialData, null, 2));
        console.log('Banco de dados inicializado com sucesso!');
    }
}

// funcoes auxiliares para banco de dados
async function readDatabase() {
    try {
        const data = await fs.readFile(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erro ao ler banco de dados:', error);
        throw error;
    }
}

async function writeDatabase(data) {
    try {
        await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Erro ao escrever banco de dados:', error);
        throw error;
    }
}

// middleware de autenticacao
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token de acesso necessário' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido' });
        }
        req.user = user;
        next();
    });
}

// rotas da API

// rota principal - servir o site
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/ChicStar.html'));
});

// verificar token
app.get('/api/verify-token', authenticateToken, (req, res) => {
    res.json({ 
        message: 'Token válido',
        user: req.user
    });
});

// cadastro de cliente
app.post('/api/cadastro', async (req, res) => {
    try {
        const { nome, email, telefone, senha, confirmarSenha, aceitaTermos, aceitaNewsletter } = req.body;

        // validacoes
        if (!nome || !email || !telefone || !senha || !confirmarSenha) {
            return res.status(400).json({ message: 'Todos os campos obrigatórios devem ser preenchidos' });
        }

        if (senha !== confirmarSenha) {
            return res.status(400).json({ message: 'As senhas não coincidem' });
        }

        if (!aceitaTermos) {
            return res.status(400).json({ message: 'Você deve aceitar os termos de uso' });
        }

        // verificar se email ja existe
        const db = await readDatabase();
        const clienteExistente = db.clientes.find(cliente => cliente.email === email);
        
        if (clienteExistente) {
            return res.status(400).json({ message: 'Este email já está cadastrado' });
        }

        // hash da senha
        const saltRounds = 10;
        const senhaHash = await bcrypt.hash(senha, saltRounds);

        // criar novo cliente
        const novoCliente = {
            id: Date.now(),
            nome,
            email,
            telefone,
            senha: senhaHash,
            aceitaNewsletter: aceitaNewsletter || false,
            dataCadastro: new Date().toISOString(),
            ultimoAcesso: new Date().toISOString(),
            status: 'ativo',
            pedidos: [],
            favoritos: []
        };

        // salvar no banco
        db.clientes.push(novoCliente);
        await writeDatabase(db);

        // gerar token JWT
        const token = jwt.sign(
            { 
                id: novoCliente.id, 
                email: novoCliente.email,
                nome: novoCliente.nome
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // resposta sem dados sensiveis
        const clienteResponse = {
            id: novoCliente.id,
            nome: novoCliente.nome,
            email: novoCliente.email,
            telefone: novoCliente.telefone,
            aceitaNewsletter: novoCliente.aceitaNewsletter,
            dataCadastro: novoCliente.dataCadastro,
            token
        };

        res.status(201).json({
            message: 'Cliente cadastrado com sucesso!',
            cliente: clienteResponse,
            desconto: db.configuracoes.descontoBoasVindas,
            codigoDesconto: db.configuracoes.codigoDesconto
        });

    } catch (error) {
        console.error('Erro no cadastro:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// login de cliente
app.post('/api/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ message: 'Email e senha são obrigatórios' });
        }

        const db = await readDatabase();
        const cliente = db.clientes.find(c => c.email === email);

        if (!cliente) {
            return res.status(401).json({ message: 'Email ou senha incorretos' });
        }

        const senhaValida = await bcrypt.compare(senha, cliente.senha);
        if (!senhaValida) {
            return res.status(401).json({ message: 'Email ou senha incorretos' });
        }

        // atualizar ultimo acesso
        cliente.ultimoAcesso = new Date().toISOString();
        await writeDatabase(db);

        // gerar token JWT
        const token = jwt.sign(
            { 
                id: cliente.id, 
                email: cliente.email,
                nome: cliente.nome
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        const clienteResponse = {
            id: cliente.id,
            nome: cliente.nome,
            email: cliente.email,
            telefone: cliente.telefone,
            aceitaNewsletter: cliente.aceitaNewsletter,
            dataCadastro: cliente.dataCadastro,
            ultimoAcesso: cliente.ultimoAcesso,
            token
        };

        res.json({
            message: 'Login realizado com sucesso!',
            cliente: clienteResponse
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// buscar dados do cliente
app.get('/api/cliente/:email', authenticateToken, async (req, res) => {
    try {
        const { email } = req.params;
        const db = await readDatabase();
        const cliente = db.clientes.find(c => c.email === email);

        if (!cliente) {
            return res.status(404).json({ message: 'Cliente não encontrado' });
        }

        const clienteResponse = {
            id: cliente.id,
            nome: cliente.nome,
            email: cliente.email,
            telefone: cliente.telefone,
            aceitaNewsletter: cliente.aceitaNewsletter,
            dataCadastro: cliente.dataCadastro,
            ultimoAcesso: cliente.ultimoAcesso,
            pedidos: cliente.pedidos,
            favoritos: cliente.favoritos
        };

        res.json(clienteResponse);

    } catch (error) {
        console.error('Erro ao buscar cliente:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// atualizar perfil do cliente
app.put('/api/cliente/:email', authenticateToken, async (req, res) => {
    try {
        const { email } = req.params;
        const { nome, telefone, aceitaNewsletter } = req.body;

        const db = await readDatabase();
        const clienteIndex = db.clientes.findIndex(c => c.email === email);

        if (clienteIndex === -1) {
            return res.status(404).json({ message: 'Cliente não encontrado' });
        }

        // atualizar dados
        if (nome) db.clientes[clienteIndex].nome = nome;
        if (telefone) db.clientes[clienteIndex].telefone = telefone;
        if (aceitaNewsletter !== undefined) db.clientes[clienteIndex].aceitaNewsletter = aceitaNewsletter;

        await writeDatabase(db);

        const clienteResponse = {
            id: db.clientes[clienteIndex].id,
            nome: db.clientes[clienteIndex].nome,
            email: db.clientes[clienteIndex].email,
            telefone: db.clientes[clienteIndex].telefone,
            aceitaNewsletter: db.clientes[clienteIndex].aceitaNewsletter
        };

        res.json({
            message: 'Perfil atualizado com sucesso!',
            cliente: clienteResponse
        });

    } catch (error) {
        console.error('Erro ao atualizar cliente:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// buscar produtos
app.get('/api/produtos', async (req, res) => {
    try {
        const db = await readDatabase();
        res.json(db.produtos);
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// buscar produto especifico
app.get('/api/produto/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const db = await readDatabase();
        const produto = db.produtos.find(p => p.id === parseInt(id));

        if (!produto) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }

        res.json(produto);
    } catch (error) {
        console.error('Erro ao buscar produto:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// adicionar produto aos favoritos
app.post('/api/favoritos/:email', authenticateToken, async (req, res) => {
    try {
        const { email } = req.params;
        const { produtoId } = req.body;

        const db = await readDatabase();
        const clienteIndex = db.clientes.findIndex(c => c.email === email);

        if (clienteIndex === -1) {
            return res.status(404).json({ message: 'Cliente não encontrado' });
        }

        const produto = db.produtos.find(p => p.id === produtoId);
        if (!produto) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }

        // verificar se ja esta nos favoritos
        const jaFavorito = db.clientes[clienteIndex].favoritos.includes(produtoId);
        if (jaFavorito) {
            return res.status(400).json({ message: 'Produto já está nos favoritos' });
        }

        db.clientes[clienteIndex].favoritos.push(produtoId);
        await writeDatabase(db);

        res.json({ message: 'Produto adicionado aos favoritos!' });

    } catch (error) {
        console.error('Erro ao adicionar favorito:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// remover produto dos favoritos
app.delete('/api/favoritos/:email/:produtoId', authenticateToken, async (req, res) => {
    try {
        const { email, produtoId } = req.params;

        const db = await readDatabase();
        const clienteIndex = db.clientes.findIndex(c => c.email === email);

        if (clienteIndex === -1) {
            return res.status(404).json({ message: 'Cliente não encontrado' });
        }

        const favoritoIndex = db.clientes[clienteIndex].favoritos.indexOf(parseInt(produtoId));
        if (favoritoIndex === -1) {
            return res.status(404).json({ message: 'Produto não está nos favoritos' });
        }

        db.clientes[clienteIndex].favoritos.splice(favoritoIndex, 1);
        await writeDatabase(db);

        res.json({ message: 'Produto removido dos favoritos!' });

    } catch (error) {
        console.error('Erro ao remover favorito:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// criar pedido
app.post('/api/pedido/:email', authenticateToken, async (req, res) => {
    try {
        const { email } = req.params;
        const { produtos, endereco, observacoes } = req.body;

        if (!produtos || !Array.isArray(produtos) || produtos.length === 0) {
            return res.status(400).json({ message: 'Lista de produtos é obrigatória' });
        }

        const db = await readDatabase();
        const clienteIndex = db.clientes.findIndex(c => c.email === email);

        if (clienteIndex === -1) {
            return res.status(404).json({ message: 'Cliente não encontrado' });
        }

        // calcular total
        let total = 0;
        const produtosPedido = [];

        for (const item of produtos) {
            const produto = db.produtos.find(p => p.id === item.id);
            if (!produto) {
                return res.status(404).json({ message: `Produto com ID ${item.id} não encontrado` });
            }

            if (produto.estoque < item.quantidade) {
                return res.status(400).json({ message: `Estoque insuficiente para o produto ${produto.nome}` });
            }

            const subtotal = produto.preco * item.quantidade;
            total += subtotal;

            produtosPedido.push({
                id: produto.id,
                nome: produto.nome,
                preco: produto.preco,
                quantidade: item.quantidade,
                subtotal
            });

            // atualizar estoque
            produto.estoque -= item.quantidade;
        }

        const novoPedido = {
            id: Date.now(),
            clienteEmail: email,
            produtos: produtosPedido,
            total,
            endereco: endereco || {},
            observacoes: observacoes || '',
            status: 'pendente',
            dataPedido: new Date().toISOString(),
            dataAtualizacao: new Date().toISOString()
        };

        db.pedidos.push(novoPedido);
        db.clientes[clienteIndex].pedidos.push(novoPedido.id);
        await writeDatabase(db);

        res.status(201).json({
            message: 'Pedido criado com sucesso!',
            pedido: novoPedido
        });

    } catch (error) {
        console.error('Erro ao criar pedido:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// buscar pedidos do cliente
app.get('/api/pedidos/:email', authenticateToken, async (req, res) => {
    try {
        const { email } = req.params;
        const db = await readDatabase();
        
        const pedidosCliente = db.pedidos.filter(p => p.clienteEmail === email);
        res.json(pedidosCliente);

    } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({ message: 'Erro interno do servidor' });
});

// rota 404
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Rota não encontrada' });
});

// inicializar servidor
async function startServer() {
    try {
        await initDatabase();
        
        app.listen(PORT, () => {
            console.log('Servidor ChicStar rodando na porta ${PORT}');
            console.log('Acesse: http://localhost:${PORT}');
            console.log('API disponivel em: http://localhost:${PORT}/api');
        });
    } catch (error) {
        console.error('Erro ao iniciar servidor:', error);
        process.exit(1);
    }
}

// tratamento de sinais para encerramento graceful
process.on('SIGINT', () => {
    console.log('Encerrando servidor...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('Encerrando servidor...');
    process.exit(0);
});

// iniciar servidor
startServer();