import {
  canAddDeadline,
  getBadgeState,
  getDeadlineStatus,
  getDaysUntil,
  getNextDate,
  getRemainingTrialDays,
  getSavedRepeat,
  sortDeadlinesByDate,
} from './core/deadlines';
import {
  ensureTrialStart,
  getCountdownSnapshot,
  getDeadlines,
  setDeadlines,
  setPremium,
} from './storage/deadlineStorage';
import type { Deadline } from './types';

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
  const badgeState = getBadgeState(deadlines);
  chrome.action.setBadgeText({ text: badgeState.text });

  if (badgeState.color) {
    chrome.action.setBadgeBackgroundColor({ color: badgeState.color });
  }
}

function formatDeadlineStatus(deadline: Deadline): string {
  const status = getDeadlineStatus(getDaysUntil(deadline.date));
  if (status.kind === 'overdue') {
    return chrome.i18n.getMessage('statusOverdue');
  }
  if (status.kind === 'today') {
    return chrome.i18n.getMessage('statusToday');
  }
  return chrome.i18n.getMessage('statusRemaining', [status.days.toString()]);
}

function renderDeadlines(deadlines: Deadline[]) {
  const sortedDeadlines = sortDeadlinesByDate(deadlines);

  updateBadge(sortedDeadlines);
  listContainer.innerHTML = '';

  sortedDeadlines.forEach((d) => {
    const status = formatDeadlineStatus(d);

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
    delBtn.onclick = async () => {
      const current = await getDeadlines();
      const filtered = current.filter((item) => item.id !== d.id);
      await setDeadlines(filtered);
      renderDeadlines(filtered);
    };
    item.appendChild(delBtn);

    if (d.repeat && d.repeat !== 'none') {
      const doneBtn = document.createElement('button');
      doneBtn.textContent = '✓';
      doneBtn.style.marginLeft = '5px';
      doneBtn.title = 'Next occurrence';
      doneBtn.onclick = async () => {
        const current = await getDeadlines();
        const updated = current.map((item) => {
          if (item.id === d.id) {
            return { ...item, date: getNextDate(item.date, item.repeat) };
          }
          return item;
        });
        await setDeadlines(updated);
        renderDeadlines(updated);
      };
      item.appendChild(doneBtn);
    }

    listContainer.appendChild(item);
  });
}

async function checkPremium() {
  const snapshot = await getCountdownSnapshot();
  const trialStart = snapshot.trialStartTs || await ensureTrialStart();

  if (snapshot.isPremium) {
    trialStatus.textContent = chrome.i18n.getMessage('premiumActive');
    upgradeBtn.style.display = 'none';
    repeatSelect.style.display = 'block';
  } else {
    const remainingTrial = getRemainingTrialDays(trialStart);
    trialStatus.textContent = chrome.i18n.getMessage('trialDaysLeft', [remainingTrial.toString()]);
    upgradeBtn.style.display = 'inline-block';
    repeatSelect.style.display = 'none';
  }
  renderDeadlines(snapshot.deadlines);
}

upgradeBtn.onclick = async () => {
  // Simulate Stripe checkout
  await setPremium(true);
  await checkPremium();
};

addBtn.addEventListener('click', async () => {
  const name = nameInput.value.trim();
  const date = dateInput.value;
  const repeat = repeatSelect.value as Deadline['repeat'];

  if (!name || !date) return;

  const snapshot = await getCountdownSnapshot();

  if (!canAddDeadline(snapshot.isPremium, snapshot.deadlines.length)) {
    alert(chrome.i18n.getMessage('limitReached'));
    return;
  }

  const newDeadline: Deadline = {
    id: crypto.randomUUID(),
    name,
    date,
    repeat: getSavedRepeat(snapshot.isPremium, repeat),
  };
  const updated = [...snapshot.deadlines, newDeadline];
  await setDeadlines(updated);
  nameInput.value = '';
  dateInput.value = '';
  repeatSelect.value = 'none';
  renderDeadlines(updated);
});

checkPremium();
initI18n();
