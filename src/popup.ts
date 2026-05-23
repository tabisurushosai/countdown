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
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  deadlines.forEach((d) => {
    const target = new Date(d.date);
    target.setHours(0, 0, 0, 0);
    const diffMs = target.getTime() - now.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    let status = '';
    if (diffDays < 0) {
      status = '超過';
    } else if (diffDays === 0) {
      status = '今日';
    } else {
      status = `残り ${diffDays} 日`;
    }

    const item = document.createElement('div');
    item.style.padding = '5px';
    item.style.borderBottom = '1px solid #ccc';
    item.textContent = `${d.name} - ${d.date} (${status})`;
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
