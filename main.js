const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const addBtn = $(".add-btn");
const addTaskModal = $("#addTaskModal");
const modalCloseBtn = $(".modal-close");
const todoAppForm = $(".todo-app-form");
const taskTitle = $("#taskTitle");
const taskDescription = $("#taskDescription");
const taskCategory = $("#taskCategory");
const taskPriority = $("#taskPriority");
const startTime = $("#startTime");
const endTime = $("#endTime");
const taskDate = $("#taskDate");
const taskColor = $("#taskColor");
const tasksList = $("#tasksList");
const cancelBtn = $("#cancelBtn");

addBtn.onclick = function () {
    addTaskModal.className = "modal-overlay show";
    setTimeout(() => {
        taskTitle.focus();
    }, 100);
};

cancelBtn.onclick = function () {
    todoAppForm.reset();
    addTaskModal.className = "modal-overlay";
};

modalCloseBtn.onclick = function () {
    addTaskModal.className = "modal-overlay";
};

todoTasks = [];

todoAppForm.onsubmit = function (event) {
    event.preventDefault();
    const newTask = {
        title: taskTitle.value,
        description: taskDescription.value,
        category: taskCategory.value,
        priority: taskPriority.value,
        startTime: startTime.value,
        endTime: endTime.value,
        dueDate: taskDate.value,
        cardColor: taskColor.value,
        isCompleted: false,
    };

    todoTasks.unshift(newTask);
    todoAppForm.reset();
    addTaskModal.className = "modal-overlay";
    renderTasks(todoTasks);
};

function renderTasks(todoTasks) {
    const todoTasksHTML = todoTasks
        .map((newTask) => {
            return `<li class="task-card ${newTask.cardColor} ${
                newTask.isCompleted ? "completed" : ""
            }">
        <div class="task-header">
            <h3 class="task-title">${newTask.title}</h3>
            <button class="task-menu">
                <i class="fa-solid fa-ellipsis fa-icon"></i>
                <div class="dropdown-menu">
                    <div class="dropdown-item">
                        <i class="fa-solid fa-pen-to-square fa-icon"></i>
                        Edit
                    </div>
                    <div class="dropdown-item complete">
                        <i class="fa-solid fa-check fa-icon"></i>
                        Mark as Active
                    </div>
                    <div class="dropdown-item delete">
                        <i class="fa-solid fa-trash fa-icon"></i>
                        Delete
                    </div>
                </div>
            </button>
        </div>
        <p class="task-description">
            ${newTask.description}
        </p>
        <div class="task-time">${newTask.startTime} - ${newTask.endTime}</div>
    </li>`;
        })
        .join("");
    tasksList.innerHTML = todoTasksHTML;
}
renderTasks(todoTasks);
