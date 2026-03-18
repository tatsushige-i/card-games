# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ドキュメント保守ルール

- `.claude/rules/` に記載済みの情報を CLAUDE.md に重複させない（rules/ は自動的にコンテキストに読み込まれるため）

## コマンド

- `npm run dev` — 開発サーバー起動
- `npm run build` — 本番ビルド
- `npm run lint` — ESLint（Next.js core-web-vitals + TypeScript ルール）
- `npm run test:run` — テスト一括実行
- `npm run test` — テスト（ウォッチモード）
- 単一テスト実行: `npx vitest run src/lib/__tests__/concentration-cards.test.ts`

## アーキテクチャ概要

Next.js App Router + TypeScript で構築されたカードゲーム集。各ゲームは完全に独立したファイル群を持ち、ゲーム間でコードを共有しない（`shuffle` 等の小さなユーティリティも各ゲームに複製する）。

詳細は `.claude/rules/` 配下のルールファイルを参照:

- `architecture.md` — ゲーム追加パターン・ファイル構成・コンポーネントツリー・共有リソース
- `conventions.md` — コーディング規約・デザイン要件・実装プロセス
- `pitfalls.md` — 既知の注意点
- `security.md` — セキュリティルール（機密情報の取り扱い）

### ホーム画面へのゲーム登録

`src/components/home/game-list.tsx` で以下 3 箇所を変更する:

1. `games` 配列にエントリ追加（id, title, description, emoji, storageKey）
2. `format<Game>Best()` 関数を追加
3. `formatBestScore()` の switch に case を追加

## スキル（カスタムスラッシュコマンド）

`.claude/skills/` 配下にプロジェクト固有のスキルを定義:

- `/docs-sync` — ソースコードの実態とドキュメント（README.md, CLAUDE.md, architecture.md）の整合性を検証・更新
- `/game-debug [ゲーム名]` — ゲームの reducer を対話的に操作し、状態遷移をデバッグする
- `/game-refactor [ゲーム名]` — 指定ゲームの規約準拠をチェックし、違反があればリファクタリングを行う
- `/git-branch-cleanup` — PR マージ後にローカルの feature ブランチを削除し、main を最新化する
- `/git-issue-start [Issue番号]` — GitHub Issue を取得し、ラベルに応じた feature ブランチを作成。ゲーム追加 Issue の場合は実装も開始する
- `/git-pr-create [コミットメッセージ]` — feature ブランチのコミット・プッシュ・PR 作成を一括実行
- `/git-review-respond [PR番号]` — PR のレビューコメントを取得・トリアージし、修正→品質チェック→プッシュ→返信を一括実行

## エージェント（サブエージェント）

`.claude/agents/` 配下に専用エージェントを定義:

- `quality-checker` — lint・テスト・ビルドを実行し結果を要約する（model: haiku）

