// apiService.js

import { getItem } from './localStorageService.js';

const API_BASE_URL = 'https://api.github.com';
const owner = 'SamuelAraag';
const repo = 'ToDo-List';
const filePath = 'bancoDados.json';
const refBranch = 'nao-remover-estrategia-banco-de-dados';

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
    const url = `${API_BASE_URL}/repos/${owner}/${repo}/contents/${filePath}?ref=${refBranch}`;
    try {
        const response = await fetch(url, 
            { 
                headers: getHeaders(),
                cache: 'no-store'
            });
        
        if (!response.ok) {
            if (response.status === 404) {
                return { sha: null, fileData: [] };
            }
            throw new Error(`Erro ao buscar o arquivo: ${response.statusText}`);
        }
        
        const fileData = await response.json();
        const decodedContent = decodeURIComponent(atob(fileData.content));

        if (decodedContent.trim() === '') {
            return { sha: fileData.sha, data: null };
        }

        const data = JSON.parse(decodedContent);

        return { sha: fileData.sha, data: data };
    } catch (error) {
        console.error('Falha na requisição GET:', error);
        return { sha: null, data: null };
    }
}

/**
 * Salva a lista de tarefas no arquivo JSON do GitHub.
 * @param {Array} dataToSave A lista de tarefas a ser salva.
 * @param {string} sha O SHA do arquivo atual.
 * @returns {Promise<string|null>} O novo SHA do arquivo ou null em caso de erro.
 */
async function saveTasks(dataToSave, sha) {
    const url = `${API_BASE_URL}/repos/${owner}/${repo}/contents/${filePath}?ref=${refBranch}`;
    
    dataToSave.tasks.forEach(task => {
        task.text = encodeURIComponent(task.text);
    });

    dataToSave.last_updated = new Date().toISOString();
    
    const content = btoa(JSON.stringify(dataToSave, null, 2));

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
        return { newSha: data.content.sha, newData: dataToSave };
    } catch (error) {
        console.error('Falha na requisição PUT:', error);
        return { newSha: null, newData: null };
    }
}

export { fetchTasks, saveTasks };