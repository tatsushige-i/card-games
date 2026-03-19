import { describe, it, expect } from "vitest";
import {
  shuffle,
  createDeck,
  buildTableau,
  isValidPair,
  isSoloRemovable,
  getRemainingTableauCards,
  getTotalRemainingCards,
  isStuck,
  refillTableau,
  getCardLabel,
  SUIT_SYMBOLS,
  TABLEAU_SIZE,
  TARGET_SUM,
  SOLO_REMOVE_VALUE,
} from "../ten-play-cards";
import type { PlayingCard } from "@/types/ten-play";

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
  it("TABLEAU_SIZEは13", () => {
    expect(TABLEAU_SIZE).toBe(13);
  });

  it("TARGET_SUMは10", () => {
    expect(TARGET_SUM).toBe(10);
  });

  it("SOLO_REMOVE_VALUEは10", () => {
    expect(SOLO_REMOVE_VALUE).toBe(10);
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

describe("buildTableau", () => {
  it("13スロットのタブローを生成する", () => {
    const deck = createDeck();
    const { tableau } = buildTableau(deck);
    expect(tableau).toHaveLength(TABLEAU_SIZE);
  });

  it("山札は39枚", () => {
    const deck = createDeck();
    const { stock } = buildTableau(deck);
    expect(stock).toHaveLength(39);
  });

  it("タブローにnullは含まれない（初期状態）", () => {
    const deck = createDeck();
    const { tableau } = buildTableau(deck);
    expect(tableau.every((c) => c !== null)).toBe(true);
  });
});

describe("isValidPair", () => {
  it("合計10の数札ペアはtrue", () => {
    expect(isValidPair(card("A"), card("9"))).toBe(true);
    expect(isValidPair(card("2"), card("8"))).toBe(true);
    expect(isValidPair(card("3"), card("7"))).toBe(true);
    expect(isValidPair(card("4"), card("6"))).toBe(true);
  });

  it("合計10でない数札ペアはfalse", () => {
    expect(isValidPair(card("A"), card("2"))).toBe(false);
    expect(isValidPair(card("3"), card("8"))).toBe(false);
    expect(isValidPair(card("5"), card("6"))).toBe(false);
  });

  it("同ランク絵札ペアはtrue", () => {
    expect(isValidPair(card("J", "spade"), card("J", "heart"))).toBe(true);
    expect(isValidPair(card("Q", "spade"), card("Q", "heart"))).toBe(true);
    expect(isValidPair(card("K", "spade"), card("K", "heart"))).toBe(true);
  });

  it("異ランク絵札ペアはfalse", () => {
    expect(isValidPair(card("J"), card("Q"))).toBe(false);
    expect(isValidPair(card("J"), card("K"))).toBe(false);
    expect(isValidPair(card("Q"), card("K"))).toBe(false);
  });

  it("数札と絵札の組み合わせはfalse", () => {
    expect(isValidPair(card("A"), card("J"))).toBe(false);
    expect(isValidPair(card("3"), card("K"))).toBe(false);
  });

  it("5+5=10はtrue", () => {
    expect(isValidPair(card("5", "spade"), card("5", "heart"))).toBe(true);
  });
});

describe("isSoloRemovable", () => {
  it("10のカードはtrue", () => {
    expect(isSoloRemovable(card("10"))).toBe(true);
  });

  it("10以外のカードはfalse", () => {
    expect(isSoloRemovable(card("A"))).toBe(false);
    expect(isSoloRemovable(card("9"))).toBe(false);
    expect(isSoloRemovable(card("J"))).toBe(false);
    expect(isSoloRemovable(card("K"))).toBe(false);
  });
});

describe("getRemainingTableauCards", () => {
  it("非nullカード数を返す", () => {
    const tableau: (PlayingCard | null)[] = [card("A"), null, card("2"), null];
    expect(getRemainingTableauCards(tableau)).toBe(2);
  });

  it("すべてnullなら0", () => {
    expect(getRemainingTableauCards([null, null, null])).toBe(0);
  });
});

describe("getTotalRemainingCards", () => {
  it("タブローと山札の合計を返す", () => {
    const tableau: (PlayingCard | null)[] = [card("A"), null, card("2")];
    const stock = [card("3"), card("4")];
    expect(getTotalRemainingCards(tableau, stock)).toBe(4);
  });
});

describe("isStuck", () => {
  it("10のカードがあれば手詰まりでない", () => {
    const tableau: (PlayingCard | null)[] = [card("10"), card("K")];
    expect(isStuck(tableau)).toBe(false);
  });

  it("有効な数札ペアがあれば手詰まりでない", () => {
    const tableau: (PlayingCard | null)[] = [card("3"), card("7")];
    expect(isStuck(tableau)).toBe(false);
  });

  it("同ランク絵札ペアがあれば手詰まりでない", () => {
    const tableau: (PlayingCard | null)[] = [
      card("J", "spade", 1),
      card("J", "heart", 2),
    ];
    expect(isStuck(tableau)).toBe(false);
  });

  it("有効な手がなければ手詰まり", () => {
    const tableau: (PlayingCard | null)[] = [
      card("J", "spade", 1),
      card("Q", "heart", 2),
      card("K", "diamond", 3),
    ];
    expect(isStuck(tableau)).toBe(true);
  });

  it("nullスロットは無視する", () => {
    const tableau: (PlayingCard | null)[] = [null, card("J", "spade", 1), null];
    expect(isStuck(tableau)).toBe(true);
  });

  it("空のタブローは手詰まり（クリア判定済み前提）", () => {
    expect(isStuck([null, null])).toBe(true);
  });
});

describe("refillTableau", () => {
  it("空きスロットに山札から補充する", () => {
    const tableau: (PlayingCard | null)[] = [card("A", "spade", 1), null, null];
    const stock = [card("2", "heart", 2), card("3", "heart", 3)];
    const result = refillTableau(tableau, stock);
    expect(result.tableau[0]?.id).toBe(1);
    expect(result.tableau[1]?.id).toBe(2);
    expect(result.tableau[2]?.id).toBe(3);
    expect(result.stock).toHaveLength(0);
  });

  it("山札が足りなければ補充できる分だけ補充する", () => {
    const tableau: (PlayingCard | null)[] = [null, null, null];
    const stock = [card("A", "heart", 1)];
    const result = refillTableau(tableau, stock);
    expect(result.tableau[0]?.id).toBe(1);
    expect(result.tableau[1]).toBeNull();
    expect(result.tableau[2]).toBeNull();
    expect(result.stock).toHaveLength(0);
  });

  it("空きがなければ何も変わらない", () => {
    const tableau: (PlayingCard | null)[] = [card("A", "spade", 1)];
    const stock = [card("2", "heart", 2)];
    const result = refillTableau(tableau, stock);
    expect(result.tableau[0]?.id).toBe(1);
    expect(result.stock).toHaveLength(1);
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
