# コーディング規約

## ドキュメント運用

- `.claude/tasks/<game>.md` は**要件（何を作るか）のみ**を記載する指示書。設計（どう作るか）は含めない
- 設計パターンは `.claude/rules/architecture.md` に集約する
- フィードバックによる要件変更時は、コード修正と同時に `.claude/tasks/<game>.md` も自動で最新化する

## Git 運用

- **ファイルに変更を加える場合は、main ブランチで直接行わず、必ず `git pull` で main を最新化してから feature ブランチを作成して作業を開始する**
- **コミット・プッシュはユーザーの明示的な指示があるまで行わない**

## デザイン要件（Apple 風デザインシステム準拠）

- **Glassmorphism UI**: 半透明・backdrop-blur 効果
- **グラデーション要素**: 8色テーマのカラーシステム（最低限に絞る）
- **マイクロインタラクション**: ホバー・クリック時のアニメーション
- **多層背景**: 3層構造の美しいグラデーション背景
- **レスポンシブデザイン**: モバイルファーストアプローチ
- **60fps アニメーション**: スムーズで意味のある動作
- **見やすい UI**: WCAG 基準を満たした見やすい文字・背景色のコントラスト
- **Apple Human Interface Guidelines** 準拠
- **Core Web Vitals** 最適化必須

## インフラ制約

- **データベース使用禁止**（localStorage 活用）

## コード

- **コード内のコメントはすべて日本語で記述する**
- **README.md は英語で記述する**（README.md 以外のドキュメント・指示書・ルールファイルは日本語）
- **ライトモードのみ対応** — ダークモードは非対応
- shadcn/ui コンポーネント: Button, Dialog, Badge（スタイル: "new-york"）
- Tailwind CSS 4.x 形式: `@import "tailwindcss"`, `@theme inline` ブロック
- パスエイリアス: `@/*` → `./src/*`
- テストファイルはソースと同階層に配置: `src/lib/__tests__/`, `src/components/__tests__/`
- Vitest 設定: jsdom 環境、globals 有効、`@testing-library/jest-dom` マッチャー（`src/test/setup.ts` で設定）
- ESLint: フラットコンフィグ（v9+）、`eslint-config-next/core-web-vitals` + `/typescript`

## 実装の流れ（固定プロセス）

1. 仕様を把握する
2. ESLint をセットアップする
3. 設計を行う
4. 実装する
5. テストを実装する
6. リファクタリングを行う
7. 全ての品質チェックがパスすることを確認する
8. README.md に仕様をまとめる
