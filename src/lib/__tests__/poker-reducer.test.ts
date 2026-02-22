import { describe, it, expect } from "vitest";
import { pokerReducer, initialPokerState } from "../poker-reducer";
import type { PokerState, PlayingCard, PokerAction } from "@/types/poker";

/** テスト用カード生成ヘルパー */
function card(
  rank: PlayingCard["rank"],
  suit: PlayingCard["suit"] = "spade"
): PlayingCard {
  const values: Record<string, number> = {
    A: 14,
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
  return { id: 0, suit, rank, value: values[rank] };
}

function dispatch(state: PokerState, action: PokerAction): PokerState {
  return pokerReducer(state, action);
}

describe("pokerReducer", () => {
  describe("初期状態", () => {
    it("正しい初期値を持つ", () => {
      expect(initialPokerState.phase).toBe("idle");
      expect(initialPokerState.hand).toEqual([]);
      expect(initialPokerState.held).toEqual([false, false, false, false, false]);
      expect(initialPokerState.totalScore).toBe(0);
      expect(initialPokerState.round).toBe(0);
      expect(initialPokerState.handRank).toBeNull();
    });
  });

  describe("START_GAME", () => {
    it("5枚の手札を配る", () => {
      const deck = [
        card("A"),
        card("K"),
        card("Q"),
        card("J"),
        card("10"),
        card("9"),
        card("8"),
      ];
      const state = dispatch(initialPokerState, { type: "START_GAME", deck });

      expect(state.hand).toHaveLength(5);
      expect(state.deck).toHaveLength(2);
      expect(state.phase).toBe("dealing");
      expect(state.round).toBe(1);
    });

    it("ホールド状態をリセットする", () => {
      const baseState: PokerState = {
        ...initialPokerState,
        held: [true, true, false, true, false],
      };
      const deck = [
        card("A"),
        card("K"),
        card("Q"),
        card("J"),
        card("10"),
        card("9"),
      ];
      const state = dispatch(baseState, { type: "START_GAME", deck });
      expect(state.held).toEqual([false, false, false, false, false]);
    });

    it("合計スコアを維持する", () => {
      const baseState: PokerState = {
        ...initialPokerState,
        totalScore: 25,
      };
      const deck = [
        card("A"),
        card("K"),
        card("Q"),
        card("J"),
        card("10"),
        card("9"),
      ];
      const state = dispatch(baseState, { type: "START_GAME", deck });
      expect(state.totalScore).toBe(25);
    });
  });

  describe("DEAL_COMPLETE", () => {
    it("holdingに遷移する", () => {
      const state: PokerState = {
        ...initialPokerState,
        phase: "dealing",
      };
      const next = dispatch(state, { type: "DEAL_COMPLETE" });
      expect(next.phase).toBe("holding");
    });

    it("dealing以外のフェーズでは無視する", () => {
      const state: PokerState = {
        ...initialPokerState,
        phase: "holding",
      };
      const next = dispatch(state, { type: "DEAL_COMPLETE" });
      expect(next).toBe(state);
    });
  });

  describe("TOGGLE_HOLD", () => {
    it("カードのホールド状態をトグルする", () => {
      const state: PokerState = {
        ...initialPokerState,
        phase: "holding",
        hand: [card("A"), card("K"), card("Q"), card("J"), card("10")],
      };
      const next = dispatch(state, { type: "TOGGLE_HOLD", index: 2 });
      expect(next.held[2]).toBe(true);
      expect(next.held[0]).toBe(false);
    });

    it("ホールド中のカードを解除できる", () => {
      const state: PokerState = {
        ...initialPokerState,
        phase: "holding",
        hand: [card("A"), card("K"), card("Q"), card("J"), card("10")],
        held: [true, false, true, false, false],
      };
      const next = dispatch(state, { type: "TOGGLE_HOLD", index: 0 });
      expect(next.held[0]).toBe(false);
    });

    it("holding以外のフェーズでは無視する", () => {
      const state: PokerState = {
        ...initialPokerState,
        phase: "dealing",
      };
      const next = dispatch(state, { type: "TOGGLE_HOLD", index: 0 });
      expect(next).toBe(state);
    });

    it("不正なインデックスでは無視する", () => {
      const state: PokerState = {
        ...initialPokerState,
        phase: "holding",
        hand: [card("A"), card("K"), card("Q"), card("J"), card("10")],
      };
      const next = dispatch(state, { type: "TOGGLE_HOLD", index: 5 });
      expect(next).toBe(state);
    });
  });

  describe("DRAW", () => {
    it("ホールドしていないカードを交換する", () => {
      const newCard1 = card("2", "heart");
      const newCard2 = card("3", "heart");
      const state: PokerState = {
        ...initialPokerState,
        phase: "holding",
        hand: [card("A"), card("K"), card("Q"), card("J"), card("10")],
        held: [true, false, true, false, true],
        deck: [newCard1, newCard2, card("4")],
      };
      const next = dispatch(state, { type: "DRAW" });

      expect(next.phase).toBe("drawing");
      // インデックス1と3が交換される
      expect(next.hand[0]).toBe(state.hand[0]); // ホールド
      expect(next.hand[1]).toBe(newCard1);       // 交換
      expect(next.hand[2]).toBe(state.hand[2]); // ホールド
      expect(next.hand[3]).toBe(newCard2);       // 交換
      expect(next.hand[4]).toBe(state.hand[4]); // ホールド
      expect(next.deck).toHaveLength(1);
    });

    it("全カードをホールドした場合は交換しない", () => {
      const state: PokerState = {
        ...initialPokerState,
        phase: "holding",
        hand: [card("A"), card("K"), card("Q"), card("J"), card("10")],
        held: [true, true, true, true, true],
        deck: [card("2"), card("3")],
      };
      const next = dispatch(state, { type: "DRAW" });
      expect(next.hand).toEqual(state.hand);
      expect(next.deck).toHaveLength(2);
    });

    it("holding以外のフェーズでは無視する", () => {
      const state: PokerState = {
        ...initialPokerState,
        phase: "dealing",
      };
      const next = dispatch(state, { type: "DRAW" });
      expect(next).toBe(state);
    });
  });

  describe("DRAW_COMPLETE", () => {
    it("役を判定してresultに遷移する", () => {
      const state: PokerState = {
        ...initialPokerState,
        phase: "drawing",
        hand: [
          card("J", "spade"),
          card("J", "heart"),
          card("3", "diamond"),
          card("5", "club"),
          card("9", "spade"),
        ],
      };
      const next = dispatch(state, { type: "DRAW_COMPLETE" });
      expect(next.phase).toBe("result");
      expect(next.handRank).toBe("jacksOrBetter");
      expect(next.roundScore).toBe(1);
    });

    it("ノーハンドの場合スコア0", () => {
      const state: PokerState = {
        ...initialPokerState,
        phase: "drawing",
        hand: [
          card("2", "spade"),
          card("5", "heart"),
          card("8", "diamond"),
          card("J", "club"),
          card("K", "heart"),
        ],
      };
      const next = dispatch(state, { type: "DRAW_COMPLETE" });
      expect(next.handRank).toBe("noHand");
      expect(next.roundScore).toBe(0);
    });

    it("drawing以外のフェーズでは無視する", () => {
      const state: PokerState = {
        ...initialPokerState,
        phase: "holding",
      };
      const next = dispatch(state, { type: "DRAW_COMPLETE" });
      expect(next).toBe(state);
    });
  });

  describe("SHOW_RESULT", () => {
    it("中間ラウンドではidleに遷移しダイアログを開かない", () => {
      const state: PokerState = {
        ...initialPokerState,
        phase: "result",
        roundScore: 9,
        totalScore: 20,
        round: 1,
      };
      const next = dispatch(state, { type: "SHOW_RESULT" });
      expect(next.phase).toBe("idle");
      expect(next.totalScore).toBe(29);
      expect(next.dialogOpen).toBe(false);
    });

    it("最終ラウンドではgameOverに遷移しダイアログを開く", () => {
      const state: PokerState = {
        ...initialPokerState,
        phase: "result",
        roundScore: 4,
        totalScore: 50,
        round: 10,
      };
      const next = dispatch(state, { type: "SHOW_RESULT" });
      expect(next.phase).toBe("gameOver");
      expect(next.totalScore).toBe(54);
      expect(next.dialogOpen).toBe(true);
    });

    it("result以外のフェーズでは無視する", () => {
      const state: PokerState = {
        ...initialPokerState,
        phase: "holding",
      };
      const next = dispatch(state, { type: "SHOW_RESULT" });
      expect(next).toBe(state);
    });
  });

  describe("SET_NEW_BEST", () => {
    it("isNewBestを設定する", () => {
      const state = dispatch(initialPokerState, {
        type: "SET_NEW_BEST",
        isNewBest: true,
      });
      expect(state.isNewBest).toBe(true);
    });
  });

  describe("NEXT_ROUND", () => {
    it("idleに遷移しダイアログを閉じる", () => {
      const state: PokerState = {
        ...initialPokerState,
        phase: "gameOver",
        totalScore: 25,
        round: 3,
        dialogOpen: true,
      };
      const next = dispatch(state, { type: "NEXT_ROUND" });
      expect(next.phase).toBe("idle");
      expect(next.dialogOpen).toBe(false);
      expect(next.totalScore).toBe(25);
      expect(next.round).toBe(3);
    });

    it("最終ラウンドでは無視する", () => {
      const state: PokerState = {
        ...initialPokerState,
        phase: "gameOver",
        round: 10,
        dialogOpen: true,
      };
      const next = dispatch(state, { type: "NEXT_ROUND" });
      expect(next).toBe(state);
    });
  });

  describe("DISMISS_DIALOG", () => {
    it("ダイアログを閉じる", () => {
      const state: PokerState = {
        ...initialPokerState,
        dialogOpen: true,
      };
      const next = dispatch(state, { type: "DISMISS_DIALOG" });
      expect(next.dialogOpen).toBe(false);
    });
  });

  describe("RESET", () => {
    it("初期状態に戻す", () => {
      const state: PokerState = {
        ...initialPokerState,
        phase: "gameOver",
        totalScore: 100,
        round: 10,
      };
      const next = dispatch(state, { type: "RESET" });
      expect(next).toEqual(initialPokerState);
    });
  });
});
