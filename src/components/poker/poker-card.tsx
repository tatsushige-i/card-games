"use client";

import { cn } from "@/lib/utils";
import { SUIT_SYMBOLS, SUIT_COLORS } from "@/lib/poker-cards";
import type { PlayingCard } from "@/types/poker";

type PokerCardProps = {
  card: PlayingCard | null;
  /** カードが裏向きかどうか */
  faceDown?: boolean;
  /** ホールド状態かどうか */
  held?: boolean;
  /** クリック時のコールバック */
  onClick?: () => void;
  /** クリック可能かどうか */
  clickable?: boolean;
};

/** ポーカーカード表示コンポーネント */
export function PokerCard({
  card,
  faceDown = false,
  held = false,
  onClick,
  clickable = false,
}: PokerCardProps) {
  if (!card && !faceDown) return null;

  const suitColor = card ? SUIT_COLORS[card.suit] : "black";
  const suitSymbol = card ? SUIT_SYMBOLS[card.suit] : "";

  return (
    <div className="flex flex-col items-center gap-1">
      {/* HOLDラベル */}
      <span
        className={cn(
          "text-xs font-bold tracking-wider transition-opacity duration-200",
          held ? "text-amber-500 opacity-100" : "opacity-0"
        )}
      >
        HOLD
      </span>

      <button
        type="button"
        onClick={clickable ? onClick : undefined}
        disabled={!clickable}
        className={cn(
          "card-container w-16 h-24 sm:w-20 sm:h-28 transition-transform duration-200",
          held && "-translate-y-2",
          clickable && "cursor-pointer hover:scale-105 active:scale-95",
          !clickable && "cursor-default"
        )}
      >
        <div
          className={cn("card-inner w-full h-full", !faceDown && "flipped")}
          role="img"
          aria-label={
            faceDown
              ? "裏向きのカード"
              : card
                ? `${SUIT_SYMBOLS[card.suit]}${card.rank}${held ? " (ホールド中)" : ""}`
                : ""
          }
        >
          {/* 裏面 */}
          <div
            className={cn(
              "card-face glass shadow-md",
              "bg-gradient-to-br from-violet-400 via-purple-400 to-fuchsia-400"
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
      </button>
    </div>
  );
}
