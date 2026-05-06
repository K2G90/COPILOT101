// Task Manager JavaScript

// DOM elements
const listForm = document.getElementById("list-form");
const listNameInput = document.getElementById("list-name-input");
const taskForm = document.getElementById("task-form");
const listSelect = document.getElementById("list-select");
const taskInput = document.getElementById("task-input");
const filterAll = document.getElementById("filter-all");
const filterCompleted = document.getElementById("filter-completed");
const filterPending = document.getElementById("filter-pending");
const darkModeToggle = document.getElementById("dark-mode-toggle");
const listsContainer = document.getElementById("lists-container");

// Load data from localStorage
let lists = JSON.parse(localStorage.getItem("lists")) || [];
let currentFilter = "all";
const savedTheme = localStorage.getItem("theme");
let isDarkMode = savedTheme
  ? savedTheme === "dark"
  : window.matchMedia("(prefers-color-scheme: dark)").matches;

function applyTheme() {
  if (isDarkMode) {
    document.body.classList.add("dark");
    darkModeToggle.textContent = "Light Mode";
    darkModeToggle.setAttribute("aria-pressed", "true");
  } else {
    document.body.classList.remove("dark");
    darkModeToggle.textContent = "Dark Mode";
    darkModeToggle.setAttribute("aria-pressed", "false");
  }
  localStorage.setItem("theme", isDarkMode ? "dark" : "light");
}

// Update list select dropdown
function updateListSelect() {
  listSelect.innerHTML = '<option value="">Choose a list...</option>';
  lists.forEach((list, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = list.name;
    listSelect.appendChild(option);
  });
}

// Render all lists
function renderLists() {
  listsContainer.innerHTML = "";

  if (lists.length === 0) {
    listsContainer.innerHTML =
      '<p style="text-align: center; color: var(--muted); padding: 40px;">No lists yet. Create your first list above!</p>';
    return;
  }

  lists.forEach((list, listIndex) => {
    const listDiv = document.createElement("div");
    listDiv.className = "list-container";

    const filteredTasks = list.tasks.filter((task) => {
      if (currentFilter === "completed") return task.completed;
      if (currentFilter === "pending") return !task.completed;
      return true;
    });

    listDiv.innerHTML = `
      <div class="list-header">
        <h3 class="list-title">${list.name}</h3>
        <button class="delete-list-btn" data-list-index="${listIndex}" aria-label="Delete list: ${list.name}">Delete List</button>
      </div>
      <ul class="task-list" aria-label="Tasks in ${list.name}">
        ${filteredTasks.length === 0 ? '<li style="text-align: center; color: var(--muted); padding: 20px;">No tasks in this list yet.</li>' : ""}
        ${filteredTasks
          .map((task, taskIndex) => {
            const originalTaskIndex = list.tasks.indexOf(task);
            return `
            <li class="task-card ${task.completed ? "completed" : ""}">
              <input type="checkbox" class="task-checkbox" ${task.completed ? "checked" : ""} data-list-index="${listIndex}" data-task-index="${originalTaskIndex}">
              <div class="task-content">
                <p class="task-text">${task.text}</p>
                <small class="task-date">Created: ${new Date(task.createdAt).toLocaleDateString()}</small>
              </div>
              <div class="task-actions">
                <button class="task-delete" data-list-index="${listIndex}" data-task-index="${originalTaskIndex}" aria-label="Delete task: ${task.text}">Delete</button>
              </div>
            </li>
          `;
          })
          .join("")}
      </ul>
    `;

    listsContainer.appendChild(listDiv);
  });
}

// Update filter buttons
function updateFilterButtons() {
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  if (currentFilter === "all") filterAll.classList.add("active");
  if (currentFilter === "completed") filterCompleted.classList.add("active");
  if (currentFilter === "pending") filterPending.classList.add("active");
}

// Create new list
function createList(name) {
  const trimmedName = name.trim();
  if (!trimmedName) return;

  // Check if list name already exists
  if (
    lists.some((list) => list.name.toLowerCase() === trimmedName.toLowerCase())
  ) {
    alert("A list with this name already exists!");
    return;
  }

  lists.push({
    name: trimmedName,
    tasks: [],
  });

  saveLists();
  updateListSelect();
  renderLists();
  listNameInput.value = "";
  listNameInput.focus();
}

// Add task to list
function addTask(text, listIndex) {
  const trimmedText = text.trim();
  if (!trimmedText) return;

  lists[listIndex].tasks.push({
    text: trimmedText,
    completed: false,
    createdAt: new Date().toISOString(),
  });

  saveLists();
  renderLists();
  taskInput.value = "";
  taskInput.focus();
}

// Delete list
function deleteList(listIndex) {
  if (
    confirm(
      `Are you sure you want to delete the list "${lists[listIndex].name}" and all its tasks?`,
    )
  ) {
    lists.splice(listIndex, 1);
    saveLists();
    updateListSelect();
    renderLists();
  }
}

// Delete task
function deleteTask(listIndex, taskIndex) {
  lists[listIndex].tasks.splice(taskIndex, 1);
  saveLists();
  renderLists();
}

// Toggle task completion
function toggleTask(listIndex, taskIndex) {
  lists[listIndex].tasks[taskIndex].completed =
    !lists[listIndex].tasks[taskIndex].completed;
  saveLists();
  renderLists();
}

// Save lists to localStorage
function saveLists() {
  localStorage.setItem("lists", JSON.stringify(lists));
}

// Event listeners
listForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = listNameInput.value.trim();
  if (name) {
    createList(name);
  }
});

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  const listIndex = parseInt(listSelect.value);
  if (text && !isNaN(listIndex)) {
    addTask(text, listIndex);
  }
});

listsContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-list-btn")) {
    const listIndex = parseInt(e.target.dataset.listIndex);
    deleteList(listIndex);
  } else if (e.target.classList.contains("task-delete")) {
    const listIndex = parseInt(e.target.dataset.listIndex);
    const taskIndex = parseInt(e.target.dataset.taskIndex);
    deleteTask(listIndex, taskIndex);
  } else if (e.target.classList.contains("task-checkbox")) {
    const listIndex = parseInt(e.target.dataset.listIndex);
    const taskIndex = parseInt(e.target.dataset.taskIndex);
    toggleTask(listIndex, taskIndex);
  }
});

// Keyboard navigation for accessibility
listsContainer.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    if (e.target.classList.contains("delete-list-btn")) {
      e.preventDefault();
      const listIndex = parseInt(e.target.dataset.listIndex);
      deleteList(listIndex);
    } else if (e.target.classList.contains("task-delete")) {
      e.preventDefault();
      const listIndex = parseInt(e.target.dataset.listIndex);
      const taskIndex = parseInt(e.target.dataset.taskIndex);
      deleteTask(listIndex, taskIndex);
    } else if (e.target.classList.contains("task-checkbox")) {
      e.preventDefault();
      const listIndex = parseInt(e.target.dataset.listIndex);
      const taskIndex = parseInt(e.target.dataset.taskIndex);
      toggleTask(listIndex, taskIndex);
    }
  }
});

// Filter event listeners
filterAll.addEventListener("click", () => {
  currentFilter = "all";
  updateFilterButtons();
  renderLists();
});

filterCompleted.addEventListener("click", () => {
  currentFilter = "completed";
  updateFilterButtons();
  renderLists();
});

filterPending.addEventListener("click", () => {
  currentFilter = "pending";
  updateFilterButtons();
  renderLists();
});

darkModeToggle.addEventListener("click", () => {
  isDarkMode = !isDarkMode;
  applyTheme();
});

// Initial render
applyTheme();
updateListSelect();
renderLists();
updateFilterButtons();
