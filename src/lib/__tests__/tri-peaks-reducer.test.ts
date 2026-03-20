import { describe, it, expect } from "vitest";
import {
  triPeaksReducer,
  initialTriPeaksState,
} from "../tri-peaks-reducer";
import { createDeck, buildTableau, TABLEAU_CARD_COUNT } from "../tri-peaks-cards";
import type { TriPeaksState, PlayingCard } from "@/types/tri-peaks";

/** テスト用のゲーム開始状態を作成する */
function startGame(): TriPeaksState {
  const deck = createDeck();
  return triPeaksReducer(initialTriPeaksState, {
    type: "START_GAME",
    deck,
  });
}

/**
 * 捨て札トップが value=5 で、Row 3 に隣接カード(value=4)と非隣接カード(value=10)がある
 * 確定的なテスト用ゲーム状態を構築する
 */
function createFixedState(): TriPeaksState {
  const deck = createDeck();
  const { tableau, stock } = buildTableau(deck);
  // Row 3 pos 0 を value=4（±1で隣接）に固定
  const card0 = tableau.find((c) => c.row === 3 && c.pos === 0)!;
  card0.value = 4;
  card0.rank = "4";
  // Row 3 pos 1 を value=10（非隣接）に固定
  const card1 = tableau.find((c) => c.row === 3 && c.pos === 1)!;
  card1.value = 10;
  card1.rank = "10";
  // 捨て札トップを value=5 に固定
  const wasteCard: PlayingCard = { id: 99, suit: "heart", rank: "5", value: 5 };
  return {
    ...initialTriPeaksState,
    tableau,
    stock: stock.slice(1),
    waste: [wasteCard],
    phase: "playing",
  };
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
    // 捨て札トップ=5、Row 3 pos 0=4（隣接）の固定状態
    const state = createFixedState();

    const result = triPeaksReducer(state, {
      type: "REMOVE_CARD",
      row: 3,
      pos: 0,
    });
    expect(result.removedCount).toBe(1);
    expect(result.combo).toBe(1);
    expect(result.score).toBe(1);
    const removedCard = result.tableau.find(
      (c) => c.row === 3 && c.pos === 0
    );
    expect(removedCard?.removed).toBe(true);
  });

  it("コンボが加算されスコアに反映される", () => {
    // 捨て札トップ=5、Row 3 pos 0=4（隣接）の固定状態にコンボ2を設定
    const state = { ...createFixedState(), combo: 2, score: 3 };

    const result = triPeaksReducer(state, {
      type: "REMOVE_CARD",
      row: 3,
      pos: 0,
    });
    expect(result.combo).toBe(3);
    expect(result.score).toBe(6); // 3 + 3 = 6
  });

  it("±1でないカードは除去できない", () => {
    // 捨て札トップ=5、Row 3 pos 1=10（非隣接）の固定状態
    const state = createFixedState();

    const result = triPeaksReducer(state, {
      type: "REMOVE_CARD",
      row: 3,
      pos: 1,
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
