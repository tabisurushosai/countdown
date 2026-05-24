import { chromeLocalStorageAdapter } from './chromeLocalStorageAdapter';
import {
  createCountdownStorage,
  type CountdownStorage,
} from './deadlineStorage';

export const chromeDeadlineStorage: CountdownStorage = createCountdownStorage(chromeLocalStorageAdapter);
