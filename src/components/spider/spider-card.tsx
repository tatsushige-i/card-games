"use client";

import { cn } from "@/lib/utils";
import type { SpiderCard } from "@/types/spider";

type SpiderCardComponentProps = {
  card: SpiderCard;
  /** カードが選択中か */
  selected?: boolean;
  /** クリック可能か */
  clickable?: boolean;
  /** コンパクト表示（列の重なり部分用） */
  compact?: boolean;
  /** クリック時のコールバック */
  onClick?: () => void;
};

/** スパイダーソリティアのトランプカード表示コンポーネント */
export function SpiderCardComponent({
  card,
  selected = false,
  clickable = false,
  compact = false,
  onClick,
}: SpiderCardComponentProps) {
  // 裏向きカード
  if (!card.faceUp) {
    if (compact) {
      return (
        <div className="w-14 h-4 sm:w-16 sm:h-5 rounded-t-lg bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 border border-b-0 border-emerald-500/30 shadow-sm" />
      );
    }
    return (
      <div className="card-container w-14 h-20 sm:w-16 sm:h-22">
        <div className="card-inner w-full h-full flipped">
          <div
            className={cn(
              "card-face shadow-md",
              "bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400"
            )}
          >
            <span className="text-lg text-white/90 select-none">?</span>
          </div>
          <div
            role="img"
            aria-label="裏向きのカード"
            className="card-face card-back shadow-md bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400"
          >
            <span className="text-lg text-white/90 select-none">?</span>
          </div>
        </div>
      </div>
    );
  }

  const textColor = "text-gray-800";
  const cardBg = "bg-white border border-gray-200";

  // コンパクト表示（裏向きより少し高く）
  if (compact) {
    const content = (
      <div className="flex items-center justify-center gap-0.5">
        <span className={cn("text-sm sm:text-base font-bold select-none leading-none", textColor)}>
          {card.rank}
        </span>
        <span className={cn("text-xs sm:text-sm select-none leading-none", textColor)}>
          ♠
        </span>
      </div>
    );

    if (clickable) {
      return (
        <button
          type="button"
          className={cn(
            "w-14 h-6 sm:w-16 sm:h-7 rounded-t-xl border border-b-0 border-gray-200 shadow-sm bg-white",
            "cursor-pointer hover:bg-blue-50 transition-colors duration-150",
            selected && "ring-2 ring-blue-500 ring-offset-1 bg-blue-50"
          )}
          onClick={onClick}
          aria-label={`♠${card.rank}`}
        >
          {content}
        </button>
      );
    }

    return (
      <div
        className={cn(
          "w-14 h-6 sm:w-16 sm:h-7 rounded-t-xl border border-b-0 border-gray-200 shadow-sm bg-white",
          selected && "ring-2 ring-blue-500 ring-offset-1 bg-blue-50"
        )}
      >
        {content}
      </div>
    );
  }

  // フルサイズ表示
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
        ♠
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
              selected && "ring-2 ring-blue-500 ring-offset-1"
            )}
            onClick={onClick}
            aria-label={`♠${card.rank}`}
          >
            {cardContent}
          </button>
        ) : (
          <div
            role="img"
            aria-label={`♠${card.rank}`}
            className={cn(
              "card-face card-back shadow-lg transition-all duration-200",
              cardBg,
              selected && "ring-2 ring-blue-500 ring-offset-1"
            )}
          >
            {cardContent}
          </div>
        )}
      </div>
    </div>
  );
}
