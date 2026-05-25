# Porting Guide

This project keeps reusable countdown logic separate from Chrome extension APIs so
the same behavior can be moved to iOS/Android shells later.

## Boundaries

- `src/core` is pure TypeScript logic. Do not import or reference `chrome.*`,
  DOM APIs, network APIs, or platform SDKs there.
- Domain types such as `Deadline` and `DeadlineRepeat` live in
  `src/core/types.ts` so shared logic can be reused without depending on the
  Chrome extension shell.
- `src/storage` owns persistence through the generic `KeyValueStorageAdapter`
  boundary and the countdown-specific `CountdownStorageAdapter` schema.
  Platform code should provide an adapter with `get(keys)` and `set(values)`
  instead of changing core logic.
- `src/storage/deadlineStorage.ts` is platform-neutral and accepts an adapter
  explicitly. Use `createCountdownStorage(adapter)` to bind the shared
  countdown storage helpers to the platform adapter. Chrome wiring belongs in
  `src/storage/chromeDeadlineStorage.ts`; iOS/Android shells should create the
  same kind of thin platform binding.
- Chrome-specific badge and extension event handling stays outside `src/core`.
  Mobile shells should implement their own notification/widget/badge layer.
- UI code should keep business decisions in `src/core` and persistence through
  `src/storage`, with platform localization wrappers replacing `chrome.i18n`
  when porting.

The portable boundary is typechecked by `tsconfig.portable.json`, which includes
only `src/core` and the platform-neutral storage helpers with no Chrome or DOM
ambient types. Keep new shared logic inside that project so `npm run build`
continues to catch accidental platform API imports before mobile ports depend on
the code.

## Storage contract

Keep the existing storage keys and value shapes unchanged:

- `deadlines`: `Deadline[]`
- `isPremium`: `boolean`
- `trial_start_ts`: `number`

The portable adapter boundary is
`LocalKeyValueStorageAdapter<CountdownStorageSchema>`, exposed to app code as
`CountdownStorageAdapter`. A platform adapter has only two responsibilities:

- `get(keys)` returns a partial object containing the requested storage keys;
- `set(values)` writes the provided partial object without clearing other keys.

The Chrome extension uses `chromeLocalStorageAdapter`, which maps this contract
to `chrome.storage.local`. A mobile app should implement the same
`CountdownStorageAdapter` key-value interface against its local storage
mechanism and pass it to the exported storage helpers when testing or wiring
platform services. Only concrete adapter modules, such as
`src/storage/chromeLocalStorageAdapter.ts`, should import platform SDKs.

Use the shared constants in `src/storage/storageAdapter.ts` for storage keys
instead of spelling them in platform code. That keeps Chrome, iOS, Android, and
tests aligned with the same persisted data shape while allowing each platform to
own only the adapter implementation.

Adapter implementations should:

- keep storage local to the device and available offline;
- return only the requested keys from `get(keys)` when possible, while tolerating
  missing keys as `undefined`;
- write partial updates from `set(values)` without clearing unspecified keys;
- preserve the ISO `YYYY-MM-DD` date strings and repeat values stored in
  `Deadline`;
- avoid adding network-backed persistence unless the app specification changes.

Recommended mobile wiring shape:

1. Implement a small adapter that satisfies `CountdownStorageAdapter`
   (`get(keys)` returns a partial object for requested keys, and `set(values)`
   writes only the provided keys).
2. Keep the adapter as the only module that imports native storage SDKs.
3. Pass it to `createCountdownStorage(adapter)`.
4. Use the returned methods from platform services or views instead of reading
   native storage directly from UI code.

## UI and platform services

Keep UI shells thin when moving to mobile:

- call `src/core` for date math, sorting, premium limits, repeat advancement, and
  badge state decisions;
- call platform storage through the `createCountdownStorage(adapter)` binding
  instead of reading storage directly from views;
- replace `chrome.i18n`, extension popup lifecycle, and badge APIs with native
  platform equivalents at the app shell boundary;
- keep permissions equivalent to local storage only unless a future spec
  explicitly requires more.

## Porting checklist

1. Reuse `src/core` without modification.
2. Implement a platform storage adapter that preserves the keys and data shapes
   above.
3. Bind domain storage helpers with `createCountdownStorage(adapter)`, following
   the `chromeDeadlineStorage` pattern.
4. Keep platform-only APIs in adapter/UI shell modules, not in `src/core`.
5. Run `npm run build` before sharing changes to verify the portable TypeScript
   boundary and the Chrome extension bundle.
6. Run the app's equivalent build/typecheck after wiring the adapter.
