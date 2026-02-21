"use client";

import { BlackjackCard } from "./blackjack-card";
import {
  calculateHandTotal,
  isBust,
  isNaturalBlackjack,
  BLACKJACK,
} from "@/lib/blackjack-cards";
import { cn } from "@/lib/utils";
import type { PlayingCard } from "@/types/blackjack";

type BlackjackHandProps = {
  /** 手札のラベル（例: "プレイヤー", "ディーラー"） */
  label: string;
  /** 手札のカード */
  cards: PlayingCard[];
  /** 2枚目を裏向きにするか（ディーラーのホールカード用） */
  hideSecond?: boolean;
};

/** 手札表示コンポーネント */
export function BlackjackHand({
  label,
  cards,
  hideSecond = false,
}: BlackjackHandProps) {
  // 合計値の計算（2枚目が隠れている場合は1枚目のみ）
  const visibleCards = hideSecond ? cards.slice(0, 1) : cards;
  const total = visibleCards.length > 0 ? calculateHandTotal(visibleCards) : 0;
  const bust = !hideSecond && cards.length > 0 && isBust(cards);
  const naturalBJ =
    !hideSecond && cards.length > 0 && isNaturalBlackjack(cards);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-gray-600">{label}</span>
        {cards.length > 0 && (
          <span
            className={cn(
              "text-sm font-bold",
              bust
                ? "text-red-500"
                : total === BLACKJACK
                  ? "text-amber-500"
                  : "text-gray-800"
            )}
          >
            ({hideSecond ? `${total}+?` : total})
          </span>
        )}
      </div>

      {/* バースト表示 */}
      {bust && (
        <span className="text-xl font-black tracking-widest text-red-500 animate-bounce">
          BUST!
        </span>
      )}

      {/* ナチュラルブラックジャック表示 */}
      {naturalBJ && (
        <span className="text-xl font-black tracking-widest bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent animate-pulse">
          BLACKJACK!
        </span>
      )}

      <div className="flex gap-1.5 sm:gap-2">
        {cards.map((card, index) => (
          <BlackjackCard
            key={card.id}
            card={card}
            faceDown={hideSecond && index === 1}
          />
        ))}
      </div>
    </div>
  );
}
