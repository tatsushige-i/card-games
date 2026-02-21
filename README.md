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

## 技術スタック

- **Next.js** (App Router)
- **TypeScript**
- **Tailwind CSS 4.x**
- **shadcn/ui** (Button, Dialog, Badge)
- **Vitest** + React Testing Library

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

## プロジェクト構成

```
src/
├── app/
│   ├── concentration/           # 神経衰弱ページ
│   ├── high-and-low/            # ハイ＆ローページ
│   ├── globals.css              # テーマ・背景・アニメーション
│   ├── layout.tsx               # ルートレイアウト
│   └── page.tsx                 # ホーム（ゲーム選択）
├── components/
│   ├── ui/                      # shadcn/ui（自動生成）
│   ├── home/                    # ホーム: ゲーム一覧・ベストスコア表示
│   ├── game-board.tsx           # 神経衰弱: ゲーム盤面
│   ├── card-grid.tsx            # 神経衰弱: カードグリッド
│   ├── game-card.tsx            # 神経衰弱: 個別カード
│   ├── game-header.tsx          # 神経衰弱: ヘッダー
│   ├── game-complete-dialog.tsx # 神経衰弱: 完了モーダル
│   └── high-and-low/            # ハイ＆ロー: コンポーネント群
├── hooks/
│   ├── useGame.ts               # 神経衰弱: ゲームロジックフック
│   └── useHighAndLow.ts         # ハイ＆ロー: ゲームロジックフック
├── lib/
│   ├── cards.ts                 # 神経衰弱: カード生成・シャッフル
│   ├── game-reducer.ts          # 神経衰弱: Reducer
│   ├── storage.ts               # 神経衰弱: localStorage操作
│   ├── high-and-low-cards.ts    # ハイ＆ロー: デッキ生成
│   ├── high-and-low-reducer.ts  # ハイ＆ロー: Reducer
│   ├── high-and-low-storage.ts  # ハイ＆ロー: localStorage操作
│   └── utils.ts                 # shadcn cn()
├── types/
│   ├── game.ts                  # 神経衰弱: 型定義
│   └── high-and-low.ts          # ハイ＆ロー: 型定義
└── test/
    └── setup.ts                 # テストセットアップ
```

## 設計

- **useReducer** でゲーム状態を一元管理（各ゲームが独立した Reducer を持つ）
- **Fisher-Yates** アルゴリズムによるカードシャッフル
- **CSS 3D Transform** でカードフリップ（GPU加速）
- **useSyncExternalStore** でlocalStorageのベストスコアを購読
- レスポンシブデザイン（モバイル対応）
- Glassmorphism UI + グラデーション背景
