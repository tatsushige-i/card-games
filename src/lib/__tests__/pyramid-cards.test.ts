import { describe, it, expect } from "vitest";
import {
  shuffle,
  createDeck,
  buildPyramid,
  isExposed,
  getExposedCards,
  isStuck,
  getCardLabel,
  SUIT_SYMBOLS,
  PYRAMID_ROWS,
  PYRAMID_CARD_COUNT,
  TARGET_SUM,
} from "../pyramid-cards";
import type { PlayingCard, PyramidCard } from "@/types/pyramid";

/** テスト用カード生成ヘルパー */
function card(
  rank: PlayingCard["rank"],
  suit: PlayingCard["suit"] = "spade",
  id: number = 0
): PlayingCard {
  const values: Record<string, number> = {
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
  return { id, suit, rank, value: values[rank] };
}

/** テスト用ピラミッドカード生成ヘルパー */
function pyramidCard(
  rank: PlayingCard["rank"],
  row: number,
  col: number,
  removed: boolean = false,
  id: number = 0,
  suit: PlayingCard["suit"] = "spade"
): PyramidCard {
  const values: Record<string, number> = {
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
  return { id, suit, rank, value: values[rank], row, col, removed };
}

describe("定数", () => {
  it("PYRAMID_ROWSは7", () => {
    expect(PYRAMID_ROWS).toBe(7);
  });

  it("PYRAMID_CARD_COUNTは28", () => {
    expect(PYRAMID_CARD_COUNT).toBe(28);
  });

  it("TARGET_SUMは13", () => {
    expect(TARGET_SUM).toBe(13);
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
    const suits = ["spade", "heart", "diamond", "club"] as const;
    for (const suit of suits) {
      expect(deck.filter((c) => c.suit === suit)).toHaveLength(13);
    }
  });

  it("A=1, J=11, Q=12, K=13 の値を持つ", () => {
    const deck = createDeck();
    expect(deck.filter((c) => c.rank === "A").every((c) => c.value === 1)).toBe(
      true
    );
    expect(
      deck.filter((c) => c.rank === "J").every((c) => c.value === 11)
    ).toBe(true);
    expect(
      deck.filter((c) => c.rank === "Q").every((c) => c.value === 12)
    ).toBe(true);
    expect(
      deck.filter((c) => c.rank === "K").every((c) => c.value === 13)
    ).toBe(true);
  });

  it("数字カードは額面通りの値を持つ", () => {
    const deck = createDeck();
    for (let n = 2; n <= 10; n++) {
      const cards = deck.filter((c) => c.rank === String(n));
      expect(cards.every((c) => c.value === n)).toBe(true);
    }
  });
});

describe("buildPyramid", () => {
  it("28枚のピラミッドカードを生成する", () => {
    const deck = createDeck();
    const { pyramid } = buildPyramid(deck);
    expect(pyramid).toHaveLength(PYRAMID_CARD_COUNT);
  });

  it("残り24枚を返す", () => {
    const deck = createDeck();
    const { remaining } = buildPyramid(deck);
    expect(remaining).toHaveLength(24);
  });

  it("各段に正しい枚数のカードがある", () => {
    const deck = createDeck();
    const { pyramid } = buildPyramid(deck);
    for (let row = 0; row < PYRAMID_ROWS; row++) {
      const rowCards = pyramid.filter((c) => c.row === row);
      expect(rowCards).toHaveLength(row + 1);
    }
  });

  it("すべてのカードがremoved=falseで初期化される", () => {
    const deck = createDeck();
    const { pyramid } = buildPyramid(deck);
    expect(pyramid.every((c) => c.removed === false)).toBe(true);
  });
});

describe("isExposed", () => {
  it("最下段のカードは常に露出", () => {
    const pyramid = [pyramidCard("A", 6, 0)];
    expect(isExposed(pyramid[0], pyramid)).toBe(true);
  });

  it("子カードが両方除去済みなら露出", () => {
    const pyramid = [
      pyramidCard("A", 0, 0, false, 1),
      pyramidCard("2", 1, 0, true, 2),
      pyramidCard("3", 1, 1, true, 3),
    ];
    expect(isExposed(pyramid[0], pyramid)).toBe(true);
  });

  it("子カードが片方だけ除去済みなら露出しない", () => {
    const pyramid = [
      pyramidCard("A", 0, 0, false, 1),
      pyramidCard("2", 1, 0, true, 2),
      pyramidCard("3", 1, 1, false, 3),
    ];
    expect(isExposed(pyramid[0], pyramid)).toBe(false);
  });

  it("除去済みカードは露出しない", () => {
    const pyramid = [pyramidCard("A", 6, 0, true)];
    expect(isExposed(pyramid[0], pyramid)).toBe(false);
  });
});

describe("getExposedCards", () => {
  it("露出済みカードのみを返す", () => {
    const pyramid = [
      pyramidCard("A", 0, 0, false, 1),
      pyramidCard("2", 1, 0, true, 2),
      pyramidCard("3", 1, 1, true, 3),
      pyramidCard("5", 6, 0, false, 4),
      pyramidCard("6", 6, 1, true, 5),
    ];
    const exposed = getExposedCards(pyramid);
    // row=0のカード（子が除去済み）とrow=6のid=4が露出
    expect(exposed.map((c) => c.id)).toEqual(
      expect.arrayContaining([1, 4])
    );
    expect(exposed).toHaveLength(2);
  });
});

describe("isStuck", () => {
  it("Kが露出していれば手詰まりでない", () => {
    const pyramid = [pyramidCard("K", 6, 0, false, 1)];
    expect(isStuck(pyramid, [], [], 0)).toBe(false);
  });

  it("合計13のペアがあれば手詰まりでない", () => {
    const pyramid = [
      pyramidCard("6", 6, 0, false, 1),
      pyramidCard("7", 6, 1, false, 2),
    ];
    expect(isStuck(pyramid, [], [], 0)).toBe(false);
  });

  it("捨て札トップとペアが作れれば手詰まりでない", () => {
    const pyramid = [pyramidCard("6", 6, 0, false, 1)];
    const waste = [card("7", "heart", 2)];
    expect(isStuck(pyramid, [], waste, 0)).toBe(false);
  });

  it("捨て札トップがKなら手詰まりでない", () => {
    const pyramid = [pyramidCard("2", 6, 0, false, 1)];
    const waste = [card("K", "heart", 2)];
    expect(isStuck(pyramid, [], waste, 1)).toBe(false);
  });

  it("山札があれば手詰まりでない", () => {
    const pyramid = [pyramidCard("2", 6, 0, false, 1)];
    const stock = [card("3", "heart", 2)];
    expect(isStuck(pyramid, stock, [], 0)).toBe(false);
  });

  it("リサイクル可能なら手詰まりでない", () => {
    const pyramid = [pyramidCard("2", 6, 0, false, 1)];
    const waste = [card("4", "heart", 2)];
    expect(isStuck(pyramid, [], waste, 0)).toBe(false);
  });

  it("何もできなければ手詰まり", () => {
    const pyramid = [
      pyramidCard("2", 6, 0, false, 1),
      pyramidCard("3", 6, 1, false, 2),
    ];
    expect(isStuck(pyramid, [], [], 1)).toBe(true);
  });

  it("リサイクル上限に達していれば手詰まりの可能性がある", () => {
    const pyramid = [pyramidCard("2", 6, 0, false, 1)];
    const waste = [card("4", "heart", 2)];
    expect(isStuck(pyramid, [], waste, 1)).toBe(true);
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
