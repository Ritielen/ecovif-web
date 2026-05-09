document.addEventListener('DOMContentLoaded', function () {
    // === SELETORES DO FORMULÁRIO ===
    const categoriaSelect = document.getElementById('categoria');
    const formPrincipal = document.getElementById('formCadastroPrato');
    const formPrato = document.getElementById('formPrato');
    const formBebida = document.getElementById('formBebida');
    const inputPrecoVenda = document.getElementById('preco_venda');
    const btnLimparForm = document.getElementById('btnLimparFiltro');

    // === SELETORES DE PESQUISA E LISTA ===
    const inputPesquisa = document.getElementById('inputPesquisa');
    const btnPesquisar = document.getElementById('btnPesquisar');
    const msgSemResultado = document.getElementById('msgSemResultado');
    const termoPesquisado = document.getElementById('termoPesquisado');
    const filtroOpcoes = document.querySelectorAll('.filtro-opcao');
    const itensCardapio = document.querySelectorAll('.item-cardapio');

    let filtroAtual = 'todos';

    // --- FUNÇÕES DE AUXÍLIO ---
    function configurarCampos(container, ativo) {
        if (!container) return;
        const campos = container.querySelectorAll('input, select');
        campos.forEach(campo => {
            campo.disabled = !ativo;
            if (ativo) {
                campo.setAttribute('required', 'required');
            } else {
                campo.removeAttribute('required');
            }
        });
    }

    function normalizarTexto(txt) {
        return txt.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    // --- LÓGICA DO FORMULÁRIO ---
const conteudoFormulario = document.getElementById('conteudoFormulario');

if (categoriaSelect) {
    categoriaSelect.addEventListener('change', function () {
        const valor = this.value;
        conteudoFormulario.style.display = 'block'; // <-- Corrigido

        if (valor === 'prato') {
            formPrato.style.display = 'block';
            formBebida.style.display = 'none';
            configurarCampos(formPrato, true);
            configurarCampos(formBebida, false);
            inputPrecoVenda.disabled = false;
            inputPrecoVenda.required = true;
        } else if (valor === 'bebida') {
            formPrato.style.display = 'none';
            formBebida.style.display = 'block';
            configurarCampos(formPrato, false);
            configurarCampos(formBebida, true);
            inputPrecoVenda.disabled = false;
            inputPrecoVenda.required = true;
        }
    });
}
// --- LÓGICA DE LIMPEZA DO FORMULÁRIO ---
if (btnLimparForm) {
    btnLimparForm.addEventListener('click', function () {
        formPrincipal.reset();
        categoriaSelect.value = "";
        conteudoFormulario.style.display = 'none'; // <-- Corrigido
        configurarCampos(formPrato, false);
        configurarCampos(formBebida, false);
        inputPrecoVenda.disabled = true;
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
    

 });