import { describe, it, expect } from "vitest";
import { golfReducer, initialGolfState } from "../golf-reducer";
import type { GolfState, PlayingCard } from "@/types/golf";

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

/** テスト用の固定デッキを生成する（52枚） */
function createTestDeck(): PlayingCard[] {
  const suits: PlayingCard["suit"][] = ["spade", "heart", "diamond", "club"];
  const ranks: PlayingCard["rank"][] = [
    "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K",
  ];
  const cards: PlayingCard[] = [];
  let id = 0;
  for (const suit of suits) {
    for (const rank of ranks) {
      cards.push(card(rank, suit, id++));
    }
  }
  return cards;
}

describe("initialGolfState", () => {
  it("初期状態が正しい", () => {
    expect(initialGolfState.phase).toBe("idle");
    expect(initialGolfState.columns).toEqual([]);
    expect(initialGolfState.stock).toEqual([]);
    expect(initialGolfState.waste).toEqual([]);
    expect(initialGolfState.removedCount).toBe(0);
    expect(initialGolfState.result).toBeNull();
    expect(initialGolfState.elapsedTime).toBe(0);
    expect(initialGolfState.isNewBest).toBe(false);
    expect(initialGolfState.dialogOpen).toBe(false);
  });
});

describe("START_GAME", () => {
  it("7列に5枚ずつ配置する", () => {
    const deck = createTestDeck();
    const state = golfReducer(initialGolfState, { type: "START_GAME", deck });
    expect(state.columns).toHaveLength(7);
    for (const col of state.columns) {
      expect(col).toHaveLength(5);
    }
  });

  it("山札の先頭1枚を捨て札に置く", () => {
    const deck = createTestDeck();
    const state = golfReducer(initialGolfState, { type: "START_GAME", deck });
    // 35枚がtableau、残り17枚のうち1枚が捨て札、16枚が山札
    expect(state.waste).toHaveLength(1);
    expect(state.stock).toHaveLength(16);
  });

  it("playingフェーズになる", () => {
    const deck = createTestDeck();
    const state = golfReducer(initialGolfState, { type: "START_GAME", deck });
    expect(state.phase).toBe("playing");
  });
});

describe("DRAW", () => {
  it("山札から1枚を捨て札に移動する", () => {
    const state: GolfState = {
      ...initialGolfState,
      phase: "playing",
      columns: [[card("2", "spade", 1)]],
      stock: [card("3", "heart", 2), card("4", "heart", 3)],
      waste: [card("5", "diamond", 4)],
    };
    const newState = golfReducer(state, { type: "DRAW" });
    expect(newState.stock).toHaveLength(1);
    expect(newState.waste).toHaveLength(2);
    expect(newState.waste[1].id).toBe(2);
  });

  it("山札が空なら何もしない", () => {
    const state: GolfState = {
      ...initialGolfState,
      phase: "playing",
      columns: [[card("2", "spade", 1)]],
      stock: [],
      waste: [card("5", "diamond", 2)],
    };
    const newState = golfReducer(state, { type: "DRAW" });
    expect(newState).toEqual(state);
  });

  it("ドロー後に手詰まりならstuckフェーズに遷移する", () => {
    const state: GolfState = {
      ...initialGolfState,
      phase: "playing",
      columns: [[card("K", "spade", 1)]],
      stock: [card("5", "heart", 2)],
      waste: [card("3", "diamond", 3)],
    };
    const newState = golfReducer(state, { type: "DRAW" });
    expect(newState.phase).toBe("stuck");
    expect(newState.result).toBe("lose");
    expect(newState.dialogOpen).toBe(true);
  });

  it("playingフェーズ以外では何もしない", () => {
    const state: GolfState = {
      ...initialGolfState,
      phase: "idle",
      stock: [card("3", "heart", 1)],
      waste: [card("5", "diamond", 2)],
    };
    const newState = golfReducer(state, { type: "DRAW" });
    expect(newState).toEqual(state);
  });
});

describe("REMOVE_CARD", () => {
  it("±1のカードを除去して捨て札に移動する", () => {
    const state: GolfState = {
      ...initialGolfState,
      phase: "playing",
      columns: [[card("5", "spade", 1), card("6", "spade", 2)]],
      stock: [card("3", "heart", 3)],
      waste: [card("7", "diamond", 4)],
    };
    const newState = golfReducer(state, { type: "REMOVE_CARD", columnIndex: 0 });
    expect(newState.columns[0]).toHaveLength(1);
    expect(newState.waste[newState.waste.length - 1].id).toBe(2);
    expect(newState.removedCount).toBe(1);
  });

  it("±1でないカードは除去できない", () => {
    const state: GolfState = {
      ...initialGolfState,
      phase: "playing",
      columns: [[card("3", "spade", 1)]],
      stock: [card("8", "heart", 2)],
      waste: [card("7", "diamond", 3)],
    };
    const newState = golfReducer(state, { type: "REMOVE_CARD", columnIndex: 0 });
    expect(newState).toEqual(state);
  });

  it("場のカードがすべてなくなればclearedフェーズに遷移する", () => {
    const state: GolfState = {
      ...initialGolfState,
      phase: "playing",
      columns: [[card("6", "spade", 1)]],
      stock: [],
      waste: [card("7", "diamond", 2)],
    };
    const newState = golfReducer(state, { type: "REMOVE_CARD", columnIndex: 0 });
    expect(newState.phase).toBe("cleared");
    expect(newState.result).toBe("win");
    expect(newState.dialogOpen).toBe(true);
  });

  it("除去後に手詰まりならstuckフェーズに遷移する", () => {
    const state: GolfState = {
      ...initialGolfState,
      phase: "playing",
      columns: [
        [card("6", "spade", 1)],
        [card("K", "heart", 2)],
      ],
      stock: [],
      waste: [card("7", "diamond", 3)],
    };
    const newState = golfReducer(state, { type: "REMOVE_CARD", columnIndex: 0 });
    // 6を除去 → 捨て札トップは6 → K(13)と6(6)は±1でない → 山札空 → stuck
    expect(newState.phase).toBe("stuck");
    expect(newState.result).toBe("lose");
  });

  it("空列からは除去できない", () => {
    const state: GolfState = {
      ...initialGolfState,
      phase: "playing",
      columns: [[]],
      stock: [],
      waste: [card("7", "diamond", 1)],
    };
    const newState = golfReducer(state, { type: "REMOVE_CARD", columnIndex: 0 });
    expect(newState).toEqual(state);
  });
});

describe("TICK", () => {
  it("playingフェーズで経過時間をインクリメントする", () => {
    const state: GolfState = {
      ...initialGolfState,
      phase: "playing",
      elapsedTime: 10,
    };
    const newState = golfReducer(state, { type: "TICK" });
    expect(newState.elapsedTime).toBe(11);
  });

  it("playing以外では何もしない", () => {
    const state: GolfState = {
      ...initialGolfState,
      phase: "idle",
      elapsedTime: 10,
    };
    const newState = golfReducer(state, { type: "TICK" });
    expect(newState.elapsedTime).toBe(10);
  });
});

describe("SET_NEW_BEST", () => {
  it("isNewBestを設定する", () => {
    const state = golfReducer(initialGolfState, {
      type: "SET_NEW_BEST",
      isNewBest: true,
    });
    expect(state.isNewBest).toBe(true);
  });
});

describe("DISMISS_DIALOG", () => {
  it("ダイアログを閉じる", () => {
    const state: GolfState = { ...initialGolfState, dialogOpen: true };
    const newState = golfReducer(state, { type: "DISMISS_DIALOG" });
    expect(newState.dialogOpen).toBe(false);
  });
});

describe("RESTART", () => {
  it("初期状態に戻る", () => {
    const state: GolfState = {
      ...initialGolfState,
      phase: "playing",
      removedCount: 10,
      elapsedTime: 60,
    };
    const newState = golfReducer(state, { type: "RESTART" });
    expect(newState).toEqual(initialGolfState);
  });
});
