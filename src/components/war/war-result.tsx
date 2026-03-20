"use client";

import type { RoundResult } from "@/types/war";

type WarResultProps = {
  roundResult: RoundResult | null;
};

/** ラウンド結果の表示コンポーネント */
export function WarResult({ roundResult }: WarResultProps) {
  if (!roundResult) return null;

  return (
    <div className="text-center py-2">
      {roundResult === "player" && (
        <span className="text-2xl font-bold text-emerald-600">
          勝ち！
        </span>
      )}
      {roundResult === "cpu" && (
        <span className="text-2xl font-bold text-red-500">
          負け...
        </span>
      )}
      {roundResult === "war" && (
        <span className="text-2xl font-bold text-amber-500">
          同値 → 戦争！
        </span>
      )}
    </div>
  );
}
