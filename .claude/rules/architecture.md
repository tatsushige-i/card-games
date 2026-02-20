# アーキテクチャ

## 状態管理

**useReducer パターン**を採用し、純粋な reducer（`src/lib/game-reducer.ts`）で状態遷移を管理する。`useGame` フック（`src/hooks/useGame.ts`）が以下を統括:

- `gameReducer` — 判別共用体アクションによる純粋な状態遷移: `START_GAME`, `FLIP_CARD`, `CHECK_MATCH`, `TICK`, `SET_NEW_BEST`, `RESET`
- タイマー — `useEffect`（`phase` をキーとする）内で `setInterval` により毎秒 `TICK` をディスパッチ
- マッチ判定遅延 — カードが2枚めくられた後、800ms の `setTimeout` を経て `CHECK_MATCH` を実行
- ベストスコア永続化 — `useSyncExternalStore` と localStorage の**キャッシュ済みスナップショット**を使用（重要: `getSnapshot` は安定した参照を返す必要がある。詳細は `pitfalls.md` を参照）

## ルーティング

- `/` — ホーム（ゲーム選択画面、Server Component）
- `/concentration` — 神経衰弱ゲーム

## コンポーネント階層（神経衰弱）

```
GameBoard（クライアントコンポーネント、useGame を呼び出す）
├── GameHeader（スコア、タイマー、ベストスコア、戻るリンク、操作ボタン）
├── CardGrid（4x4 グリッド、phase !== "idle" のとき条件付きレンダリング）
│   └── GameCard（3D フリップアニメーション、アクセシビリティラベル）
└── GameCompleteDialog（shadcn Dialog、phase === "complete" のとき表示）
```

## 主要ファイル

- `src/app/page.tsx` — ホームページ（ゲーム選択リンク）
- `src/app/concentration/page.tsx` — 神経衰弱エントリーポイント
- `src/types/game.ts` — 全型定義（`Card`, `GameState`, `GameAction`, `BestScore`）
- `src/lib/cards.ts` — カード生成（Fisher-Yates シャッフル）
- `src/lib/storage.ts` — localStorage によるベストスコアの読み書き
- `src/app/globals.css` — カスタム CSS クラス: グラスモーフィズム（`.glass`）、3D カードフリップ（`.card-inner`, `.card-face`, `.card-back`）、グラデーション背景（`.game-background`）
