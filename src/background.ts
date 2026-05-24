import { updateChromeBadge } from './chromeBadge';
import { chromeDeadlineStorage } from './storage/chromeDeadlineStorage';

async function refreshBadge(): Promise<void> {
  const deadlines = await chromeDeadlineStorage.getDeadlines();
  updateChromeBadge(deadlines);
}

chrome.runtime.onStartup.addListener(() => {
  void refreshBadge();
});

chrome.runtime.onInstalled.addListener(() => {
  void refreshBadge();
});
