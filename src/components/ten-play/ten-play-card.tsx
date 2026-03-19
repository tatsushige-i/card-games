"use client";

import { cn } from "@/lib/utils";
import { SUIT_SYMBOLS, SUIT_COLORS } from "@/lib/ten-play-cards";
import type { PlayingCard } from "@/types/ten-play";

type TenPlayCardProps = {
  card: PlayingCard;
  /** 選択中 */
  selected?: boolean;
  /** 不正ペア表示 */
  invalid?: boolean;
  /** クリック時のコールバック */
  onClick?: () => void;
};

/** テンプレイのトランプカード表示コンポーネント */
export function TenPlayCard({
  card,
  selected = false,
  invalid = false,
  onClick,
}: TenPlayCardProps) {
  const suitColor = SUIT_COLORS[card.suit];
  const suitSymbol = SUIT_SYMBOLS[card.suit];
  const textColor = suitColor === "red" ? "text-red-600" : "text-gray-800";

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

  return (
    <div className="card-container w-14 h-20 sm:w-16 sm:h-22">
      <div className="card-inner w-full h-full flipped">
        {/* 裏面（常にflippedのため非表示） */}
        <div
          className={cn(
            "card-face shadow-md",
            "bg-gradient-to-br from-amber-400 via-orange-400 to-red-400"
          )}
        >
          <span className="text-lg text-white/90 select-none">?</span>
        </div>

        {/* 表面 */}
        <button
          type="button"
          className={cn(
            "card-face card-back shadow-lg transition-all duration-200",
            "bg-white border border-gray-200",
            "cursor-pointer hover:shadow-xl hover:-translate-y-0.5",
            selected && "ring-2 ring-blue-500 ring-offset-1",
            invalid && "ring-2 ring-red-500 ring-offset-1 animate-shake"
          )}
          onClick={onClick}
          aria-label={`${SUIT_SYMBOLS[card.suit]}${card.rank}`}
        >
          {cardContent}
        </button>
      </div>
    </div>
  );
}

/** 空スロットの表示コンポーネント */
export function TenPlayEmptySlot() {
  return (
    <div className="w-14 h-20 sm:w-16 sm:h-22 rounded-2xl border-2 border-dashed border-gray-200" />
  );
}
