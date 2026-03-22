# スキル

Claude Code のカスタムスラッシュコマンド。`.claude/skills/` 配下に定義する。各スキルはプロジェクト固有のワークフローを自動化する。

## プロジェクト固有スキル

### `/docs-sync`

ソースコードとドキュメント（README.md, CLAUDE.md, architecture.md）の整合性を検証し、古いセクションを更新する。

### `/game-debug [ゲーム名]`

ゲームの reducer をインタラクティブに操作し、状態遷移をデバッグする。ファイルを変更せずにリアルタイムでアクションをシミュレーションする。

- **引数**: 英語 kebab-case のゲーム名（例: `concentration`）

### `/game-refactor [ゲーム名]`

ゲームのプロジェクト規約準拠を監査し、違反があれば自動的にリファクタリングする（命名、ファイル構成、パターン）。引数なしの場合は全ゲームをチェックする。

- **引数**（任意）: 英語 kebab-case のゲーム名（例: `blackjack`）。省略時は全ゲームをチェック。

## 共有スキル（シンボリックリンク → shared-claude-rules）

- `/config-claude-sync` — shared-claude-rules から共有ルール・スキルのシンボリックリンクを同期
- `/config-github-sync` — GitHub リポジトリ設定（ラベル、マイルストーン等）を同期
- `/git-branch-cleanup` — PR マージ後のクリーンアップ
- `/git-issue-create` — 会話コンテキストから GitHub Issue を作成
- `/git-issue-start [issue番号]` — GitHub Issue を取得しフィーチャーブランチを作成
- `/git-pr-create [コミットメッセージ]` — コミット、プッシュ、PR を作成
- `/git-review-respond [PR番号]` — PR レビューコメントへの対応を一括処理
- `/tech-debt-audit-nextjs` — Next.js（App Router）プロジェクトの技術的負債を監査し、優先順位付きレポートを生成
