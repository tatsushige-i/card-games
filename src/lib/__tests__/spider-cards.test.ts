import { describe, it, expect } from "vitest";
import {
  shuffle,
  createDeck,
  buildColumns,
  isValidSequence,
  canMoveToColumn,
  hasCompleteSequence,
  removeCompleteSequence,
  canDealRow,
  getCardLabel,
  COLUMN_COUNT,
  TARGET_SETS,
  COMPLETE_SEQUENCE_LENGTH,
  DECK_SIZE,
  TABLEAU_CARD_COUNT,
  STOCK_CARD_COUNT,
} from "../spider-cards";
import type { SpiderCard, Rank } from "@/types/spider";

/** テスト用カード生成ヘルパー */
function card(
  rank: Rank,
  faceUp: boolean = true,
  id: number = 0
): SpiderCard {
  const values: Record<string, number> = {
    A: 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7,
    "8": 8, "9": 9, "10": 10, J: 11, Q: 12, K: 13,
  };
  return { id, suit: "spade", rank, value: values[rank], faceUp };
}

describe("定数", () => {
  it("COLUMN_COUNTは10", () => {
    expect(COLUMN_COUNT).toBe(10);
  });

  it("TARGET_SETSは8", () => {
    expect(TARGET_SETS).toBe(8);
  });

  it("COMPLETE_SEQUENCE_LENGTHは13", () => {
    expect(COMPLETE_SEQUENCE_LENGTH).toBe(13);
  });

  it("DECK_SIZEは104", () => {
    expect(DECK_SIZE).toBe(104);
  });

  it("TABLEAU_CARD_COUNTは54", () => {
    expect(TABLEAU_CARD_COUNT).toBe(54);
  });

  it("STOCK_CARD_COUNTは50", () => {
    expect(STOCK_CARD_COUNT).toBe(50);
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
  it("104枚のカードを生成する", () => {
    const deck = createDeck();
    expect(deck).toHaveLength(DECK_SIZE);
  });

  it("すべてのカードがユニークなIDを持つ", () => {
    const deck = createDeck();
    const ids = new Set(deck.map((c) => c.id));
    expect(ids.size).toBe(DECK_SIZE);
  });

  it("すべてスペードである", () => {
    const deck = createDeck();
    expect(deck.every((c) => c.suit === "spade")).toBe(true);
  });

  it("各ランクが8枚ずつある", () => {
    const deck = createDeck();
    const ranks: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    for (const rank of ranks) {
      expect(deck.filter((c) => c.rank === rank)).toHaveLength(8);
    }
  });

  it("すべてのカードが裏向きで生成される", () => {
    const deck = createDeck();
    expect(deck.every((c) => !c.faceUp)).toBe(true);
  });
});

describe("buildColumns", () => {
  it("10列を生成する", () => {
    const deck = createDeck();
    const { columns } = buildColumns(deck);
    expect(columns).toHaveLength(COLUMN_COUNT);
  });

  it("左4列は6枚、右6列は5枚", () => {
    const deck = createDeck();
    const { columns } = buildColumns(deck);
    for (let i = 0; i < 4; i++) {
      expect(columns[i]).toHaveLength(6);
    }
    for (let i = 4; i < 10; i++) {
      expect(columns[i]).toHaveLength(5);
    }
  });

  it("各列の最下段のみ表向き", () => {
    const deck = createDeck();
    const { columns } = buildColumns(deck);
    for (const col of columns) {
      for (let i = 0; i < col.length - 1; i++) {
        expect(col[i].faceUp).toBe(false);
      }
      expect(col[col.length - 1].faceUp).toBe(true);
    }
  });

  it("残り50枚を山札として返す", () => {
    const deck = createDeck();
    const { stock } = buildColumns(deck);
    expect(stock).toHaveLength(STOCK_CARD_COUNT);
  });
});

describe("isValidSequence", () => {
  it("表向き連続降順のシーケンスはtrue", () => {
    const column = [card("5"), card("4"), card("3"), card("2")];
    expect(isValidSequence(column, 0)).toBe(true);
  });

  it("途中から開始しても有効ならtrue", () => {
    const column = [card("K"), card("5"), card("4"), card("3")];
    expect(isValidSequence(column, 1)).toBe(true);
  });

  it("裏向きのカードがあればfalse", () => {
    const column = [card("5", false), card("4"), card("3")];
    expect(isValidSequence(column, 0)).toBe(false);
  });

  it("降順でなければfalse", () => {
    const column = [card("3"), card("5"), card("4")];
    expect(isValidSequence(column, 0)).toBe(false);
  });

  it("1枚だけなら常にtrue（表向きの場合）", () => {
    const column = [card("A")];
    expect(isValidSequence(column, 0)).toBe(true);
  });
});

describe("canMoveToColumn", () => {
  it("空列には何でも移動できる", () => {
    expect(canMoveToColumn([card("5")], [])).toBe(true);
  });

  it("移動先末尾の値が移動元先頭+1ならtrue", () => {
    expect(canMoveToColumn([card("5")], [card("6")])).toBe(true);
  });

  it("値が合わなければfalse", () => {
    expect(canMoveToColumn([card("5")], [card("7")])).toBe(false);
  });

  it("複数枚移動でも先頭カードのみ判定", () => {
    expect(canMoveToColumn([card("5"), card("4"), card("3")], [card("6")])).toBe(true);
  });
});

describe("hasCompleteSequence", () => {
  it("K〜Aの13枚連続があればtrue", () => {
    const column: SpiderCard[] = [];
    for (let v = 13; v >= 1; v--) {
      const ranks: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
      column.push(card(ranks[v - 1], true, v));
    }
    expect(hasCompleteSequence(column)).toBe(true);
  });

  it("13枚未満ならfalse", () => {
    const column = [card("K"), card("Q"), card("J")];
    expect(hasCompleteSequence(column)).toBe(false);
  });

  it("裏向きカードが混ざっていればfalse", () => {
    const column: SpiderCard[] = [];
    const ranks: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    for (let v = 13; v >= 1; v--) {
      column.push(card(ranks[v - 1], v !== 7, v));
    }
    expect(hasCompleteSequence(column)).toBe(false);
  });
});

describe("removeCompleteSequence", () => {
  it("完成列がなければそのまま返す", () => {
    const column = [card("K"), card("Q")];
    const { newColumn, removed } = removeCompleteSequence(column);
    expect(removed).toBe(false);
    expect(newColumn).toBe(column);
  });

  it("完成列を除去する", () => {
    const ranks: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    const prefix = [card("3", true, 100)];
    const sequence: SpiderCard[] = [];
    for (let v = 13; v >= 1; v--) {
      sequence.push(card(ranks[v - 1], true, v));
    }
    const column = [...prefix, ...sequence];
    const { newColumn, removed } = removeCompleteSequence(column);
    expect(removed).toBe(true);
    expect(newColumn).toHaveLength(1);
    expect(newColumn[0].id).toBe(100);
  });

  it("除去後に裏向きカードが末尾にあれば表にする", () => {
    const ranks: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    const prefix = [card("3", false, 100)];
    const sequence: SpiderCard[] = [];
    for (let v = 13; v >= 1; v--) {
      sequence.push(card(ranks[v - 1], true, v));
    }
    const column = [...prefix, ...sequence];
    const { newColumn } = removeCompleteSequence(column);
    expect(newColumn[0].faceUp).toBe(true);
  });
});

describe("canDealRow", () => {
  it("全列にカードがあり山札が列数以上あればtrue", () => {
    const columns = Array.from({ length: 10 }, (_, i) => [card("A", true, i)]);
    const stock = Array.from({ length: 10 }, (_, i) => card("2", false, 100 + i));
    expect(canDealRow(columns, stock)).toBe(true);
  });

  it("空列があればfalse", () => {
    const columns = Array.from({ length: 10 }, (_, i) =>
      i === 0 ? [] : [card("A", true, i)]
    );
    const stock = Array.from({ length: 10 }, (_, i) => card("2", false, 100 + i));
    expect(canDealRow(columns, stock)).toBe(false);
  });

  it("山札が空ならfalse", () => {
    const columns = Array.from({ length: 10 }, (_, i) => [card("A", true, i)]);
    expect(canDealRow(columns, [])).toBe(false);
  });
});

describe("getCardLabel", () => {
  it("表向きカードのラベルを返す", () => {
    expect(getCardLabel(card("A"))).toBe("♠A");
    expect(getCardLabel(card("10"))).toBe("♠10");
    expect(getCardLabel(card("K"))).toBe("♠K");
  });

  it("裏向きカードは「裏向きのカード」を返す", () => {
    expect(getCardLabel(card("A", false))).toBe("裏向きのカード");
  });
});
