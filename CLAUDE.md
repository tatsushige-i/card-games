# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ドキュメント保守ルール

- `.claude/rules/` に記載済みの情報を CLAUDE.md に重複させない（rules/ は自動的にコンテキストに読み込まれるため）

## コマンド

- `npm run dev` — 開発サーバー起動
- `npm run build` — 本番ビルド
- `npm run lint` — ESLint
- `npm run test` — テスト一括実行
- 単一テスト実行: `npx vitest run src/lib/__tests__/<file>.test.ts`

## アーキテクチャ概要

Next.js App Router + TypeScript で構築されたカードゲーム集。各ゲームは完全に独立したファイル群を持ち、ゲーム間でコードを共有しない。

詳細は `.claude/rules/` 配下を参照（自動的にコンテキストに読み込まれる）。

## スキル・エージェント

- スキル一覧: `.claude/skills/README.md`
- エージェント一覧: `.claude/agents/README.md`
