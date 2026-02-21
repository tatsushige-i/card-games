# コーディング規約

## ドキュメント運用

- `tasks/<game>.md` は**要件（何を作るか）のみ**を記載する指示書。設計（どう作るか）は含めない
- 設計パターンは `.claude/rules/architecture.md` に集約する
- フィードバックによる要件変更時は、コード修正と同時に `tasks/<game>.md` も自動で最新化する

## Git 運用

- **コミット・プッシュはユーザーの明示的な指示があるまで行わない**

## コード

- **コード内のコメントはすべて日本語で記述する**（TASK.md によるプロジェクト要件）
- **ライトモードのみ対応** — ダークモードは非対応
- shadcn/ui コンポーネント: Button, Dialog, Badge（スタイル: "new-york"）
- Tailwind CSS 4.x 形式: `@import "tailwindcss"`, `@theme inline` ブロック
- パスエイリアス: `@/*` → `./src/*`
- テストファイルはソースと同階層に配置: `src/lib/__tests__/`, `src/components/__tests__/`
- Vitest 設定: jsdom 環境、globals 有効、`@testing-library/jest-dom` マッチャー（`src/test/setup.ts` で設定）
- ESLint: フラットコンフィグ（v9+）、`eslint-config-next/core-web-vitals` + `/typescript`
