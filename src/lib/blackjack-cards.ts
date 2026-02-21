import type { PlayingCard, Suit, Rank } from "@/types/blackjack";

/** スート一覧 */
const SUITS: Suit[] = ["spade", "heart", "diamond", "club"];

/** ランク一覧 */
const RANKS: Rank[] = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];

/** ブラックジャックの各ランクに対応する値 */
const RANK_VALUES: Record<Rank, number> = {
  A: 11,
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "10": 10,
  J: 10,
  Q: 10,
  K: 10,
};

/** スートの表示記号 */
export const SUIT_SYMBOLS: Record<Suit, string> = {
  spade: "♠",
  heart: "♥",
  diamond: "♦",
  club: "♣",
};

/** スートの色（赤 or 黒） */
export const SUIT_COLORS: Record<Suit, "red" | "black"> = {
  spade: "black",
  heart: "red",
  diamond: "red",
  club: "black",
};

/** ブラックジャックの目標値 */
export const BLACKJACK = 21;

/** ディーラーがスタンドする閾値 */
export const DEALER_STAND = 17;

/**
 * Fisher-Yatesアルゴリズムで配列をシャッフルする（元の配列は変更しない）
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 52枚のトランプデッキを生成してシャッフルする
 */
export function createDeck(): PlayingCard[] {
  const cards: PlayingCard[] = [];
  let id = 0;
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push({
        id: id++,
        suit,
        rank,
        value: RANK_VALUES[rank],
      });
    }
  }
  return shuffle(cards);
}

/**
 * 手札の合計値を計算する（Aは11→1に自動調整）
 */
export function calculateHandTotal(hand: PlayingCard[]): number {
  let total = hand.reduce((sum, card) => sum + card.value, 0);
  let aces = hand.filter((card) => card.rank === "A").length;

  // 合計が21を超えている間、Aを11→1に変換する
  while (total > BLACKJACK && aces > 0) {
    total -= 10;
    aces--;
  }

  return total;
}

/**
 * 手札がバーストしているか判定する
 */
export function isBust(hand: PlayingCard[]): boolean {
  return calculateHandTotal(hand) > BLACKJACK;
}

/**
 * ナチュラルブラックジャック（初期2枚で21）か判定する
 */
export function isNaturalBlackjack(hand: PlayingCard[]): boolean {
  return hand.length === 2 && calculateHandTotal(hand) === BLACKJACK;
}

/**
 * カードのラベルを取得する（アクセシビリティ用）
 */
export function getCardLabel(card: PlayingCard): string {
  return `${SUIT_SYMBOLS[card.suit]}${card.rank}`;
}
