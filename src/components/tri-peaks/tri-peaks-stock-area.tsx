"use client";

import { cn } from "@/lib/utils";
import { TriPeaksCard } from "./tri-peaks-card";
import type { PlayingCard, TriPeaksPhase } from "@/types/tri-peaks";

type TriPeaksStockAreaProps = {
  stock: PlayingCard[];
  waste: PlayingCard[];
  phase: TriPeaksPhase;
  onDraw: () => void;
};

/** 山札・捨て札エリア */
export function TriPeaksStockArea({
  stock,
  waste,
  phase,
  onDraw,
}: TriPeaksStockAreaProps) {
  const wasteTop = waste.length > 0 ? waste[waste.length - 1] : null;
  const canDraw = phase === "playing" && stock.length > 0;

  return (
    <div className="flex justify-center gap-6 sm:gap-8 select-none">
      {/* 山札 */}
      <div className="flex flex-col items-center gap-1">
        {stock.length > 0 ? (
          <button
            type="button"
            className={cn(
              "card-container w-10 h-14 sm:w-12 sm:h-16 select-none",
              canDraw ? "cursor-pointer" : "cursor-not-allowed opacity-50"
            )}
            onClick={canDraw ? onDraw : undefined}
            disabled={!canDraw}
            aria-label={`山札（残り${stock.length}枚）`}
          >
            <div className="card-inner w-full h-full">
              <div
                className={cn(
                  "card-face glass shadow-md",
                  "bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400",
                  "hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                )}
              >
                <span className="text-sm text-white/90 select-none font-bold">
                  {stock.length}
                </span>
              </div>
            </div>
          </button>
        ) : (
          <div className="w-10 h-14 sm:w-12 sm:h-16 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center">
            <span className="text-xs text-gray-300">空</span>
          </div>
        )}
        <p className="text-xs text-gray-400">山札</p>
      </div>

      {/* 捨て札 */}
      <div className="flex flex-col items-center gap-1">
        {wasteTop ? (
          <TriPeaksCard card={wasteTop} />
        ) : (
          <div className="w-10 h-14 sm:w-12 sm:h-16 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center">
            <span className="text-xs text-gray-300">空</span>
          </div>
        )}
        <p className="text-xs text-gray-400">捨て札</p>
      </div>
    </div>
  );
}
