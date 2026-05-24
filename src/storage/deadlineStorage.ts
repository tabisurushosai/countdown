import type { Deadline } from '../types';
import {
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

export async function getDeadlines(storage: CountdownStorageAdapter): Promise<Deadline[]> {
  const result = await storage.get([DEADLINES_KEY]);
  return result.deadlines || [];
}

export async function setDeadlines(
  deadlines: Deadline[],
  storage: CountdownStorageAdapter,
): Promise<void> {
  await storage.set({ deadlines });
}

export async function getCountdownSnapshot(storage: CountdownStorageAdapter): Promise<CountdownSnapshot> {
  const result = await storage.get([DEADLINES_KEY, IS_PREMIUM_KEY, TRIAL_START_KEY]);
  return {
    deadlines: result.deadlines || [],
    isPremium: result.isPremium || false,
    trialStartTs: result.trial_start_ts,
  };
}

export async function ensureTrialStart(
  storage: CountdownStorageAdapter,
  nowTs = Date.now(),
): Promise<number> {
  const result = await storage.get([TRIAL_START_KEY]);
  if (result.trial_start_ts) {
    return result.trial_start_ts;
  }

  await storage.set({ trial_start_ts: nowTs });
  return nowTs;
}

export async function setPremium(
  isPremium: boolean,
  storage: CountdownStorageAdapter,
): Promise<void> {
  await storage.set({ isPremium });
}
