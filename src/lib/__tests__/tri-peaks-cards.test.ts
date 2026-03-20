import { describe, it, expect } from "vitest";
import {
  shuffle,
  createDeck,
  buildTableau,
  getChildren,
  getParents,
  isExposed,
  getExposedCards,
  isAdjacentValue,
  isStuck,
  getCardLabel,
  TABLEAU_CARD_COUNT,
  STOCK_CARD_COUNT,
  ROW_SIZES,
  SUIT_SYMBOLS,
} from "../tri-peaks-cards";
import type { PlayingCard, TriPeaksCard } from "@/types/tri-peaks";

describe("定数", () => {
  it("タブローのカード数は28枚", () => {
    expect(TABLEAU_CARD_COUNT).toBe(28);
  });

  it("山札のカード数は24枚", () => {
    expect(STOCK_CARD_COUNT).toBe(24);
  });

  it("各行のカード数は3, 6, 9, 10", () => {
    expect(ROW_SIZES).toEqual([3, 6, 9, 10]);
  });

  it("ROW_SIZESの合計はTABLEAU_CARD_COUNT", () => {
    const sum = ROW_SIZES.reduce((a, b) => a + b, 0);
    expect(sum).toBe(TABLEAU_CARD_COUNT);
  });
});

describe("shuffle", () => {
  it("元の配列を変更しない", () => {
    const original = [1, 2, 3, 4, 5];
    const copy = [...original];
    shuffle(original);
    expect(original).toEqual(copy);
  });

  it("同じ要素を含む配列を返す", () => {
    const original = [1, 2, 3, 4, 5];
    const shuffled = shuffle(original);
    expect(shuffled.sort()).toEqual(original.sort());
  });

  it("同じ長さの配列を返す", () => {
    const original = [1, 2, 3, 4, 5];
    expect(shuffle(original)).toHaveLength(5);
  });
});

describe("createDeck", () => {
  it("52枚のカードを生成する", () => {
    const deck = createDeck();
    expect(deck).toHaveLength(52);
  });

  it("全てのカードがユニークなIDを持つ", () => {
    const deck = createDeck();
    const ids = new Set(deck.map((c) => c.id));
    expect(ids.size).toBe(52);
  });

  it("各スート13枚ずつ含む", () => {
    const deck = createDeck();
    const suitCounts = { spade: 0, heart: 0, diamond: 0, club: 0 };
    deck.forEach((c) => suitCounts[c.suit]++);
    expect(suitCounts.spade).toBe(13);
    expect(suitCounts.heart).toBe(13);
    expect(suitCounts.diamond).toBe(13);
    expect(suitCounts.club).toBe(13);
  });

  it("Aの値は1、Kの値は13", () => {
    const deck = createDeck();
    const aces = deck.filter((c) => c.rank === "A");
    const kings = deck.filter((c) => c.rank === "K");
    aces.forEach((c) => expect(c.value).toBe(1));
    kings.forEach((c) => expect(c.value).toBe(13));
  });
});

describe("buildTableau", () => {
  it("タブロー28枚と山札24枚に分割する", () => {
    const deck = createDeck();
    const { tableau, stock } = buildTableau(deck);
    expect(tableau).toHaveLength(TABLEAU_CARD_COUNT);
    expect(stock).toHaveLength(STOCK_CARD_COUNT);
  });

  it("各行のカード数が正しい", () => {
    const deck = createDeck();
    const { tableau } = buildTableau(deck);
    for (let row = 0; row < 4; row++) {
      const rowCards = tableau.filter((c) => c.row === row);
      expect(rowCards).toHaveLength(ROW_SIZES[row]);
    }
  });

  it("全てのカードがremoved=falseで初期化される", () => {
    const deck = createDeck();
    const { tableau } = buildTableau(deck);
    tableau.forEach((c) => expect(c.removed).toBe(false));
  });

  it("各カードのposが行内で0から連番", () => {
    const deck = createDeck();
    const { tableau } = buildTableau(deck);
    for (let row = 0; row < 4; row++) {
      const rowCards = tableau.filter((c) => c.row === row);
      const positions = rowCards.map((c) => c.pos).sort((a, b) => a - b);
      expect(positions).toEqual(
        Array.from({ length: ROW_SIZES[row] }, (_, i) => i)
      );
    }
  });
});

describe("getChildren", () => {
  it("Row 0の子はRow 1の対応位置", () => {
    expect(getChildren(0, 0)).toEqual([0, 1]);
    expect(getChildren(0, 1)).toEqual([2, 3]);
    expect(getChildren(0, 2)).toEqual([4, 5]);
  });

  it("Row 1の子はRow 2の対応位置", () => {
    expect(getChildren(1, 0)).toEqual([0, 1]);
    expect(getChildren(1, 1)).toEqual([1, 2]);
    expect(getChildren(1, 2)).toEqual([3, 4]);
    expect(getChildren(1, 3)).toEqual([4, 5]);
    expect(getChildren(1, 4)).toEqual([6, 7]);
    expect(getChildren(1, 5)).toEqual([7, 8]);
  });

  it("Row 2の子はRow 3の対応位置", () => {
    expect(getChildren(2, 0)).toEqual([0, 1]);
    expect(getChildren(2, 4)).toEqual([4, 5]);
    expect(getChildren(2, 8)).toEqual([8, 9]);
  });

  it("Row 3は子を持たない", () => {
    expect(getChildren(3, 0)).toBeNull();
    expect(getChildren(3, 9)).toBeNull();
  });
});

describe("getParents", () => {
  it("Row 0は親を持たない", () => {
    expect(getParents(0, 0)).toEqual([]);
    expect(getParents(0, 2)).toEqual([]);
  });

  it("Row 1の親はRow 0の対応位置", () => {
    expect(getParents(1, 0)).toEqual([{ row: 0, pos: 0 }]);
    expect(getParents(1, 1)).toEqual([{ row: 0, pos: 0 }]);
    expect(getParents(1, 2)).toEqual([{ row: 0, pos: 1 }]);
    expect(getParents(1, 3)).toEqual([{ row: 0, pos: 1 }]);
    expect(getParents(1, 4)).toEqual([{ row: 0, pos: 2 }]);
    expect(getParents(1, 5)).toEqual([{ row: 0, pos: 2 }]);
  });

  it("Row 2の共有カードは2つの親を持つ", () => {
    // pos 1は Row 1 pos 0 と pos 1 の子
    const parents = getParents(2, 1);
    expect(parents).toHaveLength(2);
    expect(parents).toContainEqual({ row: 1, pos: 0 });
    expect(parents).toContainEqual({ row: 1, pos: 1 });
  });

  it("Row 2の端カードは1つの親を持つ", () => {
    expect(getParents(2, 0)).toEqual([{ row: 1, pos: 0 }]);
    expect(getParents(2, 8)).toEqual([{ row: 1, pos: 5 }]);
  });

  it("Row 3の共有カードは2つの親を持つ", () => {
    const parents = getParents(3, 1);
    expect(parents).toHaveLength(2);
    expect(parents).toContainEqual({ row: 2, pos: 0 });
    expect(parents).toContainEqual({ row: 2, pos: 1 });
  });

  it("Row 3の端カードは1つの親を持つ", () => {
    expect(getParents(3, 0)).toEqual([{ row: 2, pos: 0 }]);
    expect(getParents(3, 9)).toEqual([{ row: 2, pos: 8 }]);
  });
});

describe("isExposed", () => {
  /** テスト用のタブローを作成するヘルパー */
  function makeTableau(
    removedPositions: Array<{ row: number; pos: number }> = []
  ): TriPeaksCard[] {
    const deck = createDeck();
    const { tableau } = buildTableau(deck);
    for (const { row, pos } of removedPositions) {
      const card = tableau.find((c) => c.row === row && c.pos === pos);
      if (card) card.removed = true;
    }
    return tableau;
  }

  it("Row 3のカードは常に露出（子がないため）", () => {
    const tableau = makeTableau();
    const row3Card = tableau.find((c) => c.row === 3 && c.pos === 0)!;
    expect(isExposed(row3Card, tableau)).toBe(true);
  });

  it("Row 0のカードは子が残っていると非露出", () => {
    const tableau = makeTableau();
    const peakCard = tableau.find((c) => c.row === 0 && c.pos === 0)!;
    expect(isExposed(peakCard, tableau)).toBe(false);
  });

  it("Row 0のカードは両方の子（Row 1）が除去されると露出", () => {
    const tableau = makeTableau([
      { row: 1, pos: 0 },
      { row: 1, pos: 1 },
    ]);
    const peakCard = tableau.find((c) => c.row === 0 && c.pos === 0)!;
    expect(isExposed(peakCard, tableau)).toBe(true);
  });

  it("Row 2のカードは両方の子（Row 3）が除去されると露出", () => {
    // Row 2 pos 0 の子は Row 3 pos 0 と pos 1
    const tableau = makeTableau([
      { row: 3, pos: 0 },
      { row: 3, pos: 1 },
    ]);
    const card = tableau.find((c) => c.row === 2 && c.pos === 0)!;
    expect(isExposed(card, tableau)).toBe(true);
  });

  it("Row 2のカードは片方の子しか除去されていないと非露出", () => {
    const tableau = makeTableau([{ row: 3, pos: 0 }]);
    const card = tableau.find((c) => c.row === 2 && c.pos === 0)!;
    expect(isExposed(card, tableau)).toBe(false);
  });

  it("除去済みカードは露出とみなさない", () => {
    const tableau = makeTableau([{ row: 3, pos: 0 }]);
    const card = tableau.find((c) => c.row === 3 && c.pos === 0)!;
    expect(isExposed(card, tableau)).toBe(false);
  });
});

describe("getExposedCards", () => {
  it("初期状態ではRow 3（底段10枚）のみが露出", () => {
    const deck = createDeck();
    const { tableau } = buildTableau(deck);
    const exposed = getExposedCards(tableau);
    expect(exposed).toHaveLength(10);
    exposed.forEach((c) => {
      expect(c.row).toBe(3);
    });
  });
});

describe("isAdjacentValue", () => {
  it("差が1の場合はtrue", () => {
    expect(isAdjacentValue(1, 2)).toBe(true);
    expect(isAdjacentValue(5, 4)).toBe(true);
    expect(isAdjacentValue(12, 13)).toBe(true);
  });

  it("K(13)とA(1)のラップアラウンド", () => {
    expect(isAdjacentValue(13, 1)).toBe(true);
    expect(isAdjacentValue(1, 13)).toBe(true);
  });

  it("同値はfalse", () => {
    expect(isAdjacentValue(5, 5)).toBe(false);
  });

  it("差が2以上（かつ12でない）はfalse", () => {
    expect(isAdjacentValue(1, 3)).toBe(false);
    expect(isAdjacentValue(5, 10)).toBe(false);
  });
});

describe("isStuck", () => {
  const makeCard = (id: number, value: number): PlayingCard => ({
    id,
    suit: "spade",
    rank: "A",
    value,
  });

  const makeTableauCard = (
    id: number,
    value: number,
    row: number,
    pos: number,
    removed = false
  ): TriPeaksCard => ({
    ...makeCard(id, value),
    row,
    pos,
    removed,
  });

  it("山札が残っていれば手詰まりでない", () => {
    const tableau = [makeTableauCard(0, 5, 3, 0)];
    const stock = [makeCard(1, 10)];
    const waste = [makeCard(2, 2)];
    expect(isStuck(tableau, stock, waste)).toBe(false);
  });

  it("露出カードに±1のカードがあれば手詰まりでない", () => {
    const tableau = [makeTableauCard(0, 5, 3, 0)];
    const stock: PlayingCard[] = [];
    const waste = [makeCard(1, 4)];
    expect(isStuck(tableau, stock, waste)).toBe(false);
  });

  it("山札空＋±1のカードなし → 手詰まり", () => {
    const tableau = [makeTableauCard(0, 5, 3, 0)];
    const stock: PlayingCard[] = [];
    const waste = [makeCard(1, 10)];
    expect(isStuck(tableau, stock, waste)).toBe(true);
  });

  it("K↔Aラップアラウンドで手詰まり回避", () => {
    const tableau = [makeTableauCard(0, 13, 3, 0)];
    const stock: PlayingCard[] = [];
    const waste = [makeCard(1, 1)];
    expect(isStuck(tableau, stock, waste)).toBe(false);
  });
});

describe("getCardLabel", () => {
  it("スート記号とランクを結合する", () => {
    const card: PlayingCard = { id: 0, suit: "spade", rank: "A", value: 1 };
    expect(getCardLabel(card)).toBe(`${SUIT_SYMBOLS.spade}A`);
  });

  it("ハートのKの場合", () => {
    const card: PlayingCard = { id: 0, suit: "heart", rank: "K", value: 13 };
    expect(getCardLabel(card)).toBe("♥K");
  });
});
