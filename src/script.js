import { fetchTasks, saveTasks } from './apiService.js';
import { setItem, getItem, removeItem } from './localStorageService.js';
import { renderTasks, setupEventListeners, clearInputBox } from './domService.js';
import { APP_CONSTANTS } from './constants/app.constants.js';

let tasks = [];
let currentSha = null;
let lastUpdatedLocal = null;
let lastFetchedTasksString = '[]'; 

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
        setItem(APP_CONSTANTS.STORAGE_KEYS.LAST_UPDATE_TASKS, lastUpdatedLocal);
        lastFetchedTasksString = JSON.stringify(tasks);
    }

    _renderTasks();
}

async function startRoutine() {
    await loadTasks();
    
    setInterval(() => {
        loadTasks();
    }, 3000);
}

async function loadTasks() {
    _verifyAndShowLogOut();
    _verifyAndShowLoadTasks();
    const dataRemote = await fetchTasks();

    const tasksBeforeLoad = JSON.stringify(tasks);

    if (dataRemote.data) {
        const remoteTime = new Date(dataRemote.data.last_updated);

        const localTime = lastUpdatedLocal 
            ? new Date(lastUpdatedLocal) 
            : null;

        if(localTime === null || remoteTime > localTime){
            tasks = dataRemote.data.tasks;
            currentSha = dataRemote.sha;
            lastUpdatedLocal = dataRemote.data.last_updated;
            setItem(APP_CONSTANTS.STORAGE_KEYS.LAST_UPDATE_TASKS, lastUpdatedLocal);
            lastFetchedTasksString = JSON.stringify(tasks);
        }
    } else {
        tasks = [];
        currentSha = null;
        lastUpdatedLocal = new Date().toISOString();
        setItem(APP_CONSTANTS.STORAGE_KEYS.LAST_UPDATE_TASKS, lastUpdatedLocal);
    }

    const tasksAfterLoad = JSON.stringify(tasks);
    if (tasksBeforeLoad !== tasksAfterLoad) {
        _renderTasks();
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
    saveTask();
}

function handleDeleteTask(index) {
    tasks.splice(index, 1);
    _renderTasks();
    saveTask();
}

function handleRemoveToken(token){
    removeItem(token);
}

function handleAddTask(taskText) {
    if (taskText.trim() === '') {
        alert("A sua nova tarefa deve ser preenchida!");
        return;
    }

    tasks.push({ text: taskText, completed: false });
    clearInputBox();
    _renderTasks();
    saveTask();
}

function handleSaveToken(token) {
    if (token) {
        setItem(APP_CONSTANTS.STORAGE_KEYS.GITHUB_TOKEN, token);
        const tokenModal = document.getElementById("token-modal");
        tokenModal.classList.add('modal-hidden');
        startRoutine();
    } else {
        alert('Por favor, insira um token válido.');
    }
}

function handleLoadTasks(){
    const token = getItem();

    //so vai mostrar o modal quando clicado no botão de carregar lista de tarefas
    const tokenModal = document.getElementById("token-modal");

    if (!token) { //se não tiver token ele pede pra preencher, 
        tokenModal.classList.remove('modal-hidden');
    } else { //caso tenha o token, ele esconde o modal e inicia o polling - carregando a lista
        tokenModal.classList.add('modal-hidden');
        onAppReady();
    }
}

function _verifyAndShowLogOut(){
    const token = getItem(APP_CONSTANTS.STORAGE_KEYS.GITHUB_TOKEN);
    if(token){
        _showButtonLogOut();
    }
}

function _showButtonLogOut(){
    const logOutRemoveToken = document.getElementById("logout-remove-token");
    logOutRemoveToken.style.display = 'block';
}

function _verifyAndShowLoadTasks(){
    const token = getItem(APP_CONSTANTS.STORAGE_KEYS.GITHUB_TOKEN);
    if(!token){
        _showButtonLoadTasks();
    }
}

function _showButtonLoadTasks(){
    const buttonLoadTasks = document.getElementById("id-button-load-tasks");
    buttonLoadTasks.style.display = 'block';
}

setupEventListeners({
    onAddTask: handleAddTask,
    onSaveToken: handleSaveToken,
    onLoadTasks: handleLoadTasks,
    verifyAndShowLoadTasks: _verifyAndShowLoadTasks,
    verifyAndShowLogOut: _verifyAndShowLogOut,
    onRemoveToken: () => handleRemoveToken(APP_CONSTANTS.STORAGE_KEYS.GITHUB_TOKEN),
    getStoredToken: () => getItem(APP_CONSTANTS.STORAGE_KEYS.GITHUB_TOKEN),
    onAppReady: startRoutine
})