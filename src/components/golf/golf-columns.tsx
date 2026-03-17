"use client";

import { GolfCard } from "./golf-card";
import { isAdjacentValue } from "@/lib/golf-cards";
import type { PlayingCard } from "@/types/golf";

type GolfColumnsProps = {
  columns: PlayingCard[][];
  wasteTop: PlayingCard | null;
  onRemoveCard: (columnIndex: number) => void;
};

/** 7列のカード配置 */
export function GolfColumns({
  columns,
  wasteTop,
  onRemoveCard,
}: GolfColumnsProps) {
  return (
    <div className="flex justify-center gap-1.5 sm:gap-2 overflow-x-auto max-w-full px-1">
      {columns.map((column, colIndex) => (
        <div key={colIndex} className="flex flex-col items-center">
          {column.length === 0 ? (
            // 空列のスペース確保
            <div className="w-14 h-20 sm:w-16 sm:h-22 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center">
              <span className="text-xs text-gray-300">空</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {/* 上部カード：コンパクトな短冊表示 */}
              {column.slice(0, -1).map((card) => (
                <GolfCard key={card.id} card={card} compact />
              ))}
              {/* 末尾カード：フルサイズ表示 */}
              {(() => {
                const bottomCard = column[column.length - 1];
                const canRemove =
                  wasteTop !== null &&
                  isAdjacentValue(bottomCard.value, wasteTop.value);
                return (
                  <GolfCard
                    card={bottomCard}
                    clickable={canRemove}
                    highlighted={canRemove}
                    onClick={canRemove ? () => onRemoveCard(colIndex) : undefined}
                  />
                );
              })()}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
