import {
  canAddDeadline,
  type DeadlineStatus,
  getDeadlineStatus,
  getDaysUntil,
  getNextDate,
  getRemainingTrialDays,
  getSavedRepeat,
  sortDeadlinesByDate,
} from './core/deadlines';
import { updateChromeBadge } from './chromeBadge';
import {
  ensureTrialStart,
  getCountdownSnapshot,
  getDeadlines,
  setDeadlines,
  setPremium,
} from './storage/deadlineStorage';
import { isDeadlineRepeat } from './types';
import type { Deadline, DeadlineRepeat } from './types';

const REPEAT_LABEL_MESSAGE_KEYS: Record<Exclude<DeadlineRepeat, 'none'>, string> = {
  weekly: 'repeatWeekly',
  monthly: 'repeatMonthly',
  yearly: 'repeatYearly',
};

function getRequiredElement<T extends HTMLElement>(id: string, elementType: { new (): T }): T {
  const element = document.getElementById(id);
  if (!(element instanceof elementType)) {
    throw new Error(`Expected #${id} to be a ${elementType.name}`);
  }
  return element;
}

function setTextById(id: string, text: string): void {
  getRequiredElement(id, HTMLElement).textContent = text;
}

const nameInput = getRequiredElement('deadline-name', HTMLInputElement);
const dateInput = getRequiredElement('deadline-date', HTMLInputElement);
const repeatSelect = getRequiredElement('deadline-repeat', HTMLSelectElement);
const addBtn = getRequiredElement('add-btn', HTMLButtonElement);
const listContainer = getRequiredElement('deadline-list', HTMLDivElement);
const trialStatus = getRequiredElement('trial-status', HTMLSpanElement);
const upgradeBtn = getRequiredElement('upgrade-btn', HTMLButtonElement);

function initI18n() {
  const titleEl = document.getElementById('title');
  if (titleEl) titleEl.textContent = chrome.i18n.getMessage('title');
  nameInput.placeholder = chrome.i18n.getMessage('namePlaceholder');
  addBtn.textContent = chrome.i18n.getMessage('addButton');

  setTextById('repeat-none', chrome.i18n.getMessage('repeatNone'));
  setTextById('repeat-weekly', chrome.i18n.getMessage('repeatWeekly'));
  setTextById('repeat-monthly', chrome.i18n.getMessage('repeatMonthly'));
  setTextById('repeat-yearly', chrome.i18n.getMessage('repeatYearly'));
  upgradeBtn.textContent = chrome.i18n.getMessage('upgradeButton');
  listContainer.replaceChildren(createStateMessage(chrome.i18n.getMessage('loadingState')));
}

function setHidden(element: HTMLElement, hidden: boolean) {
  element.classList.toggle('is-hidden', hidden);
}

function createStateMessage(message: string): HTMLDivElement {
  const state = document.createElement('div');
  state.className = 'state-message';
  state.textContent = message;
  return state;
}

function formatDeadlineStatus(status: DeadlineStatus): string {
  if (status.kind === 'overdue') {
    return chrome.i18n.getMessage('statusOverdue');
  }
  if (status.kind === 'today') {
    return chrome.i18n.getMessage('statusToday');
  }
  return chrome.i18n.getMessage('statusRemaining', [status.days.toString()]);
}

function getRepeatLabel(deadline: Deadline): string {
  const repeat = deadline.repeat;
  if (!repeat || repeat === 'none') {
    return '';
  }

  return chrome.i18n.getMessage(REPEAT_LABEL_MESSAGE_KEYS[repeat]);
}

function createDeadlineItem(deadline: Deadline): HTMLDivElement {
  const status = getDeadlineStatus(getDaysUntil(deadline.date));

  const item = document.createElement('div');
  item.className = 'deadline-item';

  const main = document.createElement('div');
  main.className = 'deadline-main';

  const name = document.createElement('div');
  name.className = 'deadline-name';
  name.textContent = deadline.name;
  main.appendChild(name);

  const meta = document.createElement('div');
  meta.className = 'deadline-meta';

  const date = document.createElement('time');
  date.dateTime = deadline.date;
  date.textContent = deadline.date;
  meta.appendChild(date);

  const statusBadge = document.createElement('span');
  statusBadge.className = `status-badge status-${status.kind}`;
  statusBadge.textContent = formatDeadlineStatus(status);
  meta.appendChild(statusBadge);

  const repeatLabel = getRepeatLabel(deadline);
  if (repeatLabel) {
    const repeat = document.createElement('span');
    repeat.className = 'repeat-badge';
    repeat.textContent = repeatLabel;
    meta.appendChild(repeat);
  }

  main.appendChild(meta);
  item.appendChild(main);

  const actions = document.createElement('div');
  actions.className = 'deadline-actions';

  const delBtn = document.createElement('button');
  delBtn.className = 'icon-button danger-button';
  delBtn.textContent = chrome.i18n.getMessage('deleteButton');
  delBtn.onclick = async () => {
    const current = await getDeadlines();
    const filtered = current.filter((item) => item.id !== deadline.id);
    await setDeadlines(filtered);
    renderDeadlines(filtered);
  };
  actions.appendChild(delBtn);

  if (deadline.repeat && deadline.repeat !== 'none') {
    const doneBtn = document.createElement('button');
    doneBtn.className = 'icon-button';
    doneBtn.textContent = '✓';
    doneBtn.title = chrome.i18n.getMessage('nextOccurrenceButtonTitle');
    doneBtn.onclick = async () => {
      const current = await getDeadlines();
      const updated = current.map((item) => {
        if (item.id === deadline.id) {
          return { ...item, date: getNextDate(item.date, item.repeat) };
        }
        return item;
      });
      await setDeadlines(updated);
      renderDeadlines(updated);
    };
    actions.appendChild(doneBtn);
  }

  item.appendChild(actions);
  return item;
}

function renderDeadlines(deadlines: Deadline[]) {
  const sortedDeadlines = sortDeadlinesByDate(deadlines);

  updateChromeBadge(sortedDeadlines);
  listContainer.replaceChildren();

  if (sortedDeadlines.length === 0) {
    listContainer.appendChild(createStateMessage(chrome.i18n.getMessage('emptyState')));
    return;
  }

  sortedDeadlines.forEach((deadline) => {
    listContainer.appendChild(createDeadlineItem(deadline));
  });
}

async function checkPremium() {
  const snapshot = await getCountdownSnapshot();
  const trialStart = snapshot.trialStartTs || await ensureTrialStart();

  if (snapshot.isPremium) {
    trialStatus.textContent = chrome.i18n.getMessage('premiumActive');
    setHidden(upgradeBtn, true);
    setHidden(repeatSelect, false);
  } else {
    const remainingTrial = getRemainingTrialDays(trialStart);
    trialStatus.textContent = chrome.i18n.getMessage('trialDaysLeft', [remainingTrial.toString()]);
    setHidden(upgradeBtn, false);
    setHidden(repeatSelect, true);
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
  const repeat = isDeadlineRepeat(repeatSelect.value) ? repeatSelect.value : 'none';

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

initI18n();
void checkPremium();
