# カードゲーム

さまざまなカードゲームが遊べるWebアプリです。

> **Note:** このプロジェクトは [Claude Code](https://claude.ai/code) の練習用として作成しています。コーディングはすべて Claude Code が行い、人間はレビューとフィードバックのみを担当しています。

## ホーム画面

- 収録ゲームをカード形式で一覧表示
- 各ゲームのベストスコアをlocalStorageから読み取り表示（未プレイ時は非表示）
- ゲームから戻った際にベストスコアが自動で最新化

## 収録ゲーム

### 神経衰弱

カードをめくってペアを見つけるメモリーマッチングゲーム。

- 4x4グリッド（8ペア・16枚）のカードマッチング
- 3Dフリップアニメーション付きカード
- 試行回数・経過時間の記録
- ベストスコアのlocalStorage保存
- ゲーム完了時のクリアダイアログ

### ハイ＆ロー

次のトランプカードが現在より高いか低いかを予想するゲーム。

- 52枚のトランプデッキを使用（スート・ランク表示）
- 初期スコア3点、10点到達で勝利、0点で敗北
- 同値は引き分け（スコア±0）
- 連勝中はカードが横に積み重なる視覚演出
- 最大連勝数のベストスコア保存

### ブラックジャック

プレイヤー vs ディーラーの1対1カードゲーム。

- 手札の合計を21に近づけてディーラーに勝つ
- A=1or11（自動調整）、J/Q/K=10
- ヒット（カードを引く）/スタンド（止める）を選択
- ディーラーは17以上になるまで自動でカードを引く
- ナチュラルブラックジャック（初期2枚で21）は特別勝利
- ラウンド制: 勝利後に連勝を継続可能
- 最大連勝数のベストスコア保存

### ビデオポーカー

Jacks or Better 形式の1人用ビデオポーカー。

- 52枚のデッキから5枚を配布
- カードタップでホールド（保持）を選択、ドローで交換
- 最終手札でポーカーの役を判定（ロイヤルフラッシュ〜ノーハンド）
- 10ラウンド制: 各ラウンドで役に応じたポイントを獲得（中間ラウンドは自動進行）
- ペイテーブル表示・現在の役ハイライト
- 合計スコアのベストスコア保存

## 技術スタック

- **Next.js** (App Router)
- **TypeScript**
- **Tailwind CSS 4.x**
- **shadcn/ui** (Button, Dialog, Badge)
- **Vitest** + React Testing Library

## CI

GitHub Actions により、`main` ブランチへの push および PR 時に以下を自動実行します。

- **Lint** — `npm run lint`
- **テスト** — `npm run test:run`
- **ビルド** — `npm run build`

## 開発

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# リント
npm run lint

# テスト実行
npm run test:run

# ビルド
npm run build
```

## Claude Code スキル

このプロジェクトでは [Claude Code](https://claude.ai/code) のカスタムスキル（スラッシュコマンド）を活用しています。

| コマンド | 説明 |
|----------|------|
| `/add-game [ゲーム名]` | 新しいカードゲームの追加を自動化。既存パターンに従い、型定義・ロジック・テスト・UI・ページを一貫して実装する |
| `/pr [コミットメッセージ]` | feature ブランチのコミット・プッシュ・PR 作成・ローカルブランチ削除を一括実行 |
| `/update-docs` | ソースコードの実態とドキュメント（README.md, CLAUDE.md, architecture.md）の整合性を検証・更新 |

スキル定義: `.claude/skills/<skill-name>/SKILL.md`

## Claude Code エージェント

特定タスクを委任するサブエージェントを定義しています。

| エージェント | 説明 |
|-------------|------|
| `quality-checker` | lint・テスト・ビルドを実行し結果のみ報告（haiku モデルで高速・低コスト） |

エージェント定義: `.claude/agents/quality-checker.md`

## プロジェクト構成

```
src/
├── app/
│   ├── blackjack/               # ブラックジャックページ
│   ├── concentration/           # 神経衰弱ページ
│   ├── high-and-low/            # ハイ＆ローページ
│   ├── poker/                   # ビデオポーカーページ
│   ├── globals.css              # テーマ・背景・アニメーション
│   ├── layout.tsx               # ルートレイアウト
│   └── page.tsx                 # ホーム（ゲーム選択）
├── components/
│   ├── ui/                      # shadcn/ui（自動生成）
│   ├── home/                    # ホーム: ゲーム一覧・ベストスコア表示
│   ├── concentration/           # 神経衰弱: コンポーネント群
│   ├── high-and-low/            # ハイ＆ロー: コンポーネント群
│   ├── blackjack/               # ブラックジャック: コンポーネント群
│   └── poker/                   # ビデオポーカー: コンポーネント群
├── hooks/
│   ├── useConcentration.ts      # 神経衰弱: ゲームロジックフック
│   ├── useHighAndLow.ts         # ハイ＆ロー: ゲームロジックフック
│   ├── useBlackjack.ts          # ブラックジャック: ゲームロジックフック
│   └── usePoker.ts              # ビデオポーカー: ゲームロジックフック
├── lib/
│   ├── concentration-cards.ts   # 神経衰弱: カード生成・シャッフル
│   ├── concentration-reducer.ts # 神経衰弱: Reducer
│   ├── concentration-storage.ts # 神経衰弱: localStorage操作
│   ├── high-and-low-cards.ts    # ハイ＆ロー: デッキ生成
│   ├── high-and-low-reducer.ts  # ハイ＆ロー: Reducer
│   ├── high-and-low-storage.ts  # ハイ＆ロー: localStorage操作
│   ├── blackjack-cards.ts       # ブラックジャック: デッキ・手札計算
│   ├── blackjack-reducer.ts     # ブラックジャック: Reducer
│   ├── blackjack-storage.ts     # ブラックジャック: localStorage操作
│   ├── poker-cards.ts           # ビデオポーカー: デッキ・役判定
│   ├── poker-reducer.ts         # ビデオポーカー: Reducer
│   ├── poker-storage.ts         # ビデオポーカー: localStorage操作
│   └── utils.ts                 # shadcn cn()
├── types/
│   ├── concentration.ts         # 神経衰弱: 型定義
│   ├── high-and-low.ts          # ハイ＆ロー: 型定義
│   ├── blackjack.ts             # ブラックジャック: 型定義
│   └── poker.ts                 # ビデオポーカー: 型定義
└── test/
    └── setup.ts                 # テストセットアップ

.claude/
├── agents/                      # Claude Code サブエージェント
│   └── quality-checker.md       # 品質チェックエージェント
├── rules/                       # Claude Code ルールファイル
├── tasks/                       # ゲームごとの要件定義
└── skills/
    ├── add-game/SKILL.md        # 新ゲーム追加スキル
    ├── pr/SKILL.md              # PR作成スキル
    └── update-docs/SKILL.md     # ドキュメント横展開スキル
```

## 設計

- **useReducer** でゲーム状態を一元管理（各ゲームが独立した Reducer を持つ）
- **Fisher-Yates** アルゴリズムによるカードシャッフル
- **CSS 3D Transform** でカードフリップ（GPU加速）
- **useSyncExternalStore** でlocalStorageのベストスコアを購読
- レスポンシブデザイン（モバイル対応）
- Glassmorphism UI + グラデーション背景
