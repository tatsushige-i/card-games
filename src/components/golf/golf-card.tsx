"use client";

import { cn } from "@/lib/utils";
import { SUIT_SYMBOLS, SUIT_COLORS } from "@/lib/golf-cards";
import type { PlayingCard } from "@/types/golf";

type GolfCardProps = {
  card: PlayingCard;
  /** クリック可能か */
  clickable?: boolean;
  /** ハイライト表示（±1で除去可能） */
  highlighted?: boolean;
  /** コンパクト表示（列の重なり部分用） */
  compact?: boolean;
  /** クリック時のコールバック */
  onClick?: () => void;
};

/** ゴルフソリティアのトランプカード表示コンポーネント */
export function GolfCard({
  card,
  clickable = false,
  highlighted = false,
  compact = false,
  onClick,
}: GolfCardProps) {
  const suitColor = SUIT_COLORS[card.suit];
  const suitSymbol = SUIT_SYMBOLS[card.suit];
  const textColor = suitColor === "red" ? "text-red-600" : "text-gray-800";

  // コンパクト表示：ランクとスートを横並びで小さく表示
  if (compact) {
    return (
      <div
        className="w-14 h-6 sm:w-16 sm:h-7 rounded-t-xl bg-white border border-b-0 border-gray-200 shadow-sm flex items-center justify-center gap-0.5"
      >
        <span className={cn("text-sm sm:text-base font-bold select-none leading-none", textColor)}>
          {card.rank}
        </span>
        <span className={cn("text-xs sm:text-sm select-none leading-none", textColor)}>
          {suitSymbol}
        </span>
      </div>
    );
  }

  /** カードの表面コンテンツ */
  const cardContent = (
    <div className="flex flex-col items-center justify-center gap-0">
      <span
        className={cn(
          "text-xl sm:text-2xl font-bold select-none leading-tight",
          textColor
        )}
      >
        {card.rank}
      </span>
      <span
        className={cn(
          "text-base sm:text-lg select-none leading-tight",
          textColor
        )}
      >
        {suitSymbol}
      </span>
    </div>
  );

  // 不透明な白背景を使用（重なり時の透け防止）
  const cardBg = "bg-white border border-gray-200";

  return (
    <div className="card-container w-14 h-20 sm:w-16 sm:h-22">
      <div className="card-inner w-full h-full flipped">
        {/* 裏面（常にflippedのため非表示） */}
        <div
          className={cn(
            "card-face shadow-md",
            "bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400"
          )}
        >
          <span className="text-lg text-white/90 select-none">?</span>
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
