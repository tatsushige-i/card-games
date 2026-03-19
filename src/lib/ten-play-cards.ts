import type { PlayingCard, Suit, Rank } from "@/types/ten-play";

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

/** テンプレイの各ランクに対応する値（A=1, J=11, Q=12, K=13） */
const RANK_VALUES: Record<Rank, number> = {
  A: 1,
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

/** タブローのスロット数 */
export const TABLEAU_SIZE = 13;

/** ペア除去の目標合計値 */
export const TARGET_SUM = 10;

/** 10のカードの値（単独除去対象） */
export const SOLO_REMOVE_VALUE = 10;

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
 * デッキからタブロー13枚と山札39枚に分割する
 */
export function buildTableau(deck: PlayingCard[]): {
  tableau: (PlayingCard | null)[];
  stock: PlayingCard[];
} {
  const tableau: (PlayingCard | null)[] = deck.slice(0, TABLEAU_SIZE);
  const stock = deck.slice(TABLEAU_SIZE);
  return { tableau, stock };
}

/**
 * 2枚のカードが有効なペアかどうか判定する
 * - 数札（A〜9）同士: 合計10
 * - 同ランク絵札: J+J, Q+Q, K+K
 */
export function isValidPair(a: PlayingCard, b: PlayingCard): boolean {
  // 数札同士で合計10
  if (a.value <= 9 && b.value <= 9 && a.value + b.value === TARGET_SUM) {
    return true;
  }
  // 同ランク絵札（J+J, Q+Q, K+K）
  if (a.value >= 11 && b.value >= 11 && a.rank === b.rank) {
    return true;
  }
  return false;
}

/**
 * カードが単独除去可能か判定する（10のカード）
 */
export function isSoloRemovable(card: PlayingCard): boolean {
  return card.value === SOLO_REMOVE_VALUE;
}

/**
 * タブロー上の残りカード数を計算する
 */
export function getRemainingTableauCards(
  tableau: (PlayingCard | null)[]
): number {
  return tableau.filter((c) => c !== null).length;
}

/**
 * 全体の残りカード数を計算する（タブロー + 山札）
 */
export function getTotalRemainingCards(
  tableau: (PlayingCard | null)[],
  stock: PlayingCard[]
): number {
  return getRemainingTableauCards(tableau) + stock.length;
}

/**
 * 手詰まりかどうか判定する
 * タブローの非nullカード間に有効なペアがなく、単独除去可能な10もない場合
 */
export function isStuck(tableau: (PlayingCard | null)[]): boolean {
  const cards = tableau.filter((c): c is PlayingCard => c !== null);

  // 単独除去可能な10がある
  if (cards.some((c) => isSoloRemovable(c))) return false;

  // 有効なペアがある
  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      if (isValidPair(cards[i], cards[j])) return false;
    }
  }

  return true;
}

/**
 * タブローの空きスロットに山札から補充する
 */
export function refillTableau(
  tableau: (PlayingCard | null)[],
  stock: PlayingCard[]
): { tableau: (PlayingCard | null)[]; stock: PlayingCard[] } {
  const newTableau = [...tableau];
  const newStock = [...stock];

  for (let i = 0; i < newTableau.length; i++) {
    if (newTableau[i] === null && newStock.length > 0) {
      newTableau[i] = newStock.shift()!;
    }
  }

  return { tableau: newTableau, stock: newStock };
}

/**
 * カードのラベルを取得する（アクセシビリティ用）
 */
export function getCardLabel(card: PlayingCard): string {
  return `${SUIT_SYMBOLS[card.suit]}${card.rank}`;
}
