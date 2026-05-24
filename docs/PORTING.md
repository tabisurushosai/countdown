# Porting Guide

This project keeps reusable countdown logic separate from Chrome extension APIs so
the same behavior can be moved to iOS/Android shells later.

## Boundaries

- `src/core` is pure TypeScript logic. Do not import or reference `chrome.*`,
  DOM APIs, network APIs, or platform SDKs there.
- `src/storage` owns persistence through `CountdownStorageAdapter`. Platform
  code should provide an adapter with `get(keys)` and `set(values)` instead of
  changing core logic.
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

## Porting checklist

1. Reuse `src/core` without modification.
2. Implement a platform storage adapter that preserves the keys and data shapes
   above.
3. Keep platform-only APIs in adapter/UI shell modules, not in `src/core`.
4. Run the app's equivalent build/typecheck after wiring the adapter.
