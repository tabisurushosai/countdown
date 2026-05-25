import type {
  CountdownStorageAdapter,
  CountdownStorageKey,
  CountdownStoragePatch,
  CountdownStorageReadResult,
} from './storageAdapter';

export interface ChromeStorageAreaSource {
  get(keys: string[], callback: (result: Record<string, unknown>) => void): void;
  set(values: object, callback: () => void): void;
}

export function createChromeLocalStorageAdapter(
  storageArea: ChromeStorageAreaSource,
): CountdownStorageAdapter {
  return {
    get<const Key extends readonly CountdownStorageKey[]>(
      keys: Key,
    ): Promise<CountdownStorageReadResult<Key>> {
      return new Promise((resolve) => {
        storageArea.get([...keys], (result) => {
          resolve(result as CountdownStorageReadResult<Key>);
        });
      });
    },
    set(values: CountdownStoragePatch): Promise<void> {
      return new Promise((resolve) => {
        storageArea.set(values, () => {
          resolve();
        });
      });
    },
  };
}

export const chromeLocalStorageAdapter = createChromeLocalStorageAdapter(chrome.storage.local);
