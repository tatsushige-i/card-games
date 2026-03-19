"use client";

import { SpiderCardComponent } from "./spider-card";
import { isValidSequence } from "@/lib/spider-cards";
import type { SpiderCard } from "@/types/spider";

type SpiderColumnsProps = {
  columns: SpiderCard[][];
  selectedColumn: number | null;
  selectedCardIndex: number | null;
  onCardClick: (columnIndex: number, cardIndex: number) => void;
  onEmptyColumnClick: (columnIndex: number) => void;
};

/** 10列のカード配置 */
export function SpiderColumns({
  columns,
  selectedColumn,
  selectedCardIndex,
  onCardClick,
  onEmptyColumnClick,
}: SpiderColumnsProps) {
  return (
    <div className="flex justify-center gap-1 sm:gap-1.5 overflow-x-auto max-w-full px-1">
      {columns.map((column, colIndex) => (
        <div key={colIndex} className="flex flex-col items-center">
          {column.length === 0 ? (
            <button
              type="button"
              className="w-14 h-20 sm:w-16 sm:h-22 rounded-2xl border-2 border-dashed border-gray-400 bg-white/30 flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-all duration-200"
              onClick={() => onEmptyColumnClick(colIndex)}
              aria-label={`空の列${colIndex + 1}`}
            >
              <span className="text-2xl text-gray-300 select-none">♠</span>
            </button>
          ) : (
            <div className="flex flex-col items-center">
              {column.map((card, cardIndex) => {
                const isLast = cardIndex === column.length - 1;
                const isSelected =
                  selectedColumn === colIndex &&
                  selectedCardIndex !== null &&
                  cardIndex >= selectedCardIndex;
                const isClickable =
                  card.faceUp && isValidSequence(column, cardIndex);

                return (
                  <SpiderCardComponent
                    key={card.id}
                    card={card}
                    selected={isSelected}
                    clickable={isClickable}
                    compact={!isLast}
                    onClick={
                      isClickable
                        ? () => onCardClick(colIndex, cardIndex)
                        : undefined
                    }
                  />
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
