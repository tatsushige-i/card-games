import { describe, it, expect } from "vitest";
import { gameReducer, initialGameState } from "../game-reducer";
import type { Card, GameState } from "@/types/game";

/** テスト用のカード配列を作成する */
function createTestCards(): Card[] {
  return [
    { id: 0, emoji: "🍎", status: "hidden" },
    { id: 1, emoji: "🍎", status: "hidden" },
    { id: 2, emoji: "🌸", status: "hidden" },
    { id: 3, emoji: "🌸", status: "hidden" },
  ];
}

/** テスト用のゲーム状態を作成する */
function createPlayingState(overrides?: Partial<GameState>): GameState {
  return {
    ...initialGameState,
    cards: createTestCards(),
    phase: "playing",
    totalPairs: 2,
    ...overrides,
  };
}

describe("gameReducer", () => {
  describe("START_GAME", () => {
    it("カードをセットしてplaying状態にする", () => {
      const cards = createTestCards();
      const state = gameReducer(initialGameState, {
        type: "START_GAME",
        cards,
      });
      expect(state.phase).toBe("playing");
      expect(state.cards).toEqual(cards);
      expect(state.moves).toBe(0);
      expect(state.matchedPairs).toBe(0);
    });
  });

  describe("FLIP_CARD", () => {
    it("hidden状態のカードをflippedにする", () => {
      const state = createPlayingState();
      const next = gameReducer(state, { type: "FLIP_CARD", cardId: 0 });
      expect(next.cards[0].status).toBe("flipped");
      expect(next.flippedIds).toEqual([0]);
    });

    it("既にflippedのカードは無視する", () => {
      const state = createPlayingState({
        cards: [
          { id: 0, emoji: "🍎", status: "flipped" },
          ...createTestCards().slice(1),
        ],
        flippedIds: [0],
      });
      const next = gameReducer(state, { type: "FLIP_CARD", cardId: 0 });
      expect(next.flippedIds).toEqual([0]);
    });

    it("2枚めくられている場合は無視する", () => {
      const state = createPlayingState({
        flippedIds: [0, 2],
      });
      const next = gameReducer(state, { type: "FLIP_CARD", cardId: 1 });
      expect(next.flippedIds).toEqual([0, 2]);
    });

    it("idle状態では無視する", () => {
      const state = { ...createPlayingState(), phase: "idle" as const };
      const next = gameReducer(state, { type: "FLIP_CARD", cardId: 0 });
      expect(next.flippedIds).toEqual([]);
    });
  });

  describe("CHECK_MATCH", () => {
    it("ペアが一致した場合、matchedにする", () => {
      const state = createPlayingState({
        cards: [
          { id: 0, emoji: "🍎", status: "flipped" },
          { id: 1, emoji: "🍎", status: "flipped" },
          { id: 2, emoji: "🌸", status: "hidden" },
          { id: 3, emoji: "🌸", status: "hidden" },
        ],
        flippedIds: [0, 1],
      });

      const next = gameReducer(state, { type: "CHECK_MATCH" });
      expect(next.cards[0].status).toBe("matched");
      expect(next.cards[1].status).toBe("matched");
      expect(next.matchedPairs).toBe(1);
      expect(next.moves).toBe(1);
      expect(next.flippedIds).toEqual([]);
    });

    it("ペアが不一致の場合、hiddenに戻す", () => {
      const state = createPlayingState({
        cards: [
          { id: 0, emoji: "🍎", status: "flipped" },
          { id: 2, emoji: "🌸", status: "flipped" },
          { id: 1, emoji: "🍎", status: "hidden" },
          { id: 3, emoji: "🌸", status: "hidden" },
        ],
        flippedIds: [0, 2],
      });

      const next = gameReducer(state, { type: "CHECK_MATCH" });
      expect(next.cards[0].status).toBe("hidden");
      expect(next.cards[1].status).toBe("hidden");
      expect(next.matchedPairs).toBe(0);
      expect(next.moves).toBe(1);
    });

    it("全ペア一致でcomplete状態になりダイアログが開く", () => {
      const state = createPlayingState({
        cards: [
          { id: 0, emoji: "🍎", status: "matched" },
          { id: 1, emoji: "🍎", status: "matched" },
          { id: 2, emoji: "🌸", status: "flipped" },
          { id: 3, emoji: "🌸", status: "flipped" },
        ],
        flippedIds: [2, 3],
        matchedPairs: 1,
      });

      const next = gameReducer(state, { type: "CHECK_MATCH" });
      expect(next.phase).toBe("complete");
      expect(next.matchedPairs).toBe(2);
      expect(next.dialogOpen).toBe(true);
    });
  });

  describe("TICK", () => {
    it("playing中は経過時間を+1する", () => {
      const state = createPlayingState({ elapsedTime: 5 });
      const next = gameReducer(state, { type: "TICK" });
      expect(next.elapsedTime).toBe(6);
    });

    it("idle状態では変化しない", () => {
      const state = { ...initialGameState, elapsedTime: 0 };
      const next = gameReducer(state, { type: "TICK" });
      expect(next.elapsedTime).toBe(0);
    });
  });

  describe("DISMISS_DIALOG", () => {
    it("ダイアログを閉じる（ゲーム状態は維持）", () => {
      const state = createPlayingState({
        phase: "complete",
        dialogOpen: true,
        moves: 5,
        matchedPairs: 2,
      });
      const next = gameReducer(state, { type: "DISMISS_DIALOG" });
      expect(next.dialogOpen).toBe(false);
      expect(next.phase).toBe("complete");
      expect(next.moves).toBe(5);
    });
  });

  describe("SET_NEW_BEST", () => {
    it("isNewBestフラグを更新する", () => {
      const state = createPlayingState();
      const next = gameReducer(state, { type: "SET_NEW_BEST", isNewBest: true });
      expect(next.isNewBest).toBe(true);
    });
  });

  describe("RESET", () => {
    it("初期状態に戻す", () => {
      const state = createPlayingState({ moves: 10, elapsedTime: 30 });
      const next = gameReducer(state, { type: "RESET" });
      expect(next).toEqual(initialGameState);
    });
  });
});
