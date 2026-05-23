function converterParaBase(valor, unidade) {

  switch (unidade) {

    // peso
    case "kg":
      return valor * 1000;

    case "g":
      return valor;

    // líquido
    case "l":
      return valor * 1000;

    case "ml":
      return valor;

    // unidade
    case "un":
      return valor;

    default:
      return valor;
  }
}

module.exports = {
  converterParaBase
};