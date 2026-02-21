# CLAUDE.md

このファイルは Claude Code (claude.ai/code) がこのリポジトリで作業する際のガイダンスを提供します。

## コマンド

- `npm run dev` — 開発サーバー起動
- `npm run build` — 本番ビルド
- `npm run lint` — ESLint（Next.js core-web-vitals + TypeScript ルール）
- `npm run test:run` — テスト一括実行
- `npm run test` — テスト（ウォッチモード）
- 単一テスト実行: `npx vitest run src/lib/__tests__/cards.test.ts`

## アーキテクチャ概要

Next.js App Router + TypeScript で構築されたカードゲーム集。

詳細は `.claude/rules/` 配下のルールファイルを参照:

- `architecture.md` — アーキテクチャ詳細（状態管理・ルーティング・コンポーネント構成・主要ファイル）
- `conventions.md` — コーディング規約
- `pitfalls.md` — 既知の注意点

## スキル（カスタムスラッシュコマンド）

`.claude/skills/` 配下にプロジェクト固有のスキルを定義:

- `/add-game [ゲーム名]` — 新しいカードゲームを追加する（型定義・ロジック・テスト・UI・ページを一貫して実装）
