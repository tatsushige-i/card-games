import { describe, it, expect } from "vitest";
import {
  pyramidReducer,
  initialPyramidState,
} from "../pyramid-reducer";
import type {
  PyramidState,
  PyramidCard,
  PlayingCard,
} from "@/types/pyramid";

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
function pCard(
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

/** テスト用のデッキ（52枚） */
function createTestDeck(): PlayingCard[] {
  const suits: PlayingCard["suit"][] = ["spade", "heart", "diamond", "club"];
  const ranks: PlayingCard["rank"][] = [
    "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K",
  ];
  const values: Record<string, number> = {
    A: 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7,
    "8": 8, "9": 9, "10": 10, J: 11, Q: 12, K: 13,
  };
  const deck: PlayingCard[] = [];
  let id = 0;
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ id: id++, suit, rank, value: values[rank] });
    }
  }
  return deck;
}

describe("initialPyramidState", () => {
  it("初期状態が正しい", () => {
    expect(initialPyramidState).toEqual({
      pyramid: [],
      stock: [],
      waste: [],
      selectedCardId: null,
      selectedSource: null,
      phase: "idle",
      result: null,
      elapsedTime: 0,
      removedPairs: 0,
      stockRecycles: 0,
      invalidPair: null,
      isNewBest: false,
      dialogOpen: false,
    });
  });
});

describe("START_GAME", () => {
  it("デッキからピラミッドと山札をセットアップする", () => {
    const deck = createTestDeck();
    const state = pyramidReducer(initialPyramidState, {
      type: "START_GAME",
      deck,
    });
    expect(state.pyramid).toHaveLength(28);
    expect(state.stock).toHaveLength(24);
    expect(state.waste).toHaveLength(0);
    expect(state.phase).toBe("playing");
    expect(state.elapsedTime).toBe(0);
  });
});

describe("SELECT_CARD", () => {
  it("K（値13）を選択すると単独除去される", () => {
    const state: PyramidState = {
      ...initialPyramidState,
      pyramid: [
        pCard("K", 6, 0, false, 1),
        pCard("A", 6, 1, false, 2),
      ],
      phase: "playing",
    };
    const next = pyramidReducer(state, {
      type: "SELECT_CARD",
      cardId: 1,
      source: "pyramid",
    });
    expect(next.pyramid[0].removed).toBe(true);
    expect(next.removedPairs).toBe(1);
    expect(next.phase).toBe("removing");
  });

  it("1枚目を選択するとselectedCardIdがセットされる", () => {
    const state: PyramidState = {
      ...initialPyramidState,
      pyramid: [pCard("6", 6, 0, false, 1)],
      phase: "playing",
    };
    const next = pyramidReducer(state, {
      type: "SELECT_CARD",
      cardId: 1,
      source: "pyramid",
    });
    expect(next.selectedCardId).toBe(1);
    expect(next.selectedSource).toBe("pyramid");
  });

  it("同じカードを再選択すると選択解除される", () => {
    const state: PyramidState = {
      ...initialPyramidState,
      pyramid: [pCard("6", 6, 0, false, 1)],
      phase: "playing",
      selectedCardId: 1,
      selectedSource: "pyramid",
    };
    const next = pyramidReducer(state, {
      type: "SELECT_CARD",
      cardId: 1,
      source: "pyramid",
    });
    expect(next.selectedCardId).toBeNull();
    expect(next.selectedSource).toBeNull();
  });

  it("合計13のペアで除去される（ピラミッド同士）", () => {
    const state: PyramidState = {
      ...initialPyramidState,
      pyramid: [
        pCard("6", 6, 0, false, 1),
        pCard("7", 6, 1, false, 2),
        pCard("A", 6, 2, false, 3),
      ],
      phase: "playing",
      selectedCardId: 1,
      selectedSource: "pyramid",
    };
    const next = pyramidReducer(state, {
      type: "SELECT_CARD",
      cardId: 2,
      source: "pyramid",
    });
    expect(next.pyramid[0].removed).toBe(true);
    expect(next.pyramid[1].removed).toBe(true);
    expect(next.removedPairs).toBe(1);
    expect(next.phase).toBe("removing");
  });

  it("合計13のペアで除去される（ピラミッド+捨て札）", () => {
    const state: PyramidState = {
      ...initialPyramidState,
      pyramid: [
        pCard("6", 6, 0, false, 1),
        pCard("A", 6, 1, false, 3),
      ],
      waste: [card("7", "heart", 2)],
      phase: "playing",
      selectedCardId: 2,
      selectedSource: "waste",
    };
    const next = pyramidReducer(state, {
      type: "SELECT_CARD",
      cardId: 1,
      source: "pyramid",
    });
    expect(next.pyramid[0].removed).toBe(true);
    expect(next.waste).toHaveLength(0);
    expect(next.removedPairs).toBe(1);
    expect(next.phase).toBe("removing");
  });

  it("合計13でない場合は不正ペアが設定される", () => {
    const state: PyramidState = {
      ...initialPyramidState,
      pyramid: [
        pCard("6", 6, 0, false, 1),
        pCard("5", 6, 1, false, 2),
      ],
      phase: "playing",
      selectedCardId: 1,
      selectedSource: "pyramid",
    };
    const next = pyramidReducer(state, {
      type: "SELECT_CARD",
      cardId: 2,
      source: "pyramid",
    });
    expect(next.invalidPair).toEqual([1, 2]);
    expect(next.selectedCardId).toBeNull();
  });

  it("露出していないカードは選択できない", () => {
    const state: PyramidState = {
      ...initialPyramidState,
      pyramid: [
        pCard("A", 0, 0, false, 1),
        pCard("2", 1, 0, false, 2),
        pCard("3", 1, 1, false, 3),
      ],
      phase: "playing",
    };
    const next = pyramidReducer(state, {
      type: "SELECT_CARD",
      cardId: 1,
      source: "pyramid",
    });
    expect(next.selectedCardId).toBeNull();
  });

  it("ピラミッド全除去でクリア勝利", () => {
    const state: PyramidState = {
      ...initialPyramidState,
      pyramid: [
        pCard("6", 6, 0, false, 1),
        pCard("7", 6, 1, false, 2),
      ],
      phase: "playing",
      selectedCardId: 1,
      selectedSource: "pyramid",
    };
    const next = pyramidReducer(state, {
      type: "SELECT_CARD",
      cardId: 2,
      source: "pyramid",
    });
    expect(next.phase).toBe("complete");
    expect(next.result).toBe("win");
    expect(next.dialogOpen).toBe(true);
  });

  it("捨て札のKも除去できる", () => {
    const state: PyramidState = {
      ...initialPyramidState,
      pyramid: [pCard("A", 6, 0, false, 1)],
      waste: [card("K", "heart", 2)],
      phase: "playing",
    };
    const next = pyramidReducer(state, {
      type: "SELECT_CARD",
      cardId: 2,
      source: "waste",
    });
    expect(next.waste).toHaveLength(0);
    expect(next.removedPairs).toBe(1);
  });
});

describe("DESELECT", () => {
  it("選択を解除する", () => {
    const state: PyramidState = {
      ...initialPyramidState,
      selectedCardId: 1,
      selectedSource: "pyramid",
    };
    const next = pyramidReducer(state, { type: "DESELECT" });
    expect(next.selectedCardId).toBeNull();
    expect(next.selectedSource).toBeNull();
  });
});

describe("DRAW_STOCK", () => {
  it("山札から1枚引いて捨て札に置く", () => {
    const state: PyramidState = {
      ...initialPyramidState,
      pyramid: [pCard("6", 6, 0, false, 10)],
      stock: [card("A", "spade", 1), card("2", "heart", 2)],
      waste: [],
      phase: "playing",
    };
    const next = pyramidReducer(state, { type: "DRAW_STOCK" });
    expect(next.stock).toHaveLength(1);
    expect(next.waste).toHaveLength(1);
    expect(next.waste[0].id).toBe(1);
  });

  it("山札が空なら何もしない", () => {
    const state: PyramidState = {
      ...initialPyramidState,
      stock: [],
      phase: "playing",
    };
    const next = pyramidReducer(state, { type: "DRAW_STOCK" });
    expect(next).toEqual(state);
  });

  it("選択中のカードを解除する", () => {
    const state: PyramidState = {
      ...initialPyramidState,
      pyramid: [pCard("6", 6, 0, false, 10)],
      stock: [card("A", "spade", 1)],
      phase: "playing",
      selectedCardId: 5,
      selectedSource: "pyramid",
    };
    const next = pyramidReducer(state, { type: "DRAW_STOCK" });
    expect(next.selectedCardId).toBeNull();
    expect(next.selectedSource).toBeNull();
  });

  it("最後の1枚を引いて手詰まりならcomplete(lose)", () => {
    const state: PyramidState = {
      ...initialPyramidState,
      pyramid: [
        pCard("2", 6, 0, false, 1),
        pCard("3", 6, 1, false, 2),
      ],
      stock: [card("4", "heart", 3)],
      waste: [],
      stockRecycles: 1,
      phase: "playing",
    };
    const next = pyramidReducer(state, { type: "DRAW_STOCK" });
    expect(next.phase).toBe("complete");
    expect(next.result).toBe("lose");
    expect(next.dialogOpen).toBe(true);
  });

  it("引いた後にペアが作れるなら手詰まりにならない", () => {
    const state: PyramidState = {
      ...initialPyramidState,
      pyramid: [pCard("6", 6, 0, false, 1)],
      stock: [card("7", "heart", 2)],
      waste: [],
      stockRecycles: 1,
      phase: "playing",
    };
    const next = pyramidReducer(state, { type: "DRAW_STOCK" });
    expect(next.phase).toBe("playing");
  });
});

describe("RECYCLE_STOCK", () => {
  it("捨て札を裏返して山札にする", () => {
    const state: PyramidState = {
      ...initialPyramidState,
      pyramid: [pCard("6", 6, 0, false, 10)],
      stock: [],
      waste: [card("A", "spade", 1), card("2", "heart", 2)],
      stockRecycles: 0,
      phase: "playing",
    };
    const next = pyramidReducer(state, { type: "RECYCLE_STOCK" });
    expect(next.stock).toHaveLength(2);
    expect(next.waste).toHaveLength(0);
    expect(next.stockRecycles).toBe(1);
    expect(next.stock[0].id).toBe(2);
    expect(next.stock[1].id).toBe(1);
  });

  it("リサイクル上限に達していたら何もしない", () => {
    const state: PyramidState = {
      ...initialPyramidState,
      stock: [],
      waste: [card("A", "spade", 1)],
      stockRecycles: 1,
      phase: "playing",
    };
    const next = pyramidReducer(state, { type: "RECYCLE_STOCK" });
    expect(next).toEqual(state);
  });

  it("山札が残っていたら何もしない", () => {
    const state: PyramidState = {
      ...initialPyramidState,
      stock: [card("A", "spade", 1)],
      waste: [card("2", "heart", 2)],
      stockRecycles: 0,
      phase: "playing",
    };
    const next = pyramidReducer(state, { type: "RECYCLE_STOCK" });
    expect(next).toEqual(state);
  });
});

describe("REMOVE_COMPLETE", () => {
  it("手詰まりでなければplayingに戻る", () => {
    const state: PyramidState = {
      ...initialPyramidState,
      pyramid: [
        pCard("6", 6, 0, false, 1),
        pCard("7", 6, 1, false, 2),
      ],
      phase: "removing",
    };
    const next = pyramidReducer(state, { type: "REMOVE_COMPLETE" });
    expect(next.phase).toBe("playing");
  });

  it("手詰まりならcomplete(lose)になる", () => {
    const state: PyramidState = {
      ...initialPyramidState,
      pyramid: [
        pCard("2", 6, 0, false, 1),
        pCard("3", 6, 1, false, 2),
      ],
      stock: [],
      waste: [],
      stockRecycles: 1,
      phase: "removing",
    };
    const next = pyramidReducer(state, { type: "REMOVE_COMPLETE" });
    expect(next.phase).toBe("complete");
    expect(next.result).toBe("lose");
    expect(next.dialogOpen).toBe(true);
  });
});

describe("TICK", () => {
  it("playing中にelapsedTimeを1増加する", () => {
    const state: PyramidState = {
      ...initialPyramidState,
      phase: "playing",
      elapsedTime: 5,
    };
    const next = pyramidReducer(state, { type: "TICK" });
    expect(next.elapsedTime).toBe(6);
  });

  it("removing中にもelapsedTimeを1増加する", () => {
    const state: PyramidState = {
      ...initialPyramidState,
      phase: "removing",
      elapsedTime: 10,
    };
    const next = pyramidReducer(state, { type: "TICK" });
    expect(next.elapsedTime).toBe(11);
  });

  it("idle/complete中は変化しない", () => {
    const idle: PyramidState = {
      ...initialPyramidState,
      phase: "idle",
      elapsedTime: 0,
    };
    expect(pyramidReducer(idle, { type: "TICK" }).elapsedTime).toBe(0);

    const complete: PyramidState = {
      ...initialPyramidState,
      phase: "complete",
      elapsedTime: 30,
    };
    expect(pyramidReducer(complete, { type: "TICK" }).elapsedTime).toBe(30);
  });
});

describe("CLEAR_INVALID", () => {
  it("不正ペア情報をクリアする", () => {
    const state: PyramidState = {
      ...initialPyramidState,
      invalidPair: [1, 2],
    };
    const next = pyramidReducer(state, { type: "CLEAR_INVALID" });
    expect(next.invalidPair).toBeNull();
  });
});

describe("SET_NEW_BEST", () => {
  it("新記録フラグを設定する", () => {
    const next = pyramidReducer(initialPyramidState, {
      type: "SET_NEW_BEST",
      isNewBest: true,
    });
    expect(next.isNewBest).toBe(true);
  });
});

describe("DISMISS_DIALOG", () => {
  it("ダイアログを閉じる", () => {
    const state: PyramidState = {
      ...initialPyramidState,
      dialogOpen: true,
    };
    const next = pyramidReducer(state, { type: "DISMISS_DIALOG" });
    expect(next.dialogOpen).toBe(false);
  });
});

describe("RESET", () => {
  it("初期状態に戻す", () => {
    const state: PyramidState = {
      ...initialPyramidState,
      phase: "playing",
      elapsedTime: 42,
      pyramid: [pCard("A", 6, 0, false, 1)],
    };
    const next = pyramidReducer(state, { type: "RESET" });
    expect(next).toEqual(initialPyramidState);
  });
});
