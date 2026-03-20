"use client";

import { WarCardComponent } from "./war-card";
import type { WarCard, WarPhase } from "@/types/war";

type WarBattleFieldProps = {
  playerCard: WarCard | null;
  cpuCard: WarCard | null;
  playerDeckCount: number;
  cpuDeckCount: number;
  warPileCount: number;
  phase: WarPhase;
};

/** 山札の視覚表現（枚数に応じた積み重ね風） */
function DeckPile({ count, label }: { count: number; label: string }) {
  if (count === 0) {
    return (
      <div className="w-20 h-28 sm:w-24 sm:h-34 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
        <span className="text-xs text-gray-400">0枚</span>
      </div>
    );
  }

  return (
    <div className="relative w-20 h-28 sm:w-24 sm:h-34">
      {/* 積み重ね効果（最大3層） */}
      {count >= 3 && (
        <div className="absolute inset-0 translate-x-1 translate-y-1 rounded-xl bg-gradient-to-br from-emerald-500/60 via-teal-500/60 to-cyan-500/60 shadow-sm" />
      )}
      {count >= 2 && (
        <div className="absolute inset-0 translate-x-0.5 translate-y-0.5 rounded-xl bg-gradient-to-br from-emerald-500/80 via-teal-500/80 to-cyan-500/80 shadow-sm" />
      )}
      <div className="relative w-full h-full rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 shadow-md flex items-center justify-center">
        <div className="text-center">
          <span className="text-lg font-bold text-white drop-shadow-md select-none">
            {count}
          </span>
          <p className="text-[10px] text-white/90 drop-shadow-sm select-none">{label}</p>
        </div>
      </div>
    </div>
  );
}

/** 対決エリア（プレイヤーとCPUのカード表示） */
export function WarBattleField({
  playerCard,
  cpuCard,
  playerDeckCount,
  cpuDeckCount,
  warPileCount,
  phase,
}: WarBattleFieldProps) {
  const showCards =
    phase === "battle" ||
    phase === "result" ||
    phase === "war" ||
    phase === "warReveal";

  return (
    <div className="flex flex-col items-center gap-4">
      {/* CPU側: 山札 + ラベル */}
      <div className="flex flex-col items-center gap-1.5">
        <p className="text-sm font-medium text-gray-500">🤖 CPU</p>
        <DeckPile count={cpuDeckCount} label="枚" />
      </div>

      {/* 中央: 対決エリア */}
      <div className="glass rounded-2xl p-4 sm:p-6 shadow-md w-full max-w-xs">
        <div className="flex justify-center items-center gap-6">
          {/* CPUが出したカード */}
          <div className="flex flex-col items-center gap-1">
            {showCards && cpuCard ? (
              <WarCardComponent card={cpuCard} />
            ) : showCards && !cpuCard && phase === "war" ? (
              <WarCardComponent card={null} faceDown />
            ) : (
              <div className="w-20 h-28 sm:w-24 sm:h-34 rounded-xl border-2 border-dashed border-gray-200" />
            )}
            <span className="text-xs text-gray-400">CPU</span>
          </div>

          {/* VS表示 / 戦争表示 */}
          <div className="flex flex-col items-center">
            {warPileCount > 0 ? (
              <>
                <span className="text-xl font-black text-red-500 animate-pulse">
                  ⚔️
                </span>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {warPileCount}枚
                </p>
              </>
            ) : (
              <span className="text-lg font-bold text-gray-300">VS</span>
            )}
          </div>

          {/* プレイヤーが出したカード */}
          <div className="flex flex-col items-center gap-1">
            {showCards && playerCard ? (
              <WarCardComponent card={playerCard} />
            ) : showCards && !playerCard && phase === "war" ? (
              <WarCardComponent card={null} faceDown />
            ) : (
              <div className="w-20 h-28 sm:w-24 sm:h-34 rounded-xl border-2 border-dashed border-gray-200" />
            )}
            <span className="text-xs text-gray-400">あなた</span>
          </div>
        </div>
      </div>

      {/* プレイヤー側: ラベル + 山札 */}
      <div className="flex flex-col items-center gap-1.5">
        <DeckPile count={playerDeckCount} label="枚" />
        <p className="text-sm font-medium text-gray-500">🃏 あなた</p>
      </div>
    </div>
  );
}
