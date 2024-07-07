import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import {
  getDatabase,
  ref,
  push,
  set,
  update,
  remove,
  get,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBVANEg1AkLKioL3x73nsgGBsj16YcX3js",
  authDomain: "to-do-app-96ef3.firebaseapp.com",
  databaseURL: "https://to-do-app-96ef3-default-rtdb.firebaseio.com",
  projectId: "to-do-app-96ef3",
  storageBucket: "to-do-app-96ef3",
  messagingSenderId: "976710539803",
  appId: "1:976710539803:web:3092f68a5ba4070d75b6be"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

// Create List
const createListForm = document.getElementById('create-list-form');
createListForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const listName = document.getElementById('list-name').value;
  const listRef = push(ref(database, 'lists'));/*تنشئ مكان للبيانات */
  await set(listRef, { name: listName });/*هون تعيين القيمه */
  alert('List created!');
  loadLists();
});

// Add Task
const addTaskBtn = document.getElementById('add-task-btn');
addTaskBtn.addEventListener('click', async () => {
  const listSelect = document.getElementById('list-select');
  const selectedListId = listSelect.value;
  const taskName = document.getElementById('task-name').value;
  const taskPriority = document.getElementById('task-priority').value;
  const taskDueDate = document.getElementById('task-due-date').value;
  const taskRef = push(ref(database, `lists/${selectedListId}/tasks`));
  await set(taskRef, {/*عين القييم للمكان لي حجزنا بسطر لقبل */
    name: taskName,
    priority: taskPriority,
    dueDate: taskDueDate,
    completed: false
  });
  alert('Task added!');
  loadTasks(selectedListId);
});

// Load Lists
const loadLists = async () => {
  const listSelect = document.createElement('select');
  listSelect.id = 'list-select';
  const listsRef = ref(database, 'lists');
  const snapshot = await get(listsRef);
  const lists = snapshot.val();
  listSelect.innerHTML = '';
  for (const id in lists) {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = lists[id].name;
    listSelect.appendChild(option);
  }
  document.querySelector('.task-controls').prepend(listSelect);
  listSelect.addEventListener('change', () => {
    loadTasks(listSelect.value);
  });
};

// Load Tasks
const loadTasks = async (listId) => {
  const taskList = document.getElementById('task-list');
  const tasksRef = ref(database, `lists/${listId}/tasks`);
  const snapshot = await get(tasksRef);
  const tasks = snapshot.val();
  const selectedPriority = document.getElementById('filter-priority').value;
  const selectedDueDate = document.getElementById('filter-due-date').value;
  
  taskList.innerHTML = '';
  for (const id in tasks) {
    const task = tasks[id];
    const matchesPriority = !selectedPriority || task.priority === selectedPriority;
    const matchesDueDate = !selectedDueDate || task.dueDate === selectedDueDate;
    if (matchesPriority && matchesDueDate) {
      const taskCard = document.createElement('div');
      taskCard.className = `task-card ${task.priority} ${task.completed ? 'completed' : ''}`;
      taskCard.innerHTML = `
        <h3>${task.name}</h3>
        <p>Priority: ${task.priority}</p>
        <p>Due Date: ${task.dueDate}</p>
        <button class="complete-task" data-id="${id}">${task.completed ? 'Uncomplete' : 'Complete'}</button>
        <button class="edit-task" data-id="${id}">Edit</button>
        <button class="delete-task" data-id="${id}">Delete</button>
      `;
      taskList.appendChild(taskCard);
    }
  }
  
  document.querySelectorAll('.complete-task').forEach(button => {
    button.addEventListener('click', async (e) => {
      const taskId = e.target.dataset.id;
      const taskRef = ref(database, `lists/${listId}/tasks/${taskId}`);
      const snapshot = await get(taskRef);
      const task = snapshot.val();
      await update(taskRef, { completed: !task.completed });
      loadTasks(listId);
    });
  });

  document.querySelectorAll('.edit-task').forEach(button => {
    button.addEventListener('click', (e) => {
      const taskId = e.target.dataset.id;
      editTask(listId, taskId);
    });
  });

  document.querySelectorAll('.delete-task').forEach(button => {
    button.addEventListener('click', async (e) => {
      const taskId = e.target.dataset.id;
      await remove(ref(database, `lists/${listId}/tasks/${taskId}`));
      alert('Task deleted!');
      loadTasks(listId);
    });
  });
};

// Edit Task
const editTask = async (listId, taskId) => {
  const taskRef = ref(database, `lists/${listId}/tasks/${taskId}`);
  const snapshot = await get(taskRef);
  const task = snapshot.val();
  
  document.getElementById('task-name').value = task.name;
  document.getElementById('task-priority').value = task.priority;
  document.getElementById('task-due-date').value = task.dueDate;

  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save Changes';
  saveBtn.id = 'save-task-btn';
  document.querySelector('.task-controls').appendChild(saveBtn);

  saveBtn.addEventListener('click', async () => {
    const updatedTask = {
      name: document.getElementById('task-name').value,
      priority: document.getElementById('task-priority').value,
      dueDate: document.getElementById('task-due-date').value,
    };
    await update(taskRef, updatedTask);
    alert('Task updated!');
    loadTasks(listId);
    saveBtn.remove();
  });
};

document.getElementById('filter-priority').addEventListener('change', () => {
  const listSelect = document.getElementById('list-select');
  if (listSelect.value) {
    loadTasks(listSelect.value);
  }
});

document.getElementById('filter-due-date').addEventListener('change', () => {
  const listSelect = document.getElementById('list-select');
  if (listSelect.value) {
    loadTasks(listSelect.value);
  }
});

loadLists();



