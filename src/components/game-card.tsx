"use client";

import type { Card } from "@/types/game";
import { cn } from "@/lib/utils";

type GameCardProps = {
  card: Card;
  onFlip: (cardId: number) => void;
  disabled: boolean;
};

/** 3Dフリップアニメーション付きカードコンポーネント */
export function GameCard({ card, onFlip, disabled }: GameCardProps) {
  const isRevealed = card.status === "flipped" || card.status === "matched";
  const isClickable = card.status === "hidden" && !disabled;

  return (
    <div className="card-container aspect-square w-full">
      <button
        type="button"
        onClick={() => isClickable && onFlip(card.id)}
        disabled={!isClickable}
        aria-label={
          isRevealed
            ? `カード: ${card.emoji}`
            : "裏向きのカード"
        }
        aria-pressed={isRevealed}
        className={cn(
          "card-inner w-full h-full cursor-pointer",
          isRevealed && "flipped",
          card.status === "matched" && "matched",
          !isClickable && "cursor-default"
        )}
      >
        {/* 裏面（カード裏） */}
        <div
          className={cn(
            "card-face glass shadow-md",
            isClickable && "card-hover",
            "bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400"
          )}
        >
          <span className="text-2xl sm:text-3xl text-white/90 select-none">?</span>
        </div>

        {/* 表面（絵文字） */}
        <div
          className={cn(
            "card-face card-back glass shadow-md",
            card.status === "matched" && "ring-2 ring-emerald-400/60"
          )}
        >
          <span className="text-3xl sm:text-4xl select-none">{card.emoji}</span>
        </div>
      </button>
    </div>
  );
}
