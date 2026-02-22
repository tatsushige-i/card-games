import { describe, it, expect } from "vitest";
import {
  shuffle,
  createDeck,
  evaluateHand,
  getCardLabel,
  SUIT_SYMBOLS,
  HAND_PAYOUTS,
  HAND_NAMES,
  HAND_RANK_ORDER,
  MAX_ROUNDS,
} from "../poker-cards";
import type { PlayingCard, Suit } from "@/types/poker";

/** テスト用カード生成ヘルパー */
function card(
  rank: PlayingCard["rank"],
  suit: PlayingCard["suit"] = "spade"
): PlayingCard {
  const values: Record<string, number> = {
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
  return { id: 0, suit, rank, value: values[rank] };
}

describe("定数", () => {
  it("MAX_ROUNDSは10", () => {
    expect(MAX_ROUNDS).toBe(10);
  });

  it("配当テーブルが正しい", () => {
    expect(HAND_PAYOUTS.royalFlush).toBe(800);
    expect(HAND_PAYOUTS.straightFlush).toBe(50);
    expect(HAND_PAYOUTS.fourOfAKind).toBe(25);
    expect(HAND_PAYOUTS.fullHouse).toBe(9);
    expect(HAND_PAYOUTS.flush).toBe(6);
    expect(HAND_PAYOUTS.straight).toBe(4);
    expect(HAND_PAYOUTS.threeOfAKind).toBe(3);
    expect(HAND_PAYOUTS.twoPair).toBe(2);
    expect(HAND_PAYOUTS.jacksOrBetter).toBe(1);
    expect(HAND_PAYOUTS.noHand).toBe(0);
  });

  it("役名が定義されている", () => {
    expect(HAND_NAMES.royalFlush).toBe("ロイヤルフラッシュ");
    expect(HAND_NAMES.noHand).toBe("ノーハンド");
  });

  it("役の表示順が9つある（noHand除く）", () => {
    expect(HAND_RANK_ORDER).toHaveLength(9);
  });
});

describe("shuffle", () => {
  it("元の配列を変更しない", () => {
    const original = [1, 2, 3, 4, 5];
    const copy = [...original];
    shuffle(original);
    expect(original).toEqual(copy);
  });

  it("すべての要素を保持する", () => {
    const original = [1, 2, 3, 4, 5];
    const shuffled = shuffle(original);
    expect(shuffled.sort()).toEqual(original.sort());
  });
});

describe("createDeck", () => {
  it("52枚のカードを生成する", () => {
    const deck = createDeck();
    expect(deck).toHaveLength(52);
  });

  it("すべてのカードがユニークなIDを持つ", () => {
    const deck = createDeck();
    const ids = new Set(deck.map((c) => c.id));
    expect(ids.size).toBe(52);
  });

  it("各スートに13枚ずつある", () => {
    const deck = createDeck();
    const suits: Suit[] = ["spade", "heart", "diamond", "club"];
    for (const suit of suits) {
      expect(deck.filter((c) => c.suit === suit)).toHaveLength(13);
    }
  });

  it("ポーカー用の値を持つ（A=14, J=11, Q=12, K=13）", () => {
    const deck = createDeck();
    const aces = deck.filter((c) => c.rank === "A");
    expect(aces.every((c) => c.value === 14)).toBe(true);

    const jacks = deck.filter((c) => c.rank === "J");
    expect(jacks.every((c) => c.value === 11)).toBe(true);

    const queens = deck.filter((c) => c.rank === "Q");
    expect(queens.every((c) => c.value === 12)).toBe(true);

    const kings = deck.filter((c) => c.rank === "K");
    expect(kings.every((c) => c.value === 13)).toBe(true);
  });

  it("数字カードは額面通りの値を持つ", () => {
    const deck = createDeck();
    for (let n = 2; n <= 10; n++) {
      const cards = deck.filter((c) => c.rank === String(n));
      expect(cards.every((c) => c.value === n)).toBe(true);
    }
  });
});

describe("evaluateHand", () => {
  describe("ロイヤルフラッシュ", () => {
    it("10-J-Q-K-A の同一スートを判定する", () => {
      const hand = [
        card("10", "heart"),
        card("J", "heart"),
        card("Q", "heart"),
        card("K", "heart"),
        card("A", "heart"),
      ];
      expect(evaluateHand(hand)).toBe("royalFlush");
    });

    it("スペードのロイヤルフラッシュを判定する", () => {
      const hand = [
        card("A", "spade"),
        card("K", "spade"),
        card("Q", "spade"),
        card("J", "spade"),
        card("10", "spade"),
      ];
      expect(evaluateHand(hand)).toBe("royalFlush");
    });
  });

  describe("ストレートフラッシュ", () => {
    it("連続する同一スート5枚を判定する", () => {
      const hand = [
        card("5", "club"),
        card("6", "club"),
        card("7", "club"),
        card("8", "club"),
        card("9", "club"),
      ];
      expect(evaluateHand(hand)).toBe("straightFlush");
    });

    it("A-2-3-4-5のローストレートフラッシュを判定する", () => {
      const hand = [
        card("A", "diamond"),
        card("2", "diamond"),
        card("3", "diamond"),
        card("4", "diamond"),
        card("5", "diamond"),
      ];
      expect(evaluateHand(hand)).toBe("straightFlush");
    });
  });

  describe("フォーカード", () => {
    it("同じランク4枚を判定する", () => {
      const hand = [
        card("7", "spade"),
        card("7", "heart"),
        card("7", "diamond"),
        card("7", "club"),
        card("K", "spade"),
      ];
      expect(evaluateHand(hand)).toBe("fourOfAKind");
    });
  });

  describe("フルハウス", () => {
    it("3枚+2枚の組を判定する", () => {
      const hand = [
        card("K", "spade"),
        card("K", "heart"),
        card("K", "diamond"),
        card("3", "club"),
        card("3", "spade"),
      ];
      expect(evaluateHand(hand)).toBe("fullHouse");
    });
  });

  describe("フラッシュ", () => {
    it("同一スート5枚（ストレートでない）を判定する", () => {
      const hand = [
        card("2", "heart"),
        card("5", "heart"),
        card("8", "heart"),
        card("J", "heart"),
        card("K", "heart"),
      ];
      expect(evaluateHand(hand)).toBe("flush");
    });
  });

  describe("ストレート", () => {
    it("連続する5枚（異なるスート）を判定する", () => {
      const hand = [
        card("6", "spade"),
        card("7", "heart"),
        card("8", "diamond"),
        card("9", "club"),
        card("10", "spade"),
      ];
      expect(evaluateHand(hand)).toBe("straight");
    });

    it("A-2-3-4-5のローストレートを判定する", () => {
      const hand = [
        card("A", "spade"),
        card("2", "heart"),
        card("3", "diamond"),
        card("4", "club"),
        card("5", "spade"),
      ];
      expect(evaluateHand(hand)).toBe("straight");
    });

    it("10-J-Q-K-Aのハイストレートを判定する", () => {
      const hand = [
        card("10", "spade"),
        card("J", "heart"),
        card("Q", "diamond"),
        card("K", "club"),
        card("A", "spade"),
      ];
      expect(evaluateHand(hand)).toBe("straight");
    });
  });

  describe("スリーカード", () => {
    it("同じランク3枚を判定する", () => {
      const hand = [
        card("9", "spade"),
        card("9", "heart"),
        card("9", "diamond"),
        card("5", "club"),
        card("K", "spade"),
      ];
      expect(evaluateHand(hand)).toBe("threeOfAKind");
    });
  });

  describe("ツーペア", () => {
    it("2組のペアを判定する", () => {
      const hand = [
        card("J", "spade"),
        card("J", "heart"),
        card("4", "diamond"),
        card("4", "club"),
        card("K", "spade"),
      ];
      expect(evaluateHand(hand)).toBe("twoPair");
    });
  });

  describe("ジャックスオアベター", () => {
    it("Jのペアを判定する", () => {
      const hand = [
        card("J", "spade"),
        card("J", "heart"),
        card("3", "diamond"),
        card("5", "club"),
        card("9", "spade"),
      ];
      expect(evaluateHand(hand)).toBe("jacksOrBetter");
    });

    it("Qのペアを判定する", () => {
      const hand = [
        card("Q", "spade"),
        card("Q", "heart"),
        card("3", "diamond"),
        card("5", "club"),
        card("9", "spade"),
      ];
      expect(evaluateHand(hand)).toBe("jacksOrBetter");
    });

    it("Kのペアを判定する", () => {
      const hand = [
        card("K", "spade"),
        card("K", "heart"),
        card("3", "diamond"),
        card("5", "club"),
        card("9", "spade"),
      ];
      expect(evaluateHand(hand)).toBe("jacksOrBetter");
    });

    it("Aのペアを判定する", () => {
      const hand = [
        card("A", "spade"),
        card("A", "heart"),
        card("3", "diamond"),
        card("5", "club"),
        card("9", "spade"),
      ];
      expect(evaluateHand(hand)).toBe("jacksOrBetter");
    });

    it("10以下のペアはジャックスオアベターにならない", () => {
      const hand = [
        card("10", "spade"),
        card("10", "heart"),
        card("3", "diamond"),
        card("5", "club"),
        card("9", "spade"),
      ];
      expect(evaluateHand(hand)).toBe("noHand");
    });
  });

  describe("ノーハンド", () => {
    it("役なしを判定する", () => {
      const hand = [
        card("2", "spade"),
        card("5", "heart"),
        card("8", "diamond"),
        card("J", "club"),
        card("K", "heart"),
      ];
      expect(evaluateHand(hand)).toBe("noHand");
    });

    it("5枚未満はノーハンドを返す", () => {
      const hand = [card("A", "spade"), card("K", "heart")];
      expect(evaluateHand(hand)).toBe("noHand");
    });
  });

  describe("Q-K-A-2-3はストレートにならない", () => {
    it("ラップアラウンドはストレートではない", () => {
      const hand = [
        card("Q", "spade"),
        card("K", "heart"),
        card("A", "diamond"),
        card("2", "club"),
        card("3", "spade"),
      ];
      expect(evaluateHand(hand)).toBe("noHand");
    });
  });
});

describe("getCardLabel", () => {
  it("スート記号+ランクのラベルを返す", () => {
    expect(getCardLabel(card("A", "spade"))).toBe("♠A");
    expect(getCardLabel(card("10", "heart"))).toBe("♥10");
    expect(getCardLabel(card("K", "diamond"))).toBe("♦K");
    expect(getCardLabel(card("3", "club"))).toBe("♣3");
  });
});

describe("SUIT_SYMBOLS", () => {
  it("各スートの記号が正しい", () => {
    expect(SUIT_SYMBOLS.spade).toBe("♠");
    expect(SUIT_SYMBOLS.heart).toBe("♥");
    expect(SUIT_SYMBOLS.diamond).toBe("♦");
    expect(SUIT_SYMBOLS.club).toBe("♣");
  });
});
