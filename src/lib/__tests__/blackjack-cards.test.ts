import { describe, it, expect } from "vitest";
import {
  shuffle,
  createDeck,
  calculateHandTotal,
  isBust,
  isNaturalBlackjack,
  getCardLabel,
  SUIT_SYMBOLS,
  BLACKJACK,
  DEALER_STAND,
} from "../blackjack-cards";
import type { PlayingCard } from "@/types/blackjack";

/** テスト用カード生成ヘルパー */
function card(
  rank: PlayingCard["rank"],
  suit: PlayingCard["suit"] = "spade",
  value?: number
): PlayingCard {
  const defaultValues: Record<string, number> = {
    A: 11,
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "10": 10,
    J: 10,
    Q: 10,
    K: 10,
  };
  return { id: 0, suit, rank, value: value ?? defaultValues[rank] };
}

describe("定数", () => {
  it("BLACKJACKは21", () => {
    expect(BLACKJACK).toBe(21);
  });

  it("DEALER_STANDは17", () => {
    expect(DEALER_STAND).toBe(17);
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

  it("A=11, J/Q/K=10 の値を持つ", () => {
    const deck = createDeck();
    const aces = deck.filter((c) => c.rank === "A");
    expect(aces.every((c) => c.value === 11)).toBe(true);

    const jacks = deck.filter((c) => c.rank === "J");
    expect(jacks.every((c) => c.value === 10)).toBe(true);

    const queens = deck.filter((c) => c.rank === "Q");
    expect(queens.every((c) => c.value === 10)).toBe(true);

    const kings = deck.filter((c) => c.rank === "K");
    expect(kings.every((c) => c.value === 10)).toBe(true);
  });

  it("数字カードは額面通りの値を持つ", () => {
    const deck = createDeck();
    for (let n = 2; n <= 10; n++) {
      const cards = deck.filter((c) => c.rank === String(n));
      expect(cards.every((c) => c.value === n)).toBe(true);
    }
  });
});

describe("calculateHandTotal", () => {
  it("数字カードの合計を計算する", () => {
    expect(calculateHandTotal([card("5"), card("3")])).toBe(8);
  });

  it("絵札を10として計算する", () => {
    expect(calculateHandTotal([card("K"), card("Q")])).toBe(20);
  });

  it("Aを11として計算する（バーストしない場合）", () => {
    expect(calculateHandTotal([card("A"), card("9")])).toBe(20);
  });

  it("Aを1に自動調整する（バーストする場合）", () => {
    expect(calculateHandTotal([card("A"), card("K"), card("5")])).toBe(16);
  });

  it("複数のAを適切に調整する", () => {
    expect(calculateHandTotal([card("A"), card("A"), card("9")])).toBe(21);
  });

  it("すべてのAを1に調整できる", () => {
    expect(
      calculateHandTotal([card("A"), card("A"), card("A"), card("9")])
    ).toBe(12);
  });

  it("ナチュラルブラックジャックを計算する", () => {
    expect(calculateHandTotal([card("A"), card("K")])).toBe(21);
  });
});

describe("isBust", () => {
  it("21以下はバーストしない", () => {
    expect(isBust([card("K"), card("Q")])).toBe(false);
  });

  it("21超でバーストする", () => {
    expect(isBust([card("K"), card("Q"), card("5")])).toBe(true);
  });

  it("A調整後に21以下ならバーストしない", () => {
    expect(isBust([card("A"), card("K"), card("5")])).toBe(false);
  });
});

describe("isNaturalBlackjack", () => {
  it("A+10でナチュラルブラックジャック", () => {
    expect(isNaturalBlackjack([card("A"), card("K")])).toBe(true);
  });

  it("A+10（逆順）でもナチュラルブラックジャック", () => {
    expect(isNaturalBlackjack([card("10"), card("A")])).toBe(true);
  });

  it("3枚で21はナチュラルブラックジャックではない", () => {
    expect(isNaturalBlackjack([card("7"), card("7"), card("7")])).toBe(false);
  });

  it("2枚で21未満はナチュラルブラックジャックではない", () => {
    expect(isNaturalBlackjack([card("A"), card("9")])).toBe(false);
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
