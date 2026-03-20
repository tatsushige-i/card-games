import type { PlayingCard, Suit, Rank, TriPeaksCard } from "@/types/tri-peaks";

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

/** 各ランクに対応する値（A=1, J=11, Q=12, K=13） */
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

/** タブローの行数 */
export const TABLEAU_ROWS = 4;

/** 各行のカード数 */
export const ROW_SIZES = [3, 6, 9, 10] as const;

/** タブローのカード総数（3+6+9+10=28） */
export const TABLEAU_CARD_COUNT = 28;

/** 山札のカード数（52-28=24） */
export const STOCK_CARD_COUNT = 24;

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
 * 親カードの子カード位置を返す
 * Row 0→1: pos P → (P*2, P*2+1)
 * Row 1→2: peak=floor(pos/2), offset=pos%2, base=peak*3+offset → (base, base+1)
 * Row 2→3: pos P → (P, P+1)
 */
export function getChildren(
  row: number,
  pos: number
): [number, number] | null {
  if (row === 0) {
    return [pos * 2, pos * 2 + 1];
  }
  if (row === 1) {
    const peakIndex = Math.floor(pos / 2);
    const offset = pos % 2;
    const base = peakIndex * 3 + offset;
    return [base, base + 1];
  }
  if (row === 2) {
    return [pos, pos + 1];
  }
  return null;
}

/**
 * 子カードの親カード位置を返す
 * 親子関係を逆引きして、指定カードを覆っている親カードの(row, pos)一覧を返す
 */
export function getParents(
  row: number,
  pos: number
): Array<{ row: number; pos: number }> {
  if (row === 0) return [];

  const parentRow = row - 1;
  const parentRowSize = ROW_SIZES[parentRow];
  const parents: Array<{ row: number; pos: number }> = [];

  for (let p = 0; p < parentRowSize; p++) {
    const children = getChildren(parentRow, p);
    if (children && (children[0] === pos || children[1] === pos)) {
      parents.push({ row: parentRow, pos: p });
    }
  }

  return parents;
}

/**
 * デッキからタブロー（28枚）と山札（24枚）を構築する
 */
export function buildTableau(deck: PlayingCard[]): {
  tableau: TriPeaksCard[];
  stock: PlayingCard[];
} {
  const tableau: TriPeaksCard[] = [];
  let index = 0;

  for (let row = 0; row < TABLEAU_ROWS; row++) {
    for (let pos = 0; pos < ROW_SIZES[row]; pos++) {
      tableau.push({
        ...deck[index],
        row,
        pos,
        removed: false,
      });
      index++;
    }
  }

  return {
    tableau,
    stock: deck.slice(index),
  };
}

/**
 * タブロー上のカードが露出しているか判定する
 * カードが乗っている子カード（下の行）が全て除去済みなら露出
 * Row 3（底段）は子がないため常に露出
 */
export function isExposed(card: TriPeaksCard, tableau: TriPeaksCard[]): boolean {
  if (card.removed) return false;

  const children = getChildren(card.row, card.pos);
  if (!children) return true;

  return children.every((childPos) => {
    const childCard = tableau.find(
      (c) => c.row === card.row + 1 && c.pos === childPos
    );
    return childCard?.removed ?? false;
  });
}

/**
 * タブロー上の露出カード一覧を取得する
 */
export function getExposedCards(tableau: TriPeaksCard[]): TriPeaksCard[] {
  return tableau.filter((card) => isExposed(card, tableau));
}

/**
 * 2枚のカードが±1の関係にあるか判定する（K↔Aラップアラウンドあり）
 */
export function isAdjacentValue(a: number, b: number): boolean {
  const diff = Math.abs(a - b);
  return diff === 1 || diff === 12;
}

/**
 * 手詰まりかどうか判定する
 * 山札が空で、露出カードの中に捨て札トップと±1のカードがない場合
 */
export function isStuck(
  tableau: TriPeaksCard[],
  stock: PlayingCard[],
  waste: PlayingCard[]
): boolean {
  // 山札が残っていればドロー可能
  if (stock.length > 0) return false;

  // 捨て札が空なら手詰まり（山札も空の場合）
  if (waste.length === 0) return true;

  const wasteTop = waste[waste.length - 1];
  const exposed = getExposedCards(tableau);

  // 露出カードの中に±1のカードがあればプレイ可能
  return !exposed.some((card) => isAdjacentValue(card.value, wasteTop.value));
}

/**
 * カードのラベルを取得する（アクセシビリティ用）
 */
export function getCardLabel(card: PlayingCard): string {
  return `${SUIT_SYMBOLS[card.suit]}${card.rank}`;
}
