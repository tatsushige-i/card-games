# コーディング規約

- **コード内のコメントはすべて日本語で記述する**（TASK.md によるプロジェクト要件）
- **ライトモードのみ対応** — ダークモードは非対応
- shadcn/ui コンポーネント: Button, Dialog, Badge（スタイル: "new-york"）
- Tailwind CSS 4.x 形式: `@import "tailwindcss"`, `@theme inline` ブロック
- パスエイリアス: `@/*` → `./src/*`
- テストファイルはソースと同階層に配置: `src/lib/__tests__/`, `src/components/__tests__/`
- Vitest 設定: jsdom 環境、globals 有効、`@testing-library/jest-dom` マッチャー（`src/test/setup.ts` で設定）
- ESLint: フラットコンフィグ（v9+）、`eslint-config-next/core-web-vitals` + `/typescript`
