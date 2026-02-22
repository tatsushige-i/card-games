"use client";

import { PokerCard } from "./poker-card";
import type { PlayingCard } from "@/types/poker";

type PokerHandProps = {
  /** 手札（5枚） */
  cards: PlayingCard[];
  /** 各カードのホールド状態 */
  held: boolean[];
  /** カードクリック時のコールバック */
  onToggleHold?: (index: number) => void;
  /** カードがクリック可能かどうか */
  clickable?: boolean;
  /** カードが裏向きかどうか */
  faceDown?: boolean;
};

/** 手札5枚表示コンポーネント */
export function PokerHand({
  cards,
  held,
  onToggleHold,
  clickable = false,
  faceDown = false,
}: PokerHandProps) {
  return (
    <div className="flex gap-1 sm:gap-2 justify-center">
      {cards.map((card, index) => (
        <PokerCard
          key={card.id}
          card={card}
          faceDown={faceDown}
          held={held[index]}
          onClick={() => onToggleHold?.(index)}
          clickable={clickable}
        />
      ))}
    </div>
  );
}
