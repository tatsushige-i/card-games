# アーキテクチャ

## ゲーム追加パターン

各ゲームは以下の構成で独立したファイル群を持つ。ゲーム間でコードは共有しない（`shuffle` 等の小さなユーティリティも各ゲームに複製）。

```
src/
├── types/<game>.ts              — 型定義（カード、状態、アクション、ベストスコア）
├── lib/<game>-cards.ts          — カード生成・シャッフル・定数
├── lib/<game>-reducer.ts        — 純粋 Reducer（判別共用体アクション）
├── lib/<game>-storage.ts        — localStorage ベストスコア永続化
├── lib/__tests__/<game>-*.ts    — ライブラリのテスト
├── hooks/use<Game>.ts           — useReducer + useEffect + useSyncExternalStore
├── components/<game>/           — ゲーム固有コンポーネント群
│   ├── <game>-board.tsx         — メインクライアントコンポーネント（フック呼び出し）
│   ├── <game>-header.tsx        — スコア・操作ボタン・戻るリンク
│   ├── ...その他ゲーム固有UI
│   └── __tests__/               — コンポーネントのテスト
└── app/<game>/page.tsx          — ルートエントリーポイント（Server Component）
```

### 共通パターン

- **状態管理**: `useReducer` + 純粋 Reducer（判別共用体アクション）
- **遅延処理**: `useEffect` 内の `setTimeout`（phase をキーとする）で結果表示の遅延を実装
- **ベストスコア永続化**: `useSyncExternalStore` + キャッシュ済みスナップショット（`pitfalls.md` 参照）
- **localStorage キー**: `"<game>-best-score"` の命名規則
- **ホーム画面登録**: `src/app/page.tsx` の `games` 配列にエントリ追加

## ルーティング

- `/` — ホーム（ゲーム選択画面、Server Component）
- `/concentration` — 神経衰弱
- `/high-and-low` — ハイ＆ロー
- `/blackjack` — ブラックジャック

## 収録ゲーム

### 神経衰弱（concentration）

カードをめくってペアを見つけるゲーム。

```
GameBoard → useGame
├── GameHeader（試行回数、タイマー、ペア数、ベストスコア）
├── CardGrid（4x4 グリッド）
│   └── GameCard（3D フリップ、アクセシビリティラベル）
└── GameCompleteDialog
```

主要ファイル: `src/types/game.ts`, `src/lib/game-reducer.ts`, `src/lib/cards.ts`, `src/lib/storage.ts`, `src/hooks/useGame.ts`

### ハイ＆ロー（high-and-low）

次のトランプカードが現在より高いか低いかを予想するゲーム。初期3点、10点で勝利、0点で敗北。同値は引き分け（±0）。連勝中はカードが横に積み重なる視覚演出。

```
HighAndLowBoard → useHighAndLow
├── HighAndLowHeader（スコア、連勝数、枚数、ベストスコア）
├── HighAndLowCard（トランプ表示、スート色分け、3Dフリップ再利用）
├── HighAndLowResult（正解/不正解/引き分け表示）
└── HighAndLowGameOverDialog（勝利/敗北）
```

主要ファイル: `src/types/high-and-low.ts`, `src/lib/high-and-low-reducer.ts`, `src/lib/high-and-low-cards.ts`, `src/lib/high-and-low-storage.ts`, `src/hooks/useHighAndLow.ts`

### ブラックジャック（blackjack）

プレイヤー vs ディーラーの1対1カードゲーム。手札合計を21に近づける。A=1or11自動調整、J/Q/K=10。ラウンド制で連勝を継続可能。

```
BlackjackBoard → useBlackjack
├── BlackjackHeader（連勝数、ラウンド数、ベストスコア）
├── BlackjackHand（手札表示、合計値、ホールカード裏向き）
│   └── BlackjackCard（トランプ表示、3Dフリップ再利用）
├── BlackjackResult（勝ち/負け/引き分け/ブラックジャック表示）
└── BlackjackGameOverDialog（結果・統計、次のラウンド/最初から）
```

主要ファイル: `src/types/blackjack.ts`, `src/lib/blackjack-reducer.ts`, `src/lib/blackjack-cards.ts`, `src/lib/blackjack-storage.ts`, `src/hooks/useBlackjack.ts`

## 共有リソース

- `src/app/page.tsx` — ホームページ（`games` 配列でゲーム一覧を管理）
- `src/app/globals.css` — 共有 CSS: `.game-background`（3層グラデーション背景）、`.glass`（グラスモーフィズム）、`.card-container` / `.card-inner` / `.card-face` / `.card-back`（3Dカードフリップ）、`.celebrate`（勝利アニメーション）
- `src/components/ui/` — shadcn/ui コンポーネント（Button, Dialog, Badge）
- `src/lib/utils.ts` — `cn()` ユーティリティ
