import type { CountdownStorageAdapter, CountdownStorageValues } from './storageAdapter';

export const chromeLocalStorageAdapter: CountdownStorageAdapter = {
  get(keys) {
    return new Promise((resolve) => {
      chrome.storage.local.get([...keys], (result) => {
        resolve(result as CountdownStorageValues);
      });
    });
  },
  set(values) {
    return new Promise((resolve) => {
      chrome.storage.local.set(values, () => {
        resolve();
      });
    });
  },
};
