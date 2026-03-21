# Known Pitfalls

- `useSyncExternalStore`'s `getSnapshot` must return a cached object reference. Calling `JSON.parse` directly creates a new reference on every render, causing an infinite loop.
- React Hooks' strict ESLint rules prohibit ref access during rendering and direct `setState` calls inside `useEffect`. Use `dispatch` to the reducer for state updates that are reflected in rendering.
- Module-level cache variables (e.g., `cacheInitialized`) are not reset during Next.js client-side navigation. The cache must be reloaded inside the `subscribe` function to keep data fresh on component remount (addressed in `game-list.tsx`).
