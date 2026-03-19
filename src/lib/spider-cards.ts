import type { SpiderCard, Rank } from "@/types/spider";

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
export const SUIT_SYMBOLS = { spade: "♠" } as const;

/** 列数 */
export const COLUMN_COUNT = 10;

/** 完成セット目標数 */
export const TARGET_SETS = 8;

/** 完成列のカード枚数（K〜A: 13枚） */
export const COMPLETE_SEQUENCE_LENGTH = 13;

/** デッキ枚数（スペード×8セット = 104枚） */
export const DECK_SIZE = 104;

/** 場に配置するカード数（左4列6枚 + 右6列5枚 = 54枚） */
export const TABLEAU_CARD_COUNT = 54;

/** 山札のカード数（104 - 54 = 50枚） */
export const STOCK_CARD_COUNT = DECK_SIZE - TABLEAU_CARD_COUNT;

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
 * 104枚のスパイダーソリティア用デッキを生成してシャッフルする
 * スペードのみ8セット
 */
export function createDeck(): SpiderCard[] {
  const cards: SpiderCard[] = [];
  let id = 0;
  for (let set = 0; set < 8; set++) {
    for (const rank of RANKS) {
      cards.push({
        id: id++,
        suit: "spade",
        rank,
        value: RANK_VALUES[rank],
        faceUp: false,
      });
    }
  }
  return shuffle(cards);
}

/**
 * デッキから10列にカードを配置する
 * 左4列: 6枚、右6列: 5枚（各列の最下段のみ表向き）
 * 残り50枚が山札
 */
export function buildColumns(deck: SpiderCard[]): {
  columns: SpiderCard[][];
  stock: SpiderCard[];
} {
  const columns: SpiderCard[][] = [];
  let index = 0;

  for (let col = 0; col < COLUMN_COUNT; col++) {
    const cardCount = col < 4 ? 6 : 5;
    const column: SpiderCard[] = [];
    for (let row = 0; row < cardCount; row++) {
      const isLast = row === cardCount - 1;
      column.push({ ...deck[index], faceUp: isLast });
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
 * 指定位置から列末尾までが有効なシーケンスか検証する
 * 全て表向き＋連続降順であること
 */
export function isValidSequence(
  column: SpiderCard[],
  fromIndex: number
): boolean {
  for (let i = fromIndex; i < column.length; i++) {
    if (!column[i].faceUp) return false;
    if (i > fromIndex) {
      // 前のカードの値 - 1 が現在のカードの値であること（降順）
      if (column[i - 1].value !== column[i].value + 1) return false;
    }
  }
  return true;
}

/**
 * 移動先の列にカードを移動できるか判定する
 * 空列は常にOK、それ以外は移動先末尾の値が移動元先頭+1であること
 */
export function canMoveToColumn(
  movingCards: SpiderCard[],
  targetColumn: SpiderCard[]
): boolean {
  if (targetColumn.length === 0) return true;
  const targetTop = targetColumn[targetColumn.length - 1];
  return targetTop.value === movingCards[0].value + 1;
}

/**
 * 列の末尾13枚がK〜Aの完成列かどうか判定する
 */
export function hasCompleteSequence(column: SpiderCard[]): boolean {
  if (column.length < COMPLETE_SEQUENCE_LENGTH) return false;

  const startIndex = column.length - COMPLETE_SEQUENCE_LENGTH;
  for (let i = 0; i < COMPLETE_SEQUENCE_LENGTH; i++) {
    const card = column[startIndex + i];
    if (!card.faceUp) return false;
    // K(13)から始まりA(1)まで降順
    if (card.value !== COMPLETE_SEQUENCE_LENGTH - i) return false;
  }
  return true;
}

/**
 * 完成列を除去し、新しい末尾カードを表にする
 * 完成列の除去後の列と除去されたかを返す
 */
export function removeCompleteSequence(column: SpiderCard[]): {
  newColumn: SpiderCard[];
  removed: boolean;
} {
  if (!hasCompleteSequence(column)) {
    return { newColumn: column, removed: false };
  }

  const newColumn = column.slice(0, column.length - COMPLETE_SEQUENCE_LENGTH);
  // 新しい末尾カードが裏向きなら表にする
  if (newColumn.length > 0 && !newColumn[newColumn.length - 1].faceUp) {
    newColumn[newColumn.length - 1] = {
      ...newColumn[newColumn.length - 1],
      faceUp: true,
    };
  }
  return { newColumn, removed: true };
}

/**
 * 全10列にカードが1枚以上あるか判定する（山札配布の条件）
 */
export function canDealRow(
  columns: SpiderCard[][],
  stock: SpiderCard[]
): boolean {
  if (stock.length < columns.length) return false;
  return columns.every((col) => col.length > 0);
}

/**
 * カードのラベルを取得する（アクセシビリティ用）
 */
export function getCardLabel(card: SpiderCard): string {
  if (!card.faceUp) return "裏向きのカード";
  return `♠${card.rank}`;
}
