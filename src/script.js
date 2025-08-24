import { fetchTasks, saveTasks } from './apiService.js';
import { setItem, getItem } from './localStorageService.js';

const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");
const addButton = document.getElementById("add-button");

const tokenModal = document.getElementById("token-modal");
const tokenInput = document.getElementById("token-input");
const saveTokenBtn = document.getElementById("save-token-btn");

const debouncedSave = debounce(saveTask, 3000);

let tasks = [];
let currentSha = null;

function renderTasks() {
    listContainer.innerHTML = '';
    tasks.forEach((task, index) => {
        task.text = decodeURIComponent(task.text)
        const li = document.createElement("li");
        li.textContent = task.text;

        if (task.completed) {
            li.classList.add('checked');
        }

        const span = document.createElement("span");
        span.textContent = "\u00d7";

        span.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteTask(index);
        });

        li.appendChild(span);
        listContainer.appendChild(li);

        li.addEventListener('click', () => toggleTask(index));
    });
}

function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    debouncedSave();
}

function deleteTask(index) {
    tasks.splice(index, 1);
    renderTasks();
    debouncedSave();
}

function addTask() {
    const taskText = inputBox.value.trim();
    if (taskText === '') {
        alert("Você precisa escrever alguma coisa!");
        return;
    }

    tasks.push({ text: taskText, completed: false });

    inputBox.value = "";
    renderTasks();
    debouncedSave();
}

async function saveTask() {
    currentSha = await saveTasks(tasks, currentSha);
    
    tasks.forEach(task => {
        task.text = decodeURIComponent(task.text)
    })
}

async function loadTasks() {
    const data = await fetchTasks();
    tasks = data.tasks;
    currentSha = data.sha;
    renderTasks();
}

function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

function initApp() {
    const token = getItem('githubToken');
    if (!token) {
        tokenModal.classList.remove('modal-hidden'); // Mostra o modal
    } else {
        tokenModal.classList.add('modal-hidden'); // Esconde o modal
        loadTasks();
    }
}

// Evento para o botão de salvar no modal
saveTokenBtn.addEventListener('click', () => {
    const token = tokenInput.value.trim();
    if (token) {
        setItem('githubToken', token);
        tokenModal.classList.add('modal-hidden');
        loadTasks();
    } else {
        alert('Por favor, insira um token válido.');
    }
});

// Eventos da aplicação principal
addButton.addEventListener('click', addTask);
inputBox.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        addTask();
    }
});

// Inicialização
document.addEventListener('DOMContentLoaded', initApp);