/**
 * Salva um item no localStorage.
 * @param {string} key A chave para o item.
 * @param {any} value O valor a ser salvo. Pode ser um objeto, array, string, etc.
 */
const setItem = (key, value) => {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error("Erro ao salvar no localStorage:", error);
  }
};

/**
 * Obtém um item do localStorage.
 * @param {string} key A chave do item a ser obtido.
 * @returns {any} O valor salvo, ou null se a chave não existir.
 */
const getItem = (key) => {
  try {
    const serializedValue = localStorage.getItem(key);
    return serializedValue ? JSON.parse(serializedValue) : null;
  } catch (error) {
    console.error("Erro ao obter do localStorage:", error);
    return null;
  }
};

/**
 * Remove um item do localStorage.
 * @param {string} key A chave do item a ser removido.
 */
const removeItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Erro ao remover do localStorage:", error);
  }
};

/**
 * Limpa todos os itens do localStorage.
 */
const clear = () => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error("Erro ao limpar o localStorage:", error);
  }
};

export { setItem, getItem, removeItem, clear };