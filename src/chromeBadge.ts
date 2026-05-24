import { getBadgeState } from './core/deadlines';
import type { Deadline } from './core/types';

export function updateChromeBadge(deadlines: readonly Deadline[]): void {
  const badgeState = getBadgeState(deadlines);
  chrome.action.setBadgeText({ text: badgeState.text });

  if (badgeState.color) {
    chrome.action.setBadgeBackgroundColor({ color: badgeState.color });
  }
}
