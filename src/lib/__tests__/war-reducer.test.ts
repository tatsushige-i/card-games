import { describe, it, expect } from "vitest";
import { warReducer, initialWarState } from "../war-reducer";
import type { WarState, WarCard, WarAction } from "@/types/war";

/** テスト用カード生成ヘルパー */
function card(
  rank: WarCard["rank"],
  suit: WarCard["suit"] = "spade"
): WarCard {
  const values: Record<string, number> = {
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
    A: 14,
  };
  return { id: Math.random(), suit, rank, value: values[rank] };
}

function dispatch(state: WarState, action: WarAction): WarState {
  return warReducer(state, action);
}

describe("warReducer", () => {
  describe("初期状態", () => {
    it("正しい初期値を持つ", () => {
      expect(initialWarState.phase).toBe("ready");
      expect(initialWarState.playerDeck).toEqual([]);
      expect(initialWarState.cpuDeck).toEqual([]);
      expect(initialWarState.playerCard).toBeNull();
      expect(initialWarState.cpuCard).toBeNull();
      expect(initialWarState.warPile).toEqual([]);
      expect(initialWarState.roundCount).toBe(0);
      expect(initialWarState.winner).toBeNull();
    });
  });

  describe("PLAY_CARD", () => {
    it("プレイヤーとCPUが1枚ずつカードを出す", () => {
      const playerCards = [card("K"), card("5"), card("3")];
      const cpuCards = [card("Q"), card("8"), card("2")];
      const state: WarState = {
        ...initialWarState,
        playerDeck: playerCards,
        cpuDeck: cpuCards,
      };
      const next = dispatch(state, { type: "PLAY_CARD" });

      expect(next.phase).toBe("battle");
      expect(next.playerCard).toBe(playerCards[0]);
      expect(next.cpuCard).toBe(cpuCards[0]);
      expect(next.playerDeck).toHaveLength(2);
      expect(next.cpuDeck).toHaveLength(2);
      expect(next.roundCount).toBe(1);
    });

    it("ready以外のフェーズでは無視する", () => {
      const state: WarState = {
        ...initialWarState,
        phase: "battle",
        playerDeck: [card("K")],
        cpuDeck: [card("Q")],
      };
      const next = dispatch(state, { type: "PLAY_CARD" });
      expect(next).toBe(state);
    });

    it("プレイヤーのデッキが空なら無視する", () => {
      const state: WarState = {
        ...initialWarState,
        playerDeck: [],
        cpuDeck: [card("Q")],
      };
      const next = dispatch(state, { type: "PLAY_CARD" });
      expect(next).toBe(state);
    });
  });

  describe("RESOLVE_BATTLE", () => {
    it("プレイヤーのカードが大きければplayer", () => {
      const state: WarState = {
        ...initialWarState,
        phase: "battle",
        playerCard: card("K"),
        cpuCard: card("Q"),
      };
      const next = dispatch(state, { type: "RESOLVE_BATTLE" });
      expect(next.phase).toBe("result");
      expect(next.roundResult).toBe("player");
    });

    it("CPUのカードが大きければcpu", () => {
      const state: WarState = {
        ...initialWarState,
        phase: "battle",
        playerCard: card("3"),
        cpuCard: card("K"),
      };
      const next = dispatch(state, { type: "RESOLVE_BATTLE" });
      expect(next.roundResult).toBe("cpu");
    });

    it("同値ならwar", () => {
      const state: WarState = {
        ...initialWarState,
        phase: "battle",
        playerCard: card("7", "spade"),
        cpuCard: card("7", "heart"),
      };
      const next = dispatch(state, { type: "RESOLVE_BATTLE" });
      expect(next.roundResult).toBe("war");
    });

    it("warRevealフェーズでも動作する", () => {
      const state: WarState = {
        ...initialWarState,
        phase: "warReveal",
        playerCard: card("A"),
        cpuCard: card("K"),
      };
      const next = dispatch(state, { type: "RESOLVE_BATTLE" });
      expect(next.phase).toBe("result");
      expect(next.roundResult).toBe("player");
    });

    it("カードがnullなら無視する", () => {
      const state: WarState = {
        ...initialWarState,
        phase: "battle",
        playerCard: null,
        cpuCard: null,
      };
      const next = dispatch(state, { type: "RESOLVE_BATTLE" });
      expect(next).toBe(state);
    });
  });

  describe("START_WAR", () => {
    it("戦争を開始し、伏せカードをwarPileに追加する", () => {
      const pCard = card("7", "spade");
      const cCard = card("7", "heart");
      const pFaceDown = card("3");
      const cFaceDown = card("5");
      const state: WarState = {
        ...initialWarState,
        phase: "result",
        roundResult: "war",
        playerCard: pCard,
        cpuCard: cCard,
        playerDeck: [pFaceDown, card("K"), card("2")],
        cpuDeck: [cFaceDown, card("Q"), card("8")],
        warPile: [],
      };
      const next = dispatch(state, { type: "START_WAR" });

      expect(next.phase).toBe("war");
      expect(next.warPile).toHaveLength(4);
      expect(next.warPile).toContain(pCard);
      expect(next.warPile).toContain(cCard);
      expect(next.warPile).toContain(pFaceDown);
      expect(next.warPile).toContain(cFaceDown);
      expect(next.playerCard).toBeNull();
      expect(next.cpuCard).toBeNull();
      expect(next.playerDeck).toHaveLength(2);
      expect(next.cpuDeck).toHaveLength(2);
    });

    it("プレイヤーのカードが足りなければCPU勝利", () => {
      const state: WarState = {
        ...initialWarState,
        phase: "result",
        roundResult: "war",
        playerCard: card("7"),
        cpuCard: card("7", "heart"),
        playerDeck: [card("3")],
        cpuDeck: [card("5"), card("Q"), card("8")],
      };
      const next = dispatch(state, { type: "START_WAR" });
      expect(next.phase).toBe("gameOver");
      expect(next.winner).toBe("cpu");
    });

    it("CPUのカードが足りなければプレイヤー勝利", () => {
      const state: WarState = {
        ...initialWarState,
        phase: "result",
        roundResult: "war",
        playerCard: card("7"),
        cpuCard: card("7", "heart"),
        playerDeck: [card("3"), card("K"), card("2")],
        cpuDeck: [card("5")],
      };
      const next = dispatch(state, { type: "START_WAR" });
      expect(next.phase).toBe("gameOver");
      expect(next.winner).toBe("player");
    });

    it("roundResultがwar以外なら無視する", () => {
      const state: WarState = {
        ...initialWarState,
        phase: "result",
        roundResult: "player",
      };
      const next = dispatch(state, { type: "START_WAR" });
      expect(next).toBe(state);
    });
  });

  describe("REVEAL_WAR_CARDS", () => {
    it("戦争の表カードを出す", () => {
      const pReveal = card("A");
      const cReveal = card("K");
      const state: WarState = {
        ...initialWarState,
        phase: "war",
        playerDeck: [pReveal, card("2")],
        cpuDeck: [cReveal, card("3")],
        warPile: [card("7"), card("7", "heart"), card("5"), card("8")],
      };
      const next = dispatch(state, { type: "REVEAL_WAR_CARDS" });

      expect(next.phase).toBe("warReveal");
      expect(next.playerCard).toBe(pReveal);
      expect(next.cpuCard).toBe(cReveal);
      expect(next.playerDeck).toHaveLength(1);
      expect(next.cpuDeck).toHaveLength(1);
    });

    it("プレイヤーのデッキが空ならCPU勝利", () => {
      const state: WarState = {
        ...initialWarState,
        phase: "war",
        playerDeck: [],
        cpuDeck: [card("K")],
      };
      const next = dispatch(state, { type: "REVEAL_WAR_CARDS" });
      expect(next.phase).toBe("gameOver");
      expect(next.winner).toBe("cpu");
    });

    it("CPUのデッキが空ならプレイヤー勝利", () => {
      const state: WarState = {
        ...initialWarState,
        phase: "war",
        playerDeck: [card("K")],
        cpuDeck: [],
      };
      const next = dispatch(state, { type: "REVEAL_WAR_CARDS" });
      expect(next.phase).toBe("gameOver");
      expect(next.winner).toBe("player");
    });

    it("war以外のフェーズでは無視する", () => {
      const state: WarState = {
        ...initialWarState,
        phase: "ready",
      };
      const next = dispatch(state, { type: "REVEAL_WAR_CARDS" });
      expect(next).toBe(state);
    });
  });

  describe("COLLECT_CARDS", () => {
    it("プレイヤー勝利時、プレイヤーがカードを獲得してreadyに遷移", () => {
      const pCard = card("K");
      const cCard = card("Q");
      const state: WarState = {
        ...initialWarState,
        phase: "result",
        roundResult: "player",
        playerCard: pCard,
        cpuCard: cCard,
        playerDeck: [card("5")],
        cpuDeck: [card("3")],
        warPile: [],
      };
      const next = dispatch(state, { type: "COLLECT_CARDS" });

      expect(next.phase).toBe("ready");
      expect(next.playerDeck).toHaveLength(3);
      expect(next.cpuDeck).toHaveLength(1);
      expect(next.playerCard).toBeNull();
      expect(next.cpuCard).toBeNull();
      expect(next.warPile).toEqual([]);
    });

    it("CPU勝利時、CPUがカードを獲得する", () => {
      const pCard = card("3");
      const cCard = card("K");
      const state: WarState = {
        ...initialWarState,
        phase: "result",
        roundResult: "cpu",
        playerCard: pCard,
        cpuCard: cCard,
        playerDeck: [card("5")],
        cpuDeck: [card("8")],
        warPile: [],
      };
      const next = dispatch(state, { type: "COLLECT_CARDS" });

      expect(next.playerDeck).toHaveLength(1);
      expect(next.cpuDeck).toHaveLength(3);
    });

    it("warPileのカードも勝者に渡る", () => {
      const state: WarState = {
        ...initialWarState,
        phase: "result",
        roundResult: "player",
        playerCard: card("A"),
        cpuCard: card("K"),
        playerDeck: [card("5")],
        cpuDeck: [card("3")],
        warPile: [card("7"), card("7", "heart"), card("2"), card("8")],
      };
      const next = dispatch(state, { type: "COLLECT_CARDS" });

      // 1 (元のデッキ) + 4 (warPile) + 2 (表カード) = 7
      expect(next.playerDeck).toHaveLength(7);
    });

    it("CPUのデッキが0になったらプレイヤー勝利でgameOver", () => {
      const state: WarState = {
        ...initialWarState,
        phase: "result",
        roundResult: "player",
        playerCard: card("A"),
        cpuCard: card("K"),
        playerDeck: [card("5")],
        cpuDeck: [],
        warPile: [],
      };
      const next = dispatch(state, { type: "COLLECT_CARDS" });
      expect(next.phase).toBe("gameOver");
      expect(next.winner).toBe("player");
    });

    it("プレイヤーのデッキが0になったらCPU勝利でgameOver", () => {
      const state: WarState = {
        ...initialWarState,
        phase: "result",
        roundResult: "cpu",
        playerCard: card("3"),
        cpuCard: card("K"),
        playerDeck: [],
        cpuDeck: [card("5")],
        warPile: [],
      };
      const next = dispatch(state, { type: "COLLECT_CARDS" });
      expect(next.phase).toBe("gameOver");
      expect(next.winner).toBe("cpu");
    });

    it("roundResultがwarなら無視する", () => {
      const state: WarState = {
        ...initialWarState,
        phase: "result",
        roundResult: "war",
        playerCard: card("7"),
        cpuCard: card("7", "heart"),
      };
      const next = dispatch(state, { type: "COLLECT_CARDS" });
      expect(next).toBe(state);
    });
  });

  describe("SET_NEW_BEST", () => {
    it("isNewBestを設定する", () => {
      const state = dispatch(initialWarState, {
        type: "SET_NEW_BEST",
        isNewBest: true,
      });
      expect(state.isNewBest).toBe(true);
    });
  });

  describe("DISMISS_DIALOG", () => {
    it("ダイアログを閉じる", () => {
      const state: WarState = {
        ...initialWarState,
        dialogOpen: true,
      };
      const next = dispatch(state, { type: "DISMISS_DIALOG" });
      expect(next.dialogOpen).toBe(false);
    });
  });

  describe("RESTART", () => {
    it("新しいデッキで初期状態にリセットする", () => {
      const newPlayerDeck = [card("K"), card("Q")];
      const newCpuDeck = [card("A"), card("J")];
      const state: WarState = {
        ...initialWarState,
        phase: "gameOver",
        roundCount: 50,
        winner: "cpu",
      };
      const next = dispatch(state, {
        type: "RESTART",
        playerDeck: newPlayerDeck,
        cpuDeck: newCpuDeck,
      });

      expect(next.phase).toBe("ready");
      expect(next.playerDeck).toBe(newPlayerDeck);
      expect(next.cpuDeck).toBe(newCpuDeck);
      expect(next.roundCount).toBe(0);
      expect(next.winner).toBeNull();
    });
  });
});
