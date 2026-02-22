"use client";

import { cn } from "@/lib/utils";
import { HAND_NAMES, HAND_PAYOUTS } from "@/lib/poker-cards";
import type { HandRank } from "@/types/poker";

type PokerResultProps = {
  /** 判定された役 */
  handRank: HandRank | null;
};

/** 役結果表示コンポーネント */
export function PokerResult({ handRank }: PokerResultProps) {
  if (!handRank) return null;

  const payout = HAND_PAYOUTS[handRank];
  const isWin = payout > 0;

  return (
    <div className="text-center py-2">
      <span
        className={cn(
          "text-2xl sm:text-3xl font-black tracking-wide",
          handRank === "royalFlush" &&
            "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent",
          handRank === "straightFlush" &&
            "bg-gradient-to-r from-purple-500 via-pink-400 to-purple-500 bg-clip-text text-transparent",
          handRank !== "royalFlush" &&
            handRank !== "straightFlush" &&
            isWin &&
            "text-emerald-600",
          !isWin && "text-gray-400"
        )}
      >
        {HAND_NAMES[handRank]}
      </span>
      {isWin && (
        <p className="text-lg font-bold text-amber-500 mt-1">+{payout}pt</p>
      )}
    </div>
  );
}
