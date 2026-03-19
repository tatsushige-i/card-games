import { describe, it, expect } from "vitest";
import { tenPlayReducer, initialTenPlayState } from "../ten-play-reducer";
import type { TenPlayState, PlayingCard } from "@/types/ten-play";

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

describe("initialTenPlayState", () => {
  it("初期状態が正しい", () => {
    expect(initialTenPlayState.phase).toBe("idle");
    expect(initialTenPlayState.tableau).toEqual([]);
    expect(initialTenPlayState.stock).toEqual([]);
    expect(initialTenPlayState.selectedIndices).toEqual([]);
    expect(initialTenPlayState.removedCount).toBe(0);
    expect(initialTenPlayState.result).toBeNull();
    expect(initialTenPlayState.elapsedTime).toBe(0);
    expect(initialTenPlayState.invalidPair).toBeNull();
    expect(initialTenPlayState.isNewBest).toBe(false);
    expect(initialTenPlayState.dialogOpen).toBe(false);
  });
});

describe("START_GAME", () => {
  it("タブローに13枚配置する", () => {
    const deck = createTestDeck();
    const state = tenPlayReducer(initialTenPlayState, { type: "START_GAME", deck });
    expect(state.tableau).toHaveLength(13);
    expect(state.tableau.every((c) => c !== null)).toBe(true);
  });

  it("山札は39枚", () => {
    const deck = createTestDeck();
    const state = tenPlayReducer(initialTenPlayState, { type: "START_GAME", deck });
    expect(state.stock).toHaveLength(39);
  });

  it("playingフェーズになる", () => {
    const deck = createTestDeck();
    const state = tenPlayReducer(initialTenPlayState, { type: "START_GAME", deck });
    expect(state.phase).toBe("playing");
  });
});

describe("SELECT_CARD", () => {
  it("1枚目を選択する", () => {
    const state: TenPlayState = {
      ...initialTenPlayState,
      phase: "playing",
      tableau: [card("A", "spade", 1), card("9", "heart", 2)],
      stock: [],
    };
    const newState = tenPlayReducer(state, { type: "SELECT_CARD", index: 0 });
    expect(newState.selectedIndices).toEqual([0]);
  });

  it("選択済みのカードを選択解除する", () => {
    const state: TenPlayState = {
      ...initialTenPlayState,
      phase: "playing",
      tableau: [card("A", "spade", 1), card("9", "heart", 2)],
      stock: [],
      selectedIndices: [0],
    };
    const newState = tenPlayReducer(state, { type: "SELECT_CARD", index: 0 });
    expect(newState.selectedIndices).toEqual([]);
  });

  it("10のカードは単独除去される", () => {
    const state: TenPlayState = {
      ...initialTenPlayState,
      phase: "playing",
      tableau: [
        card("10", "spade", 1),
        card("A", "heart", 2),
        card("9", "diamond", 3),
      ],
      stock: [card("5", "club", 4)],
    };
    const newState = tenPlayReducer(state, { type: "SELECT_CARD", index: 0 });
    // 10が除去され、山札から補充
    expect(newState.tableau[0]?.id).toBe(4);
    expect(newState.removedCount).toBe(1);
    expect(newState.selectedIndices).toEqual([]);
  });

  it("合計10の数札ペアを除去する", () => {
    const state: TenPlayState = {
      ...initialTenPlayState,
      phase: "playing",
      tableau: [
        card("A", "spade", 1),
        card("9", "heart", 2),
        card("K", "diamond", 3),
      ],
      stock: [card("5", "club", 4), card("6", "club", 5)],
      selectedIndices: [0],
    };
    const newState = tenPlayReducer(state, { type: "SELECT_CARD", index: 1 });
    // A+9=10 → ペア除去 → 補充
    expect(newState.tableau[0]?.id).toBe(4);
    expect(newState.tableau[1]?.id).toBe(5);
    expect(newState.removedCount).toBe(1);
  });

  it("同ランク絵札ペアを除去する", () => {
    const state: TenPlayState = {
      ...initialTenPlayState,
      phase: "playing",
      tableau: [
        card("J", "spade", 1),
        card("J", "heart", 2),
        card("A", "diamond", 3),
      ],
      stock: [card("5", "club", 4), card("6", "club", 5)],
      selectedIndices: [0],
    };
    const newState = tenPlayReducer(state, { type: "SELECT_CARD", index: 1 });
    expect(newState.removedCount).toBe(1);
    expect(newState.tableau[0]?.id).toBe(4);
    expect(newState.tableau[1]?.id).toBe(5);
  });

  it("不正ペアでinvalidPairがセットされる", () => {
    const state: TenPlayState = {
      ...initialTenPlayState,
      phase: "playing",
      tableau: [
        card("A", "spade", 1),
        card("2", "heart", 2),
        card("3", "diamond", 3),
      ],
      stock: [],
      selectedIndices: [0],
    };
    const newState = tenPlayReducer(state, { type: "SELECT_CARD", index: 1 });
    expect(newState.invalidPair).toEqual([0, 1]);
    expect(newState.selectedIndices).toEqual([]);
  });

  it("nullスロットは選択できない", () => {
    const state: TenPlayState = {
      ...initialTenPlayState,
      phase: "playing",
      tableau: [null, card("A", "heart", 1)],
      stock: [],
    };
    const newState = tenPlayReducer(state, { type: "SELECT_CARD", index: 0 });
    expect(newState.selectedIndices).toEqual([]);
  });

  it("playingフェーズ以外では何もしない", () => {
    const state: TenPlayState = {
      ...initialTenPlayState,
      phase: "idle",
      tableau: [card("A", "spade", 1)],
    };
    const newState = tenPlayReducer(state, { type: "SELECT_CARD", index: 0 });
    expect(newState).toEqual(state);
  });

  it("全カード除去でclearedフェーズに遷移する", () => {
    // タブローに10が1枚だけ、山札なし
    const state: TenPlayState = {
      ...initialTenPlayState,
      phase: "playing",
      tableau: [card("10", "spade", 1)],
      stock: [],
    };
    const newState = tenPlayReducer(state, { type: "SELECT_CARD", index: 0 });
    expect(newState.phase).toBe("cleared");
    expect(newState.result).toBe("win");
    expect(newState.dialogOpen).toBe(true);
  });

  it("除去後に手詰まりならstuckフェーズに遷移する", () => {
    const state: TenPlayState = {
      ...initialTenPlayState,
      phase: "playing",
      tableau: [
        card("10", "spade", 1),
        card("J", "heart", 2),
        card("Q", "diamond", 3),
      ],
      stock: [],
    };
    // 10を単独除去 → 残りJ,Q → 手詰まり
    const newState = tenPlayReducer(state, { type: "SELECT_CARD", index: 0 });
    expect(newState.phase).toBe("stuck");
    expect(newState.result).toBe("lose");
    expect(newState.dialogOpen).toBe(true);
  });
});

describe("CLEAR_INVALID", () => {
  it("invalidPairをクリアする", () => {
    const state: TenPlayState = {
      ...initialTenPlayState,
      invalidPair: [0, 1],
    };
    const newState = tenPlayReducer(state, { type: "CLEAR_INVALID" });
    expect(newState.invalidPair).toBeNull();
  });
});

describe("TICK", () => {
  it("playingフェーズで経過時間をインクリメントする", () => {
    const state: TenPlayState = {
      ...initialTenPlayState,
      phase: "playing",
      elapsedTime: 10,
    };
    const newState = tenPlayReducer(state, { type: "TICK" });
    expect(newState.elapsedTime).toBe(11);
  });

  it("playing以外では何もしない", () => {
    const state: TenPlayState = {
      ...initialTenPlayState,
      phase: "idle",
      elapsedTime: 10,
    };
    const newState = tenPlayReducer(state, { type: "TICK" });
    expect(newState.elapsedTime).toBe(10);
  });
});

describe("SET_NEW_BEST", () => {
  it("isNewBestを設定する", () => {
    const state = tenPlayReducer(initialTenPlayState, {
      type: "SET_NEW_BEST",
      isNewBest: true,
    });
    expect(state.isNewBest).toBe(true);
  });
});

describe("DISMISS_DIALOG", () => {
  it("ダイアログを閉じる", () => {
    const state: TenPlayState = { ...initialTenPlayState, dialogOpen: true };
    const newState = tenPlayReducer(state, { type: "DISMISS_DIALOG" });
    expect(newState.dialogOpen).toBe(false);
  });
});

describe("RESTART", () => {
  it("初期状態に戻る", () => {
    const state: TenPlayState = {
      ...initialTenPlayState,
      phase: "playing",
      removedCount: 10,
      elapsedTime: 60,
    };
    const newState = tenPlayReducer(state, { type: "RESTART" });
    expect(newState).toEqual(initialTenPlayState);
  });
});
