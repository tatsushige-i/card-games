import type { PlayingCard, PyramidCard, Suit, Rank } from "@/types/pyramid";

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

/** ピラミッドソリティアの各ランクに対応する値（A=1, J=11, Q=12, K=13） */
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

/** ピラミッドの段数 */
export const PYRAMID_ROWS = 7;

/** ピラミッドのカード数（1+2+3+4+5+6+7 = 28枚） */
export const PYRAMID_CARD_COUNT = 28;

/** ペア除去の目標値 */
export const TARGET_SUM = 13;

/** 山札のリサイクル上限 */
export const MAX_RECYCLES = 1;

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
 * デッキから28枚をピラミッド構造に配置する
 */
export function buildPyramid(deck: PlayingCard[]): {
  pyramid: PyramidCard[];
  remaining: PlayingCard[];
} {
  const pyramid: PyramidCard[] = [];
  let index = 0;

  for (let row = 0; row < PYRAMID_ROWS; row++) {
    for (let col = 0; col <= row; col++) {
      const card = deck[index];
      pyramid.push({
        ...card,
        row,
        col,
        removed: false,
      });
      index++;
    }
  }

  return {
    pyramid,
    remaining: deck.slice(index),
  };
}

/**
 * カードが露出しているか判定する（両方の子カードが除去済み、または最下段）
 */
export function isExposed(card: PyramidCard, pyramid: PyramidCard[]): boolean {
  if (card.removed) return false;

  // 最下段は常に露出
  if (card.row === PYRAMID_ROWS - 1) return true;

  // 子カード（row+1, col）と（row+1, col+1）の両方が除去済みなら露出
  const leftChild = pyramid.find(
    (c) => c.row === card.row + 1 && c.col === card.col
  );
  const rightChild = pyramid.find(
    (c) => c.row === card.row + 1 && c.col === card.col + 1
  );

  return (
    (leftChild?.removed ?? false) && (rightChild?.removed ?? false)
  );
}

/**
 * 露出済みのピラミッドカード一覧を取得する
 */
export function getExposedCards(pyramid: PyramidCard[]): PyramidCard[] {
  return pyramid.filter((card) => isExposed(card, pyramid));
}

/**
 * 手詰まりかどうか判定する
 */
export function isStuck(
  pyramid: PyramidCard[],
  stock: PlayingCard[],
  waste: PlayingCard[],
  stockRecycles: number
): boolean {
  const exposed = getExposedCards(pyramid);

  // 1. 露出カードにKがある → 手詰まりではない
  if (exposed.some((c) => c.value === TARGET_SUM)) return false;

  // 2. 露出カード同士で合計13のペアがある → 手詰まりではない
  for (let i = 0; i < exposed.length; i++) {
    for (let j = i + 1; j < exposed.length; j++) {
      if (exposed[i].value + exposed[j].value === TARGET_SUM) return false;
    }
  }

  // 3. 捨て札トップがK（単独除去可能） → 手詰まりではない
  // 4. 露出カードと捨て札トップで合計13 → 手詰まりではない
  if (waste.length > 0) {
    const wasteTop = waste[waste.length - 1];
    if (wasteTop.value === TARGET_SUM) return false;
    if (exposed.some((c) => c.value + wasteTop.value === TARGET_SUM)) {
      return false;
    }
  }

  // 5. 山札が残っている → ドロー可能 → 手詰まりではない
  if (stock.length > 0) return false;

  // 6. 山札が空で捨て札があり、リサイクル回数 < 1 → リサイクル可能
  if (stock.length === 0 && waste.length > 0 && stockRecycles < MAX_RECYCLES) {
    return false;
  }

  return true;
}

/**
 * カードのラベルを取得する（アクセシビリティ用）
 */
export function getCardLabel(card: PlayingCard | PyramidCard): string {
  return `${SUIT_SYMBOLS[card.suit]}${card.rank}`;
}
