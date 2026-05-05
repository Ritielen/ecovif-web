document.addEventListener('DOMContentLoaded', function () {

    // ==============================
    // FORMULÁRIO (PRODUTO / BEBIDA)
    // ==============================
    const selectTipo = document.querySelector('select[name="tipo_item"]');
    const formProduto = document.getElementById('formProduto');
    const formBebida = document.getElementById('formBebida');
    const textoBotao = document.getElementById('textoBotao');
    const formEstoque = document.getElementById('formEstoque');

    // Função para habilitar/desabilitar campos de um container
    function desabilitarCampos(container, desabilitar) {
        if (!container) return;
        const inputs = container.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (desabilitar) {
                input.disabled = true;
                // Remove required quando desabilitar
                if (input.hasAttribute('required')) {
                    input.setAttribute('data-required-saved', 'true');
                    input.removeAttribute('required');
                }
            } else {
                input.disabled = false;
                // Restaura required se tinha antes
                if (input.hasAttribute('data-required-saved')) {
                    input.setAttribute('required', 'required');
                    input.removeAttribute('data-required-saved');
                }
            }
        });
    }

    function removerRequired() {
        document.querySelectorAll('#formProduto input, #formProduto select')
            .forEach(campo => campo.required = false);

        document.querySelectorAll('#formBebida input, #formBebida select')
            .forEach(campo => campo.required = false);
    }
    //esse codigo permite que alguns campos sejam obrigatorios o preenchimento, e outros não.
    function adicionarRequired(formId) {
    document.querySelectorAll(`#${formId} [data-required="true"]`)
        .forEach(campo => campo.required = true);
}

    /*function adicionarRequired(formId) {
        document.querySelectorAll(`#${formId} input, #${formId} select`)
            .forEach(campo => campo.required = true);
    }*/

    function esconderForms() {
        if (formProduto) formProduto.style.display = 'none';
        if (formBebida) formBebida.style.display = 'none';
    }

    esconderForms();

    // Estado inicial: desabilitar todos os campos
    if (formProduto) desabilitarCampos(formProduto, true);
    if (formBebida) desabilitarCampos(formBebida, true);

    if (selectTipo) {
        selectTipo.addEventListener('change', function () {

            const tipo = this.value;

            esconderForms();
            removerRequired();

            // Primeiro desabilita todos os campos
            if (formProduto) desabilitarCampos(formProduto, true);
            if (formBebida) desabilitarCampos(formBebida, true);

            if (tipo === 'produto') {
                if (formProduto) {
                    formProduto.style.display = 'block';
                    desabilitarCampos(formProduto, false); // Habilita campos do produto
                    adicionarRequired('formProduto');
                }
                if (textoBotao) textoBotao.textContent = 'Cadastrar Produto';

            } else if (tipo === 'bebida') {
                if (formBebida) {
                    formBebida.style.display = 'block';
                    desabilitarCampos(formBebida, false); // Habilita campos da bebida
                    adicionarRequired('formBebida');
                }
                if (textoBotao) textoBotao.textContent = 'Cadastrar Bebida';
            }
        });
    }

    // ==============================
    // VALIDAÇÃO ANTES DO SUBMIT
    // ==============================
    if (formEstoque) {
        formEstoque.addEventListener('submit', function (e) {
            const tipoSelecionado = selectTipo ? selectTipo.value : null;
            
            if (!tipoSelecionado) {
                e.preventDefault();
                alert('Por favor, selecione o tipo do item (Produto ou Bebida)');
                return false;
            }

            // Garantir que os campos do tipo não selecionado sejam desabilitados
            if (tipoSelecionado === 'produto') {
                if (formBebida) desabilitarCampos(formBebida, true);
                if (formProduto) desabilitarCampos(formProduto, false);
            } else if (tipoSelecionado === 'bebida') {
                if (formProduto) desabilitarCampos(formProduto, true);
                if (formBebida) desabilitarCampos(formBebida, false);
            }
            
        });
    }

    // ==============================
    // ELEMENTOS DA PESQUISA
    // ==============================
    const inputPesquisa = document.getElementById('inputPesquisa');
    const btnPesquisar = document.getElementById('btnPesquisar');
    const msgSemResultado = document.getElementById('msgSemResultado');
    const termoPesquisado = document.getElementById('termoPesquisado');

    const btnFiltro = document.getElementById('btnFiltro');
    const filtroDropdown = document.getElementById('filtroDropdown');
    const filtroAtivoTag = document.getElementById('filtroAtivoTag');
    const filtroAtivoNome = document.getElementById('filtroAtivoNome');
    const btnLimparFiltro = document.getElementById('btnLimparFiltro');

    // ==============================
    // SEÇÕES
    // ==============================
    const secaoProdutos = document.querySelectorAll('.caixa-categoria')[0];
    const secaoBebidas = document.querySelectorAll('.caixa-categoria')[1];

    let filtroAtual = 'todos';

    function ocultarSecoes() {
        if (secaoProdutos) secaoProdutos.style.display = 'none';
        if (secaoBebidas) secaoBebidas.style.display = 'none';
    }

    function mostrarSecao(secao) {
        if (secao) secao.style.display = 'block';
    }

    function normalizarTexto(txt) {
        return txt
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }

    function itensDaSecao(secao) {
        if (!secao) return [];
        return Array.from(secao.querySelectorAll('.conteudo-item'));
    }

    // ==============================
    // FUNÇÃO DE PESQUISA
    // ==============================
    function realizarPesquisa() {

    const termo = normalizarTexto(inputPesquisa.value.trim());

    ocultarSecoes();
    if (msgSemResultado) msgSemResultado.style.display = 'none';

    let secoes = [];

    if (filtroAtual === 'todos') {
        secoes = [
            { tipo: 'produto', el: secaoProdutos },
            { tipo: 'bebida', el: secaoBebidas }
        ];
    } else if (filtroAtual === 'produto') {
        secoes = [{ tipo: 'produto', el: secaoProdutos }];
    } else if (filtroAtual === 'bebida') {
        secoes = [{ tipo: 'bebida', el: secaoBebidas }];
    }

    let total = 0;
    let secaoComResultado = null;

    secoes.forEach(secaoObj => {

        const itens = itensDaSecao(secaoObj.el);
        let algumVisivel = false;

        itens.forEach(item => {

            const textoItem = normalizarTexto(item.innerText);
            const bate = termo === '' || textoItem.includes(termo);

            item.style.display = bate ? 'block' : 'none';

            if (bate) {
                algumVisivel = true;
                total++;
            }
        });

        // Guarda qual seção teve resultado
        if (algumVisivel && !secaoComResultado) {
            secaoComResultado = secaoObj.el;
        }
    });

    // 🔥 MOSTRA SOMENTE UMA SEÇÃO (a correta)
    if (secaoComResultado) {
        mostrarSecao(secaoComResultado);
    }

    // Mensagem sem resultado
    if (total === 0 && msgSemResultado) {
        if (termoPesquisado) termoPesquisado.textContent = inputPesquisa.value || 'vazio';
        msgSemResultado.style.display = 'block';
    }
}

    // ==============================
    // EVENTOS DE PESQUISA
    // ==============================
    if (btnPesquisar) {
        btnPesquisar.addEventListener('click', realizarPesquisa);
    }

    if (inputPesquisa) {
        inputPesquisa.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') realizarPesquisa();
        });
    }

    // ==============================
    // DROPDOWN FILTRO
    // ==============================
   
        
    // ==============================
    // LIMPAR FILTRO
    // ==============================
    if (btnLimparFiltro) {
        btnLimparFiltro.addEventListener('click', function () {

            filtroAtual = 'todos';

            if (filtroAtivoTag) filtroAtivoTag.classList.remove('visivel');
            if (filtroAtivoNome) filtroAtivoNome.textContent = 'Todos';

            if (filtroDropdown) {
                filtroDropdown.querySelectorAll('.filtro-opcao')
                    .forEach(b => b.classList.remove('ativo'));

                const btnTodos = filtroDropdown.querySelector('[data-filtro="todos"]');
                if (btnTodos) btnTodos.classList.add('ativo');
            }

            if (inputPesquisa) inputPesquisa.value = '';
            ocultarSecoes();
            if (msgSemResultado) msgSemResultado.style.display = 'none';
        });
    } 

        

    // ==============================
    // ESTADO INICIAL
    // ==============================
    ocultarSecoes();
    if (msgSemResultado) msgSemResultado.style.display = 'none';

}); 

