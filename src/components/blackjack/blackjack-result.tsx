"use client";

import { isBust } from "@/lib/blackjack-cards";
import type { GameResult, PlayingCard } from "@/types/blackjack";

type BlackjackResultProps = {
  result: GameResult | null;
  /** プレイヤーの手札（バースト判定用） */
  playerHand: PlayingCard[];
  /** ディーラーの手札（バースト判定用） */
  dealerHand: PlayingCard[];
};

/** ゲーム結果の表示コンポーネント */
export function BlackjackResult({
  result,
  playerHand,
  dealerHand,
}: BlackjackResultProps) {
  if (!result) return null;

  const playerBust = isBust(playerHand);
  const dealerBust = isBust(dealerHand);

  return (
    <div className="text-center py-2">
      {result === "blackjack" && (
        <div className="flex flex-col items-center gap-1">
          <span className="text-3xl font-black bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
            BLACKJACK!
          </span>
          <span className="text-sm text-amber-600 font-medium">
            ナチュラルブラックジャックで勝利！
          </span>
        </div>
      )}
      {result === "win" && !dealerBust && (
        <span className="text-2xl font-bold text-emerald-600">
          勝ち！
        </span>
      )}
      {result === "win" && dealerBust && (
        <span className="text-2xl font-bold text-emerald-600">
          ディーラーバーストで勝ち！
        </span>
      )}
      {result === "lose" && playerBust && (
        <span className="text-2xl font-bold text-red-500">
          バーストで負け...
        </span>
      )}
      {result === "lose" && !playerBust && (
        <span className="text-2xl font-bold text-red-500">
          負け...
        </span>
      )}
      {result === "draw" && (
        <span className="text-2xl font-bold text-amber-500">
          引き分け
        </span>
      )}
    </div>
  );
}
