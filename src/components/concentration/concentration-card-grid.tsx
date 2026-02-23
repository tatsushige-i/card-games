"use client";

import type { ConcentrationCard } from "@/types/concentration";
import { ConcentrationCard as ConcentrationCardComponent } from "./concentration-card";

type ConcentrationCardGridProps = {
  cards: ConcentrationCard[];
  onFlip: (cardId: number) => void;
  disabled: boolean;
};

/** 4x4レスポンシブカードグリッド */
export function ConcentrationCardGrid({ cards, onFlip, disabled }: ConcentrationCardGridProps) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 w-full max-w-md mx-auto">
      {cards.map((card) => (
        <ConcentrationCardComponent
          key={card.id}
          card={card}
          onFlip={onFlip}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
