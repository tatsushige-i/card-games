import { describe, it, expect } from "vitest";
import {
  shuffle,
  createDeck,
  getCardLabel,
  SUIT_SYMBOLS,
} from "../high-and-low-cards";
import type { Suit } from "@/types/high-and-low";

describe("shuffle", () => {
  it("元の配列を変更しない", () => {
    const original = [1, 2, 3, 4, 5];
    const copy = [...original];
    shuffle(original);
    expect(original).toEqual(copy);
  });

  it("全ての要素を保持する", () => {
    const original = [1, 2, 3, 4, 5];
    const shuffled = shuffle(original);
    expect(shuffled).toHaveLength(original.length);
    expect(shuffled.sort()).toEqual(original.sort());
  });
});

describe("createDeck", () => {
  it("52枚のカードを生成する", () => {
    const deck = createDeck();
    expect(deck).toHaveLength(52);
  });

  it("全てのカードにユニークなIDを持つ", () => {
    const deck = createDeck();
    const ids = deck.map((c) => c.id);
    expect(new Set(ids).size).toBe(52);
  });

  it("4つのスートがそれぞれ13枚ずつある", () => {
    const deck = createDeck();
    const suits: Suit[] = ["spade", "heart", "diamond", "club"];
    for (const suit of suits) {
      const count = deck.filter((c) => c.suit === suit).length;
      expect(count).toBe(13);
    }
  });

  it("13のランクがそれぞれ4枚ずつある", () => {
    const deck = createDeck();
    const ranks = [
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
    for (const rank of ranks) {
      const count = deck.filter((c) => c.rank === rank).length;
      expect(count).toBe(4);
    }
  });

  it("全てのカードのvalueが1〜13の範囲にある", () => {
    const deck = createDeck();
    for (const card of deck) {
      expect(card.value).toBeGreaterThanOrEqual(1);
      expect(card.value).toBeLessThanOrEqual(13);
    }
  });
});

describe("getCardLabel", () => {
  it("スート記号とランクを組み合わせたラベルを返す", () => {
    expect(
      getCardLabel({ id: 0, suit: "spade", rank: "A", value: 1 })
    ).toBe("♠A");
    expect(
      getCardLabel({ id: 1, suit: "heart", rank: "10", value: 10 })
    ).toBe("♥10");
    expect(
      getCardLabel({ id: 2, suit: "diamond", rank: "K", value: 13 })
    ).toBe("♦K");
    expect(
      getCardLabel({ id: 3, suit: "club", rank: "J", value: 11 })
    ).toBe("♣J");
  });

  it("SUIT_SYMBOLSの定義と一致する", () => {
    expect(SUIT_SYMBOLS.spade).toBe("♠");
    expect(SUIT_SYMBOLS.heart).toBe("♥");
    expect(SUIT_SYMBOLS.diamond).toBe("♦");
    expect(SUIT_SYMBOLS.club).toBe("♣");
  });
});
