"use client";

import { cn } from "@/lib/utils";
import { PyramidCardComponent } from "./pyramid-card";
import { MAX_RECYCLES } from "@/lib/pyramid-cards";
import type { PlayingCard } from "@/types/pyramid";

type PyramidStockAreaProps = {
  stock: PlayingCard[];
  waste: PlayingCard[];
  stockRecycles: number;
  selectedCardId: number | null;
  invalidPair: number[] | null;
  onDrawStock: () => void;
  onRecycleStock: () => void;
  onSelectWaste: (cardId: number) => void;
};

/** 山札・捨て札エリア */
export function PyramidStockArea({
  stock,
  waste,
  stockRecycles,
  selectedCardId,
  invalidPair,
  onDrawStock,
  onRecycleStock,
  onSelectWaste,
}: PyramidStockAreaProps) {
  const wasteTop = waste.length > 0 ? waste[waste.length - 1] : null;
  const canRecycle = stock.length === 0 && waste.length > 0 && stockRecycles < MAX_RECYCLES;

  return (
    <div className="flex justify-center gap-6 sm:gap-8">
      {/* 山札 */}
      <div className="flex flex-col items-center gap-1">
        {stock.length > 0 ? (
          <div
            className="card-container w-14 h-20 sm:w-16 sm:h-22 cursor-pointer"
            onClick={onDrawStock}
          >
            <div
              className={cn(
                "card-inner w-full h-full"
              )}
              role="button"
              aria-label={`山札（残り${stock.length}枚）`}
            >
              <div
                className={cn(
                  "card-face glass shadow-md",
                  "bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400",
                  "hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                )}
              >
                <span className="text-lg text-white/90 select-none font-bold">
                  {stock.length}
                </span>
              </div>
            </div>
          </div>
        ) : canRecycle ? (
          <div
            className="w-14 h-20 sm:w-16 sm:h-22 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
            onClick={onRecycleStock}
            role="button"
            aria-label="山札をリサイクル"
          >
            <span className="text-xl text-gray-400">↻</span>
          </div>
        ) : (
          <div className="w-14 h-20 sm:w-16 sm:h-22 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center">
            <span className="text-xs text-gray-300">空</span>
          </div>
        )}
        <p className="text-xs text-gray-400">山札</p>
      </div>

      {/* 捨て札 */}
      <div className="flex flex-col items-center gap-1">
        {wasteTop ? (
          <PyramidCardComponent
            card={wasteTop}
            selected={selectedCardId === wasteTop.id}
            exposed={true}
            invalid={invalidPair?.includes(wasteTop.id) ?? false}
            onClick={() => onSelectWaste(wasteTop.id)}
          />
        ) : (
          <div className="w-14 h-20 sm:w-16 sm:h-22 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center">
            <span className="text-xs text-gray-300">空</span>
          </div>
        )}
        <p className="text-xs text-gray-400">捨て札</p>
      </div>
    </div>
  );
}
