interface Deadline {
  id: string;
  name: string;
  date: string;
}

export {};

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

function refreshBadge() {
  chrome.storage.local.get(['deadlines'], (result) => {
    const deadlines: Deadline[] = result.deadlines || [];
    updateBadge(deadlines);
  });
}

chrome.runtime.onStartup.addListener(() => {
  refreshBadge();
});

chrome.runtime.onInstalled.addListener(() => {
  refreshBadge();
});
