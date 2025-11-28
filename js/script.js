document.addEventListener("DOMContentLoaded", () => {
  const taskInput = document.getElementById("task-input");
  const taskDate = document.getElementById("task-date");
  const taskList = document.getElementById("task-list");
  const emptyImage = document.querySelector(".empty-image");
  const form = document.querySelector(".input-area");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const filterArea = document.getElementById("filter-area");
  const progressFill = document.getElementById("progress-fill");
  const progressText = document.getElementById("progress-text");
  const progressPercent = document.getElementById("progress-percent");

  const updateProgress = () => {
    const tasks = [...taskList.children];
    const total = tasks.length;
    const completed = tasks.filter(
      (li) => li.querySelector(".checkbox").checked
    ).length;

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    progressFill.style.width = percent + "%";
    progressText.textContent = `${completed}/${total} tasks completed`;
    progressPercent.textContent = percent + "%";
  };

  const saveTasks = () => {
    const tasks = [...taskList.children].map((li) => ({
      text: li.querySelector("span").textContent,
      date: li.getAttribute("data-date"),
      completed: li.querySelector(".checkbox").checked,
    }));
    localStorage.setItem("tasks", JSON.stringify(tasks));
  };

  const loadTasks = () => {
    const saved = JSON.parse(localStorage.getItem("tasks") || "[]");
    saved.forEach((t) => addTask(t.text, t.completed, t.date));
  };

  const toggleEmptyState = () => {
    const hasTask = taskList.children.length > 0;
    emptyImage.style.display = hasTask ? "none" : "block";

    if (hasTask) {
      filterArea.style.display = "flex";
    } else {
      filterArea.style.display = "none";
    }
  };

  const applyFilter = (filter) => {
    [...taskList.children].forEach((li) => {
      const completed = li.querySelector(".checkbox").checked;
      if (filter === "all") li.style.display = "flex";
      else if (filter === "completed")
        li.style.display = completed ? "flex" : "none";
      else if (filter === "incomplete")
        li.style.display = !completed ? "flex" : "none";
    });
  };

  const initFilterButtons = () => {
    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        document
          .querySelector(".filter-btn.active")
          ?.classList.remove("active");
        btn.classList.add("active");
        applyFilter(btn.dataset.filter);
      });
    });
  };

  initFilterButtons();

  const addTask = (
    text = taskInput.value.trim(),
    completed = false,
    date = taskDate.value || ""
  ) => {
    if (!text) return;

    const li = document.createElement("li");
    li.setAttribute("data-date", date);

    li.innerHTML = `
                    <input type="checkbox" class="checkbox" ${
                      completed ? "checked" : ""
                    } />
                    <div class="task-content">
                        <span>${text}</span>
                        <small class="task-date">${
                          date ? date : "No date"
                        }</small>
                    </div>
                    <div class="task-buttons">
                        <button class="edit-btn"><i class="fa-solid fa-pen"></i></button>
                        <button class="delete-btn"><i class="fa-solid fa-trash"></i></button>
                    </div>
                `;

    const checkbox = li.querySelector(".checkbox");
    const editBtn = li.querySelector(".edit-btn");
    const deleteBtn = li.querySelector(".delete-btn");

    const setCompleted = (state) => {
      li.classList.toggle("completed", state);
      editBtn.disabled = state;
      editBtn.style.opacity = state ? 0.5 : 1;
      editBtn.style.pointerEvents = state ? "none" : "auto";
    };

    if (completed) setCompleted(true);

    checkbox.addEventListener("change", () => {
      setCompleted(checkbox.checked);
      saveTasks();
      updateProgress();
      applyFilter(document.querySelector(".filter-btn.active").dataset.filter);
    });

    editBtn.addEventListener("click", () => {
      if (!checkbox.checked) {
        const span = li.querySelector("span").textContent;
        taskInput.value = span;
        taskDate.value = date;
        li.classList.add("delete-animation");
        setTimeout(() => {
          li.remove();
          toggleEmptyState();
          saveTasks();
          updateProgress();
        }, 300);
      }
    });

    deleteBtn.addEventListener("click", () => {
      li.classList.add("delete-animation");
      setTimeout(() => {
        li.remove();
        toggleEmptyState();
        saveTasks();
        updateProgress();
        applyFilter(
          document.querySelector(".filter-btn.active").dataset.filter
        );
      }, 300);
    });

    taskList.appendChild(li);
    taskInput.value = "";
    taskDate.value = "";
    toggleEmptyState();
    saveTasks();
    updateProgress();
    applyFilter(document.querySelector(".filter-btn.active").dataset.filter);
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    addTask();
  });

  loadTasks();
  toggleEmptyState();
  updateProgress();
});
