import { describe, it, expect } from "vitest";
import { spiderReducer, initialSpiderState } from "../spider-reducer";
import type { SpiderState, SpiderCard, Rank } from "@/types/spider";

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

/** テスト用の固定デッキを生成する（104枚） */
function createTestDeck(): SpiderCard[] {
  const ranks: Rank[] = [
    "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K",
  ];
  const cards: SpiderCard[] = [];
  let id = 0;
  for (let set = 0; set < 8; set++) {
    for (const rank of ranks) {
      cards.push(card(rank, false, id++));
    }
  }
  return cards;
}

describe("initialSpiderState", () => {
  it("初期状態が正しい", () => {
    expect(initialSpiderState.phase).toBe("idle");
    expect(initialSpiderState.columns).toEqual([]);
    expect(initialSpiderState.stock).toEqual([]);
    expect(initialSpiderState.completedSets).toBe(0);
    expect(initialSpiderState.moves).toBe(0);
    expect(initialSpiderState.result).toBeNull();
    expect(initialSpiderState.elapsedTime).toBe(0);
    expect(initialSpiderState.selectedColumn).toBeNull();
    expect(initialSpiderState.selectedCardIndex).toBeNull();
    expect(initialSpiderState.isNewBestMoves).toBe(false);
    expect(initialSpiderState.isNewBestTime).toBe(false);
    expect(initialSpiderState.dialogOpen).toBe(false);
  });
});

describe("START_GAME", () => {
  it("10列にカードを配置する", () => {
    const deck = createTestDeck();
    const state = spiderReducer(initialSpiderState, { type: "START_GAME", deck });
    expect(state.columns).toHaveLength(10);
  });

  it("左4列は6枚、右6列は5枚", () => {
    const deck = createTestDeck();
    const state = spiderReducer(initialSpiderState, { type: "START_GAME", deck });
    for (let i = 0; i < 4; i++) {
      expect(state.columns[i]).toHaveLength(6);
    }
    for (let i = 4; i < 10; i++) {
      expect(state.columns[i]).toHaveLength(5);
    }
  });

  it("山札は50枚", () => {
    const deck = createTestDeck();
    const state = spiderReducer(initialSpiderState, { type: "START_GAME", deck });
    expect(state.stock).toHaveLength(50);
  });

  it("playingフェーズになる", () => {
    const deck = createTestDeck();
    const state = spiderReducer(initialSpiderState, { type: "START_GAME", deck });
    expect(state.phase).toBe("playing");
  });
});

describe("SELECT_CARD", () => {
  it("表向きで有効なシーケンスの先頭カードを選択できる", () => {
    const state: SpiderState = {
      ...initialSpiderState,
      phase: "playing",
      columns: [[card("5", true, 1), card("4", true, 2), card("3", true, 3)]],
    };
    const newState = spiderReducer(state, { type: "SELECT_CARD", columnIndex: 0, cardIndex: 1 });
    expect(newState.selectedColumn).toBe(0);
    expect(newState.selectedCardIndex).toBe(1);
  });

  it("裏向きカードは選択できない", () => {
    const state: SpiderState = {
      ...initialSpiderState,
      phase: "playing",
      columns: [[card("5", false, 1)]],
    };
    const newState = spiderReducer(state, { type: "SELECT_CARD", columnIndex: 0, cardIndex: 0 });
    expect(newState.selectedColumn).toBeNull();
  });

  it("有効なシーケンスでなければ選択できない", () => {
    const state: SpiderState = {
      ...initialSpiderState,
      phase: "playing",
      columns: [[card("3", true, 1), card("5", true, 2), card("4", true, 3)]],
    };
    // インデックス0からだと3,5,4で降順でない
    const newState = spiderReducer(state, { type: "SELECT_CARD", columnIndex: 0, cardIndex: 0 });
    expect(newState.selectedColumn).toBeNull();
  });

  it("playing以外では何もしない", () => {
    const state: SpiderState = {
      ...initialSpiderState,
      phase: "idle",
      columns: [[card("5", true, 1)]],
    };
    const newState = spiderReducer(state, { type: "SELECT_CARD", columnIndex: 0, cardIndex: 0 });
    expect(newState.selectedColumn).toBeNull();
  });
});

describe("MOVE_CARDS", () => {
  it("有効な移動先にカードを移動する", () => {
    const state: SpiderState = {
      ...initialSpiderState,
      phase: "playing",
      columns: [
        [card("5", true, 1), card("4", true, 2)],
        [card("6", true, 3)],
      ],
      selectedColumn: 0,
      selectedCardIndex: 0,
    };
    const newState = spiderReducer(state, { type: "MOVE_CARDS", targetColumn: 1 });
    expect(newState.columns[0]).toHaveLength(0);
    expect(newState.columns[1]).toHaveLength(3);
    expect(newState.moves).toBe(1);
    expect(newState.selectedColumn).toBeNull();
  });

  it("無効な移動先では選択解除のみ", () => {
    const state: SpiderState = {
      ...initialSpiderState,
      phase: "playing",
      columns: [
        [card("5", true, 1)],
        [card("3", true, 2)],
      ],
      selectedColumn: 0,
      selectedCardIndex: 0,
    };
    const newState = spiderReducer(state, { type: "MOVE_CARDS", targetColumn: 1 });
    expect(newState.columns[0]).toHaveLength(1);
    expect(newState.columns[1]).toHaveLength(1);
    expect(newState.selectedColumn).toBeNull();
  });

  it("空列にカードを移動できる", () => {
    const state: SpiderState = {
      ...initialSpiderState,
      phase: "playing",
      columns: [
        [card("K", true, 1)],
        [],
      ],
      selectedColumn: 0,
      selectedCardIndex: 0,
    };
    const newState = spiderReducer(state, { type: "MOVE_CARDS", targetColumn: 1 });
    expect(newState.columns[0]).toHaveLength(0);
    expect(newState.columns[1]).toHaveLength(1);
  });

  it("移動元の新しい末尾カードを表にする", () => {
    const state: SpiderState = {
      ...initialSpiderState,
      phase: "playing",
      columns: [
        [card("K", false, 1), card("5", true, 2)],
        [card("6", true, 3)],
      ],
      selectedColumn: 0,
      selectedCardIndex: 1,
    };
    const newState = spiderReducer(state, { type: "MOVE_CARDS", targetColumn: 1 });
    expect(newState.columns[0][0].faceUp).toBe(true);
  });

  it("同じ列への移動は選択解除のみ", () => {
    const state: SpiderState = {
      ...initialSpiderState,
      phase: "playing",
      columns: [[card("5", true, 1), card("4", true, 2)]],
      selectedColumn: 0,
      selectedCardIndex: 0,
    };
    const newState = spiderReducer(state, { type: "MOVE_CARDS", targetColumn: 0 });
    expect(newState.selectedColumn).toBeNull();
    expect(newState.columns[0]).toHaveLength(2);
  });

  it("移動後に完成列があれば自動除去する", () => {
    // 列1にK〜2の12枚、列0にAを配置して移動
    const ranks: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    const col1: SpiderCard[] = [];
    for (let v = 13; v >= 2; v--) {
      col1.push(card(ranks[v - 1], true, v));
    }
    const state: SpiderState = {
      ...initialSpiderState,
      phase: "playing",
      columns: [
        [card("A", true, 100)],
        col1,
      ],
      selectedColumn: 0,
      selectedCardIndex: 0,
    };
    const newState = spiderReducer(state, { type: "MOVE_CARDS", targetColumn: 1 });
    expect(newState.completedSets).toBe(1);
    expect(newState.columns[1]).toHaveLength(0);
  });

  it("選択が空の場合は何もしない", () => {
    const state: SpiderState = {
      ...initialSpiderState,
      phase: "playing",
      columns: [[card("5", true, 1)]],
      selectedColumn: null,
      selectedCardIndex: null,
    };
    const newState = spiderReducer(state, { type: "MOVE_CARDS", targetColumn: 0 });
    expect(newState).toEqual(state);
  });
});

describe("DEAL_ROW", () => {
  it("10枚を各列に1枚ずつ表向きで追加する", () => {
    const columns = Array.from({ length: 10 }, (_, i) => [card("A", true, i)]);
    const stock = Array.from({ length: 10 }, (_, i) => card("2", false, 100 + i));
    const state: SpiderState = {
      ...initialSpiderState,
      phase: "playing",
      columns,
      stock,
    };
    const newState = spiderReducer(state, { type: "DEAL_ROW" });
    for (const col of newState.columns) {
      expect(col).toHaveLength(2);
      expect(col[1].faceUp).toBe(true);
    }
    expect(newState.stock).toHaveLength(0);
    expect(newState.moves).toBe(1);
  });

  it("空列がある場合は配布できない", () => {
    const columns = Array.from({ length: 10 }, (_, i) =>
      i === 0 ? [] : [card("A", true, i)]
    );
    const stock = Array.from({ length: 10 }, (_, i) => card("2", false, 100 + i));
    const state: SpiderState = {
      ...initialSpiderState,
      phase: "playing",
      columns,
      stock,
    };
    const newState = spiderReducer(state, { type: "DEAL_ROW" });
    expect(newState).toEqual(state);
  });

  it("山札が空なら配布できない", () => {
    const columns = Array.from({ length: 10 }, (_, i) => [card("A", true, i)]);
    const state: SpiderState = {
      ...initialSpiderState,
      phase: "playing",
      columns,
      stock: [],
    };
    const newState = spiderReducer(state, { type: "DEAL_ROW" });
    expect(newState).toEqual(state);
  });

  it("playing以外では何もしない", () => {
    const state: SpiderState = {
      ...initialSpiderState,
      phase: "idle",
    };
    const newState = spiderReducer(state, { type: "DEAL_ROW" });
    expect(newState).toEqual(state);
  });
});

describe("DESELECT", () => {
  it("選択を解除する", () => {
    const state: SpiderState = {
      ...initialSpiderState,
      selectedColumn: 0,
      selectedCardIndex: 1,
    };
    const newState = spiderReducer(state, { type: "DESELECT" });
    expect(newState.selectedColumn).toBeNull();
    expect(newState.selectedCardIndex).toBeNull();
  });
});

describe("TICK", () => {
  it("playingフェーズで経過時間をインクリメントする", () => {
    const state: SpiderState = {
      ...initialSpiderState,
      phase: "playing",
      elapsedTime: 10,
    };
    const newState = spiderReducer(state, { type: "TICK" });
    expect(newState.elapsedTime).toBe(11);
  });

  it("playing以外では何もしない", () => {
    const state: SpiderState = {
      ...initialSpiderState,
      phase: "idle",
      elapsedTime: 10,
    };
    const newState = spiderReducer(state, { type: "TICK" });
    expect(newState.elapsedTime).toBe(10);
  });
});

describe("GIVE_UP", () => {
  it("gameOverフェーズに遷移する", () => {
    const state: SpiderState = {
      ...initialSpiderState,
      phase: "playing",
    };
    const newState = spiderReducer(state, { type: "GIVE_UP" });
    expect(newState.phase).toBe("gameOver");
    expect(newState.result).toBe("lose");
    expect(newState.dialogOpen).toBe(true);
  });

  it("playing以外では何もしない", () => {
    const state: SpiderState = {
      ...initialSpiderState,
      phase: "idle",
    };
    const newState = spiderReducer(state, { type: "GIVE_UP" });
    expect(newState).toEqual(state);
  });
});

describe("SET_NEW_BEST", () => {
  it("isNewBestMoves・isNewBestTimeを設定する", () => {
    const state = spiderReducer(initialSpiderState, {
      type: "SET_NEW_BEST",
      isNewBestMoves: true,
      isNewBestTime: false,
    });
    expect(state.isNewBestMoves).toBe(true);
    expect(state.isNewBestTime).toBe(false);
  });
});

describe("DISMISS_DIALOG", () => {
  it("ダイアログを閉じる", () => {
    const state: SpiderState = { ...initialSpiderState, dialogOpen: true };
    const newState = spiderReducer(state, { type: "DISMISS_DIALOG" });
    expect(newState.dialogOpen).toBe(false);
  });
});

describe("RESTART", () => {
  it("初期状態に戻る", () => {
    const state: SpiderState = {
      ...initialSpiderState,
      phase: "playing",
      moves: 50,
      elapsedTime: 120,
      completedSets: 3,
    };
    const newState = spiderReducer(state, { type: "RESTART" });
    expect(newState).toEqual(initialSpiderState);
  });
});
