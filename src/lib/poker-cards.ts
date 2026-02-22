import type { PlayingCard, Suit, Rank, HandRank } from "@/types/poker";

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

/** ポーカーの各ランクに対応する数値（ストレート判定用） */
const RANK_VALUES: Record<Rank, number> = {
  A: 14,
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "10": 10,
  J: 11,
  Q: 12,
  K: 13,
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

/** 最大ラウンド数 */
export const MAX_ROUNDS = 10;

/** 役の配当テーブル */
export const HAND_PAYOUTS: Record<HandRank, number> = {
  royalFlush: 800,
  straightFlush: 50,
  fourOfAKind: 25,
  fullHouse: 9,
  flush: 6,
  straight: 4,
  threeOfAKind: 3,
  twoPair: 2,
  jacksOrBetter: 1,
  noHand: 0,
};

/** 役の日本語名 */
export const HAND_NAMES: Record<HandRank, string> = {
  royalFlush: "ロイヤルフラッシュ",
  straightFlush: "ストレートフラッシュ",
  fourOfAKind: "フォーカード",
  fullHouse: "フルハウス",
  flush: "フラッシュ",
  straight: "ストレート",
  threeOfAKind: "スリーカード",
  twoPair: "ツーペア",
  jacksOrBetter: "ジャックスオアベター",
  noHand: "ノーハンド",
};

/** 役の表示順（配当表用） */
export const HAND_RANK_ORDER: HandRank[] = [
  "royalFlush",
  "straightFlush",
  "fourOfAKind",
  "fullHouse",
  "flush",
  "straight",
  "threeOfAKind",
  "twoPair",
  "jacksOrBetter",
];

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
 * カードのラベルを取得する（アクセシビリティ用）
 */
export function getCardLabel(card: PlayingCard): string {
  return `${SUIT_SYMBOLS[card.suit]}${card.rank}`;
}

/**
 * 手札（5枚）のポーカー役を判定する
 */
export function evaluateHand(hand: PlayingCard[]): HandRank {
  if (hand.length !== 5) return "noHand";

  const values = hand.map((c) => c.value).sort((a, b) => a - b);
  const suits = hand.map((c) => c.suit);

  // フラッシュ判定（すべて同じスート）
  const isFlush = suits.every((s) => s === suits[0]);

  // ストレート判定
  const isStraight = checkStraight(values);

  // ランクごとのカウントマップ
  const countMap = new Map<number, number>();
  for (const v of values) {
    countMap.set(v, (countMap.get(v) ?? 0) + 1);
  }
  const counts = Array.from(countMap.values()).sort((a, b) => b - a);

  // ロイヤルフラッシュ: 10-J-Q-K-A のフラッシュ
  if (isFlush && isStraight && values[0] === 10 && values[4] === 14) {
    return "royalFlush";
  }

  // ストレートフラッシュ
  if (isFlush && isStraight) {
    return "straightFlush";
  }

  // フォーカード
  if (counts[0] === 4) {
    return "fourOfAKind";
  }

  // フルハウス
  if (counts[0] === 3 && counts[1] === 2) {
    return "fullHouse";
  }

  // フラッシュ
  if (isFlush) {
    return "flush";
  }

  // ストレート
  if (isStraight) {
    return "straight";
  }

  // スリーカード
  if (counts[0] === 3) {
    return "threeOfAKind";
  }

  // ツーペア
  if (counts[0] === 2 && counts[1] === 2) {
    return "twoPair";
  }

  // ジャックスオアベター（J/Q/K/Aのワンペア）
  if (counts[0] === 2) {
    for (const [value, count] of countMap) {
      if (count === 2 && value >= 11) {
        return "jacksOrBetter";
      }
    }
  }

  return "noHand";
}

/**
 * ストレート判定（A-2-3-4-5のローストレートも対応）
 */
function checkStraight(sortedValues: number[]): boolean {
  // 通常のストレート: 連続する5枚
  const isNormalStraight =
    sortedValues[4] - sortedValues[0] === 4 &&
    new Set(sortedValues).size === 5;

  // ローストレート: A-2-3-4-5（値は [2,3,4,5,14]）
  const isLowStraight =
    sortedValues[0] === 2 &&
    sortedValues[1] === 3 &&
    sortedValues[2] === 4 &&
    sortedValues[3] === 5 &&
    sortedValues[4] === 14;

  return isNormalStraight || isLowStraight;
}
