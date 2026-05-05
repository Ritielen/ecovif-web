document.addEventListener('DOMContentLoaded', function() {

    // --- Elementos do DOM (Formulário) ---
    const selectCategoria = document.getElementById('categoria');
    const formCadastroPrato = document.getElementById('formCadastroPrato');
    const formCadastroBebida = document.getElementById('formCadastroBebida');
    const formCadastroVinho = document.getElementById('formCadastroVinho');
    
    const formPrato = document.getElementById('formPrato');
    const formBebida = document.getElementById('formBebida');
    const formVinho = document.getElementById('formVinho');

    // --- Funções Helper (Formulário) ---
    function removerRequired() {
        // Pratos
        document.querySelectorAll('#formPrato input, #formPrato select').forEach(campo => { campo.required = false; });
        // Bebidas
        document.querySelectorAll('#formBebida input, #formBebida select').forEach(campo => { campo.required = false; });
        // Vinhos
        document.querySelectorAll('#formVinho input, #formVinho select').forEach(campo => { campo.required = false; });
    }

    function adicionarRequired(formularioId) {
        document.querySelectorAll(`#${formularioId} input, #${formularioId} select`).forEach(campo => {
            campo.required = true;
        });
    }

    // --- Lógica do Formulário (mostrar/esconder) ---
    if (selectCategoria) {
        // Esconde todos os formulários inicialmente
        formCadastroPrato.style.display = 'none';
        formCadastroBebida.style.display = 'none';
        formCadastroVinho.style.display = 'none';

        selectCategoria.addEventListener('change', function() {
            const categoria = this.value;

            // Esconde todos
            formCadastroPrato.style.display = 'none';
            formCadastroBebida.style.display = 'none';
            formCadastroVinho.style.display = 'none';

            // Remove required de todos
            removerRequired();

            // Mostra o formulário correspondente e adiciona required
            if (categoria === 'prato') {
                formCadastroPrato.style.display = 'block';
                adicionarRequired('formPrato');
            } else if (categoria === 'bebida') {
                formCadastroBebida.style.display = 'block';
                adicionarRequired('formBebida');
            } else if (categoria === 'vinho') {
                formCadastroVinho.style.display = 'block';
                adicionarRequired('formVinho');
            }
        });
    }

    // --- Lógica dos Ingredientes (Adicionar e Remover) ---
const containerIngredientes = document.getElementById('container-ingredientes');

if (containerIngredientes) {
    
    // Função para atualizar visibilidade dos botões remover
    function atualizarBotoesRemover() {
        const linhas = containerIngredientes.querySelectorAll('.linha-ingrediente');
        linhas.forEach((linha, index) => {
            const btnRemover = linha.querySelector('.btn-remover-ingrediente');
            if (btnRemover) {
                // Esconde na primeira linha, mostra nas demais
                btnRemover.style.display = index === 0 ? 'none' : 'flex';
            }
        });
    }
    
    // Função para criar nova linha
    function criarNovaLinha(linhaOriginal) {
        const novaLinha = linhaOriginal.cloneNode(true);
        
        // Limpa os valores dos inputs na nova linha
        novaLinha.querySelectorAll('input, select').forEach(input => {
            input.value = '';
        });
        
        // Garante que o botão remover existe na nova linha
        let btnRemover = novaLinha.querySelector('.btn-remover-ingrediente');
        if (!btnRemover) {
            const botoesContainer = novaLinha.querySelector('.botoes-ingrediente');
            if (botoesContainer) {
                btnRemover = document.createElement('button');
                btnRemover.type = 'button';
                btnRemover.className = 'btn-remover-ingrediente';
                btnRemover.title = 'Remover ingrediente';
                btnRemover.innerHTML = '<i class="fa-solid fa-trash"></i>';
                botoesContainer.appendChild(btnRemover);
            }
        }
        
        return novaLinha;
    }
    
    // Evento de clique no container (delegação)
    containerIngredientes.addEventListener('click', function(e) {
        const botaoAdicionar = e.target.closest('.btn-adicionar-ingrediente');
        const botaoRemover = e.target.closest('.btn-remover-ingrediente');
        
        // Lógica para ADICIONAR ingrediente
        if (botaoAdicionar) {
            e.preventDefault();
            
            const linhaOriginal = botaoAdicionar.closest('.linha-ingrediente');
            if (linhaOriginal) {
                const novaLinha = criarNovaLinha(linhaOriginal);
                containerIngredientes.appendChild(novaLinha);
                atualizarBotoesRemover();
            }
        }
        
        // Lógica para REMOVER ingrediente
        if (botaoRemover) {
            e.preventDefault();
            
            const linha = botaoRemover.closest('.linha-ingrediente');
            const totalLinhas = containerIngredientes.querySelectorAll('.linha-ingrediente').length;
            
            // Só remove se houver mais de uma linha
            if (linha && totalLinhas > 1) {
                linha.remove();
                atualizarBotoesRemover();
            }
        }
    });
    
    // Inicializa: esconde o botão remover da primeira linha
    atualizarBotoesRemover();
}

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
});

// --- VARIÁVEL GLOBAL PARA CONTROLAR EDIÇÃO ---
let itemEmEdicao = {
    id: null,
    tipo: null,
    dados: null
};

// --- FUNÇÃO PARA EDITAR ITEM (chamada pelo botão) ---
window.editarItem = function(id, tipo) {
    // Faz uma requisição para buscar os dados completos do item
    fetch(`/admin/cardapio/${tipo}/dados/${id}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Salva os dados do item em edição
                itemEmEdicao = {
                    id: id,
                    tipo: tipo,
                    dados: data.item
                };
                
                // Preenche o formulário com os dados
                preencherFormularioEdicao(tipo, data.item);
                
                // Mostra indicador de modo edição
                mostrarModoEdicao();
                
                // Rola a página até o formulário
                document.querySelector('.secao-formulario').scrollIntoView({ behavior: 'smooth' });
            } else {
                alert('Erro ao carregar dados do item: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao carregar dados do item');
        });
};

// --- FUNÇÃO PARA PREENCHER FORMULÁRIO COM DADOS ---
function preencherFormularioEdicao(tipo, dados) {
    // Primeiro, seleciona a categoria correta no dropdown
    const selectCategoria = document.getElementById('categoria');
    selectCategoria.value = tipo;
    
    // Dispara o evento change para mostrar o formulário correto
    selectCategoria.dispatchEvent(new Event('change'));
    
    // Preenche os campos conforme o tipo
    if (tipo === 'prato') {
        document.getElementById('descricao').value = dados.descricao || dados.descricao || '';
        document.getElementById('rendimento').value = dados.rendimento || '';
        document.getElementById('custoPrato').value = dados.custo || '';
        document.getElementById('precoPrato').value = dados.valor || dados.preco || '';
        
        // Preenche ingredientes
        preencherIngredientes(dados.ingredientes || []);
        
    } else if (tipo === 'bebida') {
        document.getElementById('nomeBebida').value = dados.nomeBebida || '';
        document.getElementById('tamanhoBebida').value = dados.tamanhoBebida || '';
        document.getElementById('unidadeBebida').value = dados.unidadeBebida || '';
        document.getElementById('precoBebida').value = dados.precoBebida || '';
        
    } else if (tipo === 'vinho') {
        document.getElementById('nomeVinho').value = dados.nomeVinho || '';
        document.getElementById('tamanhoVinho').value = dados.tamanhoVinho || '';
        document.getElementById('unidadeVinho').value = dados.unidadeVinho || '';
        document.getElementById('tipoVinho').value = dados.tipoVinho || '';
        document.getElementById('precoVinho').value = dados.precoVinho || '';
    }
    
    // Muda o texto do botão de submit
    const btnSubmit = document.querySelector('button[type="submit"]');
    btnSubmit.innerHTML = '<i class="fa-solid fa-pen"></i> Atualizar Item';
    
    // Muda a ação do formulário
    const form = document.getElementById('formCadastro');
    form.action = `/admin/cardapio/${tipo}/atualizar/${id}`;
    
    // Adiciona campo hidden para método PUT (se necessário)
    let methodInput = document.querySelector('input[name="_method"]');
    if (!methodInput) {
        methodInput = document.createElement('input');
        methodInput.type = 'hidden';
        methodInput.name = '_method';
        form.appendChild(methodInput);
    }
    methodInput.value = 'PUT';
}

// --- FUNÇÃO PARA PREENCHER INGREDIENTES ---
function preencherIngredientes(ingredientes) {
    const container = document.getElementById('container-ingredientes');
    
    // Limpa todas as linhas existentes
    container.innerHTML = '';
    
    if (ingredientes.length === 0) {
        // Se não tem ingredientes, cria uma linha vazia
        criarLinhaIngredienteVazia();
    } else {
        // Cria uma linha para cada ingrediente
        ingredientes.forEach((ing, index) => {
            const novaLinha = criarLinhaIngrediente(ing);
            container.appendChild(novaLinha);
        });
    }
    
    // Atualiza visibilidade dos botões remover
    if (typeof atualizarBotoesRemover === 'function') {
        atualizarBotoesRemover();
    }
}

// --- FUNÇÃO PARA CRIAR LINHA DE INGREDIENTE COM DADOS ---
function criarLinhaIngrediente(ingrediente) {
    const div = document.createElement('div');
    div.className = 'linha-ingrediente';
    
    div.innerHTML = `
        <div class="campo-ingrediente">
            <input type="text" name="nomeIngrediente" class="controle-formulario" 
                   placeholder="Nome do ingrediente" value="${ingrediente.nome || ''}">
        </div>
        <div class="campo-quantidade">
            <input type="number" name="quantidadeIngrediente" class="controle-formulario" 
                   placeholder="Quantidade" step="0.01" min="0" value="${ingrediente.quantidade || ''}">
            <select name="unidadeIngrediente" class="controle-formulario">
                <option value="">--</option>
                <option value="kg" ${ingrediente.unidade === 'kg' ? 'selected' : ''}>kg</option>
                <option value="g" ${ingrediente.unidade === 'g' ? 'selected' : ''}>g</option>
                <option value="ml" ${ingrediente.unidade === 'ml' ? 'selected' : ''}>ml</option>
                <option value="l" ${ingrediente.unidade === 'l' ? 'selected' : ''}>l</option>
                <option value="un" ${ingrediente.unidade === 'un' ? 'selected' : ''}>un</option>
            </select>
        </div>
        <div class="botoes-ingrediente">
            <button type="button" class="btn-adicionar-ingrediente" title="Adicionar ingrediente">
                <i class="fa-solid fa-plus"></i>
            </button>
            <button type="button" class="btn-remover-ingrediente" title="Remover ingrediente">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `;
    
    return div;
}

// --- FUNÇÃO PARA CRIAR LINHA VAZIA ---
function criarLinhaIngredienteVazia() {
    const div = document.createElement('div');
    div.className = 'linha-ingrediente';
    
    div.innerHTML = `
        <div class="campo-ingrediente">
            <input type="text" name="nomeIngrediente" class="controle-formulario" placeholder="Nome do ingrediente">
        </div>
        <div class="campo-quantidade">
            <input type="number" name="quantidadeIngrediente" class="controle-formulario" 
                   placeholder="Quantidade" step="0.01" min="0">
            <select name="unidadeIngrediente" class="controle-formulario">
                <option value="">--</option>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="ml">ml</option>
                <option value="l">l</option>
                <option value="un">un</option>
            </select>
        </div>
        <div class="botoes-ingrediente">
            <button type="button" class="btn-adicionar-ingrediente" title="Adicionar ingrediente">
                <i class="fa-solid fa-plus"></i>
            </button>
            <button type="button" class="btn-remover-ingrediente" title="Remover ingrediente">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `;
    
    return div;
}

// --- FUNÇÃO PARA MOSTRAR MODO EDIÇÃO ---
function mostrarModoEdicao() {
    // Remove indicador existente se houver
    const indicadorExistente = document.querySelector('.modo-edicao-indicador');
    if (indicadorExistente) {
        indicadorExistente.remove();
    }
    
    // Cria novo indicador
    const indicador = document.createElement('div');
    indicador.className = 'modo-edicao-indicador';
    indicador.innerHTML = `
        <div>
            <i class="fa-solid fa-pen"></i> 
            Modo Edição: Editando ${itemEmEdicao.tipo} - ID: ${itemEmEdicao.id}
        </div>
        <button type="button" class="btn-cancelar" onclick="cancelarEdicao()">
            <i class="fa-solid fa-times"></i> Cancelar
        </button>
    `;
    
    // Insere no topo do formulário
    const caixaFormulario = document.querySelector('.caixa-formulario');
    caixaFormulario.insertBefore(indicador, caixaFormulario.firstChild);
}

// --- FUNÇÃO PARA CANCELAR EDIÇÃO ---
window.cancelarEdicao = function() {
    // Limpa variável de edição
    itemEmEdicao = { id: null, tipo: null, dados: null };
    
    // Remove indicador
    const indicador = document.querySelector('.modo-edicao-indicador');
    if (indicador) indicador.remove();
    
    // Reseta o formulário
    document.getElementById('formCadastro').reset();
    
    // Reseta o select de categoria
    const selectCategoria = document.getElementById('categoria');
    selectCategoria.value = '';
    selectCategoria.dispatchEvent(new Event('change'));
    
    // Reseta o botão de submit
    const btnSubmit = document.querySelector('button[type="submit"]');
    btnSubmit.innerHTML = '<i class="fa-solid fa-plus-circle"></i> Adicionar Item';
    
    // Reseta a ação do formulário
    const form = document.getElementById('formCadastro');
    form.action = '/admin/cardapio/adicionar';
    
    // Remove método PUT
    const methodInput = document.querySelector('input[name="_method"]');
    if (methodInput) methodInput.remove();
    
    // Limpa ingredientes e cria uma linha vazia
    const container = document.getElementById('container-ingredientes');
    container.innerHTML = '';
    container.appendChild(criarLinhaIngredienteVazia());
};

// --- FUNÇÃO PARA RESETAR FORMULÁRIO APÓS SALVAR ---
window.resetarFormularioAposSalvar = function() {
    cancelarEdicao();
};