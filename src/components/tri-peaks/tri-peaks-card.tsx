"use client";

import { cn } from "@/lib/utils";
import { SUIT_SYMBOLS, SUIT_COLORS } from "@/lib/tri-peaks-cards";
import type { PlayingCard } from "@/types/tri-peaks";

type TriPeaksCardProps = {
  card: PlayingCard;
  /** 表向きか */
  faceUp?: boolean;
  /** クリック可能か */
  clickable?: boolean;
  /** ハイライト表示（±1で除去可能） */
  highlighted?: boolean;
  /** クリック時のコールバック */
  onClick?: () => void;
};

/** トライピークスのトランプカード表示コンポーネント */
export function TriPeaksCard({
  card,
  faceUp = true,
  clickable = false,
  highlighted = false,
  onClick,
}: TriPeaksCardProps) {
  const suitColor = SUIT_COLORS[card.suit];
  const suitSymbol = SUIT_SYMBOLS[card.suit];
  const textColor = suitColor === "red" ? "text-red-600" : "text-gray-800";

  // 裏向きカード
  if (!faceUp) {
    return (
      <div className="card-container w-10 h-14 sm:w-12 sm:h-16">
        <div className="card-inner w-full h-full">
          <div
            className={cn(
              "card-face glass shadow-md",
              "bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400"
            )}
          >
            <span className="text-sm text-white/90 select-none">?</span>
          </div>
        </div>
      </div>
    );
  }

  /** カードの表面コンテンツ */
  const cardContent = (
    <div className="flex flex-col items-center justify-center gap-0">
      <span
        className={cn(
          "text-base sm:text-lg font-bold select-none leading-tight",
          textColor
        )}
      >
        {card.rank}
      </span>
      <span
        className={cn(
          "text-xs sm:text-sm select-none leading-tight",
          textColor
        )}
      >
        {suitSymbol}
      </span>
    </div>
  );

  const cardBg = "bg-white border border-gray-200";

  return (
    <div className="card-container w-10 h-14 sm:w-12 sm:h-16">
      <div className="card-inner w-full h-full flipped">
        {/* 裏面（常にflippedのため非表示） */}
        <div
          className={cn(
            "card-face shadow-md",
            "bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400"
          )}
        >
          <span className="text-sm text-white/90 select-none">?</span>
        </div>

        {/* 表面 */}
        {clickable ? (
          <button
            type="button"
            className={cn(
              "card-face card-back shadow-lg transition-all duration-200",
              cardBg,
              "cursor-pointer hover:shadow-xl hover:-translate-y-0.5",
              highlighted && "ring-2 ring-emerald-500 ring-offset-1"
            )}
            onClick={onClick}
            aria-label={`${SUIT_SYMBOLS[card.suit]}${card.rank}`}
          >
            {cardContent}
          </button>
        ) : (
          <div
            role="img"
            aria-label={`${SUIT_SYMBOLS[card.suit]}${card.rank}`}
            className={cn(
              "card-face card-back shadow-lg transition-all duration-200",
              cardBg
            )}
          >
            {cardContent}
          </div>
        )}
      </div>
    </div>
  );
}
