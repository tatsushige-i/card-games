---
name: start-issue
description: GitHub Issue を取得し、ラベルに応じた feature ブランチを作成して作業を開始する。
argument-hint: "[Issue番号]"
---

# Issue 作業開始スキル

GitHub Issue の内容を取得し、ラベルに応じたブランチ名で feature ブランチを作成して作業を開始する。

## 前提条件

- `$ARGUMENTS` に Issue 番号が指定されていること
- 現在 `main` ブランチにいること
- 未コミットの変更がないこと

## 実行プロセス

### Step 1: 引数チェック

1. `$ARGUMENTS` が空の場合は **エラーとして中止** し、`/start-issue 36` のように Issue 番号を指定するよう案内する

### Step 2: 状態確認

1. 現在のブランチ名を取得する
2. `main` ブランチ以外にいる場合は **エラーとして中止** し、`git switch main` で main に戻るよう案内する
3. `git status` で未コミットの変更がないことを確認する。変更がある場合は **エラーとして中止** し、先にコミットまたはスタッシュするよう案内する

### Step 3: Issue 取得

1. `gh issue view $ARGUMENTS` で Issue のタイトル・ラベル・本文を取得する
2. Issue が存在しない場合は **エラーとして中止** する

### Step 4: main 最新化

1. `git pull` で main ブランチを最新化する

### Step 5: ブランチ作成

1. Issue のラベルからブランチ名のプレフィックスを決定する:
   - `bug` → `fix/`
   - `enhancement` → `feature/`
   - `documentation` → `docs/`
   - 上記以外・ラベルなし → `feature/`（デフォルト）
2. Issue のタイトルから英語のケバブケースでスラッグを生成する（例: `add-start-issue-skill`）
3. `git checkout -b <prefix><slug>` でブランチを作成・チェックアウトする

### Step 6: 作業コンテキスト提示

以下の情報をユーザーに提示する:

1. Issue 番号・タイトル・ラベル
2. Issue 本文の要約
3. 作成したブランチ名
4. 次のステップの案内（作業完了後は `/pr` でPR作成できること）
