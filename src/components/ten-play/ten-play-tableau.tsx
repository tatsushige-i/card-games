"use client";

import { TenPlayCard, TenPlayEmptySlot } from "./ten-play-card";
import type { PlayingCard } from "@/types/ten-play";

type TenPlayTableauProps = {
  tableau: (PlayingCard | null)[];
  selectedIndices: number[];
  invalidPair: number[] | null;
  onSelectCard: (index: number) => void;
};

/** 13スロットのタブロー配置（7+6の2段構成） */
export function TenPlayTableau({
  tableau,
  selectedIndices,
  invalidPair,
  onSelectCard,
}: TenPlayTableauProps) {
  // 上段: 0〜6（7枚）、下段: 7〜12（6枚）
  const topRow = tableau.slice(0, 7);
  const bottomRow = tableau.slice(7, 13);

  return (
    <div className="flex flex-col items-center gap-2 sm:gap-3">
      {/* 上段: 7枚 */}
      <div className="flex justify-center gap-1.5 sm:gap-2">
        {topRow.map((card, i) => (
          <div key={i}>
            {card ? (
              <TenPlayCard
                card={card}
                selected={selectedIndices.includes(i)}
                invalid={invalidPair?.includes(i) ?? false}
                onClick={() => onSelectCard(i)}
              />
            ) : (
              <TenPlayEmptySlot />
            )}
          </div>
        ))}
      </div>

      {/* 下段: 6枚（センタリング） */}
      <div className="flex justify-center gap-1.5 sm:gap-2">
        {bottomRow.map((card, j) => {
          const index = j + 7;
          return (
            <div key={index}>
              {card ? (
                <TenPlayCard
                  card={card}
                  selected={selectedIndices.includes(index)}
                  invalid={invalidPair?.includes(index) ?? false}
                  onClick={() => onSelectCard(index)}
                />
              ) : (
                <TenPlayEmptySlot />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
