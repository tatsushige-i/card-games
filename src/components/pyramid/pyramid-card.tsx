"use client";

import { cn } from "@/lib/utils";
import { SUIT_SYMBOLS, SUIT_COLORS } from "@/lib/pyramid-cards";
import type { PlayingCard, PyramidCard } from "@/types/pyramid";

type PyramidCardComponentProps = {
  card: PlayingCard | PyramidCard;
  /** カードが選択中か */
  selected?: boolean;
  /** カードが露出しているか */
  exposed?: boolean;
  /** 不正ペアのshakeアニメーション中か */
  invalid?: boolean;
  /** クリック時のコールバック */
  onClick?: () => void;
};

/** ピラミッドのトランプカード表示コンポーネント */
export function PyramidCardComponent({
  card,
  selected = false,
  exposed = true,
  invalid = false,
  onClick,
}: PyramidCardComponentProps) {
  const suitColor = SUIT_COLORS[card.suit];
  const suitSymbol = SUIT_SYMBOLS[card.suit];
  const isClickable = exposed && onClick;

  /** カードの表面コンテンツ */
  const cardContent = (
    <div className="flex flex-col items-center justify-center gap-0">
      <span
        className={cn(
          "text-xl sm:text-2xl font-bold select-none leading-tight",
          suitColor === "red" ? "text-red-600" : "text-gray-800"
        )}
      >
        {card.rank}
      </span>
      <span
        className={cn(
          "text-base sm:text-lg select-none leading-tight",
          suitColor === "red" ? "text-red-600" : "text-gray-800"
        )}
      >
        {suitSymbol}
      </span>
    </div>
  );

  return (
    <div
      className={cn(
        "card-container w-14 h-20 sm:w-16 sm:h-22",
        invalid && "animate-shake"
      )}
    >
      <div className="card-inner w-full h-full flipped">
        {/* 裏面（常にflippedのため非表示） */}
        <div
          className={cn(
            "card-face glass shadow-md",
            "bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400"
          )}
        >
          <span className="text-lg text-white/90 select-none">?</span>
        </div>

        {/* 表面 */}
        {isClickable ? (
        <button
          type="button"
          className={cn(
            "card-face card-back glass shadow-lg transition-all duration-200",
            "cursor-pointer hover:shadow-xl hover:-translate-y-0.5",
            selected && "ring-2 ring-blue-500 ring-offset-1",
            invalid && "ring-2 ring-red-500 ring-offset-1"
          )}
          onClick={onClick}
          aria-label={`${SUIT_SYMBOLS[card.suit]}${card.rank}`}
        >
          {cardContent}
        </button>
        ) : (
        <div
          className={cn(
            "card-face card-back glass shadow-lg transition-all duration-200",
            selected && "ring-2 ring-blue-500 ring-offset-1",
            invalid && "ring-2 ring-red-500 ring-offset-1",
            !exposed && "opacity-60"
          )}
        >
          {cardContent}
        </div>
        )}
      </div>
    </div>
  );
}
