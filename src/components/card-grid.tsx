"use client";

import type { Card } from "@/types/game";
import { GameCard } from "./game-card";

type CardGridProps = {
  cards: Card[];
  onFlip: (cardId: number) => void;
  disabled: boolean;
};

/** 4x4レスポンシブカードグリッド */
export function CardGrid({ cards, onFlip, disabled }: CardGridProps) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 w-full max-w-md mx-auto">
      {cards.map((card) => (
        <GameCard
          key={card.id}
          card={card}
          onFlip={onFlip}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
