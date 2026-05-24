import {
  canAddDeadline,
  type DeadlineStatus,
  FREE_DEADLINE_LIMIT,
  getDeadlineStatus,
  getDaysUntil,
  getNextDate,
  getRemainingTrialDays,
  getSavedRepeat,
  sortDeadlinesByDate,
} from './core/deadlines';
import { formatDisplayDate, formatInteger, type DisplayLocale } from './core/formatting';
import { updateChromeBadge } from './chromeBadge';
import {
  ensureTrialStart,
  getCountdownSnapshot,
  getDeadlines,
  setDeadlines,
  setPremium,
} from './storage/chromeDeadlineStorage';
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
const repeatLabel = getRequiredElement('deadline-repeat-label', HTMLLabelElement);
const addBtn = getRequiredElement('add-btn', HTMLButtonElement);
const inputForm = getRequiredElement('input-form', HTMLFormElement);
const listContainer = getRequiredElement('deadline-list', HTMLElement);
const trialStatus = getRequiredElement('trial-status', HTMLSpanElement);
const upgradeBtn = getRequiredElement('upgrade-btn', HTMLButtonElement);
const onboardingGuide = getRequiredElement('onboarding-guide', HTMLElement);
let displayLocale: DisplayLocale = 'en';

function initI18n(): void {
  displayLocale = chrome.i18n.getUILanguage().startsWith('ja') ? 'ja' : 'en';
  document.documentElement.lang = displayLocale;

  const titleEl = document.getElementById('title');
  if (titleEl) titleEl.textContent = chrome.i18n.getMessage('title');
  setTextById('deadline-name-label', chrome.i18n.getMessage('nameLabel'));
  setTextById('deadline-date-label', chrome.i18n.getMessage('dateLabel'));
  setTextById('deadline-repeat-label', chrome.i18n.getMessage('repeatLabel'));
  setTextById('deadline-list-title', chrome.i18n.getMessage('deadlineListLabel'));
  setTextById('premium-info-title', chrome.i18n.getMessage('premiumInfoLabel'));
  nameInput.placeholder = chrome.i18n.getMessage('namePlaceholder');
  onboardingGuide.textContent = chrome.i18n.getMessage('onboardingGuide');
  addBtn.textContent = chrome.i18n.getMessage('addButton');

  setTextById('repeat-none', chrome.i18n.getMessage('repeatNone'));
  setTextById('repeat-weekly', chrome.i18n.getMessage('repeatWeekly'));
  setTextById('repeat-monthly', chrome.i18n.getMessage('repeatMonthly'));
  setTextById('repeat-yearly', chrome.i18n.getMessage('repeatYearly'));
  upgradeBtn.textContent = chrome.i18n.getMessage('upgradeButton');
  listContainer.removeAttribute('role');
  listContainer.replaceChildren(createStateMessage(chrome.i18n.getMessage('loadingState')));
}

function setHidden(element: HTMLElement, hidden: boolean): void {
  element.classList.toggle('is-hidden', hidden);
}

function setOnboardingVisible(visible: boolean): void {
  setHidden(onboardingGuide, !visible);
  if (visible) {
    inputForm.setAttribute('aria-describedby', 'onboarding-guide');
  } else {
    inputForm.removeAttribute('aria-describedby');
  }
}

function setRepeatSelectHidden(hidden: boolean): void {
  setHidden(repeatLabel, hidden);
  setHidden(repeatSelect, hidden);
  repeatSelect.disabled = hidden;
  repeatSelect.setAttribute('aria-hidden', hidden.toString());
}

function focusDeadlineList(): void {
  listContainer.focus({ preventScroll: true });
}

function createStateMessage(message: string): HTMLDivElement {
  const state = document.createElement('div');
  state.className = 'state-message';
  state.setAttribute('role', 'status');
  state.textContent = message;
  return state;
}

function createEmptyStateMessage(): HTMLDivElement {
  const state = document.createElement('div');
  state.className = 'state-message empty-state';
  state.setAttribute('role', 'status');

  const title = document.createElement('div');
  title.className = 'state-title';
  title.textContent = chrome.i18n.getMessage('emptyStateTitle');
  state.appendChild(title);

  const body = document.createElement('p');
  body.className = 'state-body';
  body.textContent = chrome.i18n.getMessage('emptyStateBody');
  state.appendChild(body);

  const hint = document.createElement('p');
  hint.className = 'state-hint';
  hint.textContent = chrome.i18n.getMessage('emptyStateHint');
  state.appendChild(hint);

  return state;
}

function formatDeadlineStatus(status: DeadlineStatus): string {
  if (status.kind === 'overdue') {
    return chrome.i18n.getMessage('statusOverdue');
  }
  if (status.kind === 'today') {
    return chrome.i18n.getMessage('statusToday');
  }

  const messageKey = status.days === 1 ? 'statusRemainingOne' : 'statusRemaining';
  return chrome.i18n.getMessage(messageKey, [formatInteger(status.days, displayLocale)]);
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
  const itemId = `deadline-${deadline.id}`;

  const item = document.createElement('div');
  item.className = 'deadline-item';
  item.setAttribute('role', 'listitem');
  item.setAttribute('aria-labelledby', `${itemId}-name`);
  item.setAttribute('aria-describedby', `${itemId}-meta`);

  const main = document.createElement('div');
  main.className = 'deadline-main';

  const name = document.createElement('div');
  name.id = `${itemId}-name`;
  name.className = 'deadline-name';
  name.textContent = deadline.name;
  main.appendChild(name);

  const meta = document.createElement('div');
  meta.id = `${itemId}-meta`;
  meta.className = 'deadline-meta';

  const date = document.createElement('time');
  date.dateTime = deadline.date;
  date.textContent = formatDisplayDate(deadline.date, displayLocale);
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
  delBtn.type = 'button';
  delBtn.textContent = chrome.i18n.getMessage('deleteButton');
  delBtn.setAttribute('aria-label', chrome.i18n.getMessage('deleteDeadlineButtonLabel', [deadline.name]));
  delBtn.onclick = async () => {
    const current = await getDeadlines();
    const filtered = current.filter((item) => item.id !== deadline.id);
    await setDeadlines(filtered);
    renderDeadlines(filtered);
    focusDeadlineList();
  };
  actions.appendChild(delBtn);

  if (deadline.repeat && deadline.repeat !== 'none') {
    const doneBtn = document.createElement('button');
    doneBtn.className = 'icon-button';
    doneBtn.type = 'button';
    doneBtn.textContent = '✓';
    doneBtn.title = chrome.i18n.getMessage('nextOccurrenceButtonTitle');
    doneBtn.setAttribute('aria-label', chrome.i18n.getMessage('nextOccurrenceButtonLabel', [deadline.name]));
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
      focusDeadlineList();
    };
    actions.appendChild(doneBtn);
  }

  item.appendChild(actions);
  return item;
}

function renderDeadlines(deadlines: readonly Deadline[]): void {
  const sortedDeadlines = sortDeadlinesByDate(deadlines);

  updateChromeBadge(sortedDeadlines);
  listContainer.replaceChildren();
  setOnboardingVisible(sortedDeadlines.length === 0);

  if (sortedDeadlines.length === 0) {
    listContainer.removeAttribute('role');
    listContainer.appendChild(createEmptyStateMessage());
    return;
  }

  listContainer.setAttribute('role', 'list');
  sortedDeadlines.forEach((deadline) => {
    listContainer.appendChild(createDeadlineItem(deadline));
  });
}

async function checkPremium(): Promise<void> {
  const snapshot = await getCountdownSnapshot();
  const trialStart = snapshot.trialStartTs || (await ensureTrialStart());

  if (snapshot.isPremium) {
    trialStatus.textContent = chrome.i18n.getMessage('premiumActive');
    setHidden(upgradeBtn, true);
    setRepeatSelectHidden(false);
  } else {
    const remainingTrial = getRemainingTrialDays(trialStart);
    const messageKey = remainingTrial === 1 ? 'trialDaysLeftOne' : 'trialDaysLeft';
    trialStatus.textContent = chrome.i18n.getMessage(messageKey, [
      formatInteger(remainingTrial, displayLocale),
    ]);
    setHidden(upgradeBtn, false);
    setRepeatSelectHidden(true);
  }
  renderDeadlines(snapshot.deadlines);
}

upgradeBtn.onclick = async () => {
  // Simulate Stripe checkout
  await setPremium(true);
  await checkPremium();
};

inputForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const date = dateInput.value;
  const repeat = isDeadlineRepeat(repeatSelect.value) ? repeatSelect.value : 'none';

  if (!name || !date) return;

  const snapshot = await getCountdownSnapshot();

  if (!canAddDeadline(snapshot.isPremium, snapshot.deadlines.length)) {
    alert(
      chrome.i18n.getMessage('limitReached', [
        formatInteger(FREE_DEADLINE_LIMIT, displayLocale),
      ]),
    );
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
