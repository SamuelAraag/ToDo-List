import { fetchTasks, saveTasks } from './apiService.js';
import { setItem, getItem } from './localStorageService.js';
import { renderTasks, setupEventListeners, clearInputBox } from './domService.js';

const debouncedSave = debounce(saveTask, 500);

let tasks = [];
let currentSha = null;
let lastUpdatedLocal = null;
let lastFetchedTasksString = '[]'; 

function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

async function saveTask() {
    const localTasksString = JSON.stringify(tasks);

    if (localTasksString === lastFetchedTasksString) {
        return;
    }
    
    const dataToSave = {
        tasks: tasks,
        last_updated: new Date().toISOString()
    };
    
    const result = await saveTasks(dataToSave, currentSha);

    if (result.newSha) {
        currentSha = result.newSha;
        lastUpdatedLocal = result.newData.last_updated;
        setItem('lastUpdatedLocal', lastUpdatedLocal);
        lastFetchedTasksString = JSON.stringify(tasks);
    }

    _renderTasks();
}

async function startRoutine() {
    await loadTasks();
    
    setInterval(() => {
        loadTasks();
    }, 1000);
}

async function loadTasks() {
    const dataRemote = await fetchTasks();

    if (dataRemote.data) {
        const remoteTime = new Date(dataRemote.data.last_updated);

        const localTime = lastUpdatedLocal 
            ? new Date(lastUpdatedLocal) 
            : null;

        if(localTime === null || remoteTime > localTime){
            tasks = dataRemote.data.tasks;
            currentSha = dataRemote.sha;
            lastUpdatedLocal = dataRemote.data.last_updated;
            setItem('lastUpdatedLocal', lastUpdatedLocal);
            lastFetchedTasksString = JSON.stringify(tasks);
        }
    } else {
        tasks = [];
        currentSha = null;
        lastUpdatedLocal = new Date().toISOString();
        setItem('lastUpdatedLocal', lastUpdatedLocal);
    }
    
    lastFetchedTasksString = JSON.stringify(tasks);
    
    _renderTasks();
}

function _renderTasks(){
    renderTasks(tasks, {
        onDeleteTasks: handleDeleteTask,
        onToggleTasks: handleToggleTask
    });
}

function handleToggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    _renderTasks();
    debouncedSave();
}

function handleDeleteTask(index) {
    tasks.splice(index, 1);
    _renderTasks();
    debouncedSave();
}

function handleAddTask(taskText) {
    if (taskText.trim() === '') {
        alert("A sua nova tarefa deve ser preenchida!");
        return;
    }

    tasks.push({ text: taskText, completed: false });
    clearInputBox();
    _renderTasks();
    debouncedSave();
}

function handleSaveToken(token) {
    if (token) {
        setItem('githubToken', token);
        const tokenModal = document.getElementById("token-modal");
        tokenModal.classList.add('modal-hidden');
        startRoutine();
    } else {
        alert('Por favor, insira um token válido.');
    }
}

setupEventListeners({
    onAddTask: handleAddTask,
    onSaveToken: handleSaveToken,
    getStoredToken: () => getItem('githubToken'),
    onAppReady: startRoutine
})