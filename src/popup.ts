interface Deadline {
  id: string;
  name: string;
  date: string;
}

const nameInput = document.getElementById('deadline-name') as HTMLInputElement;
const dateInput = document.getElementById('deadline-date') as HTMLInputElement;
const addBtn = document.getElementById('add-btn') as HTMLButtonElement;
const listContainer = document.getElementById('deadline-list') as HTMLDivElement;

function renderDeadlines(deadlines: Deadline[]) {
  listContainer.innerHTML = '';
  deadlines.forEach((d) => {
    const item = document.createElement('div');
    item.style.padding = '5px';
    item.style.borderBottom = '1px solid #ccc';
    item.textContent = `${d.name} - ${d.date}`;
    listContainer.appendChild(item);
  });
}

function loadDeadlines() {
  chrome.storage.local.get(['deadlines'], (result) => {
    const deadlines: Deadline[] = result.deadlines || [];
    renderDeadlines(deadlines);
  });
}

addBtn.addEventListener('click', () => {
  const name = nameInput.value.trim();
  const date = dateInput.value;

  if (!name || !date) return;

  chrome.storage.local.get(['deadlines'], (result) => {
    const deadlines: Deadline[] = result.deadlines || [];
    const newDeadline: Deadline = {
      id: crypto.randomUUID(),
      name,
      date,
    };
    const updated = [...deadlines, newDeadline];
    chrome.storage.local.set({ deadlines: updated }, () => {
      nameInput.value = '';
      dateInput.value = '';
      renderDeadlines(updated);
    });
  });
});

loadDeadlines();
