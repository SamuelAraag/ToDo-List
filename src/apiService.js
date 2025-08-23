// apiService.js

const API_BASE_URL = 'https://api.github.com';
const owner = 'SamuelAraag';
const repo = 'ToDo-List';
const filePath = 'bancoDados.json'; // O caminho do seu arquivo
const token = 'SEU_TOKEN_DE_ACESSO_PESSOAL'; // Guarde isso em local seguro!

const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json'
};

/**
 * Busca o arquivo JSON da API do GitHub e decodifica o conteúdo.
 * @returns {Promise<Array>} A lista de tarefas ou um array vazio.
 */
async function fetchTasks() {
    const url = `${API_BASE_URL}/repos/${owner}/${repo}/contents/${filePath}`;
    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            // Se o arquivo não existe, retorna um array vazio.
            if (response.status === 404) {
                return [];
            }
            throw new Error(`Erro ao buscar o arquivo: ${response.statusText}`);
        }
        const data = await response.json();
        
        // Decodifica o conteúdo Base64 para string e depois para JSON
        const decodedContent = atob(data.content);
        const tasks = JSON.parse(decodedContent);
        
        // Retorna o SHA e o conteúdo para as próximas requisições
        return { sha: data.sha, tasks: tasks };
    } catch (error) {
        console.error('Falha na requisição GET:', error);
        return { sha: null, tasks: [] };
    }
}

/**
 * Salva a lista de tarefas no arquivo JSON do GitHub.
 * @param {Array} tasks A lista de tarefas a ser salva.
 * @param {string} sha O SHA do arquivo atual.
 */
async function saveTasks(tasks, sha) {
    const url = `${API_BASE_URL}/repos/${owner}/${repo}/contents/${filePath}`;
    
    // Codifica o JSON para string e depois para Base64
    const content = btoa(JSON.stringify(tasks, null, 2));

    const body = {
        message: 'Atualiza tarefas via API',
        content: content,
        sha: sha
    };
    
    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers,
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error(`Erro ao salvar o arquivo: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Arquivo salvo com sucesso no GitHub:', data);
        return data.content.sha; // Retorna o novo SHA
        
    } catch (error) {
        console.error('Falha na requisição PUT:', error);
        return null;
    }
}

export { fetchTasks, saveTasks };