import { Deadline } from './types';

const nameInput = document.getElementById('deadline-name') as HTMLInputElement;
const dateInput = document.getElementById('deadline-date') as HTMLInputElement;
const repeatSelect = document.getElementById('deadline-repeat') as HTMLSelectElement;
const addBtn = document.getElementById('add-btn') as HTMLButtonElement;
const listContainer = document.getElementById('deadline-list') as HTMLDivElement;
const trialStatus = document.getElementById('trial-status') as HTMLSpanElement;
const upgradeBtn = document.getElementById('upgrade-btn') as HTMLButtonElement;

function initI18n() {
  const titleEl = document.getElementById('title');
  if (titleEl) titleEl.textContent = chrome.i18n.getMessage('title');
  nameInput.placeholder = chrome.i18n.getMessage('namePlaceholder');
  addBtn.textContent = chrome.i18n.getMessage('addButton');
  
  document.getElementById('repeat-none')!.textContent = chrome.i18n.getMessage('repeatNone');
  document.getElementById('repeat-weekly')!.textContent = chrome.i18n.getMessage('repeatWeekly');
  document.getElementById('repeat-monthly')!.textContent = chrome.i18n.getMessage('repeatMonthly');
  document.getElementById('repeat-yearly')!.textContent = chrome.i18n.getMessage('repeatYearly');
  upgradeBtn.textContent = chrome.i18n.getMessage('upgradeButton');
}

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

function getNextDate(dateStr: string, repeat: string): string {
  const date = new Date(dateStr);
  if (repeat === 'weekly') {
    date.setDate(date.getDate() + 7);
  } else if (repeat === 'monthly') {
    date.setMonth(date.getMonth() + 1);
  } else if (repeat === 'yearly') {
    date.setFullYear(date.getFullYear() + 1);
  }
  return date.toISOString().split('T')[0];
}

function renderDeadlines(deadlines: Deadline[]) {
  const sortedDeadlines = [...deadlines].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  updateBadge(sortedDeadlines);
  listContainer.innerHTML = '';
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  sortedDeadlines.forEach((d) => {
    const target = new Date(d.date);
    target.setHours(0, 0, 0, 0);
    const diffMs = target.getTime() - now.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    const status = diffDays < 0
      ? chrome.i18n.getMessage('statusOverdue')
      : diffDays === 0
        ? chrome.i18n.getMessage('statusToday')
        : chrome.i18n.getMessage('statusRemaining', [diffDays.toString()]);

    const item = document.createElement('div');
    item.style.padding = '5px';
    item.style.borderBottom = '1px solid #ccc';
    item.style.display = 'flex';
    item.style.justifyContent = 'space-between';
    item.style.alignItems = 'center';

    const text = document.createElement('span');
    const repeatLabel = d.repeat && d.repeat !== 'none' ? ` [${chrome.i18n.getMessage('repeat' + d.repeat.charAt(0).toUpperCase() + d.repeat.slice(1))}]` : '';
    text.textContent = `${d.name} - ${d.date}${repeatLabel} (${status})`;
    item.appendChild(text);

    const delBtn = document.createElement('button');
    delBtn.textContent = chrome.i18n.getMessage('deleteButton');
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

    if (d.repeat && d.repeat !== 'none') {
      const doneBtn = document.createElement('button');
      doneBtn.textContent = '✓';
      doneBtn.style.marginLeft = '5px';
      doneBtn.title = 'Next occurrence';
      doneBtn.onclick = () => {
        chrome.storage.local.get(['deadlines'], (result) => {
          const current: Deadline[] = result.deadlines || [];
          const updated = current.map((item) => {
            if (item.id === d.id) {
              return { ...item, date: getNextDate(item.date, item.repeat!) };
            }
            return item;
          });
          chrome.storage.local.set({ deadlines: updated }, () => {
            renderDeadlines(updated);
          });
        });
      };
      item.appendChild(doneBtn);
    }

    listContainer.appendChild(item);
  });
}

function checkPremium() {
  chrome.storage.local.get(['isPremium', 'trial_start_ts', 'deadlines'], (result) => {
    const isPremium = result.isPremium || false;
    let trialStart = result.trial_start_ts;
    const deadlines = result.deadlines || [];

    if (!trialStart) {
      trialStart = Date.now();
      chrome.storage.local.set({ trial_start_ts: trialStart });
    }

    if (isPremium) {
      trialStatus.textContent = chrome.i18n.getMessage('premiumActive');
      upgradeBtn.style.display = 'none';
      repeatSelect.style.display = 'block';
    } else {
      const elapsedDays = Math.floor((Date.now() - trialStart) / (1000 * 60 * 60 * 24));
      const remainingTrial = Math.max(0, 7 - elapsedDays);
      trialStatus.textContent = chrome.i18n.getMessage('trialDaysLeft', [remainingTrial.toString()]);
      upgradeBtn.style.display = 'inline-block';
      repeatSelect.style.display = 'none';
    }
    renderDeadlines(deadlines);
  });
}

upgradeBtn.onclick = () => {
  // Simulate Stripe checkout
  chrome.storage.local.set({ isPremium: true }, () => {
    checkPremium();
  });
};

addBtn.addEventListener('click', () => {
  const name = nameInput.value.trim();
  const date = dateInput.value;
  const repeat = repeatSelect.value as Deadline['repeat'];

  if (!name || !date) return;

  chrome.storage.local.get(['deadlines', 'isPremium'], (result) => {
    const deadlines: Deadline[] = result.deadlines || [];
    const isPremium = result.isPremium || false;

    if (!isPremium && deadlines.length >= 5) {
      alert(chrome.i18n.getMessage('limitReached'));
      return;
    }

    const newDeadline: Deadline = {
      id: crypto.randomUUID(),
      name,
      date,
      repeat: isPremium ? repeat : 'none',
    };
    const updated = [...deadlines, newDeadline];
    chrome.storage.local.set({ deadlines: updated }, () => {
      nameInput.value = '';
      dateInput.value = '';
      repeatSelect.value = 'none';
      renderDeadlines(updated);
    });
  });
});

checkPremium();
initI18n();
