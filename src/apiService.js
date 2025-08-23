// apiService.js

import { getItem } from './localStorageService.js';

const API_BASE_URL = 'https://api.github.com';
const owner = 'SamuelAraag';
const repo = 'ToDo-List';
const filePath = 'bancoDados.json';

// Função para obter o cabeçalho de autorização dinamicamente
function getHeaders() {
    const token = getItem('githubToken');
    return {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
    };
}

/**
 * Busca o arquivo JSON da API do GitHub e decodifica o conteúdo.
 * @returns {Promise<Object>} Um objeto com o SHA e a lista de tarefas, ou um objeto com valores nulos/vazios.
 */
async function fetchTasks() {
    const url = `${API_BASE_URL}/repos/${owner}/${repo}/contents/${filePath}`;
    try {
        const response = await fetch(url, { headers: getHeaders() });
        
        if (!response.ok) {
            // Se o arquivo não existe (404), ou outro erro, retorna um objeto padrão.
            if (response.status === 404) {
                return { sha: null, tasks: [] };
            }
            throw new Error(`Erro ao buscar o arquivo: ${response.statusText}`);
        }
        
        const data = await response.json();
        const decodedContent = atob(data.content);
        const tasks = JSON.parse(decodedContent);
        
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
 * @returns {Promise<string|null>} O novo SHA do arquivo ou null em caso de erro.
 */
async function saveTasks(tasks, sha) {
    const url = `${API_BASE_URL}/repos/${owner}/${repo}/contents/${filePath}`;
    const content = btoa(JSON.stringify(tasks, null, 2));

    const body = {
        message: 'Atualiza tarefas via API',
        content: content,
        sha: sha
    };
    
    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error(`Erro ao salvar o arquivo: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Arquivo salvo com sucesso no GitHub:', data);
        return data.content.sha;
        
    } catch (error) {
        console.error('Falha na requisição PUT:', error);
        return null;
    }
}

export { fetchTasks, saveTasks };