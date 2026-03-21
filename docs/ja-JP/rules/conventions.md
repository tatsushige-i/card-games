# プロジェクト固有規約

## ドキュメント運用

- 設計パターンは `.claude/rules/architecture.md` に集約する
- **README.md は簡潔に保つ**（詳細は `.claude/rules/` 配下のドキュメントに委ねる）
  - 記載する: プロジェクト概要、収録ゲーム一覧（名前のみ）、Tech Stack（1行）、Setup コマンド、詳細ドキュメントへのリンク
  - 記載しない: 各ゲームの詳細仕様、ディレクトリ構成、設計パターン、スキル/エージェント一覧（すべて `.claude/rules/` や `CLAUDE.md` に既載）

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
- **ライトモードのみ対応** — ダークモードは非対応
- shadcn/ui コンポーネント: Button, Dialog, Badge（スタイル: "new-york"）
- Tailwind CSS 4.x 形式: `@import "tailwindcss"`, `@theme inline` ブロック
- パスエイリアス: `@/*` → `./src/*`
- テストファイルはソースと同階層に配置: `src/lib/__tests__/`, `src/components/__tests__/`
- Vitest 設定: jsdom 環境、globals 有効、`@testing-library/jest-dom` マッチャー（`src/test/setup.ts` で設定）
- ESLint: フラットコンフィグ（v9+）、`eslint-config-next/core-web-vitals` + `/typescript`

## スキルカテゴリ

共通の命名規則（`shared/conventions.md`）に加え、本プロジェクトでは以下のカテゴリを使用:

- `game`（ゲーム開発）
- `git`（Gitワークフロー）
- `docs`（ドキュメント管理）

## 実装の流れ（固定プロセス）

1. 仕様を把握する
2. ESLint をセットアップする
3. 設計を行う
4. 実装する
5. テストを実装する
6. リファクタリングを行う
7. 全ての品質チェックがパスすることを確認する
8. README.md に仕様をまとめる
