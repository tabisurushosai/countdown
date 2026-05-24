import { updateChromeBadge } from './chromeBadge';
import { getDeadlines } from './storage/deadlineStorage';

async function refreshBadge(): Promise<void> {
  const deadlines = await getDeadlines();
  updateChromeBadge(deadlines);
}

chrome.runtime.onStartup.addListener(() => {
  refreshBadge();
});

chrome.runtime.onInstalled.addListener(() => {
  refreshBadge();
});
