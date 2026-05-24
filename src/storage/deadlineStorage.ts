import type { Deadline } from '../core/types';
import {
  COUNTDOWN_DEADLINE_KEYS,
  COUNTDOWN_SNAPSHOT_KEYS,
  COUNTDOWN_TRIAL_KEYS,
  DEADLINES_KEY,
  IS_PREMIUM_KEY,
  TRIAL_START_KEY,
  type CountdownStorageAdapter,
} from './storageAdapter';

export interface CountdownSnapshot {
  deadlines: Deadline[];
  isPremium: boolean;
  trialStartTs: number | undefined;
}

export interface CountdownStorage {
  getDeadlines(): Promise<Deadline[]>;
  setDeadlines(deadlines: Deadline[]): Promise<void>;
  getCountdownSnapshot(): Promise<CountdownSnapshot>;
  ensureTrialStart(nowTs?: number): Promise<number>;
  setPremium(isPremium: boolean): Promise<void>;
}

export async function getDeadlines(storage: CountdownStorageAdapter): Promise<Deadline[]> {
  const result = await storage.get(COUNTDOWN_DEADLINE_KEYS);
  return result[DEADLINES_KEY] ?? [];
}

export async function setDeadlines(
  deadlines: Deadline[],
  storage: CountdownStorageAdapter,
): Promise<void> {
  await storage.set({ [DEADLINES_KEY]: deadlines });
}

export async function getCountdownSnapshot(storage: CountdownStorageAdapter): Promise<CountdownSnapshot> {
  const result = await storage.get(COUNTDOWN_SNAPSHOT_KEYS);
  return {
    deadlines: result[DEADLINES_KEY] ?? [],
    isPremium: result[IS_PREMIUM_KEY] ?? false,
    trialStartTs: result[TRIAL_START_KEY],
  };
}

export async function ensureTrialStart(
  storage: CountdownStorageAdapter,
  nowTs = Date.now(),
): Promise<number> {
  const result = await storage.get(COUNTDOWN_TRIAL_KEYS);
  if (result[TRIAL_START_KEY] !== undefined) {
    return result[TRIAL_START_KEY];
  }

  await storage.set({ [TRIAL_START_KEY]: nowTs });
  return nowTs;
}

export async function setPremium(
  isPremium: boolean,
  storage: CountdownStorageAdapter,
): Promise<void> {
  await storage.set({ [IS_PREMIUM_KEY]: isPremium });
}

export function createCountdownStorage(storage: CountdownStorageAdapter): CountdownStorage {
  return {
    getDeadlines: () => getDeadlines(storage),
    setDeadlines: (deadlines) => setDeadlines(deadlines, storage),
    getCountdownSnapshot: () => getCountdownSnapshot(storage),
    ensureTrialStart: (nowTs) => ensureTrialStart(storage, nowTs),
    setPremium: (isPremium) => setPremium(isPremium, storage),
  };
}
