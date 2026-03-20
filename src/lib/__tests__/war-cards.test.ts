import { describe, it, expect } from "vitest";
import {
  shuffle,
  createDeck,
  dealCards,
  compareCards,
  getCardLabel,
  SUIT_SYMBOLS,
  SUIT_COLORS,
} from "../war-cards";
import type { WarCard } from "@/types/war";

/** テスト用カード生成ヘルパー */
function card(
  rank: WarCard["rank"],
  suit: WarCard["suit"] = "spade",
  value?: number
): WarCard {
  const defaultValues: Record<string, number> = {
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
  return { id: 0, suit, rank, value: value ?? defaultValues[rank] };
}

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

  it("A=14（最強）の値を持つ", () => {
    const deck = createDeck();
    const aces = deck.filter((c) => c.rank === "A");
    expect(aces.every((c) => c.value === 14)).toBe(true);
  });

  it("J=11, Q=12, K=13 の値を持つ", () => {
    const deck = createDeck();
    expect(deck.filter((c) => c.rank === "J").every((c) => c.value === 11)).toBe(true);
    expect(deck.filter((c) => c.rank === "Q").every((c) => c.value === 12)).toBe(true);
    expect(deck.filter((c) => c.rank === "K").every((c) => c.value === 13)).toBe(true);
  });

  it("数字カードは額面通りの値を持つ", () => {
    const deck = createDeck();
    for (let n = 2; n <= 10; n++) {
      const cards = deck.filter((c) => c.rank === String(n));
      expect(cards.every((c) => c.value === n)).toBe(true);
    }
  });
});

describe("dealCards", () => {
  it("プレイヤーとCPUに26枚ずつ配る", () => {
    const { playerDeck, cpuDeck } = dealCards();
    expect(playerDeck).toHaveLength(26);
    expect(cpuDeck).toHaveLength(26);
  });

  it("全52枚が配られる", () => {
    const { playerDeck, cpuDeck } = dealCards();
    const allIds = [...playerDeck, ...cpuDeck].map((c) => c.id);
    expect(new Set(allIds).size).toBe(52);
  });
});

describe("compareCards", () => {
  it("プレイヤーのカードが大きければplayerを返す", () => {
    expect(compareCards(card("K"), card("Q"))).toBe("player");
  });

  it("CPUのカードが大きければcpuを返す", () => {
    expect(compareCards(card("5"), card("10"))).toBe("cpu");
  });

  it("同じ値ならwarを返す", () => {
    expect(compareCards(card("7", "spade"), card("7", "heart"))).toBe("war");
  });

  it("Aが最強", () => {
    expect(compareCards(card("A"), card("K"))).toBe("player");
  });

  it("2が最弱", () => {
    expect(compareCards(card("2"), card("3"))).toBe("cpu");
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

describe("SUIT_COLORS", () => {
  it("各スートの色が正しい", () => {
    expect(SUIT_COLORS.spade).toBe("black");
    expect(SUIT_COLORS.heart).toBe("red");
    expect(SUIT_COLORS.diamond).toBe("red");
    expect(SUIT_COLORS.club).toBe("black");
  });
});
