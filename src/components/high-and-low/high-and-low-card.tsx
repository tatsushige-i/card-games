"use client";

import { cn } from "@/lib/utils";
import { SUIT_SYMBOLS, SUIT_COLORS } from "@/lib/high-and-low-cards";
import type { PlayingCard, GuessResult } from "@/types/high-and-low";

type HighAndLowCardProps = {
  card: PlayingCard | null;
  /** カードが裏向きかどうか */
  faceDown?: boolean;
  /** 結果表示用のハイライト */
  highlight?: GuessResult | null;
};

/** トランプカード表示コンポーネント */
export function HighAndLowCard({
  card,
  faceDown = false,
  highlight = null,
}: HighAndLowCardProps) {
  if (!card && !faceDown) return null;

  const suitColor = card ? SUIT_COLORS[card.suit] : "black";
  const suitSymbol = card ? SUIT_SYMBOLS[card.suit] : "";

  return (
    <div className="card-container w-28 h-40 sm:w-36 sm:h-52">
      <div
        className={cn("card-inner w-full h-full", !faceDown && "flipped")}
        role="img"
        aria-label={
          faceDown
            ? "裏向きのカード"
            : card
              ? `${SUIT_SYMBOLS[card.suit]}${card.rank}`
              : ""
        }
      >
        {/* 裏面 */}
        <div
          className={cn(
            "card-face glass shadow-md",
            "bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400"
          )}
        >
          <span className="text-3xl text-white/90 select-none">?</span>
        </div>

        {/* 表面 */}
        <div
          className={cn(
            "card-face card-back glass shadow-lg",
            highlight === "correct" && "ring-2 ring-emerald-400/60",
            highlight === "incorrect" && "ring-2 ring-red-400/60",
            highlight === "draw" && "ring-2 ring-amber-400/60"
          )}
        >
          {card && (
            <div className="flex flex-col items-center justify-center gap-1">
              <span
                className={cn(
                  "text-4xl sm:text-5xl font-bold select-none",
                  suitColor === "red" ? "text-red-600" : "text-gray-800"
                )}
              >
                {card.rank}
              </span>
              <span
                className={cn(
                  "text-2xl sm:text-3xl select-none",
                  suitColor === "red" ? "text-red-600" : "text-gray-800"
                )}
              >
                {suitSymbol}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
