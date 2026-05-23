import { getBadgeState } from './core/deadlines';
import { getDeadlines } from './storage/deadlineStorage';
import type { Deadline } from './types';

function updateBadge(deadlines: Deadline[]) {
  const badgeState = getBadgeState(deadlines);
  chrome.action.setBadgeText({ text: badgeState.text });

  if (badgeState.color) {
    chrome.action.setBadgeBackgroundColor({ color: badgeState.color });
  }
}

async function refreshBadge() {
  const deadlines = await getDeadlines();
  updateBadge(deadlines);
}

chrome.runtime.onStartup.addListener(() => {
  refreshBadge();
});

chrome.runtime.onInstalled.addListener(() => {
  refreshBadge();
});
