import type {
  CountdownStorageAdapter,
  CountdownStorageKey,
  CountdownStorageSelection,
} from './storageAdapter';

export const chromeLocalStorageAdapter: CountdownStorageAdapter = {
  get<const Key extends readonly CountdownStorageKey[]>(
    keys: Key,
  ): Promise<CountdownStorageSelection<Key>> {
    return new Promise((resolve) => {
      chrome.storage.local.get([...keys], (result) => {
        resolve(result as CountdownStorageSelection<Key>);
      });
    });
  },
  set(values): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set(values, () => {
        resolve();
      });
    });
  },
};
