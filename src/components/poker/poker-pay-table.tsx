"use client";

import { cn } from "@/lib/utils";
import { HAND_RANK_ORDER, HAND_NAMES, HAND_PAYOUTS } from "@/lib/poker-cards";
import type { HandRank } from "@/types/poker";

type PokerPayTableProps = {
  /** 現在の役（ハイライト用） */
  currentRank: HandRank | null;
};

/** 配当表コンポーネント */
export function PokerPayTable({ currentRank }: PokerPayTableProps) {
  return (
    <div className="glass rounded-xl p-3 sm:p-4 shadow-md">
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs sm:text-sm">
        {HAND_RANK_ORDER.map((rank) => {
          const isActive = currentRank === rank;
          return (
            <div
              key={rank}
              className={cn(
                "contents",
                isActive && "[&>*]:bg-amber-100 [&>*]:font-bold"
              )}
            >
              <span
                className={cn(
                  "py-0.5 px-1 rounded-l transition-colors",
                  isActive ? "text-amber-700" : "text-gray-600"
                )}
              >
                {HAND_NAMES[rank]}
              </span>
              <span
                className={cn(
                  "py-0.5 px-1 rounded-r text-right tabular-nums transition-colors",
                  isActive ? "text-amber-700" : "text-gray-500"
                )}
              >
                {HAND_PAYOUTS[rank]}pt
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
