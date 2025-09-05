export function renderTasks(tasks, callBacks){
    const listContainer = document.getElementById('list-container');
    listContainer.innerHTML = '';
    
    tasks.forEach((task, index) => {
        task.text = decodeURIComponent(task.text);

        const li = document.createElement("li");
        li.textContent = task.text;

        if (task.completed) {
            li.classList.add('checked');
        }

        const span = document.createElement("span");
        span.textContent = "\u00d7";

        span.addEventListener('click', (e) => {
            e.stopPropagation();
            callBacks.onDeleteTasks(index);
        });

        li.appendChild(span);
        listContainer.appendChild(li);

        li.addEventListener('click', () => callBacks.onToggleTasks(index));
    });
}

export function setupEventListeners(callbacks) {
    const addButton = document.getElementById("add-button");
    const loadTasks = document.getElementById("id-button-load-tasks");
    const inputBox = document.getElementById("input-box");
    const saveTokenBtn = document.getElementById("save-token-btn");
    const tokenInput = document.getElementById("token-input");
    const tokenModal = document.getElementById("token-modal");
    const logOutRemoveToken = document.getElementById("logout-remove-token");
    
    addButton.addEventListener('click', () => {
        callbacks.onAddTask(inputBox.value);
    });

    loadTasks.addEventListener('click', () => {
        callbacks.onLoadTasks();
        callbacks.onAppReady();
    })

    inputBox.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            callbacks.onAddTask(inputBox.value);
        }
    });

    saveTokenBtn.addEventListener('click', () => {
        callbacks.onSaveToken(tokenInput.value);
        callbacks.onAppReady();
    });

    logOutRemoveToken.addEventListener('click', () => {
        callbacks.onRemoveToken();
        logOutRemoveToken.classList.add('hidden-button');
        window.location.reload();
    });

    document.addEventListener('DOMContentLoaded', () => {
        callbacks.verifyAndShowLoadTasks();
        callbacks.verifyAndShowLogOut();

        callbacks.onAppReady();
    });
}

export function clearInputBox() {
    const inputBox = document.getElementById("input-box");
    inputBox.value = "";
}