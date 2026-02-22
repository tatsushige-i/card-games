---
name: add-game
description: 新しいカードゲームをプロジェクトに追加する。既存のアーキテクチャパターンに従い、型定義・ロジック・テスト・UI・ページを一貫して実装する。
argument-hint: "[ゲーム名(英語kebab-case)]"
---

# 新ゲーム追加スキル

引数 `$ARGUMENTS` で指定されたゲームを、既存パターンに従って実装する。

## 前提条件

- `.claude/rules/architecture.md` のゲーム追加パターンに厳密に従うこと
- `.claude/rules/conventions.md` のコーディング規約・デザイン要件を遵守すること
- `.claude/rules/pitfalls.md` の既知の注意点を理解すること
- ゲーム間でコードは共有しない（`shuffle` 等のユーティリティも各ゲームに複製）

## 実装プロセス

以下の順序で実装する。各ステップで既存ゲーム（`high-and-low`, `blackjack`）の該当ファイルを参考にすること。

### Step 0: ブランチ準備

1. `main` ブランチで `git pull` を実行し、最新状態にする
2. `feature/create-$ARGUMENTS` ブランチを作成して切り替える

### Step 1: 要件整理

1. `.claude/tasks/$ARGUMENTS.md` を作成し、ゲームの機能要件を記載する
2. 要件が不明確な場合はユーザーに質問して確定させる
3. **要件（何を作るか）のみ**を記載し、設計（どう作るか）は含めない

### Step 2: 設計（Plan Mode）

EnterPlanMode で設計を行い、以下を決定する:

- Phase 遷移図（`idle` → ... → `gameOver`）
- State の構造（`<Game>State` 型）
- Action の一覧（`<Game>Action` 型）
- ベストスコアの判定基準（`<Game>BestScore` 型）
- コンポーネントツリー
- ファイル一覧

### Step 3: 型定義

`src/types/$ARGUMENTS.ts` を作成:

- カード型（ゲーム固有）
- Phase 型（判別共用体）
- GameResult 型
- State 型
- Action 型（判別共用体）
- BestScore 型

### Step 4: カードユーティリティ + テスト

`src/lib/$ARGUMENTS-cards.ts` を作成:

- カード生成・シャッフル（Fisher-Yates）
- ゲーム固有の計算ロジック
- 定数（目標値、閾値など）
- 表示用ヘルパー（`getCardLabel`, `SUIT_SYMBOLS`, `SUIT_COLORS`）

`src/lib/__tests__/$ARGUMENTS-cards.test.ts` を作成

### Step 5: Storage + テスト

`src/lib/$ARGUMENTS-storage.ts` を作成:

- localStorage キー: `"$ARGUMENTS-best-score"`
- `get<Game>BestScore()` / `save<Game>BestScore()` / `update<Game>BestScore()`
- `typeof window === "undefined"` ガード

`src/lib/__tests__/$ARGUMENTS-storage.test.ts` を作成:

- localStorage モックパターン（`vi.fn()` + `Object.defineProperty`）を使用

### Step 6: Reducer + テスト

`src/lib/$ARGUMENTS-reducer.ts` を作成:

- `initial<Game>State` 定数
- 純粋 Reducer 関数（switch 文、判別共用体アクション）
- 各 Phase 遷移のロジック

`src/lib/__tests__/$ARGUMENTS-reducer.test.ts` を作成

### Step 7: カスタムフック

`src/hooks/use<Game>.ts` を作成:

- `useReducer` で状態管理
- `useSyncExternalStore` でベストスコア管理（**キャッシュ済みスナップショット必須**）
- `useEffect` で Phase ベースの遅延処理（`setTimeout`）
- `prevPhaseRef` で Phase 遷移検出・ベストスコア更新
- 公開 API: state, bestScore, アクション関数群

### Step 8: コンポーネント群

`src/components/$ARGUMENTS/` 配下に作成:

| ファイル | 役割 |
|---------|------|
| `$ARGUMENTS-board.tsx` | `"use client"`, フック呼び出し、全体統合 |
| `$ARGUMENTS-header.tsx` | スコア・Badge・操作ボタン・戻るリンク |
| `$ARGUMENTS-card.tsx` | カード表示（3D フリップ CSS 再利用） |
| `$ARGUMENTS-result.tsx` | ラウンド結果表示 |
| `$ARGUMENTS-game-over-dialog.tsx` | ゲーム終了ダイアログ |
| その他ゲーム固有 UI | 必要に応じて追加 |

テスト: `src/components/$ARGUMENTS/__tests__/` 配下

デザイン要件:
- Glassmorphism UI（`.glass` クラス）
- グラデーション背景（`.game-background` クラス）
- 3D カードフリップ（`.card-container` / `.card-inner` / `.card-face` / `.card-back`）
- 勝利アニメーション（`.celebrate`）
- レスポンシブ・モバイルファースト
- WCAG 基準のコントラスト

### Step 9: ページ

`src/app/$ARGUMENTS/page.tsx` を作成:

- Server Component
- `<Game>Board` をレンダリング

### Step 10: ホーム画面登録

`src/components/home/game-list.tsx` を更新:

1. `games` 配列にエントリ追加
2. `format<Game>Best()` 関数を追加
3. `formatBestScore()` の switch に case 追加
4. BestScore 型の import 追加

### Step 11: 品質チェック

以下をすべてパスさせる:

```bash
npm run lint
npm run test:run
npm run build
```

### Step 12: ドキュメント更新

1. `.claude/rules/architecture.md` — ルーティング・収録ゲームセクションに追加
2. `README.md` — ゲーム説明・ファイル構成に追加
3. `.claude/tasks/$ARGUMENTS.md` — フィードバックがあれば最新化

## 参考ファイル

実装時に以下のファイルを読んでパターンを確認すること:

- `src/types/blackjack.ts` — 型定義の参考
- `src/lib/blackjack-cards.ts` — カードユーティリティの参考
- `src/lib/blackjack-storage.ts` — Storage の参考
- `src/lib/blackjack-reducer.ts` — Reducer の参考
- `src/hooks/useBlackjack.ts` — フックの参考
- `src/components/blackjack/` — コンポーネントの参考
- `src/components/home/game-list.tsx` — ホーム登録の参考
