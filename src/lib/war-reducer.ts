import type { WarState, WarAction } from "@/types/war";
import { compareCards } from "./war-cards";

/** ゲーム状態の初期値 */
export const initialWarState: WarState = {
  phase: "ready",
  playerDeck: [],
  cpuDeck: [],
  playerCard: null,
  cpuCard: null,
  warPile: [],
  roundResult: null,
  roundCount: 0,
  winner: null,
  isNewBest: false,
  dialogOpen: false,
};

/** 戦争ゲームの状態を管理する純粋なReducer */
export function warReducer(state: WarState, action: WarAction): WarState {
  switch (action.type) {
    case "PLAY_CARD": {
      if (state.phase !== "ready") return state;
      if (state.playerDeck.length === 0 || state.cpuDeck.length === 0)
        return state;

      const [playerCard, ...playerRest] = state.playerDeck;
      const [cpuCard, ...cpuRest] = state.cpuDeck;

      return {
        ...state,
        phase: "battle",
        playerCard,
        cpuCard,
        playerDeck: playerRest,
        cpuDeck: cpuRest,
        roundResult: null,
        roundCount: state.roundCount + 1,
      };
    }

    case "RESOLVE_BATTLE": {
      if (state.phase !== "battle" && state.phase !== "warReveal") return state;
      if (!state.playerCard || !state.cpuCard) return state;

      const result = compareCards(state.playerCard, state.cpuCard);

      return {
        ...state,
        phase: "result",
        roundResult: result,
      };
    }

    case "START_WAR": {
      if (state.phase !== "result") return state;
      if (state.roundResult !== "war") return state;

      // 戦争時にカードが足りない場合は敗北
      if (state.playerDeck.length < 2) {
        return {
          ...state,
          phase: "gameOver",
          winner: "cpu",
          dialogOpen: true,
        };
      }
      if (state.cpuDeck.length < 2) {
        return {
          ...state,
          phase: "gameOver",
          winner: "player",
          dialogOpen: true,
        };
      }

      // 現在の表カード + 各1枚伏せカードを warPile に追加
      const [playerFaceDown, ...playerRest] = state.playerDeck;
      const [cpuFaceDown, ...cpuRest] = state.cpuDeck;

      const newWarPile = [
        ...state.warPile,
        state.playerCard!,
        state.cpuCard!,
        playerFaceDown,
        cpuFaceDown,
      ];

      return {
        ...state,
        phase: "war",
        playerDeck: playerRest,
        cpuDeck: cpuRest,
        playerCard: null,
        cpuCard: null,
        warPile: newWarPile,
        roundResult: null,
      };
    }

    case "REVEAL_WAR_CARDS": {
      if (state.phase !== "war") return state;

      // 戦争の表カードを出す
      if (state.playerDeck.length === 0) {
        return {
          ...state,
          phase: "gameOver",
          winner: "cpu",
          dialogOpen: true,
        };
      }
      if (state.cpuDeck.length === 0) {
        return {
          ...state,
          phase: "gameOver",
          winner: "player",
          dialogOpen: true,
        };
      }

      const [playerCard, ...playerRest] = state.playerDeck;
      const [cpuCard, ...cpuRest] = state.cpuDeck;

      return {
        ...state,
        phase: "warReveal",
        playerCard,
        cpuCard,
        playerDeck: playerRest,
        cpuDeck: cpuRest,
        roundCount: state.roundCount + 1,
      };
    }

    case "COLLECT_CARDS": {
      if (state.phase !== "result") return state;
      if (state.roundResult === "war") return state;
      if (!state.playerCard || !state.cpuCard) return state;

      // 勝者が全カードを獲得（warPile含む）
      const collectedCards = [
        ...state.warPile,
        state.playerCard,
        state.cpuCard,
      ];

      let newPlayerDeck: typeof state.playerDeck;
      let newCpuDeck: typeof state.cpuDeck;

      if (state.roundResult === "player") {
        newPlayerDeck = [...state.playerDeck, ...collectedCards];
        newCpuDeck = state.cpuDeck;
      } else {
        newPlayerDeck = state.playerDeck;
        newCpuDeck = [...state.cpuDeck, ...collectedCards];
      }

      // ゲーム終了判定
      if (newPlayerDeck.length === 0) {
        return {
          ...state,
          phase: "gameOver",
          playerDeck: newPlayerDeck,
          cpuDeck: newCpuDeck,
          playerCard: null,
          cpuCard: null,
          warPile: [],
          winner: "cpu",
          dialogOpen: true,
        };
      }
      if (newCpuDeck.length === 0) {
        return {
          ...state,
          phase: "gameOver",
          playerDeck: newPlayerDeck,
          cpuDeck: newCpuDeck,
          playerCard: null,
          cpuCard: null,
          warPile: [],
          winner: "player",
          dialogOpen: true,
        };
      }

      return {
        ...state,
        phase: "ready",
        playerDeck: newPlayerDeck,
        cpuDeck: newCpuDeck,
        playerCard: null,
        cpuCard: null,
        warPile: [],
      };
    }

    case "SET_NEW_BEST":
      return { ...state, isNewBest: action.isNewBest };

    case "DISMISS_DIALOG":
      return { ...state, dialogOpen: false };

    case "RESTART":
      return {
        ...initialWarState,
        playerDeck: action.playerDeck,
        cpuDeck: action.cpuDeck,
      };

    default:
      return state;
  }
}
