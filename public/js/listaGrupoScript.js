
    function ativarEdicao(id) {
      const linha = document.querySelector(`#linha-${id}`);
      const nomeCel = linha.querySelector('.col-nome');
      const descCel = linha.querySelector('.col-descricao');

      // Transforma texto em Input
      nomeCel.innerHTML = `<input type="text" class="form-control form-control-sm" value="${nomeCel.innerText}">`;
      descCel.innerHTML = `<input type="text" class="form-control form-control-sm" value="${descCel.innerText}">`;

      // Alterna os botões
      linha.querySelector('.btn-editar').classList.add('d-none');
      linha.querySelector('.btn-salvar').classList.remove('d-none');
    }

    async function salvarEdicao(id) {
      const linha = document.querySelector(`#linha-${id}`);
      const novoNome = linha.querySelector('.col-nome input').value;
      const novaDesc = linha.querySelector('.col-descricao input').value;

      try {
        const response = await fetch(`/admin/grupos/editar/${id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            nome_grupo: novoNome,
            descricao_grupo: novaDesc
          })
        });

        if (response.ok) {
          // Atualiza a tela sem recarregar tudo
          linha.querySelector('.col-nome').innerText = novoNome;
          linha.querySelector('.col-descricao').innerText = novaDesc;
          linha.querySelector('.btn-editar').classList.remove('d-none');
          linha.querySelector('.btn-salvar').classList.add('d-none');
          alert('Atualizado com sucesso!');
        }
      } catch (err) {
        alert('Erro ao salvar');
      }
    }
 