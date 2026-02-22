# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

- `architecture.md` — ゲーム追加パターン・ファイル構成・コンポーネントツリー・共有リソース
- `conventions.md` — コーディング規約・デザイン要件・実装プロセス
- `pitfalls.md` — 既知の注意点

## スキル（カスタムスラッシュコマンド）

`.claude/skills/` 配下にプロジェクト固有のスキルを定義:

- `/add-game [ゲーム名]` — 新しいカードゲームを追加する（型定義・ロジック・テスト・UI・ページを一貫して実装）
