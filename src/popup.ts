interface Deadline {
  id: string;
  name: string;
  date: string;
}

const nameInput = document.getElementById('deadline-name') as HTMLInputElement;
const dateInput = document.getElementById('deadline-date') as HTMLInputElement;
const addBtn = document.getElementById('add-btn') as HTMLButtonElement;
const listContainer = document.getElementById('deadline-list') as HTMLDivElement;

function updateBadge(deadlines: Deadline[]) {
  if (deadlines.length === 0) {
    chrome.action.setBadgeText({ text: '' });
    return;
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  let minDiff = Infinity;
  deadlines.forEach((d) => {
    const target = new Date(d.date);
    target.setHours(0, 0, 0, 0);
    const diffMs = target.getTime() - now.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < minDiff) {
      minDiff = diffDays;
    }
  });

  const badgeText = minDiff < 0 ? '!' : minDiff.toString();
  chrome.action.setBadgeText({ text: badgeText });

  if (minDiff <= 3) {
    chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
  } else {
    chrome.action.setBadgeBackgroundColor({ color: '#4688F1' });
  }
}

function renderDeadlines(deadlines: Deadline[]) {
  updateBadge(deadlines);
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
    item.style.display = 'flex';
    item.style.justifyContent = 'space-between';
    item.style.alignItems = 'center';

    const text = document.createElement('span');
    text.textContent = `${d.name} - ${d.date} (${status})`;
    item.appendChild(text);

    const delBtn = document.createElement('button');
    delBtn.textContent = '削除';
    delBtn.style.marginLeft = '5px';
    delBtn.onclick = () => {
      chrome.storage.local.get(['deadlines'], (result) => {
        const current: Deadline[] = result.deadlines || [];
        const filtered = current.filter((item) => item.id !== d.id);
        chrome.storage.local.set({ deadlines: filtered }, () => {
          renderDeadlines(filtered);
        });
      });
    };
    item.appendChild(delBtn);

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
