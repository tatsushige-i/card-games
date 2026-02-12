# 神経衰弱ゲーム

カードをめくってペアを見つけるメモリーマッチングゲームです。

## 機能

- 4x4グリッド（8ペア・16枚）のカードマッチングゲーム
- 3Dフリップアニメーション付きカード
- 試行回数・経過時間の記録
- ベストスコアのlocalStorage保存
- ゲーム完了時のクリアダイアログ
- レスポンシブデザイン（モバイル対応）
- Glassmorphism UI + 3層グラデーション背景

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
│   ├── globals.css          # テーマ・背景・アニメーション
│   ├── layout.tsx           # ルートレイアウト
│   └── page.tsx             # メインページ
├── components/
│   ├── ui/                  # shadcn/ui（自動生成）
│   ├── game-board.tsx       # ゲーム盤面全体
│   ├── card-grid.tsx        # カードグリッド
│   ├── game-card.tsx        # 個別カード
│   ├── game-header.tsx      # ヘッダー（スコア等）
│   └── game-complete-dialog.tsx  # 完了モーダル
├── hooks/
│   └── useGame.ts           # ゲームロジックフック
├── lib/
│   ├── cards.ts             # カード生成・シャッフル
│   ├── game-reducer.ts      # ゲームReducer
│   ├── storage.ts           # localStorage操作
│   └── utils.ts             # shadcn cn()
├── types/
│   └── game.ts              # 型定義
└── test/
    └── setup.ts             # テストセットアップ
```

## 設計

- **useReducer** でゲーム状態を一元管理
- **Fisher-Yates** アルゴリズムによるカードシャッフル
- **CSS 3D Transform** でカードフリップ（GPU加速）
- **useSyncExternalStore** でlocalStorageのベストスコアを購読
