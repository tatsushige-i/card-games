---
name: playground
description: ゲームの reducer をインタラクティブに操作し、状態遷移をデバッグする。
argument-hint: "[ゲーム名(英語kebab-case)]"
---

# Reducer プレイグラウンドスキル

引数 `$ARGUMENTS` で指定されたゲームの reducer を対話的に操作し、状態遷移を確認するデバッグツール。

## 表記ルール

以下の表記を使用する:

- `<game>` — 引数のゲーム名そのまま（kebab-case、例: `high-and-low`）
- `<Game>` — PascalCase に変換したゲーム名（例: `HighAndLow`）

## Step 1: ゲーム特定とファイル読み込み

`$ARGUMENTS` からゲーム名を特定し、以下のファイルを読み込む:

| ファイル | 目的 |
|---------|------|
| `src/types/<game>.ts` | State 型、Action 型、Phase 型 |
| `src/lib/<game>-reducer.ts` | `<game>Reducer` 関数、`initial<Game>State` |
| `src/lib/<game>-cards.ts` | `createDeck()` / `createCards()`、ユーティリティ |

### 対応ゲームと export 名

| ゲーム | reducer | initialState | デッキ生成 |
|--------|---------|-------------|-----------|
| concentration | `concentrationReducer` | `initialConcentrationState` | `createCards()` |
| high-and-low | `highAndLowReducer` | `initialHighAndLowState` | `createDeck()` |
| blackjack | `blackjackReducer` | `initialBlackjackState` | `createDeck()` |
| poker | `pokerReducer` | `initialPokerState` | `createDeck()` |

指定されたゲームが上記に含まれない場合は、エラーを表示して終了する。

## Step 2: 初期状態の表示

1. `initial<Game>State` の内容を整形して表示する
2. `src/types/<game>.ts` から Action 型を読み取り、利用可能なアクション一覧を表示する
3. ユーザーにコマンド入力を促す

表示例:

```
🎮 Poker Playground
━━━━━━━━━━━━━━━━━━━━━━━

📋 現在の状態:
  phase: "idle"
  hand: []
  deck: []
  round: 0
  score: 0
  ...

🎯 利用可能なアクション:
  START_GAME    — { deck: PlayingCard[] }
  DEAL_COMPLETE
  TOGGLE_HOLD   — { index: number }
  DRAW
  DRAW_COMPLETE
  SHOW_RESULT
  SET_NEW_BEST  — { isNewBest: boolean }
  NEXT_ROUND
  DISMISS_DIALOG
  RESET

💡 コマンド: dispatch / state / set / trace / reset / help
```

## Step 3: 対話ループ

ユーザーの入力を待ち、以下のコマンドを処理する。各コマンド実行後、次の入力を `AskUserQuestion` で促す。

### コマンド一覧

#### `dispatch [ACTION]` または `d [ACTION]`

アクションを reducer に適用し、**変化したフィールドのみ**を差分表示する。

- アクションにペイロードが必要な場合（例: `START_GAME` には `deck` が必要）、reducer の型定義に基づいて適切なデフォルト値を自動生成する
  - `deck` / `cards` — `createDeck()` / `createCards()` で生成
  - `index` — `0` をデフォルトにする
  - `guess` — `"high"` をデフォルトにする
  - `isNewBest` — `false` をデフォルトにする
- ユーザーがペイロードを明示的に指定した場合はそちらを優先する（例: `dispatch TOGGLE_HOLD index=2`）
- アクション名は大文字・小文字を区別しない（`start_game` も `START_GAME` も受け付ける）

表示例:

```
⚡ dispatch START_GAME

📋 状態の変化:
  phase: "idle" → "dealing"
  deck: [] → [52枚]
  hand: [] → [♠A, ♥K, ♦10, ♣5, ♠7]
  round: 0 → 1
```

#### `state` または `s`

現在の全状態を整形して表示する。配列は要素数と先頭数件を表示する。

#### `set [field] [value]`

状態の特定フィールドを直接書き換える。ネストしたフィールドにはドット記法を使用する。

例:
- `set phase "result"` — phase を直接変更
- `set score 100` — score を変更
- `set round 5` — round を変更

変更後、変更されたフィールドを表示する。

#### `trace` または `t`

これまでのアクション履歴と phase 遷移を時系列で表示する。

表示例:

```
📜 アクション履歴:
  1. START_GAME    → phase: idle → dealing
  2. DEAL_COMPLETE → phase: dealing → holding
  3. TOGGLE_HOLD(index=0)
  4. TOGGLE_HOLD(index=2)
  5. DRAW          → phase: holding → drawing
```

#### `reset` または `r`

状態を `initial<Game>State` に戻し、アクション履歴をクリアする。

#### `help` または `h`

コマンド一覧と使い方を表示する。

### 対話の実装

各コマンド実行後、`AskUserQuestion` を使って次のコマンド入力をユーザーに促す。選択肢として主要なアクション（`dispatch` の候補）を提示し、「Other」でユーザーが自由にコマンドを入力できるようにする。

## 重要な制約

- **ファイルの変更は一切行わない** — このスキルは読み取り専用のデバッグツール
- **状態はすべてスキルの説明テキスト内で管理する** — 実際のコード実行はしない
- reducer の型定義とロジックを読み取り、Claude が reducer の動作を**シミュレーション**する
- 状態遷移の正確性は reducer のコードに忠実に従う
