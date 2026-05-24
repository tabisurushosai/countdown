import type { Deadline } from '../types';
import { chromeLocalStorageAdapter } from './chromeLocalStorageAdapter';
import {
  ensureTrialStart as ensureTrialStartWithStorage,
  getCountdownSnapshot as getCountdownSnapshotWithStorage,
  getDeadlines as getDeadlinesWithStorage,
  setDeadlines as setDeadlinesWithStorage,
  setPremium as setPremiumWithStorage,
  type CountdownSnapshot,
} from './deadlineStorage';

export function getDeadlines(): Promise<Deadline[]> {
  return getDeadlinesWithStorage(chromeLocalStorageAdapter);
}

export function setDeadlines(deadlines: Deadline[]): Promise<void> {
  return setDeadlinesWithStorage(deadlines, chromeLocalStorageAdapter);
}

export function getCountdownSnapshot(): Promise<CountdownSnapshot> {
  return getCountdownSnapshotWithStorage(chromeLocalStorageAdapter);
}

export function ensureTrialStart(nowTs = Date.now()): Promise<number> {
  return ensureTrialStartWithStorage(chromeLocalStorageAdapter, nowTs);
}

export function setPremium(isPremium: boolean): Promise<void> {
  return setPremiumWithStorage(isPremium, chromeLocalStorageAdapter);
}
