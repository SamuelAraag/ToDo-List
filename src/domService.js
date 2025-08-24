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
    const inputBox = document.getElementById("input-box");
    const saveTokenBtn = document.getElementById("save-token-btn");
    const tokenInput = document.getElementById("token-input");
    const tokenModal = document.getElementById("token-modal");
    
    addButton.addEventListener('click', () => {
        callbacks.onAddTask(inputBox.value);
    });

    inputBox.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            callbacks.onAddTask(inputBox.value);
        }
    });

    saveTokenBtn.addEventListener('click', () => {
        callbacks.onSaveToken(tokenInput.value);
    });

    document.addEventListener('DOMContentLoaded', () => {
        const token = callbacks.getStoredToken();
        if (!token) {
            tokenModal.classList.remove('modal-hidden');
        } else {
            tokenModal.classList.add('modal-hidden');
            callbacks.onAppReady();
        }
    });
}

export function clearInputBox() {
    const inputBox = document.getElementById("input-box");
    inputBox.value = "";
}