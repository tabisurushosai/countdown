import type { Deadline } from '../types';

const DEADLINES_KEY = 'deadlines';
const IS_PREMIUM_KEY = 'isPremium';
const TRIAL_START_KEY = 'trial_start_ts';

interface CountdownStorage {
  deadlines?: Deadline[];
  isPremium?: boolean;
  trial_start_ts?: number;
}

export interface CountdownSnapshot {
  deadlines: Deadline[];
  isPremium: boolean;
  trialStartTs?: number;
}

function getStorage(keys: string[]): Promise<CountdownStorage> {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (result) => {
      resolve(result as CountdownStorage);
    });
  });
}

function setStorage(values: CountdownStorage): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set(values, () => {
      resolve();
    });
  });
}

export async function getDeadlines(): Promise<Deadline[]> {
  const result = await getStorage([DEADLINES_KEY]);
  return result.deadlines || [];
}

export async function setDeadlines(deadlines: Deadline[]): Promise<void> {
  await setStorage({ deadlines });
}

export async function getCountdownSnapshot(): Promise<CountdownSnapshot> {
  const result = await getStorage([DEADLINES_KEY, IS_PREMIUM_KEY, TRIAL_START_KEY]);
  return {
    deadlines: result.deadlines || [],
    isPremium: result.isPremium || false,
    trialStartTs: result.trial_start_ts,
  };
}

export async function ensureTrialStart(nowTs = Date.now()): Promise<number> {
  const result = await getStorage([TRIAL_START_KEY]);
  if (result.trial_start_ts) {
    return result.trial_start_ts;
  }

  await setStorage({ trial_start_ts: nowTs });
  return nowTs;
}

export async function setPremium(isPremium: boolean): Promise<void> {
  await setStorage({ isPremium });
}
