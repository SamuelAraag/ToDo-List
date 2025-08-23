// script.js (novo)

import { fetchTasks, saveTasks } from './apiService.js';

const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");

let tasks = [];
let currentSha = null; // Variável para armazenar o SHA do arquivo

// ... (Funções renderTasks, toggleTask, deleteTask, addTask) ...

async function saveTasks() {
    // Chama o serviço para salvar as tarefas, usando o SHA
    const newSha = await saveTasks(tasks, currentSha);
    if (newSha) {
        currentSha = newSha; // Atualiza o SHA para a próxima vez
    }
}

async function loadTasks() {
    // Pega as tarefas e o SHA do serviço
    const { tasks: loadedTasks, sha } = await fetchTasks();
    tasks = loadedTasks;
    currentSha = sha;
    renderTasks();
}

// ... (O resto da sua lógica de eventos) ...

// Adiciona o evento de 'DOMContentLoaded'
document.addEventListener('DOMContentLoaded', loadTasks);