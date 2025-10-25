// ChicStar - Sistema Completo de Login e Cadastro
// funcionalidades principais do frontend

class ChicStarApp {
    constructor() {
        this.currentUser = null;
        this.token = localStorage.getItem('chicstar_token');
        this.init();
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    init() {
        console.log('ChicStar App inicializada');
        console.log('Elemento productsGrid existe?', !!document.getElementById('productsGrid'));
        // aguardar um pouco para garantir que o DOM esteja totalmente carregado
        setTimeout(() => {
            this.loadProducts();
        }, 100);
    }

    setupEventListeners() {
        // botoes de navegacao
        const loginBtn = document.getElementById('loginBtn');
        const cadastroBtn = document.getElementById('cadastroBtn');
        
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.openLoginModal());
        }
        
        if (cadastroBtn) {
            cadastroBtn.addEventListener('click', () => this.openCadastroModal());
        }

        // botoes de fechar modal
        const closeLoginBtn = document.getElementById('closeLoginModal');
        const closeCadastroBtn = document.getElementById('closeCadastroModal');
        const closeProfileBtn = document.getElementById('closeProfileModal');
        
        if (closeLoginBtn) {
            closeLoginBtn.addEventListener('click', () => this.closeLoginModal());
        }
        
        if (closeCadastroBtn) {
            closeCadastroBtn.addEventListener('click', () => this.closeCadastroModal());
        }
        
        if (closeProfileBtn) {
            closeProfileBtn.addEventListener('click', () => this.closeProfileModal());
        }

        // fechar modal clicando fora dele
        this.setupModalCloseListeners();

        // formularios
        const loginForm = document.getElementById('loginForm');
        const cadastroForm = document.getElementById('cadastroForm');
        const profileForm = document.getElementById('profileForm');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        if (cadastroForm) {
            cadastroForm.addEventListener('submit', (e) => this.handleCadastro(e));
        }
        
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => this.handleProfileUpdate(e));
        }

        // links de alternancia entre modais
        const switchToCadastro = document.getElementById('switchToCadastro');
        const switchToLogin = document.getElementById('switchToLogin');
        
        if (switchToCadastro) {
            switchToCadastro.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeLoginModal();
                this.openCadastroModal();
            });
        }
        
        if (switchToLogin) {
            switchToLogin.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeCadastroModal();
                this.openLoginModal();
            });
        }

        // menu do usuario
        this.setupUserMenuListeners();

        // validacao em tempo real dos campos
        this.setupFieldValidation();
    }

    setupModalCloseListeners() {
        const modals = ['loginModal', 'cadastroModal', 'profileModal'];
        
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        this.closeModal(modalId);
                    }
                });
            }
        });
    }

    setupUserMenuListeners() {
        const dropdownBtn = document.getElementById('dropdownBtn');
        const dropdownContent = document.getElementById('dropdownContent');
        const profileLink = document.getElementById('profileLink');
        const ordersLink = document.getElementById('ordersLink');
        const favoritesLink = document.getElementById('favoritesLink');
        const logoutLink = document.getElementById('logoutLink');

        if (dropdownBtn && dropdownContent) {
            dropdownBtn.addEventListener('click', () => {
                dropdownContent.classList.toggle('show');
            });
        }

        if (profileLink) {
            profileLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.openProfileModal();
            });
        }

        if (ordersLink) {
            ordersLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showOrders();
            });
        }

        if (favoritesLink) {
            favoritesLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showFavorites();
            });
        }

        if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // fechar dropdown ao clicar fora
        document.addEventListener('click', (e) => {
            if (dropdownContent && !dropdownBtn.contains(e.target) && !dropdownContent.contains(e.target)) {
                dropdownContent.classList.remove('show');
            }
        });
    }

    setupFieldValidation() {
        const emailField = document.getElementById('email');
        const loginEmailField = document.getElementById('loginEmail');
        const telefoneField = document.getElementById('telefone');
        const senhaField = document.getElementById('senha');
        const confirmarSenhaField = document.getElementById('confirmarSenha');

        if (emailField) {
            emailField.addEventListener('blur', () => this.validateEmail(emailField));
        }

        if (loginEmailField) {
            loginEmailField.addEventListener('blur', () => this.validateEmail(loginEmailField));
        }

        if (telefoneField) {
            telefoneField.addEventListener('input', () => this.formatTelefone(telefoneField));
        }

        if (senhaField) {
            senhaField.addEventListener('input', () => this.validatePassword(senhaField));
        }

        if (confirmarSenhaField) {
            confirmarSenhaField.addEventListener('input', () => this.validatePasswordMatch(senhaField, confirmarSenhaField));
        }
    }

    async checkAuthStatus() {
        if (this.token) {
            try {
                const response = await fetch('/api/verify-token', {
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                });

                if (response.ok) {
                    const userData = await response.json();
                    this.currentUser = userData.user;
                    this.updateUIForLoggedInUser();
                } else {
                    this.logout();
                }
            } catch (error) {
                console.error('Erro ao verificar token:', error);
                this.logout();
            }
        }
    }

    updateUIForLoggedInUser() {
        const navButtons = document.getElementById('navButtons');
        const userMenu = document.getElementById('userMenu');
        const userName = document.getElementById('userName');

        if (navButtons) navButtons.style.display = 'none';
        if (userMenu) userMenu.style.display = 'flex';
        if (userName && this.currentUser) {
            userName.textContent = this.currentUser.nome;
        }
    }

    updateUIForLoggedOutUser() {
        const navButtons = document.getElementById('navButtons');
        const userMenu = document.getElementById('userMenu');

        if (navButtons) navButtons.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
    }

    async loadProducts() {
        try {
            console.log('Carregando produtos...');
            const response = await fetch('/api/produtos');
            console.log('Resposta da API:', response.status);
            
            if (response.ok) {
                const produtos = await response.json();
                console.log('Produtos carregados:', produtos);
                this.renderProducts(produtos);
            } else {
                console.error('Erro na resposta da API:', response.status, response.statusText);
                this.showErrorMessage('Erro ao carregar produtos');
            }
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            this.showErrorMessage('Erro de conexão ao carregar produtos');
        }
    }

    renderProducts(produtos) {
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) {
            console.error('Elemento productsGrid não encontrado');
            return;
        }

        console.log('Renderizando produtos:', produtos);

        if (!produtos || produtos.length === 0) {
            productsGrid.innerHTML = '<p class="no-products" style="text-align: center; color: red; font-size: 18px; padding: 20px;">Nenhum produto encontrado.</p>';
            return;
        }

        productsGrid.innerHTML = produtos.map(produto => `
            <div class="product-card">
                <div class="product-image">
                    <img src="${produto.imagem}" alt="${produto.nome}" onerror="this.src='img/logo.png'">
                    <div class="product-actions">
                        <button class="favorite-btn" onclick="app.toggleFavorite(${produto.id})" title="Adicionar aos favoritos">
                            ♥
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <h3>${produto.nome}</h3>
                    <p>${produto.descricao}</p>
                    <span class="price">R$ ${produto.preco.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                    <button class="buy-btn" onclick="app.buyProduct(${produto.id})">Comprar</button>
                </div>
            </div>
        `).join('');
    }

    async toggleFavorite(produtoId) {
        if (!this.currentUser) {
            this.showErrorMessage('Você precisa estar logado para adicionar favoritos');
            this.openLoginModal();
            return;
        }

        try {
            const response = await fetch(`/api/favoritos/${this.currentUser.email}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ produtoId })
            });

            if (response.ok) {
                this.showSuccessMessage('Produto adicionado aos favoritos!');
            } else {
                const error = await response.json();
                this.showErrorMessage(error.message);
            }
        } catch (error) {
            console.error('Erro ao adicionar favorito:', error);
            this.showErrorMessage('Erro ao adicionar favorito');
        }
    }

    async buyProduct(produtoId) {
        if (!this.currentUser) {
            this.showErrorMessage('Você precisa estar logado para fazer uma compra');
            this.openLoginModal();
            return;
        }

        // implementar logica de compra
        this.showSuccessMessage('Funcionalidade de compra em desenvolvimento!');
    }

    openLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            const emailField = document.getElementById('loginEmail');
            if (emailField) {
                setTimeout(() => emailField.focus(), 100);
            }
        }
    }

    closeLoginModal() {
        this.closeModal('loginModal');
    }

    openCadastroModal() {
        const modal = document.getElementById('cadastroModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            const nomeField = document.getElementById('nome');
            if (nomeField) {
                setTimeout(() => nomeField.focus(), 100);
            }
        }
    }

    closeCadastroModal() {
        this.closeModal('cadastroModal');
    }

    openProfileModal() {
        if (!this.currentUser) {
            this.showErrorMessage('Você precisa estar logado para acessar o perfil');
            return;
        }

        const modal = document.getElementById('profileModal');
        if (modal) {
            this.loadProfileData();
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    closeProfileModal() {
        this.closeModal('profileModal');
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            this.clearForm(modalId);
        }
    }

    clearForm(modalId) {
        const form = document.querySelector(`#${modalId} form`);
        if (form) {
            form.reset();
            this.clearValidationMessages(form);
        }
    }

    clearValidationMessages(form) {
        const errorMessages = form.querySelectorAll('.error-message');
        errorMessages.forEach(msg => msg.remove());
        
        const fields = form.querySelectorAll('.form-field, input');
        fields.forEach(field => field.classList.remove('error'));
    }

    async handleLogin(event) {
        event.preventDefault();
        console.log('Iniciando processo de login...');
        
        const formData = new FormData(event.target);
        const loginData = {
            email: formData.get('email').trim(),
            senha: formData.get('senha'),
            lembrarLogin: formData.get('lembrarLogin') === 'on'
        };

        console.log('Dados de login:', { email: loginData.email, senha: loginData.senha ? '***' : 'vazio' });

        // validacao basica
        if (!loginData.email || !loginData.senha) {
            console.error('Campos obrigatorios nao preenchidos');
            this.showErrorMessage('Email e senha são obrigatórios');
            return;
        }

        this.showLoading(true, 'loginSubmitBtn');

        try {
            console.log('Enviando requisição de login...');
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData)
            });

            console.log('Resposta do servidor:', response.status, response.statusText);

            const result = await response.json();
            console.log('Resultado do login:', result);

            if (response.ok) {
                this.token = result.cliente.token;
                this.currentUser = result.cliente;
                
                // salvar token no localStorage se "lembrar de mim" estiver marcado
                if (loginData.lembrarLogin) {
                    localStorage.setItem('chicstar_token', this.token);
                }
                
                this.showSuccessMessage('Login realizado com sucesso!');
                this.closeLoginModal();
                this.updateUIForLoggedInUser();
                this.showWelcomeBack();
            } else {
                console.error('Erro no login:', result.message);
                this.showErrorMessage(result.message || 'Erro ao fazer login');
            }
        } catch (error) {
            console.error('Erro no login:', error);
            this.showErrorMessage('Erro de conexão. Tente novamente.');
        } finally {
            this.showLoading(false, 'loginSubmitBtn');
        }
    }

    async handleCadastro(event) {
        event.preventDefault();
        console.log('Iniciando processo de cadastro...');
        
        const formData = new FormData(event.target);
        const clienteData = {
            nome: formData.get('nome').trim(),
            email: formData.get('email').trim(),
            telefone: formData.get('telefone').trim(),
            senha: formData.get('senha'),
            confirmarSenha: formData.get('confirmarSenha'),
            aceitaTermos: formData.get('aceitaTermos') === 'on',
            aceitaNewsletter: formData.get('aceitaNewsletter') === 'on'
        };

        console.log('Dados de cadastro:', { 
            nome: clienteData.nome, 
            email: clienteData.email, 
            telefone: clienteData.telefone,
            senha: clienteData.senha ? '***' : 'vazio',
            aceitaTermos: clienteData.aceitaTermos
        });

        // validacao completa
        if (!this.validateForm(clienteData)) {
            console.error('Validacao de formulario falhou');
            return;
        }

        this.showLoading(true, 'cadastroSubmitBtn');

        try {
            console.log('Enviando requisição de cadastro...');
            const response = await fetch('/api/cadastro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(clienteData)
            });

            console.log('Resposta do servidor:', response.status, response.statusText);

            const result = await response.json();
            console.log('Resultado do cadastro:', result);

            if (response.ok) {
                this.token = result.cliente.token;
                this.currentUser = result.cliente;
                localStorage.setItem('chicstar_token', this.token);
                
                this.showSuccessMessage('Cadastro realizado com sucesso!');
                this.closeCadastroModal();
                this.updateUIForLoggedInUser();
                this.showWelcomeBonus(result.desconto, result.codigoDesconto);
            } else {
                console.error('Erro no cadastro:', result.message);
                this.showErrorMessage(result.message || 'Erro ao realizar cadastro');
            }
        } catch (error) {
            console.error('Erro no cadastro:', error);
            this.showErrorMessage('Erro de conexão. Tente novamente.');
        } finally {
            this.showLoading(false, 'cadastroSubmitBtn');
        }
    }

    async handleProfileUpdate(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const profileData = {
            nome: formData.get('nome').trim(),
            telefone: formData.get('telefone').trim(),
            aceitaNewsletter: formData.get('aceitaNewsletter') === 'on'
        };

        this.showLoading(true, 'profileForm button[type="submit"]');

        try {
            const response = await fetch(`/api/cliente/${this.currentUser.email}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(profileData)
            });

            const result = await response.json();

            if (response.ok) {
                this.currentUser = { ...this.currentUser, ...result.cliente };
                this.showSuccessMessage('Perfil atualizado com sucesso!');
                this.updateUIForLoggedInUser();
            } else {
                this.showErrorMessage(result.message || 'Erro ao atualizar perfil');
            }
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            this.showErrorMessage('Erro de conexão. Tente novamente.');
        } finally {
            this.showLoading(false, 'profileForm button[type="submit"]');
        }
    }

    async loadProfileData() {
        if (!this.currentUser) return;

        try {
            const response = await fetch(`/api/cliente/${this.currentUser.email}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const userData = await response.json();
                
                // preencher formulario
                document.getElementById('profileNome').value = userData.nome;
                document.getElementById('profileEmail').value = userData.email;
                document.getElementById('profileTelefone').value = userData.telefone;
                document.getElementById('profileNewsletter').checked = userData.aceitaNewsletter;
                
                // atualizar estatisticas
                document.getElementById('totalPedidos').textContent = userData.pedidos ? userData.pedidos.length : 0;
                document.getElementById('totalFavoritos').textContent = userData.favoritos ? userData.favoritos.length : 0;
                
                const dataCadastro = new Date(userData.dataCadastro);
                document.getElementById('membroDesde').textContent = dataCadastro.toLocaleDateString('pt-BR');
            }
        } catch (error) {
            console.error('Erro ao carregar dados do perfil:', error);
        }
    }

    logout() {
        this.currentUser = null;
        this.token = null;
        localStorage.removeItem('chicstar_token');
        this.updateUIForLoggedOutUser();
        this.showSuccessMessage('Logout realizado com sucesso!');
    }

    showWelcomeBack() {
        const welcomeMsg = document.createElement('div');
        welcomeMsg.className = 'welcome-message';
        welcomeMsg.innerHTML = `
            <div class="welcome-content">
                <h3>Bem-vindo de volta! 👋</h3>
                <p>Que bom te ver novamente, ${this.currentUser.nome}!</p>
            </div>
        `;
        document.body.appendChild(welcomeMsg);

        setTimeout(() => {
            if (welcomeMsg.parentNode) {
                welcomeMsg.parentNode.removeChild(welcomeMsg);
            }
        }, 3000);
    }

    showWelcomeBonus(desconto, codigoDesconto) {
        const bonusModal = document.createElement('div');
        bonusModal.className = 'bonus-modal';
        bonusModal.innerHTML = `
            <div class="bonus-content">
                <h3>🎉 Parabéns!</h3>
                <p>Você ganhou <strong>${desconto}% de desconto</strong> na sua primeira compra!</p>
                <p>Código: <span class="discount-code">${codigoDesconto}</span></p>
                <button onclick="this.parentElement.parentElement.remove()" class="bonus-btn">Obrigado!</button>
            </div>
        `;

        document.body.appendChild(bonusModal);

        setTimeout(() => bonusModal.classList.add('show'), 100);
    }

    showOrders() {
        this.showSuccessMessage('Funcionalidade de pedidos em desenvolvimento!');
    }

    showFavorites() {
        this.showSuccessMessage('Funcionalidade de favoritos em desenvolvimento!');
    }

    // metodos de validacao (mantidos do codigo anterior)
    validateEmail(field) {
        const email = field.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email && !emailRegex.test(email)) {
            this.showFieldError(field, 'Por favor, insira um email válido');
            return false;
        } else {
            this.clearFieldError(field);
            return true;
        }
    }

    formatTelefone(field) {
        let value = field.value.replace(/\D/g, '');
        
        if (value.length <= 10) {
            value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        } else {
            value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
        
        field.value = value;
    }

    validatePassword(field) {
        const senha = field.value;
        const minLength = 6;
        
        if (senha && senha.length < minLength) {
            this.showFieldError(field, `A senha deve ter pelo menos ${minLength} caracteres`);
            return false;
        } else {
            this.clearFieldError(field);
            return true;
        }
    }

    validatePasswordMatch(senhaField, confirmarSenhaField) {
        const senha = senhaField.value;
        const confirmarSenha = confirmarSenhaField.value;
        
        if (confirmarSenha && senha !== confirmarSenha) {
            this.showFieldError(confirmarSenhaField, 'As senhas não coincidem');
            return false;
        } else {
            this.clearFieldError(confirmarSenhaField);
            return true;
        }
    }

    validateForm(data) {
        let isValid = true;
        this.clearValidationMessages(document.getElementById('cadastroForm'));

        if (!data.nome) {
            const nomeField = document.getElementById('nome');
            this.showFieldError(nomeField, 'Nome é obrigatório');
            isValid = false;
        }

        if (!data.email) {
            const emailField = document.getElementById('email');
            this.showFieldError(emailField, 'Email é obrigatório');
            isValid = false;
        } else if (!this.validateEmail(document.getElementById('email'))) {
            isValid = false;
        }

        if (!data.telefone) {
            const telefoneField = document.getElementById('telefone');
            this.showFieldError(telefoneField, 'Telefone é obrigatório');
            isValid = false;
        }

        if (!data.senha) {
            const senhaField = document.getElementById('senha');
            this.showFieldError(senhaField, 'Senha é obrigatória');
            isValid = false;
        } else if (!this.validatePassword(document.getElementById('senha'))) {
            isValid = false;
        }

        if (!data.confirmarSenha) {
            const confirmarSenhaField = document.getElementById('confirmarSenha');
            this.showFieldError(confirmarSenhaField, 'Confirmação de senha é obrigatória');
            isValid = false;
        } else if (!this.validatePasswordMatch(document.getElementById('senha'), document.getElementById('confirmarSenha'))) {
            isValid = false;
        }

        if (!data.aceitaTermos) {
            this.showErrorMessage('Você deve aceitar os termos de uso');
            isValid = false;
        }

        return isValid;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        field.classList.add('error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const errorMsg = field.parentNode.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.remove();
        }
    }

    showLoading(show, buttonSelector) {
        const button = document.querySelector(buttonSelector);
        if (button) {
            if (show) {
                button.disabled = true;
                button.innerHTML = '<span class="loading-spinner"></span> Processando...';
            } else {
                button.disabled = false;
                button.innerHTML = button.getAttribute('data-original-text') || 'Enviar';
            }
        }
    }

    showSuccessMessage(message) {
        this.showNotification(message, 'success');
    }

    showErrorMessage(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✓' : '✗'}</span>
                <span class="notification-message">${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
}

// inicializar a aplicacao quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
            console.log('DOM carregado, inicializando aplicacao...');
    window.app = new ChicStarApp();
});

// fallback caso o DOMContentLoaded ja tenha sido disparado
if (document.readyState === 'loading') {
    // DOM ainda carregando, aguardar DOMContentLoaded
} else {
    // DOM ja carregado, inicializar imediatamente
    console.log('DOM ja carregado, inicializando aplicacao imediatamente...');
    window.app = new ChicStarApp();
}

// funcoes globais para compatibilidade com HTML
function scrollToProducts() {
    document.getElementById('produtos').scrollIntoView({
        behavior: 'smooth'
    });
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}
