import type { Deadline, DeadlineRepeat } from '../types';

const DAY_MS = 1000 * 60 * 60 * 24;

export interface BadgeState {
  text: string;
  color?: string;
}

export type DeadlineStatus =
  | { kind: 'overdue' }
  | { kind: 'today' }
  | { kind: 'remaining'; days: number };

function startOfDay(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

export function getDaysUntil(dateStr: string, today = new Date()): number {
  const target = startOfDay(new Date(dateStr));
  const current = startOfDay(today);
  return Math.round((target.getTime() - current.getTime()) / DAY_MS);
}

export function getDeadlineStatus(daysUntil: number): DeadlineStatus {
  if (daysUntil < 0) {
    return { kind: 'overdue' };
  }
  if (daysUntil === 0) {
    return { kind: 'today' };
  }
  return { kind: 'remaining', days: daysUntil };
}

export function sortDeadlinesByDate(deadlines: readonly Deadline[]): Deadline[] {
  return [...deadlines].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
}

export function getNextDate(dateStr: string, repeat: Deadline['repeat']): string {
  const date = new Date(dateStr);
  if (repeat === 'weekly') {
    date.setDate(date.getDate() + 7);
  } else if (repeat === 'monthly') {
    date.setMonth(date.getMonth() + 1);
  } else if (repeat === 'yearly') {
    date.setFullYear(date.getFullYear() + 1);
  }
  return date.toISOString().slice(0, 10);
}

export function getBadgeState(deadlines: readonly Deadline[], today = new Date()): BadgeState {
  if (deadlines.length === 0) {
    return { text: '' };
  }

  const minDaysUntil = Math.min(...deadlines.map((deadline) => getDaysUntil(deadline.date, today)));
  return {
    text: minDaysUntil < 0 ? '!' : minDaysUntil.toString(),
    color: minDaysUntil <= 3 ? '#FF0000' : '#4688F1',
  };
}

export function canAddDeadline(isPremium: boolean, deadlineCount: number): boolean {
  return isPremium || deadlineCount < 5;
}

export function getSavedRepeat(isPremium: boolean, repeat: DeadlineRepeat): DeadlineRepeat {
  return isPremium ? repeat : 'none';
}

export function getRemainingTrialDays(trialStartTs: number, nowTs = Date.now()): number {
  const elapsedDays = Math.floor((nowTs - trialStartTs) / DAY_MS);
  return Math.max(0, 7 - elapsedDays);
}
