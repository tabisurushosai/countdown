# Porting Guide

This project keeps reusable countdown logic separate from Chrome extension APIs so
the same behavior can be moved to iOS/Android shells later.

## Boundaries

- `src/core` is pure TypeScript logic. Do not import or reference `chrome.*`,
  DOM APIs, network APIs, or platform SDKs there.
- `src/storage` owns persistence through `CountdownStorageAdapter`. Platform
  code should provide an adapter with `get(keys)` and `set(values)` instead of
  changing core logic.
- `src/storage/deadlineStorage.ts` is platform-neutral and accepts an adapter
  explicitly. Chrome wiring belongs in `src/storage/chromeDeadlineStorage.ts`;
  iOS/Android shells should create the same kind of thin platform binding.
- Chrome-specific badge and extension event handling stays outside `src/core`.
  Mobile shells should implement their own notification/widget/badge layer.
- UI code should keep business decisions in `src/core` and persistence through
  `src/storage`, with platform localization wrappers replacing `chrome.i18n`
  when porting.

## Storage contract

Keep the existing storage keys and value shapes unchanged:

- `deadlines`: `Deadline[]`
- `isPremium`: `boolean`
- `trial_start_ts`: `number`

The Chrome extension uses `chromeLocalStorageAdapter`, which maps this contract
to `chrome.storage.local`. A mobile app should implement `CountdownStorageAdapter`
against its local storage mechanism and pass it to the exported storage helpers
when testing or wiring platform services.

Adapter implementations should:

- return only the requested keys from `get(keys)` when possible, while tolerating
  missing keys as `undefined`;
- write partial updates from `set(values)` without clearing unspecified keys;
- preserve the ISO `YYYY-MM-DD` date strings and repeat values stored in
  `Deadline`;
- stay local/offline and avoid adding network-backed persistence unless the app
  specification changes.

## UI and platform services

Keep UI shells thin when moving to mobile:

- call `src/core` for date math, sorting, premium limits, repeat advancement, and
  badge state decisions;
- call platform storage through a `CountdownStorageAdapter` binding instead of
  reading storage directly from views;
- replace `chrome.i18n`, extension popup lifecycle, and badge APIs with native
  platform equivalents at the app shell boundary;
- keep permissions equivalent to local storage only unless a future spec
  explicitly requires more.

## Porting checklist

1. Reuse `src/core` without modification.
2. Implement a platform storage adapter that preserves the keys and data shapes
   above.
3. Wire domain helpers through the platform adapter, following the
   `chromeDeadlineStorage` pattern.
4. Keep platform-only APIs in adapter/UI shell modules, not in `src/core`.
5. Run the app's equivalent build/typecheck after wiring the adapter.
