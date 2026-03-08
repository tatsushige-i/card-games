#!/bin/bash

# PreToolUse hook: 保護対象ファイルの編集をブロックする
# package-lock.json は npm install/update で自動生成されるため、直接編集を禁止する

FILE_PATH=$(jq -r '.tool_input.file_path // empty')

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

case "$FILE_PATH" in
  */package-lock.json|package-lock.json)
    echo "ブロック: package-lock.json は直接編集できません。npm install/update コマンドを使用してください" >&2
    exit 2
    ;;
esac

exit 0
