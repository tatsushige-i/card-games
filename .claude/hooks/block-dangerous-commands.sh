#!/bin/bash

# PreToolUse hook: 破壊的なシェルコマンドの実行をブロックする
# Bash ツールの実行前にコマンドを検査し、危険なパターンを検出した場合は exit 2 でブロックする

COMMAND=$(jq -r '.tool_input.command // empty')

if [ -z "$COMMAND" ]; then
  exit 0
fi

# git commit のメッセージ引数のみを除去し、実際に実行されるコマンド部分は検査対象に残す
# （例: git commit -m "rm -rf を削除" → git commit -m ）
# sh -c "rm -rf /" 等の実行系コマンドの引用符内は除去しない
SANITIZED=$(echo "$COMMAND" | sed -E "s/(git[[:space:]]+commit[[:space:]]+.*(--message|-m)[[:space:]]+)\"[^\"]*\"/\1/g; s/(git[[:space:]]+commit[[:space:]]+.*(--message|-m)[[:space:]]+)'[^']*'/\1/g")

# rm -rf（オプション付きも含む、引用符内も検出）
if echo "$SANITIZED" | grep -qE '(^|[;&|"'"'"'\s])rm\s+(-[a-zA-Z]*r[a-zA-Z]*f|-[a-zA-Z]*f[a-zA-Z]*r)\b'; then
  echo "ブロック: rm -rf は実行できません。ファイル削除は手動で行ってください" >&2
  exit 2
fi

# git push --force / -f
if echo "$SANITIZED" | grep -qE '(^|[;&|"'"'"'\s])git\s+push\s+.*(-f|--force)\b'; then
  echo "ブロック: git push --force は実行できません。通常の git push を使用してください" >&2
  exit 2
fi

# git reset --hard
if echo "$SANITIZED" | grep -qE '(^|[;&|"'"'"'\s])git\s+reset\s+.*--hard\b'; then
  echo "ブロック: git reset --hard は実行できません。変更を保持するリセット方法を使用してください" >&2
  exit 2
fi

# npm publish
if echo "$SANITIZED" | grep -qE '(^|[;&|"'"'"'\s])npm\s+publish\b'; then
  echo "ブロック: npm publish は実行できません。パッケージ公開は手動で行ってください" >&2
  exit 2
fi

# git checkout . （ワーキングツリー全体の変更破棄）
if echo "$SANITIZED" | grep -qE '(^|[;&|"'"'"'\s])git\s+checkout\s+\.\s*["'"'"']?\s*$'; then
  echo "ブロック: git checkout . は実行できません。変更の破棄は手動で行ってください" >&2
  exit 2
fi

# git restore . （ワーキングツリー全体の変更破棄）
if echo "$SANITIZED" | grep -qE '(^|[;&|"'"'"'\s])git\s+restore\s+\.\s*["'"'"']?\s*$'; then
  echo "ブロック: git restore . は実行できません。変更の破棄は手動で行ってください" >&2
  exit 2
fi

exit 0
