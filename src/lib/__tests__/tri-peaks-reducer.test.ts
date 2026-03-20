import { describe, it, expect } from "vitest";
import {
  triPeaksReducer,
  initialTriPeaksState,
} from "../tri-peaks-reducer";
import { createDeck, TABLEAU_CARD_COUNT } from "../tri-peaks-cards";
import type { TriPeaksState, PlayingCard } from "@/types/tri-peaks";

/** テスト用のゲーム開始状態を作成する */
function startGame(): TriPeaksState {
  const deck = createDeck();
  return triPeaksReducer(initialTriPeaksState, {
    type: "START_GAME",
    deck,
  });
}

describe("START_GAME", () => {
  it("タブロー28枚、山札23枚、捨て札1枚で開始する", () => {
    const state = startGame();
    expect(state.tableau).toHaveLength(TABLEAU_CARD_COUNT);
    // 52 - 28 = 24枚の山札のうち1枚が捨て札へ
    expect(state.stock).toHaveLength(23);
    expect(state.waste).toHaveLength(1);
  });

  it("phaseがplayingになる", () => {
    const state = startGame();
    expect(state.phase).toBe("playing");
  });

  it("スコア・コンボ・除去数が0で初期化される", () => {
    const state = startGame();
    expect(state.score).toBe(0);
    expect(state.combo).toBe(0);
    expect(state.removedCount).toBe(0);
  });
});

describe("DRAW", () => {
  it("山札から捨て札にカードを移動する", () => {
    const state = startGame();
    const result = triPeaksReducer(state, { type: "DRAW" });
    expect(result.stock).toHaveLength(state.stock.length - 1);
    expect(result.waste).toHaveLength(state.waste.length + 1);
  });

  it("コンボをリセットする", () => {
    const state = { ...startGame(), combo: 3 };
    const result = triPeaksReducer(state, { type: "DRAW" });
    expect(result.combo).toBe(0);
  });

  it("山札が空の場合は何もしない", () => {
    const state = { ...startGame(), stock: [] as PlayingCard[] };
    const result = triPeaksReducer(state, { type: "DRAW" });
    expect(result).toBe(state);
  });

  it("playing以外のphaseでは何もしない", () => {
    const state = { ...startGame(), phase: "cleared" as const };
    const result = triPeaksReducer(state, { type: "DRAW" });
    expect(result).toBe(state);
  });
});

describe("REMOVE_CARD", () => {
  it("露出カードで±1なら除去できる", () => {
    const state = startGame();
    const wasteTop = state.waste[state.waste.length - 1];
    // Row 3（底段）の露出カードから±1のものを探す
    const target = state.tableau.find(
      (c) =>
        c.row === 3 &&
        !c.removed &&
        (Math.abs(c.value - wasteTop.value) === 1 ||
          Math.abs(c.value - wasteTop.value) === 12)
    );
    if (!target) return; // ランダムデッキなので見つからない可能性あり

    const result = triPeaksReducer(state, {
      type: "REMOVE_CARD",
      row: target.row,
      pos: target.pos,
    });
    expect(result.removedCount).toBe(1);
    expect(result.combo).toBe(1);
    expect(result.score).toBe(1);
    const removedCard = result.tableau.find(
      (c) => c.row === target.row && c.pos === target.pos
    );
    expect(removedCard?.removed).toBe(true);
  });

  it("コンボが加算されスコアに反映される", () => {
    const state = startGame();
    // コンボ2の状態をシミュレート
    const stateWithCombo = {
      ...state,
      combo: 2,
      score: 3, // 1+2=3
    };
    const wasteTop = stateWithCombo.waste[stateWithCombo.waste.length - 1];
    const target = stateWithCombo.tableau.find(
      (c) =>
        c.row === 3 &&
        !c.removed &&
        (Math.abs(c.value - wasteTop.value) === 1 ||
          Math.abs(c.value - wasteTop.value) === 12)
    );
    if (!target) return;

    const result = triPeaksReducer(stateWithCombo, {
      type: "REMOVE_CARD",
      row: target.row,
      pos: target.pos,
    });
    expect(result.combo).toBe(3);
    expect(result.score).toBe(6); // 3 + 3 = 6
  });

  it("±1でないカードは除去できない", () => {
    const state = startGame();
    const wasteTop = state.waste[state.waste.length - 1];
    // ±1でないRow 3カードを探す
    const nonAdjacent = state.tableau.find(
      (c) =>
        c.row === 3 &&
        !c.removed &&
        Math.abs(c.value - wasteTop.value) !== 1 &&
        Math.abs(c.value - wasteTop.value) !== 12
    );
    if (!nonAdjacent) return;

    const result = triPeaksReducer(state, {
      type: "REMOVE_CARD",
      row: nonAdjacent.row,
      pos: nonAdjacent.pos,
    });
    expect(result).toBe(state);
  });

  it("playing以外のphaseでは何もしない", () => {
    const state = { ...startGame(), phase: "stuck" as const };
    const result = triPeaksReducer(state, {
      type: "REMOVE_CARD",
      row: 3,
      pos: 0,
    });
    expect(result).toBe(state);
  });
});

describe("TICK", () => {
  it("playing中は経過時間を加算する", () => {
    const state = startGame();
    const result = triPeaksReducer(state, { type: "TICK" });
    expect(result.elapsedTime).toBe(1);
  });

  it("playing以外では何もしない", () => {
    const state = { ...startGame(), phase: "idle" as const };
    const result = triPeaksReducer(state, { type: "TICK" });
    expect(result).toBe(state);
  });
});

describe("SET_NEW_BEST", () => {
  it("isNewBestフラグを更新する", () => {
    const state = startGame();
    const result = triPeaksReducer(state, {
      type: "SET_NEW_BEST",
      isNewBest: true,
    });
    expect(result.isNewBest).toBe(true);
  });
});

describe("DISMISS_DIALOG", () => {
  it("dialogOpenをfalseにする", () => {
    const state = { ...startGame(), dialogOpen: true };
    const result = triPeaksReducer(state, { type: "DISMISS_DIALOG" });
    expect(result.dialogOpen).toBe(false);
  });
});

describe("RESTART", () => {
  it("初期状態に戻る", () => {
    const state = startGame();
    const result = triPeaksReducer(state, { type: "RESTART" });
    expect(result).toEqual(initialTriPeaksState);
  });
});
