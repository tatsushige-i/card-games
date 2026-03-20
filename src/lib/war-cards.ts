import type { WarCard, Suit, Rank } from "@/types/war";

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

/** 戦争での各ランクに対応する強さ（Aが最強） */
const RANK_VALUES: Record<Rank, number> = {
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
  A: 14,
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
export function createDeck(): WarCard[] {
  const cards: WarCard[] = [];
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
 * デッキを半分に分けてプレイヤーとCPUに配布する
 */
export function dealCards(): { playerDeck: WarCard[]; cpuDeck: WarCard[] } {
  const deck = createDeck();
  return {
    playerDeck: deck.slice(0, 26),
    cpuDeck: deck.slice(26),
  };
}

/**
 * 2枚のカードの勝敗を比較する
 * @returns "player" | "cpu" | "war"
 */
export function compareCards(
  playerCard: WarCard,
  cpuCard: WarCard
): "player" | "cpu" | "war" {
  if (playerCard.value > cpuCard.value) return "player";
  if (playerCard.value < cpuCard.value) return "cpu";
  return "war";
}

/**
 * カードのラベルを取得する（アクセシビリティ用）
 */
export function getCardLabel(card: WarCard): string {
  return `${SUIT_SYMBOLS[card.suit]}${card.rank}`;
}
