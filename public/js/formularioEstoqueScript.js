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
    //permite que alguns campos sejam obrigatorios o preenchimento, e outros não.
    function adicionarRequired(formId) {
    document.querySelectorAll(`#${formId} [data-required="true"]`)
        .forEach(campo => campo.required = true);
}  

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

     // Verificar alerta de estoque baixo
    const estoqueBaixo = grupo.quantidadeTotal < grupo.quantidadeMinima;
    const alertaClass = estoqueBaixo ? 'alerta-estoque-baixo' : '';
  
}); 

