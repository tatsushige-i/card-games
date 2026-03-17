import type { PlayingCard, Suit, Rank } from "@/types/golf";

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

/** ゴルフソリティアの各ランクに対応する値（A=1, J=11, Q=12, K=13） */
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

/** 列数 */
export const COLUMN_COUNT = 7;

/** 各列のカード数 */
export const CARDS_PER_COLUMN = 5;

/** 場に配置するカード数（7×5 = 35枚） */
export const TABLEAU_CARD_COUNT = COLUMN_COUNT * CARDS_PER_COLUMN;

/** 山札のカード数（52 - 35 = 17枚） */
export const STOCK_CARD_COUNT = 52 - TABLEAU_CARD_COUNT;

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
 * デッキから7列×5段にカードを配置する
 */
export function buildColumns(deck: PlayingCard[]): {
  columns: PlayingCard[][];
  stock: PlayingCard[];
} {
  const columns: PlayingCard[][] = [];
  let index = 0;

  for (let col = 0; col < COLUMN_COUNT; col++) {
    const column: PlayingCard[] = [];
    for (let row = 0; row < CARDS_PER_COLUMN; row++) {
      column.push(deck[index]);
      index++;
    }
    columns.push(column);
  }

  return {
    columns,
    stock: deck.slice(index),
  };
}

/**
 * 2枚のカードが±1の関係にあるか判定する（ラップアラウンドなし）
 */
export function isAdjacentValue(a: number, b: number): boolean {
  return Math.abs(a - b) === 1;
}

/**
 * 場に残っているカード数を計算する
 */
export function getRemainingCards(columns: PlayingCard[][]): number {
  return columns.reduce((sum, col) => sum + col.length, 0);
}

/**
 * 手詰まりかどうか判定する
 * 山札が空で、場のどの列の末尾カードも捨て札トップと±1でない場合
 */
export function isStuck(
  columns: PlayingCard[][],
  stock: PlayingCard[],
  waste: PlayingCard[]
): boolean {
  // 山札が残っていればドロー可能
  if (stock.length > 0) return false;

  // 捨て札が空なら手詰まり（山札も空の場合）
  if (waste.length === 0) return true;

  const wasteTop = waste[waste.length - 1];

  // 場のどの列の末尾カードとも±1でなければ手詰まり
  return !columns.some(
    (col) =>
      col.length > 0 && isAdjacentValue(col[col.length - 1].value, wasteTop.value)
  );
}

/**
 * カードのラベルを取得する（アクセシビリティ用）
 */
export function getCardLabel(card: PlayingCard): string {
  return `${SUIT_SYMBOLS[card.suit]}${card.rank}`;
}
