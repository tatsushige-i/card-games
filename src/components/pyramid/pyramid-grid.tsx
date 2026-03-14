"use client";

import { PyramidCardComponent } from "./pyramid-card";
import { isExposed, PYRAMID_ROWS } from "@/lib/pyramid-cards";
import type { PyramidCard } from "@/types/pyramid";

type PyramidGridProps = {
  pyramid: PyramidCard[];
  selectedCardId: number | null;
  invalidPair: number[] | null;
  onSelectCard: (cardId: number) => void;
};

/** 7段ピラミッドレイアウト */
export function PyramidGrid({
  pyramid,
  selectedCardId,
  invalidPair,
  onSelectCard,
}: PyramidGridProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      {Array.from({ length: PYRAMID_ROWS }, (_, row) => {
        const rowCards = pyramid.filter((c) => c.row === row);
        return (
          <div
            key={row}
            className="flex justify-center"
            style={{
              gap: "0.25rem",
            }}
          >
            {rowCards.map((card) => {
              if (card.removed) {
                // 除去済みカードはスペースを確保
                return (
                  <div
                    key={card.id}
                    className="w-14 h-20 sm:w-16 sm:h-22"
                  />
                );
              }

              const exposed = isExposed(card, pyramid);
              const selected = selectedCardId === card.id;
              const invalid = invalidPair?.includes(card.id) ?? false;

              return (
                <PyramidCardComponent
                  key={card.id}
                  card={card}
                  selected={selected}
                  exposed={exposed}
                  invalid={invalid}
                  onClick={exposed ? () => onSelectCard(card.id) : undefined}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
