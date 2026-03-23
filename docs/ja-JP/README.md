**Language:** [English](../../README.md) | 日本語

# カードゲーム

さまざまなカードゲームをブラウザで楽しめる Web アプリです。

> **Note:** このプロジェクトは [Claude Code](https://claude.ai/code) の練習として作成されました。コーディングはすべて Claude Code が行い、人間はレビューとフィードバックのみを担当しています。

## ゲーム一覧

神経衰弱 / ハイ＆ロー / ブラックジャック / ビデオポーカー / ピラミッド / ゴルフソリテア / スパイダー / テンプレイ / トライピークス / ウォー

## 技術スタック

- Next.js (App Router)
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- Vitest

## セットアップ

```bash
npm install
npm run dev
```

## Claude Code セットアップ

このプロジェクトは Claude Code の設定（rules, skills, hooks）を [shared-claude-code](https://github.com/tatsushige-i/shared-claude-code) リポジトリから共有しています。

クローン後、Claude Code で以下のスラッシュコマンドを実行して共有設定を同期してください：

```
/config-claude-sync
```

同期対象：
- **Rules** — `.claude/rules/shared/`（共有ルールファイルへのシンボリックリンク）
- **Skills** — `.claude/skills/`（共有スキルディレクトリへのシンボリックリンク）
- **Hooks** — `.claude/settings.json`（共有フックコマンド）

## ドキュメント

- [アーキテクチャ](../../.claude/rules/architecture.md) — ゲーム構成、ルーティング、コンポーネントツリー
- [コーディング規約](../../.claude/rules/conventions.md) — コーディングルール、デザイン要件、ワークフロー
- [CLAUDE.md](../../CLAUDE.md) — コマンド、スキル、エージェント
