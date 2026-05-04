// Task Manager JavaScript

// DOM elements
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const filterAll = document.getElementById("filter-all");
const filterCompleted = document.getElementById("filter-completed");
const filterPending = document.getElementById("filter-pending");
const darkModeToggle = document.getElementById("dark-mode-toggle");

// Load tasks from localStorage
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
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

// Render tasks
function renderTasks() {
  taskList.innerHTML = "";
  const filteredTasks = tasks
    .map((task, originalIndex) => ({ task, originalIndex }))
    .filter(({ task }) => {
      if (currentFilter === "completed") return task.completed;
      if (currentFilter === "pending") return !task.completed;
      return true;
    });

  filteredTasks.forEach(({ task, originalIndex }) => {
    const li = document.createElement("li");
    li.className = `task-item ${task.completed ? "completed" : ""}`;

    li.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? "checked" : ""} data-index="${originalIndex}">
            <span class="task-text">${task.text}</span>
            <button class="task-delete" data-index="${originalIndex}" aria-label="Delete task: ${task.text}">Delete</button>
        `;

    taskList.appendChild(li);
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

// Add task
function addTask(text) {
  const trimmedText = text.trim();
  if (!trimmedText) return;

  tasks.push({ text: trimmedText, completed: false });
  saveTasks();
  renderTasks();
  updateFilterButtons();
  taskInput.value = "";
  taskInput.focus();
}

// Delete task
function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
  updateFilterButtons();
}

// Toggle task completion
function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
  updateFilterButtons();
}

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Event listeners
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (text) {
    addTask(text);
  }
});

taskList.addEventListener("click", (e) => {
  if (e.target.classList.contains("task-delete")) {
    const index = parseInt(e.target.dataset.index);
    deleteTask(index);
  } else if (e.target.classList.contains("task-checkbox")) {
    const index = parseInt(e.target.dataset.index);
    toggleTask(index);
  }
});

// Keyboard navigation for accessibility
taskList.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    if (e.target.classList.contains("task-delete")) {
      e.preventDefault();
      const index = parseInt(e.target.dataset.index);
      deleteTask(index);
    } else if (e.target.classList.contains("task-checkbox")) {
      e.preventDefault();
      const index = parseInt(e.target.dataset.index);
      toggleTask(index);
    }
  }
});

// Filter event listeners
filterAll.addEventListener("click", () => {
  currentFilter = "all";
  updateFilterButtons();
  renderTasks();
});

filterCompleted.addEventListener("click", () => {
  currentFilter = "completed";
  updateFilterButtons();
  renderTasks();
});

filterPending.addEventListener("click", () => {
  currentFilter = "pending";
  updateFilterButtons();
  renderTasks();
});

darkModeToggle.addEventListener("click", () => {
  isDarkMode = !isDarkMode;
  applyTheme();
});

// Initial render
applyTheme();
renderTasks();
updateFilterButtons();
