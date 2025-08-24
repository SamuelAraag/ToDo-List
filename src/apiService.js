// apiService.js

import { getItem } from './localStorageService.js';

const API_BASE_URL = 'https://api.github.com';
const owner = 'SamuelAraag';
const repo = 'ToDo-List';
const filePath = 'bancoDados.json';

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
        const response = await fetch(url, 
            { 
                headers: getHeaders(),
                cache: 'no-store'
            });
        
        if (!response.ok) {
            if (response.status === 404) {
                return { sha: null, tasks: [] };
            }
            throw new Error(`Erro ao buscar o arquivo: ${response.statusText}`);
        }
        
        const data = await response.json();
        const decodedContent = decodeURIComponent(atob(data.content));

        if (decodedContent.trim() === '') {
            return { sha: data.sha, tasks: [] };
        }

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
    
    tasks.forEach(task => {
        task.text = encodeURIComponent(task.text);
    });
    
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
        return data.content.sha;
        
    } catch (error) {
        console.error('Falha na requisição PUT:', error);
        return null;
    }
}

export { fetchTasks, saveTasks };