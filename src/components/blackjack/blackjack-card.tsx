"use client";

import { cn } from "@/lib/utils";
import { SUIT_SYMBOLS, SUIT_COLORS } from "@/lib/blackjack-cards";
import type { PlayingCard } from "@/types/blackjack";

type BlackjackCardProps = {
  card: PlayingCard | null;
  /** カードが裏向きかどうか */
  faceDown?: boolean;
};

/** トランプカード表示コンポーネント */
export function BlackjackCard({ card, faceDown = false }: BlackjackCardProps) {
  if (!card && !faceDown) return null;

  const suitColor = card ? SUIT_COLORS[card.suit] : "black";
  const suitSymbol = card ? SUIT_SYMBOLS[card.suit] : "";

  return (
    <div className="card-container w-20 h-28 sm:w-24 sm:h-34">
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
            "bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400"
          )}
        >
          <span className="text-2xl text-white/90 select-none">?</span>
        </div>

        {/* 表面 */}
        <div className="card-face card-back glass shadow-lg">
          {card && (
            <div className="flex flex-col items-center justify-center gap-0.5">
              <span
                className={cn(
                  "text-3xl sm:text-4xl font-bold select-none",
                  suitColor === "red" ? "text-red-600" : "text-gray-800"
                )}
              >
                {card.rank}
              </span>
              <span
                className={cn(
                  "text-xl sm:text-2xl select-none",
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
