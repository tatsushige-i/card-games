import { describe, it, expect } from "vitest";
import {
  blackjackReducer,
  initialBlackjackState,
} from "../blackjack-reducer";
import type {
  BlackjackState,
  PlayingCard,
  BlackjackAction,
} from "@/types/blackjack";

/** テスト用カード生成ヘルパー */
function card(
  rank: PlayingCard["rank"],
  suit: PlayingCard["suit"] = "spade"
): PlayingCard {
  const values: Record<string, number> = {
    A: 11,
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "10": 10,
    J: 10,
    Q: 10,
    K: 10,
  };
  return { id: 0, suit, rank, value: values[rank] };
}

/** テスト用にデッキを構成するヘルパー（P1, D1, P2, D2, ...rest の順） */
function makeDeck(...cards: PlayingCard[]): PlayingCard[] {
  return cards;
}

function dispatch(
  state: BlackjackState,
  action: BlackjackAction
): BlackjackState {
  return blackjackReducer(state, action);
}

describe("blackjackReducer", () => {
  describe("初期状態", () => {
    it("正しい初期値を持つ", () => {
      expect(initialBlackjackState.phase).toBe("idle");
      expect(initialBlackjackState.playerHand).toEqual([]);
      expect(initialBlackjackState.dealerHand).toEqual([]);
      expect(initialBlackjackState.wins).toBe(0);
      expect(initialBlackjackState.maxWins).toBe(0);
      expect(initialBlackjackState.rounds).toBe(0);
    });
  });

  describe("START_GAME", () => {
    it("プレイヤーとディーラーに2枚ずつ配る", () => {
      const deck = makeDeck(
        card("5"),
        card("8"),
        card("K"),
        card("3"),
        card("7")
      );
      const state = dispatch(initialBlackjackState, {
        type: "START_GAME",
        deck,
      });

      expect(state.playerHand).toHaveLength(2);
      expect(state.dealerHand).toHaveLength(2);
      expect(state.deck).toHaveLength(1);
      expect(state.phase).toBe("dealing");
      expect(state.rounds).toBe(1);
    });

    it("P1, D1, P2, D2 の順で配る", () => {
      const p1 = card("A");
      const d1 = card("K");
      const p2 = card("5");
      const d2 = card("3");
      const deck = makeDeck(p1, d1, p2, d2);
      const state = dispatch(initialBlackjackState, {
        type: "START_GAME",
        deck,
      });

      expect(state.playerHand).toEqual([p1, p2]);
      expect(state.dealerHand).toEqual([d1, d2]);
    });

    it("連勝数を維持する", () => {
      const baseState: BlackjackState = {
        ...initialBlackjackState,
        wins: 3,
        maxWins: 5,
      };
      const deck = makeDeck(
        card("5"),
        card("8"),
        card("K"),
        card("3"),
        card("7")
      );
      const state = dispatch(baseState, { type: "START_GAME", deck });

      expect(state.wins).toBe(3);
      expect(state.maxWins).toBe(5);
    });
  });

  describe("DEAL_COMPLETE", () => {
    it("ナチュラルBJがなければplayingに遷移する", () => {
      const state: BlackjackState = {
        ...initialBlackjackState,
        playerHand: [card("5"), card("8")],
        dealerHand: [card("K"), card("3")],
        phase: "dealing",
      };
      const next = dispatch(state, { type: "DEAL_COMPLETE" });
      expect(next.phase).toBe("playing");
    });

    it("プレイヤーのナチュラルBJでblackjack結果になる", () => {
      const state: BlackjackState = {
        ...initialBlackjackState,
        playerHand: [card("A"), card("K")],
        dealerHand: [card("8"), card("3")],
        phase: "dealing",
      };
      const next = dispatch(state, { type: "DEAL_COMPLETE" });
      expect(next.phase).toBe("result");
      expect(next.result).toBe("blackjack");
      expect(next.dealerRevealed).toBe(true);
    });

    it("ディーラーのナチュラルBJでlose結果になる", () => {
      const state: BlackjackState = {
        ...initialBlackjackState,
        playerHand: [card("8"), card("3")],
        dealerHand: [card("A"), card("K")],
        phase: "dealing",
      };
      const next = dispatch(state, { type: "DEAL_COMPLETE" });
      expect(next.phase).toBe("result");
      expect(next.result).toBe("lose");
      expect(next.dealerRevealed).toBe(true);
    });

    it("両方ナチュラルBJでdraw結果になる", () => {
      const state: BlackjackState = {
        ...initialBlackjackState,
        playerHand: [card("A"), card("K")],
        dealerHand: [card("A"), card("Q")],
        phase: "dealing",
      };
      const next = dispatch(state, { type: "DEAL_COMPLETE" });
      expect(next.phase).toBe("result");
      expect(next.result).toBe("draw");
    });

    it("dealing以外のフェーズでは無視する", () => {
      const state: BlackjackState = {
        ...initialBlackjackState,
        phase: "playing",
      };
      const next = dispatch(state, { type: "DEAL_COMPLETE" });
      expect(next).toBe(state);
    });
  });

  describe("HIT", () => {
    it("デッキから1枚引いて手札に加える", () => {
      const drawnCard = card("3");
      const state: BlackjackState = {
        ...initialBlackjackState,
        playerHand: [card("5"), card("8")],
        dealerHand: [card("K"), card("3")],
        deck: [drawnCard, card("7")],
        phase: "playing",
      };
      const next = dispatch(state, { type: "HIT" });
      expect(next.playerHand).toHaveLength(3);
      expect(next.playerHand[2]).toBe(drawnCard);
      expect(next.deck).toHaveLength(1);
      expect(next.phase).toBe("playing");
    });

    it("バーストしたらresult(lose)に遷移する", () => {
      const state: BlackjackState = {
        ...initialBlackjackState,
        playerHand: [card("K"), card("Q")],
        dealerHand: [card("8"), card("3")],
        deck: [card("5")],
        phase: "playing",
      };
      const next = dispatch(state, { type: "HIT" });
      expect(next.phase).toBe("result");
      expect(next.result).toBe("lose");
      expect(next.dealerRevealed).toBe(true);
    });

    it("playing以外のフェーズでは無視する", () => {
      const state: BlackjackState = {
        ...initialBlackjackState,
        phase: "dealerTurn",
      };
      const next = dispatch(state, { type: "HIT" });
      expect(next).toBe(state);
    });

    it("デッキが空なら無視する", () => {
      const state: BlackjackState = {
        ...initialBlackjackState,
        playerHand: [card("5"), card("8")],
        deck: [],
        phase: "playing",
      };
      const next = dispatch(state, { type: "HIT" });
      expect(next).toBe(state);
    });
  });

  describe("STAND", () => {
    it("dealerTurnに遷移しディーラーを公開する", () => {
      const state: BlackjackState = {
        ...initialBlackjackState,
        playerHand: [card("K"), card("8")],
        dealerHand: [card("5"), card("3")],
        phase: "playing",
      };
      const next = dispatch(state, { type: "STAND" });
      expect(next.phase).toBe("dealerTurn");
      expect(next.dealerRevealed).toBe(true);
    });

    it("playing以外のフェーズでは無視する", () => {
      const state: BlackjackState = {
        ...initialBlackjackState,
        phase: "idle",
      };
      const next = dispatch(state, { type: "STAND" });
      expect(next).toBe(state);
    });
  });

  describe("DEALER_DRAW", () => {
    it("17未満なら1枚引く", () => {
      const drawnCard = card("5");
      const state: BlackjackState = {
        ...initialBlackjackState,
        playerHand: [card("K"), card("8")],
        dealerHand: [card("5"), card("3")],
        deck: [drawnCard, card("7")],
        phase: "dealerTurn",
      };
      const next = dispatch(state, { type: "DEALER_DRAW" });
      expect(next.dealerHand).toHaveLength(3);
      expect(next.dealerHand[2]).toBe(drawnCard);
      expect(next.phase).toBe("dealerTurn");
    });

    it("17以上でプレイヤーが勝っていればwin", () => {
      const state: BlackjackState = {
        ...initialBlackjackState,
        playerHand: [card("K"), card("9")],
        dealerHand: [card("10"), card("7")],
        deck: [],
        phase: "dealerTurn",
      };
      const next = dispatch(state, { type: "DEALER_DRAW" });
      expect(next.phase).toBe("result");
      expect(next.result).toBe("win");
    });

    it("17以上でディーラーが勝っていればlose", () => {
      const state: BlackjackState = {
        ...initialBlackjackState,
        playerHand: [card("10"), card("7")],
        dealerHand: [card("K"), card("9")],
        deck: [],
        phase: "dealerTurn",
      };
      const next = dispatch(state, { type: "DEALER_DRAW" });
      expect(next.phase).toBe("result");
      expect(next.result).toBe("lose");
    });

    it("同点ならdraw", () => {
      const state: BlackjackState = {
        ...initialBlackjackState,
        playerHand: [card("K"), card("8")],
        dealerHand: [card("10"), card("8")],
        deck: [],
        phase: "dealerTurn",
      };
      const next = dispatch(state, { type: "DEALER_DRAW" });
      expect(next.phase).toBe("result");
      expect(next.result).toBe("draw");
    });

    it("ディーラーがバーストしたらwin", () => {
      const state: BlackjackState = {
        ...initialBlackjackState,
        playerHand: [card("K"), card("8")],
        dealerHand: [card("10"), card("7"), card("K")],
        deck: [],
        phase: "dealerTurn",
      };
      const next = dispatch(state, { type: "DEALER_DRAW" });
      expect(next.phase).toBe("result");
      expect(next.result).toBe("win");
    });

    it("dealerTurn以外のフェーズでは無視する", () => {
      const state: BlackjackState = {
        ...initialBlackjackState,
        phase: "playing",
      };
      const next = dispatch(state, { type: "DEALER_DRAW" });
      expect(next).toBe(state);
    });
  });

  describe("SHOW_RESULT", () => {
    it("勝利時に連勝数を加算する", () => {
      const state: BlackjackState = {
        ...initialBlackjackState,
        phase: "result",
        result: "win",
        wins: 2,
        maxWins: 3,
      };
      const next = dispatch(state, { type: "SHOW_RESULT" });
      expect(next.phase).toBe("gameOver");
      expect(next.wins).toBe(3);
      expect(next.maxWins).toBe(3);
      expect(next.dialogOpen).toBe(true);
    });

    it("blackjack勝利でも連勝数を加算する", () => {
      const state: BlackjackState = {
        ...initialBlackjackState,
        phase: "result",
        result: "blackjack",
        wins: 0,
        maxWins: 0,
      };
      const next = dispatch(state, { type: "SHOW_RESULT" });
      expect(next.wins).toBe(1);
      expect(next.maxWins).toBe(1);
    });

    it("敗北時に連勝をリセットする", () => {
      const state: BlackjackState = {
        ...initialBlackjackState,
        phase: "result",
        result: "lose",
        wins: 3,
        maxWins: 5,
      };
      const next = dispatch(state, { type: "SHOW_RESULT" });
      expect(next.wins).toBe(0);
      expect(next.maxWins).toBe(5);
    });

    it("引き分け時に連勝をリセットする", () => {
      const state: BlackjackState = {
        ...initialBlackjackState,
        phase: "result",
        result: "draw",
        wins: 2,
        maxWins: 4,
      };
      const next = dispatch(state, { type: "SHOW_RESULT" });
      expect(next.wins).toBe(0);
      expect(next.maxWins).toBe(4);
    });

    it("maxWinsを更新する", () => {
      const state: BlackjackState = {
        ...initialBlackjackState,
        phase: "result",
        result: "win",
        wins: 5,
        maxWins: 3,
      };
      const next = dispatch(state, { type: "SHOW_RESULT" });
      expect(next.maxWins).toBe(6);
    });

    it("result以外のフェーズでは無視する", () => {
      const state: BlackjackState = {
        ...initialBlackjackState,
        phase: "playing",
      };
      const next = dispatch(state, { type: "SHOW_RESULT" });
      expect(next).toBe(state);
    });
  });

  describe("SET_NEW_BEST", () => {
    it("isNewBestを設定する", () => {
      const state = dispatch(initialBlackjackState, {
        type: "SET_NEW_BEST",
        isNewBest: true,
      });
      expect(state.isNewBest).toBe(true);
    });
  });

  describe("NEXT_ROUND", () => {
    it("idleに遷移しダイアログを閉じる", () => {
      const state: BlackjackState = {
        ...initialBlackjackState,
        phase: "gameOver",
        wins: 3,
        maxWins: 5,
        rounds: 3,
        dialogOpen: true,
      };
      const next = dispatch(state, { type: "NEXT_ROUND" });
      expect(next.phase).toBe("idle");
      expect(next.dialogOpen).toBe(false);
      expect(next.wins).toBe(3);
      expect(next.maxWins).toBe(5);
      expect(next.rounds).toBe(3);
    });
  });

  describe("DISMISS_DIALOG", () => {
    it("ダイアログを閉じる", () => {
      const state: BlackjackState = {
        ...initialBlackjackState,
        dialogOpen: true,
      };
      const next = dispatch(state, { type: "DISMISS_DIALOG" });
      expect(next.dialogOpen).toBe(false);
    });
  });

  describe("RESET", () => {
    it("初期状態に戻す", () => {
      const state: BlackjackState = {
        ...initialBlackjackState,
        phase: "gameOver",
        wins: 5,
        maxWins: 10,
        rounds: 15,
      };
      const next = dispatch(state, { type: "RESET" });
      expect(next).toEqual(initialBlackjackState);
    });
  });
});
