import { describe, it, expect } from "vitest";
import {
  shuffle,
  createDeck,
  buildColumns,
  isAdjacentValue,
  getRemainingCards,
  isStuck,
  getCardLabel,
  SUIT_SYMBOLS,
  COLUMN_COUNT,
  CARDS_PER_COLUMN,
  TABLEAU_CARD_COUNT,
  STOCK_CARD_COUNT,
} from "../golf-cards";
import type { PlayingCard } from "@/types/golf";

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

describe("定数", () => {
  it("COLUMN_COUNTは7", () => {
    expect(COLUMN_COUNT).toBe(7);
  });

  it("CARDS_PER_COLUMNは5", () => {
    expect(CARDS_PER_COLUMN).toBe(5);
  });

  it("TABLEAU_CARD_COUNTは35", () => {
    expect(TABLEAU_CARD_COUNT).toBe(35);
  });

  it("STOCK_CARD_COUNTは17", () => {
    expect(STOCK_CARD_COUNT).toBe(17);
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
    expect(deck.filter((c) => c.rank === "A").every((c) => c.value === 1)).toBe(true);
    expect(deck.filter((c) => c.rank === "J").every((c) => c.value === 11)).toBe(true);
    expect(deck.filter((c) => c.rank === "Q").every((c) => c.value === 12)).toBe(true);
    expect(deck.filter((c) => c.rank === "K").every((c) => c.value === 13)).toBe(true);
  });
});

describe("buildColumns", () => {
  it("7列を生成する", () => {
    const deck = createDeck();
    const { columns } = buildColumns(deck);
    expect(columns).toHaveLength(COLUMN_COUNT);
  });

  it("各列に5枚ずつカードがある", () => {
    const deck = createDeck();
    const { columns } = buildColumns(deck);
    for (const col of columns) {
      expect(col).toHaveLength(CARDS_PER_COLUMN);
    }
  });

  it("残り17枚を返す", () => {
    const deck = createDeck();
    const { stock } = buildColumns(deck);
    expect(stock).toHaveLength(STOCK_CARD_COUNT);
  });
});

describe("isAdjacentValue", () => {
  it("差が1の場合はtrue", () => {
    expect(isAdjacentValue(5, 6)).toBe(true);
    expect(isAdjacentValue(6, 5)).toBe(true);
    expect(isAdjacentValue(1, 2)).toBe(true);
    expect(isAdjacentValue(12, 13)).toBe(true);
  });

  it("差が1でない場合はfalse", () => {
    expect(isAdjacentValue(5, 7)).toBe(false);
    expect(isAdjacentValue(1, 3)).toBe(false);
    expect(isAdjacentValue(5, 5)).toBe(false);
  });

  it("K→Aのラップアラウンドはなし", () => {
    expect(isAdjacentValue(13, 1)).toBe(false);
    expect(isAdjacentValue(1, 13)).toBe(false);
  });
});

describe("getRemainingCards", () => {
  it("全列のカード数を合計する", () => {
    const columns = [
      [card("A"), card("2")],
      [card("3")],
      [],
    ];
    expect(getRemainingCards(columns)).toBe(3);
  });

  it("空の列のみなら0", () => {
    expect(getRemainingCards([[], [], []])).toBe(0);
  });
});

describe("isStuck", () => {
  it("山札が残っていれば手詰まりでない", () => {
    const columns = [[card("K", "spade", 1)]];
    const stock = [card("3", "heart", 2)];
    const waste = [card("5", "heart", 3)];
    expect(isStuck(columns, stock, waste)).toBe(false);
  });

  it("±1のカードがあれば手詰まりでない", () => {
    const columns = [[card("6", "spade", 1)]];
    const waste = [card("5", "heart", 2)];
    expect(isStuck(columns, [], waste)).toBe(false);
  });

  it("±1のカードがなく山札も空なら手詰まり", () => {
    const columns = [[card("2", "spade", 1)]];
    const waste = [card("5", "heart", 2)];
    expect(isStuck(columns, [], waste)).toBe(true);
  });

  it("捨て札が空で山札も空なら手詰まり", () => {
    const columns = [[card("2", "spade", 1)]];
    expect(isStuck(columns, [], [])).toBe(true);
  });

  it("場が空なら手詰まり（ただしすでにクリア判定済み）", () => {
    const waste = [card("5", "heart", 1)];
    expect(isStuck([], [], waste)).toBe(true);
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
