 // --- Elementos do DOM (Pesquisa e Filtro) ---
    const inputPesquisa = document.getElementById('inputPesquisa');
    const btnPesquisar = document.getElementById('btnPesquisar');
    const btnFiltro = document.getElementById('btnFiltro');
    const filtroDropdown = document.getElementById('filtroDropdown');
    const filtroAtivoTag = document.getElementById('filtroAtivoTag');
    const filtroAtivoNome = document.getElementById('filtroAtivoNome');
    const btnLimparFiltro = document.getElementById('btnLimparFiltro');
    const msgSemResultado = document.getElementById('msgSemResultado');
    const termoPesquisadoSpan = document.getElementById('termoPesquisado');

    // Seções de categoria (caixa-categoria)
    const secaoPratos = document.querySelectorAll('.caixa-categoria')[0];
    const secaoBebidas = document.querySelectorAll('.caixa-categoria')[1];
    const secaoVinhos = document.querySelectorAll('.caixa-categoria')[2];

    const mapaSecoes = { prato: secaoPratos, bebida: secaoBebidas, vinho: secaoVinhos };
    let filtroAtual = 'todos';

    // --- CONFIGURAÇÃO INICIAL: OCULTAR TODAS AS SEÇÕES ---
    function ocultarTodasSecoes() {
        [secaoPratos, secaoBebidas, secaoVinhos].forEach(s => { 
            if (s) s.style.display = 'none'; 
        });
    }

    // Oculta todas as seções ao carregar a página
    ocultarTodasSecoes();
    
    // Oculta a mensagem de "sem resultado" inicialmente
    if (msgSemResultado) {
        msgSemResultado.style.display = 'none';
    }

    function mostrarSecao(secao) {
        if (secao) secao.style.display = 'block';
    }

    function normalizarTexto(txt) {
        if (!txt) return '';
        return txt.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    function itensDeSecao(secao) {
        if (!secao) return [];
        return Array.from(secao.querySelectorAll('.conteudo-item'));
    }

    // --- Função de Pesquisar ---
    function realizarPesquisa() {
        const termo = normalizarTexto(inputPesquisa.value.trim());
        ocultarTodasSecoes();
        msgSemResultado.style.display = 'none';

        let secoesAlvo = [];
        if (filtroAtual === 'todos') {
            secoesAlvo = [ 
                { secao: secaoPratos, tipo: 'prato' }, 
                { secao: secaoBebidas, tipo: 'bebida' }, 
                { secao: secaoVinhos, tipo: 'vinho' } 
            ];
        } else {
            secoesAlvo = [ { secao: mapaSecoes[filtroAtual], tipo: filtroAtual } ];
        }

        let totalVisiveis = 0;
        secoesAlvo.forEach(({ secao }) => {
            if (!secao) return;
            const itens = itensDeSecao(secao);
            let algumVisivel = false;
            
            itens.forEach(item => {
                const textoItem = normalizarTexto(item.innerText);
                const bate = termo === '' || textoItem.includes(termo);
                item.style.display = bate ? 'block' : 'none';
                if (bate) { 
                    algumVisivel = true; 
                    totalVisiveis++; 
                }
            });
            
            if (algumVisivel) mostrarSecao(secao);
        });

        // Mensagem sem resultado
        if (totalVisiveis === 0 && termo !== '') {
            if (termoPesquisadoSpan) termoPesquisadoSpan.textContent = inputPesquisa.value.trim() || '(vazio)';
            msgSemResultado.style.display = 'block';
        } else if (totalVisiveis === 0 && termo === '') {
            // Se não digitou nada e não tem resultados, mostra mensagem específica
            if (termoPesquisadoSpan) termoPesquisadoSpan.textContent = 'vazio';
            msgSemResultado.style.display = 'block';
        }
    }

    // --- Eventos de Pesquisa ---
    if (btnPesquisar) {
        btnPesquisar.addEventListener('click', realizarPesquisa);
    }
    if (inputPesquisa) {
        inputPesquisa.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') realizarPesquisa();
        });
         // Tempo real ao digitar
        inputPesquisa.addEventListener('input', realizarPesquisa);
    }

    // --- Lógica do Dropdown de Filtro ---
    if (btnFiltro && filtroDropdown) {
        btnFiltro.addEventListener('click', function (e) {
            e.stopPropagation();
            filtroDropdown.classList.toggle('aberto');
        });

        document.addEventListener('click', function () {
            filtroDropdown.classList.remove('aberto');
        });

        filtroDropdown.querySelectorAll('.filtro-opcao').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation(); // Evita que o clique feche o dropdown imediatamente
                filtroAtual = this.dataset.filtro;

                // Atualizar estilo ativo
                filtroDropdown.querySelectorAll('.filtro-opcao').forEach(b => b.classList.remove('ativo'));
                this.classList.add('ativo');

                // Tag de filtro ativo
                const nomes = { todos: 'Todos', prato: 'Pratos', bebida: 'Bebidas', vinho: 'Vinhos' };
                if (filtroAtivoNome) filtroAtivoNome.textContent = nomes[filtroAtual];
                if (filtroAtivoTag) filtroAtivoTag.classList.toggle('visivel', filtroAtual !== 'todos');

                filtroDropdown.classList.remove('aberto');

                // Limpa o campo de pesquisa e aplica o filtro
                if (inputPesquisa) inputPesquisa.value = '';
                realizarPesquisa(); // Isso vai ocultar todas e mostrar apenas a seção selecionada
            });
        });
    }

    // --- Botão Limpar Filtro ---
    if (btnLimparFiltro) {
        btnLimparFiltro.addEventListener('click', function () {
            filtroAtual = 'todos';
            if (filtroAtivoTag) filtroAtivoTag.classList.remove('visivel');
            if (filtroAtivoNome) filtroAtivoNome.textContent = 'Todos';
            if (filtroDropdown) {
                filtroDropdown.querySelectorAll('.filtro-opcao').forEach(b => b.classList.remove('ativo'));
                const btnTodos = filtroDropdown.querySelector('[data-filtro="todos"]');
                if (btnTodos) btnTodos.classList.add('ativo');
            }
            if (inputPesquisa) inputPesquisa.value = '';
            
            // Oculta todas as seções (volta ao estado inicial)
            ocultarTodasSecoes();
            
            if (msgSemResultado) msgSemResultado.style.display = 'none';
        });
    }

