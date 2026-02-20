# 既知の注意点

- `useSyncExternalStore` の `getSnapshot` はキャッシュ済みのオブジェクト参照を返す必要がある。`JSON.parse` を直接呼び出すとレンダリングごとに新しい参照が生成され、無限ループが発生する。
- React Hooks の厳格な ESLint ルールにより、レンダリング中の ref アクセスや `useEffect` 内での直接的な `setState` 呼び出しは禁止されている。レンダリングに反映される状態更新には reducer への `dispatch` を使用すること。
