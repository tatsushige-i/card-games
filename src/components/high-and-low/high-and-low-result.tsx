"use client";

import type { GuessResult } from "@/types/high-and-low";

type HighAndLowResultProps = {
  result: GuessResult | null;
};

/** 予想結果の表示コンポーネント */
export function HighAndLowResult({ result }: HighAndLowResultProps) {
  if (!result) return null;

  return (
    <div className="text-center py-2">
      {result === "correct" && (
        <span className="text-2xl font-bold text-emerald-600">
          ⭕ 正解！ +1
        </span>
      )}
      {result === "incorrect" && (
        <span className="text-2xl font-bold text-red-500">
          ❌ 不正解... -1
        </span>
      )}
      {result === "draw" && (
        <span className="text-2xl font-bold text-amber-500">
          ➖ 引き分け ±0
        </span>
      )}
    </div>
  );
}
