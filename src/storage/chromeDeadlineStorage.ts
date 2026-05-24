import type { Deadline } from '../core/types';
import { chromeLocalStorageAdapter } from './chromeLocalStorageAdapter';
import {
  createCountdownStorage,
  type CountdownSnapshot,
} from './deadlineStorage';

const chromeDeadlineStorage = createCountdownStorage(chromeLocalStorageAdapter);

export function getDeadlines(): Promise<Deadline[]> {
  return chromeDeadlineStorage.getDeadlines();
}

export function setDeadlines(deadlines: Deadline[]): Promise<void> {
  return chromeDeadlineStorage.setDeadlines(deadlines);
}

export function getCountdownSnapshot(): Promise<CountdownSnapshot> {
  return chromeDeadlineStorage.getCountdownSnapshot();
}

export function ensureTrialStart(nowTs = Date.now()): Promise<number> {
  return chromeDeadlineStorage.ensureTrialStart(nowTs);
}

export function setPremium(isPremium: boolean): Promise<void> {
  return chromeDeadlineStorage.setPremium(isPremium);
}
