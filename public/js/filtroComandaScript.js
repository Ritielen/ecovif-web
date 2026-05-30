// ========== FILTRO E PESQUISA DE COMANDA ==========
document.addEventListener('DOMContentLoaded', function() {
    
    // --- Elementos do DOM (Pesquisa e Filtro) ---
    const inputPesquisa = document.getElementById('inputPesquisa');
    const btnPesquisar = document.getElementById('btnPesquisar');
    const btnFiltro = document.getElementById('btnFiltro');
    const filtroDropdown = document.getElementById('filtroDropdown');
    const btnLimparFiltro = document.getElementById('btnLimparFiltro');
    const msgSemResultado = document.getElementById('msgSemResultado');
    const termoPesquisadoSpan = document.getElementById('termoPesquisado');
    
    // Seção de comandas (caixa-categoria)
    const secaoComandas = document.querySelectorAll('.caixa-categoria')[0];
    
    let filtroAtual = 'todas';
    
    // --- CONFIGURAÇÃO INICIAL: OCULTAR TODAS AS COMANDA ---
    function ocultarTodasComandas() {
        if (!secaoComandas) return;
        const itens = Array.from(secaoComandas.querySelectorAll('.conteudo-item'));
        itens.forEach(item => {
            item.style.display = 'none';
        });
    }
    
    function mostrarSecao(secao) {
        if (secao) secao.style.display = 'block';
    }
    
    // Oculta todas as comandas ao carregar a página
    ocultarTodasComandas();
    
    // Oculta a mensagem de "sem resultado" inicialmente
    if (msgSemResultado) {
        msgSemResultado.style.display = 'none';
    }
    
    function normalizarTexto(txt) {
        if (!txt) return '';
        return txt.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    
    function itensDaComanda() {
        if (!secaoComandas) return [];
        return Array.from(secaoComandas.querySelectorAll('.conteudo-item'));
    }
    
    // --- Função de Pesquisar ---
    function realizarPesquisa() {
        const termo = normalizarTexto(inputPesquisa.value.trim());
        
        if (msgSemResultado) {
            msgSemResultado.style.display = 'none';
        }
        
        if (!secaoComandas) return;
        
        // Mostra a seção de comandas
        mostrarSecao(secaoComandas);
        
        const itens = itensDaComanda();
        let totalVisiveis = 0;
        
        itens.forEach(item => {
            const statusItem = item.dataset.status;
            const textoItem = normalizarTexto(item.innerText);
            
            // Verifica se o status bate com o filtro selecionado
            let bateFiltro = false;
            
            if (filtroAtual === 'todas') {
                bateFiltro = true;
            } else if (filtroAtual === 'em preparo') {
                bateFiltro = (statusItem === 'em preparo');
            } else if (filtroAtual === 'pronta') {
                bateFiltro = (statusItem === 'pronta');
            } else if (filtroAtual === 'cancelada') {
                bateFiltro = (statusItem === 'cancelada');
            }
            
            // Verifica se o termo de pesquisa bate
            const batePesquisa = termo === '' || textoItem.includes(termo);
            
            // Exibe ou oculta baseado nos dois critérios
            const bate = bateFiltro && batePesquisa;
            
            item.style.display = bate ? 'block' : 'none';
            
            if (bate) {
                totalVisiveis++;
            }
        });
        
        // Mensagem sem resultado
        if (totalVisiveis === 0 && termo !== '') {
            if (termoPesquisadoSpan) termoPesquisadoSpan.textContent = inputPesquisa.value.trim() || '(vazio)';
            if (msgSemResultado) msgSemResultado.style.display = 'block';
        } else if (totalVisiveis === 0 && termo === '') {
            // Se não digitou nada e não tem resultados
            if (termoPesquisadoSpan) termoPesquisadoSpan.textContent = 'vazio';
            if (msgSemResultado) msgSemResultado.style.display = 'block';
        }
    }
    
    // --- Eventos de Pesquisa ---
    if (btnPesquisar) {
        btnPesquisar.addEventListener('click', realizarPesquisa);
    }
    
    if (inputPesquisa) {
        inputPesquisa.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') realizarPesquisa();
        });
        // Tempo real ao digitar (autocomplete)
        inputPesquisa.addEventListener('input', realizarPesquisa);
    }
    
    // --- Lógica do Dropdown de Filtro ---
    if (btnFiltro && filtroDropdown) {
        btnFiltro.addEventListener('click', function(e) {
            e.stopPropagation();
            filtroDropdown.classList.toggle('aberto');
        });
        
        document.addEventListener('click', function() {
            filtroDropdown.classList.remove('aberto');
        });
        
        filtroDropdown.querySelectorAll('.filtro-opcao').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation(); // Evita que o clique feche o dropdown imediatamente
                
                // Atualiza o filtro atual
                filtroAtual = this.dataset.filtro;
                
                // Atualizar estilo ativo
                filtroDropdown.querySelectorAll('.filtro-opcao').forEach(b => b.classList.remove('ativo'));
                this.classList.add('ativo');
                
                // Fecha o dropdown
                filtroDropdown.classList.remove('aberto');
                
                // Limpa o campo de pesquisa e aplica o filtro
                if (inputPesquisa) inputPesquisa.value = '';
                
                realizarPesquisa();
            });
        });
    }
    
    // --- Botão Limpar Filtro ---
    if (btnLimparFiltro) {
        btnLimparFiltro.addEventListener('click', function() {
            // Volta para "todas"
            filtroAtual = 'todas';
            
            // Atualiza os botões de filtro no dropdown
            if (filtroDropdown) {
                filtroDropdown.querySelectorAll('.filtro-opcao').forEach(b => b.classList.remove('ativo'));
                const btnTodas = filtroDropdown.querySelector('.filtro-opcao[data-filtro="todas"]');
                if (btnTodas) {
                    btnTodas.classList.add('ativo');
                }
            }
            
            // Limpa o campo de pesquisa
            if (inputPesquisa) inputPesquisa.value = '';
            
            if (msgSemResultado) msgSemResultado.style.display = 'none';
            
            // Oculta todas as comandas novamente
            ocultarTodasComandas();
        });
    }
    
});