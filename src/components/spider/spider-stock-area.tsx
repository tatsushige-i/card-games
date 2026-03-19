"use client";

import { cn } from "@/lib/utils";
import type { SpiderPhase, SpiderCard } from "@/types/spider";
import { canDealRow, COLUMN_COUNT } from "@/lib/spider-cards";

type SpiderStockAreaProps = {
  stock: SpiderCard[];
  columns: SpiderCard[][];
  phase: SpiderPhase;
  onDeal: () => void;
};

/** 山札エリア */
export function SpiderStockArea({
  stock,
  columns,
  phase,
  onDeal,
}: SpiderStockAreaProps) {
  const canDeal = phase === "playing" && canDealRow(columns, stock);
  // 山札の残りセット数（列数分ずつ配布）
  const remainingSets = Math.floor(stock.length / COLUMN_COUNT);

  return (
    <div className="flex justify-center select-none">
      <div className="flex flex-col items-center gap-1">
        {stock.length > 0 ? (
          <button
            type="button"
            className={cn(
              "card-container w-14 h-20 sm:w-16 sm:h-22 select-none",
              canDeal ? "cursor-pointer" : "cursor-not-allowed opacity-50"
            )}
            onClick={canDeal ? onDeal : undefined}
            disabled={!canDeal}
            aria-label={`山札（残り${remainingSets}回配布可能）`}
          >
            <div className="card-inner w-full h-full">
              <div
                className={cn(
                  "card-face glass shadow-md",
                  "bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400",
                  canDeal && "hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                )}
              >
                <span className="text-lg text-white/90 select-none font-bold">
                  {remainingSets}
                </span>
              </div>
            </div>
          </button>
        ) : (
          <div className="w-14 h-20 sm:w-16 sm:h-22 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center">
            <span className="text-xs text-gray-300">空</span>
          </div>
        )}
        <p className="text-xs text-gray-400">山札</p>
      </div>
    </div>
  );
}
