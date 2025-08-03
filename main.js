const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const addBtn = $(".add-btn");
const addTaskModal = $("#addTaskModal");
const modalCloseBtn = $(".modal-close");
const todoAppForm = $(".todo-app-form");
const tasksList = $("#tasksList");
const cancelBtn = $("#cancelBtn");
const searchInput = $(".search-input");
const tabsContainer = $(".tab-list");
const taskTitle = $("#taskTitle");

// Biến theo dõi đang sửa task nào
let editIndex = null;
let currentFilter = "active";
// Lấy danh danh todoTasks từ localstorage
const todoTasks = JSON.parse(localStorage.getItem("todoTasks")) ?? [];

// Hàm kiểm tra tiêu đề đã tồn tại chưa

function isTitleDuplicate(title, ignoreIndex = null) {
    const normalizedTitle = title.trim().toLowerCase();
    return todoTasks.some((task, index) => {
        if (ignoreIndex !== null && index === Number(ignoreIndex)) {
            return false;
        }
        return task.title.trim().toLowerCase() === normalizedTitle;
    });
}

// Hàm mở form
function openForm() {
    addTaskModal.classList.toggle("show");
    setTimeout(() => {
        taskTitle.focus();
    }, 100);
}

// Khi nhấn nút add  để mở form
addBtn.addEventListener("click", openForm);

// Hàm đóng form
function closeForm() {
    // Ẩn form
    addTaskModal.className = "modal-overlay";

    // Đổi tiêu đề form về ban đầu
    const formTitle = addTaskModal.querySelector(".modal-title");
    if (formTitle) {
        formTitle.textContent =
            formTitle.dataset.original || formTitle.textContent;
        delete formTitle.dataset.original;
    }

    //  Đổi lại text nút submit về ban đầu
    const submitBtn = addTaskModal.querySelector(".btn-submit");
    if (submitBtn) {
        submitBtn.textContent =
            submitBtn.dataset.original || submitBtn.textContent;
        delete submitBtn.dataset.original;
    }

    // Cuộn form lên đầu

    setTimeout(() => {
        addTaskModal.querySelector(".modal").scrollTop = 0;
    }, 300);

    // reset form

    todoAppForm.reset();

    editIndex = null;
}

// Khi ấn nút đóng form
cancelBtn.addEventListener("click", closeForm);
modalCloseBtn.addEventListener("click", closeForm);

// Khi submit form add/edit
todoAppForm.onsubmit = function (event) {
    event.preventDefault();

    const title = todoAppForm.querySelector('[name="title"]').value;

    if (isTitleDuplicate(title, editIndex)) {
        alert("Tiêu đề công việc đã tồn tại! Vui lòng nhập một tiêu đề khác.");
        return;
    }

    const formData = Object.fromEntries(new FormData(todoAppForm));

    // Nếu ở chế độ edit
    if (editIndex !== null) {
        const originalTask = todoTasks[editIndex];
        formData.isCompleted = originalTask.isCompleted;

        todoTasks[editIndex] = formData;
        toast({
            title: "Thành công!",
            message: "Đã cập nhật công việc.",
            type: "success",
            duration: 3000,
        });
    } else {
        // Nếu là chế độ add
        formData.isCompleted = false;
        todoTasks.unshift(formData);
        toast({
            title: "Thành công!",
            message: "Đã thêm một công việc mới.",
            type: "success",
            duration: 3000,
        });
    }
    saveTasks();
    closeForm();
    displayTasks();
};

// Xử lý các nút nhấn trong từng task
tasksList.onclick = function (event) {
    const editBtn = event.target.closest(".edit-btn");
    const deleteBtn = event.target.closest(".delete-btn");
    const completeBtn = event.target.closest(".complete-btn");

    if (editBtn) {
        const taskIndex = Number(editBtn.dataset.index);
        const task = todoTasks[taskIndex];

        editIndex = taskIndex;

        // Điền thông tin có sẵn lên form sửa
        for (const key in task) {
            const value = task[key];
            const input = $(`[name="${key}"]`);
            if (input) {
                input.value = value;
            }
        }

        // Đổi tiêu đề form thành "Edit Task"
        const formTitle = addTaskModal.querySelector(".modal-title");
        if (formTitle) {
            formTitle.dataset.original = formTitle.textContent;
            formTitle.textContent = "Edit Task";
        }

        // Đổi text nút submit thành "Save Task"
        const submitBtn = addTaskModal.querySelector(".btn-submit");
        if (submitBtn) {
            submitBtn.dataset.original = submitBtn.textContent;
            submitBtn.textContent = "Save Task";
        }

        // Mở form
        openForm();
    }

    // Nếu nhấn nút xóa
    if (deleteBtn) {
        const taskIndex = Number(deleteBtn.dataset.index);
        const task = todoTasks[taskIndex];

        // Hỏi xác nhận trước khi xóa
        if (confirm(`Bạn chắc chắn muốn xóa công việc "${task.title}"?`)) {
            // Xóa task khỏi danh sách
            todoTasks.splice(taskIndex, 1);

            // Lưu và hiển thị lại
            saveTasks();
            displayTasks();
            toast({
                title: "Đã xóa!",
                message: `Đã xóa thành công công việc "${task.title}".`,
                type: "success",
                duration: 3000,
            });
        }
    }

    // Nếu nhấn nút hoàn thành/chưa hoàn thành
    if (completeBtn) {
        const taskIndex = Number(completeBtn.dataset.index);
        const task = todoTasks[taskIndex];

        // Đổi trạng thái hoàn thành
        task.isCompleted = !task.isCompleted;

        saveTasks();
        displayTasks();
    }
};

// Hàm lưu danh sách task vào localstorage
function saveTasks() {
    localStorage.setItem("todoTasks", JSON.stringify(todoTasks));
}
// Hàm hiển thị danh sách công việc ra man hình

function renderTasks(tasksToRender) {
    const searchQuery = searchInput.value.trim();
    if (tasksToRender.length === 0) {
        if (searchQuery) {
            tasksList.innerHTML = `<p>Không tìm thấy công việc nào khớp với từ khóa "${searchQuery}".</p>`;
        } else {
            tasksList.innerHTML = `<p>Không có công việc nào trong mục này.</p>`;
        }
        return;
    }

    const todoTasksHTML = tasksToRender
        .map((task, index) => {
            const originalIndex = todoTasks.findIndex((t) => t === task);

            return `<li class="task-card ${escapeHTML(task.cardColor)} ${
                task.isCompleted ? "completed" : ""
            }">
        <div class="task-header">
            <h3 class="task-title">${escapeHTML(task.title)}</h3>
            <button class="task-menu">
                <i class="fa-solid fa-ellipsis fa-icon"></i>
                <div class="dropdown-menu">
                    <div class="dropdown-item edit-btn" data-index="${originalIndex}">
                        <i class="fa-solid fa-pen-to-square fa-icon"></i>
                        Edit
                    </div>
                    <div class="dropdown-item complete complete-btn" data-index="${originalIndex}">
                        <i class="fa-solid fa-check fa-icon"></i>
                        ${
                            task.isCompleted
                                ? "Mark as Active"
                                : "Mark as Complete"
                        }
                    </div>
                    <div class="dropdown-item delete delete-btn" data-index="${originalIndex}">
                        <i class="fa-solid fa-trash fa-icon"></i>
                        Delete
                    </div>
                </div>
            </button>
        </div>
        <p class="task-description">
            ${escapeHTML(task.description)}
        </p>
        <div class="task-time">${escapeHTML(task.startTime)} - ${escapeHTML(
                task.endTime
            )}</div>
    </li>`;
        })
        .join("");
    tasksList.innerHTML = todoTasksHTML;
}

// Hàm hiển thị danh sách đã lọc
function displayTasks() {
    let filteredTasks = [...todoTasks];
    const searchQuery = searchInput.value.trim().toLowerCase();
    // Nếu có tìm kiếm, thì tìm trên toàn danh sách
    if (searchQuery) {
        filteredTasks = todoTasks.filter(
            (task) =>
                task.title.toLowerCase().includes(searchQuery) ||
                (task.description &&
                    task.description.toLowerCase().includes(searchQuery))
        );
    } else {
        // Nếu không, áp dụng bộ lọc 'active' hoặc 'completed'
        if (currentFilter === "active") {
            filteredTasks = todoTasks.filter((task) => !task.isCompleted);
        } else if (currentFilter === "completed") {
            filteredTasks = todoTasks.filter((task) => task.isCompleted);
        }
    }
    renderTasks(filteredTasks);
}

searchInput.oninput = function () {
    const query = searchInput.value.trim();
    if (query) {
        tabsContainer
            .querySelectorAll(".tab-button")
            .forEach((btn) => btn.classList.remove("active"));
    } else {
        tabsContainer
            .querySelector(`[data-filter="${currentFilter}"]`)
            ?.classList.add("active");
    }
    displayTasks();
};

tabsContainer.onclick = function (event) {
    const clickedTab = event.target.closest(".tab-button");
    if (!clickedTab) return;

    if (searchInput.value) {
        searchInput.value = "";
    }
    tabsContainer
        .querySelectorAll(".tab-button")
        .forEach((btn) => btn.classList.remove("active"));
    clickedTab.classList.add("active");
    currentFilter = clickedTab.dataset.filter;
    displayTasks();
};

displayTasks();

function escapeHTML(html) {
    const div = document.createElement("div");
    div.textContent = html;
    return div.innerHTML;
}

// Hàm hiển thị thông báo
function toast({ title = "", message = "", type = "info", duration = 3000 }) {
    const main = document.getElementById("toast");
    if (main) {
        const toast = document.createElement("div");

        const autoRemoveId = setTimeout(function () {
            main.removeChild(toast);
        }, duration + 1000);

        toast.onclick = function (e) {
            if (e.target.closest(".toast__close")) {
                main.removeChild(toast);
                clearTimeout(autoRemoveId);
            }
        };

        const icons = {
            success: "fas fa-check-circle",
            info: "fas fa-info-circle",
            warning: "fas fa-exclamation-circle",
            error: "fas fa-exclamation-circle",
        };
        const icon = icons[type];
        const delay = (duration / 1000).toFixed(2);

        toast.classList.add("toast", `toast--${type}`);
        toast.style.animation = `slideInLeft ease .3s, fadeOut linear 1s ${delay}s forwards`;

        toast.innerHTML = `
            <div class="toast__icon">
                <i class="${icon}"></i>
            </div>
            <div class="toast__body">
                <h3 class="toast__title">${title}</h3>
                <p class="toast__msg">${message}</p>
            </div>
            <div class="toast__close">
                <i class="fas fa-times"></i>
            </div>
        `;
        main.appendChild(toast);
    }
}
