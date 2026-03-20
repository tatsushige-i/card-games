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

### 実装プロセス

以下の順序で実装する。各ステップで既存ゲーム（`blackjack`, `high-and-low` 等）の該当ファイルを参考にすること。

#### Step 1: 要件整理

ゲームの機能要件を整理する。不明確な場合はユーザーに質問して確定させる。**要件（何を作るか）のみ**を整理し、設計（どう作るか）は含めない。

#### Step 2: 設計（Plan Mode）

EnterPlanMode で以下を決定する:

- Phase 遷移図（`idle` → ... → `gameOver`）
- State の構造（`<Game>State` 型）
- Action の一覧（`<Game>Action` 型）
- ベストスコアの判定基準（`<Game>BestScore` 型）
- コンポーネントツリー
- ファイル一覧

#### Step 3: 型定義

`src/types/<game>.ts` — カード型、Phase 型（判別共用体）、GameResult 型、State 型、Action 型（判別共用体）、BestScore 型

#### Step 4: カードユーティリティ + テスト

`src/lib/<game>-cards.ts` — カード生成・シャッフル（Fisher-Yates）、ゲーム固有の計算ロジック、定数、表示用ヘルパー（`getCardLabel`, `SUIT_SYMBOLS`, `SUIT_COLORS`）

`src/lib/__tests__/<game>-cards.test.ts`

#### Step 5: Storage + テスト

`src/lib/<game>-storage.ts` — localStorage キー `"<game>-best-score"`、`get/save/update<Game>BestScore()`、`typeof window === "undefined"` ガード

`src/lib/__tests__/<game>-storage.test.ts` — localStorage モックパターン（`vi.fn()` + `Object.defineProperty`）

#### Step 6: Reducer + テスト

`src/lib/<game>-reducer.ts` — `initial<Game>State` 定数、純粋 Reducer 関数（switch 文、判別共用体アクション）、各 Phase 遷移のロジック

`src/lib/__tests__/<game>-reducer.test.ts`

#### Step 7: カスタムフック

`src/hooks/use<Game>.ts` — `useReducer` で状態管理、`useSyncExternalStore` でベストスコア管理（**キャッシュ済みスナップショット必須**）、`useEffect` で Phase ベースの遅延処理（`setTimeout`）、`prevPhaseRef` で Phase 遷移検出・ベストスコア更新

#### Step 8: コンポーネント群

`src/components/<game>/` 配下に作成:

| ファイル | 役割 |
|---------|------|
| `<game>-board.tsx` | `"use client"`, フック呼び出し、全体統合 |
| `<game>-header.tsx` | スコア・Badge・操作ボタン・戻るリンク |
| `<game>-card.tsx` | カード表示（3D フリップ CSS 再利用） |
| `<game>-result.tsx` | ラウンド結果表示 |
| `<game>-game-over-dialog.tsx` | ゲーム終了ダイアログ |
| その他ゲーム固有 UI | 必要に応じて追加 |

テスト: `src/components/<game>/__tests__/` 配下

#### Step 9: ページ

`src/app/<game>/page.tsx` — Server Component、`<Game>Board` をレンダリング

#### Step 10: ホーム画面登録

`src/components/home/game-list.tsx` を更新: `games` 配列にエントリ追加、`format<Game>Best()` 関数を追加、`formatBestScore()` の switch に case 追加、BestScore 型の import 追加

#### Step 11: 品質チェック

`npm run lint` / `npm run test:run` / `npm run build` をすべてパスさせる

#### Step 12: ドキュメント更新

`/docs-sync` スキルの手順に従い README.md・CLAUDE.md・architecture.md を更新する

### 共通パターン

- **状態管理**: `useReducer` + 純粋 Reducer（判別共用体アクション）
- **遅延処理**: `useEffect` 内の `setTimeout`（phase をキーとする）で結果表示の遅延を実装
- **ベストスコア永続化**: `useSyncExternalStore` + キャッシュ済みスナップショット（`pitfalls.md` 参照）
- **localStorage キー**: `"<game>-best-score"` の命名規則
- **ホーム画面登録**: `src/components/home/game-list.tsx` の `games` 配列にエントリ追加

## ルーティング

- `/` — ホーム（ゲーム選択画面、Server Component）
- `/concentration` — 神経衰弱
- `/high-and-low` — ハイ＆ロー
- `/blackjack` — ブラックジャック
- `/poker` — ビデオポーカー
- `/pyramid` — ピラミッド
- `/golf` — ゴルフソリティア
- `/spider` — スパイダー
- `/ten-play` — テンプレイ
- `/tri-peaks` — トライピークス
- `/war` — 戦争

## 収録ゲーム

### 神経衰弱（concentration）

カードをめくってペアを見つけるゲーム。

```
ConcentrationBoard → useConcentration
├── ConcentrationHeader（試行回数、タイマー、ペア数、ベストスコア）
├── ConcentrationCardGrid（4x4 グリッド）
│   └── ConcentrationCard（3D フリップ、アクセシビリティラベル）
└── ConcentrationCompleteDialog
```

主要ファイル: `src/types/concentration.ts`, `src/lib/concentration-reducer.ts`, `src/lib/concentration-cards.ts`, `src/lib/concentration-storage.ts`, `src/hooks/useConcentration.ts`

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

### ビデオポーカー（poker）

Jacks or Better 形式のビデオポーカー。5枚配布→ホールド選択→交換→役判定。10ラウンド制で合計スコアを競う。

```
PokerBoard → usePoker
├── PokerHeader（ラウンド、スコア、ベストスコア、操作ボタン）
├── PokerPayTable（配当表、現在の役ハイライト）
├── PokerHand（5枚のカード横一列）
│   └── PokerCard（3Dフリップ、ホールド状態の視覚表現）
├── PokerResult（役名の大きな表示）
└── PokerGameOverDialog（最終スコア、統計、新記録表示）
```

主要ファイル: `src/types/poker.ts`, `src/lib/poker-reducer.ts`, `src/lib/poker-cards.ts`, `src/lib/poker-storage.ts`, `src/hooks/usePoker.ts`

### ピラミッド（pyramid）

52枚から28枚を7段ピラミッドに配置し、合計13になるペアを除去するソリティアゲーム。K（値13）は単独除去。山札は1回リサイクル可能。タイム制（クリアタイムがベストスコア）。

```
PyramidBoard → usePyramid
├── PyramidHeader（タイム、除去数、ベストタイム）
├── PyramidGrid（7段ピラミッドレイアウト）
│   └── PyramidCardComponent（選択/露出/不正ペア状態の視覚表現）
├── PyramidStockArea（山札・捨て札エリア）
└── PyramidGameOverDialog（クリア/手詰まり）
```

主要ファイル: `src/types/pyramid.ts`, `src/lib/pyramid-reducer.ts`, `src/lib/pyramid-cards.ts`, `src/lib/pyramid-storage.ts`, `src/hooks/usePyramid.ts`

### ゴルフソリティア（golf）

山札から1枚ずつカードを出し、場の7列のカードを±1の連続で取り除いていくソリティア。K→Aのラップアラウンドなし。ベストスコアは残りカード数（少ないほど良い）。

```
GolfBoard → useGolf
├── GolfHeader（残りカード数、タイマー、ベストスコア）
├── GolfColumns（7列のカード配置）
│   └── GolfCard（選択可能状態の視覚表現）
├── GolfStockArea（山札・捨て札エリア）
└── GolfGameOverDialog（クリア/手詰まり）
```

主要ファイル: `src/types/golf.ts`, `src/lib/golf-reducer.ts`, `src/lib/golf-cards.ts`, `src/lib/golf-storage.ts`, `src/hooks/useGolf.ts`

### スパイダー（spider）

52枚×2組（104枚）を10列に配置するソリティア。同じスートでK→Aの連続シーケンス8組を完成させるとクリア。山札から10枚ずつ配布可能（全列に最低1枚必須）。ベストスコアは最少手数と最速タイムを独立記録。

```
SpiderBoard → useSpider
├── SpiderHeader（手数、完成セット数、タイマー、山札枚数、ベストスコア）
├── SpiderColumns（10列のカード配置）
│   └── SpiderCardComponent（選択/ドラッグ状態の視覚表現）
├── SpiderStockArea（山札・配布ボタン）
└── SpiderGameOverDialog（クリア/手詰まり、統計表示）
```

主要ファイル: `src/types/spider.ts`, `src/lib/spider-reducer.ts`, `src/lib/spider-cards.ts`, `src/lib/spider-storage.ts`, `src/hooks/useSpider.ts`

### テンプレイ（ten-play）

13スロット（7+6段）のタブローに配置されたカードから、合計10になるペアを選択して除去するソリティア。全カード除去でクリア。ベストスコアはクリアタイム（短いほど良い）。

```
TenPlayBoard → useTenPlay
├── TenPlayHeader（タイマー、除去数、残りカード数、山札枚数、ベストスコア）
├── TenPlayTableau（13スロット、7+6段構成）
│   └── TenPlayCard（選択/不正状態の視覚表現）
└── TenPlayGameOverDialog（クリア/手詰まり、統計表示）
```

主要ファイル: `src/types/ten-play.ts`, `src/lib/ten-play-reducer.ts`, `src/lib/ten-play-cards.ts`, `src/lib/ten-play-storage.ts`, `src/hooks/useTenPlay.ts`

### トライピークス（tri-peaks）

3つのピラミッド状に28枚のカードを配置し、捨て札と±1のカードを連続で取り除いていくソリティア。K↔Aラップアラウンドあり。連続除去でコンボボーナス（1, 2, 3...と加算）。山札をめくるとコンボリセット。ベストスコアはスコア（高いほど良い）。

```
TriPeaksBoard → useTriPeaks
├── TriPeaksHeader（スコア、コンボ、タイマー、除去数、ベストスコア）
├── TriPeaksGrid（3つのピラミッドレイアウト、4行構成）
│   └── TriPeaksCard（表/裏/除去状態の視覚表現）
├── TriPeaksStockArea（山札・捨て札エリア）
└── TriPeaksGameOverDialog（クリア/手詰まり、最終スコア）
```

主要ファイル: `src/types/tri-peaks.ts`, `src/lib/tri-peaks-reducer.ts`, `src/lib/tri-peaks-cards.ts`, `src/lib/tri-peaks-storage.ts`, `src/hooks/useTriPeaks.ts`

### 戦争（war）

52枚をプレイヤーとCPUに等分して配布し、毎ラウンドトップカードを比較して高い方が両方のカードを獲得するゲーム。同値の場合は戦争（各側3枚伏せ+1枚表開き）が発生。どちらかのデッキが空になれば終了。ベストスコアはプレイヤー勝利時のラウンド数（少ないほど良い）。

```
WarBoard → useWar
├── WarHeader（ラウンド数、プレイヤーカード枚数、CPUカード枚数、ベストスコア）
├── WarBattleField（対決エリア、山札表示、戦争パイル）
│   └── WarCardComponent（プレイヤー/CPUカード表示）
├── WarResult（ラウンド結果表示：勝利/敗北/戦争）
└── WarGameOverDialog（最終勝者、ラウンド統計）
```

主要ファイル: `src/types/war.ts`, `src/lib/war-reducer.ts`, `src/lib/war-cards.ts`, `src/lib/war-storage.ts`, `src/hooks/useWar.ts`

## スキル（Claude Code カスタムコマンド）

`.claude/skills/` 配下にプロジェクト固有のスラッシュコマンドを定義している。

| スキル | コマンド | 説明 |
|--------|----------|------|
| docs-sync | `/docs-sync` | ソースコードの実態とドキュメント（README.md, CLAUDE.md, architecture.md）の整合性を検証・更新 |
| game-debug | `/game-debug [ゲーム名]` | ゲームの reducer を対話的に操作し、状態遷移をデバッグする |
| game-refactor | `/game-refactor [ゲーム名]` | 指定ゲーム（または全ゲーム）の規約準拠チェック＋自動リファクタリング |
| git-branch-cleanup | `/git-branch-cleanup` | PR マージ後にローカルの feature ブランチを削除し、main を最新化する |
| git-issue-start | `/git-issue-start [Issue番号]` | GitHub Issue を取得し、ブランチ作成。ゲーム追加 Issue は実装も開始 |
| git-pr-create | `/git-pr-create [コミットメッセージ]` | feature ブランチのコミット・プッシュ・PR 作成を一括実行 |
| git-review-respond | `/git-review-respond [PR番号]` | PR レビューコメントのトリアージ→修正→品質チェック→プッシュ→返信を一括実行 |

スキルファイル: `.claude/skills/<skill-name>/SKILL.md`

## エージェント（サブエージェント）

`.claude/agents/` 配下に特定タスクを委任する専用エージェントを定義している。

| エージェント | 説明 | モデル |
|-------------|------|--------|
| quality-checker | lint・テスト・ビルドを実行し結果を要約（修正は行わない） | haiku |

エージェントファイル: `.claude/agents/<agent-name>.md`

## 共有リソース

- `src/app/page.tsx` — ホームページ（`games` 配列でゲーム一覧を管理）
- `src/app/globals.css` — 共有 CSS: `.game-background`（3層グラデーション背景）、`.glass`（グラスモーフィズム）、`.card-container` / `.card-inner` / `.card-face` / `.card-back`（3Dカードフリップ）、`.celebrate`（勝利アニメーション）
- `src/components/ui/` — shadcn/ui コンポーネント（Button, Dialog, Badge）
- `src/lib/utils.ts` — `cn()` ユーティリティ
