import type { BlackjackState, BlackjackAction } from "@/types/blackjack";
import {
  calculateHandTotal,
  isBust,
  isNaturalBlackjack,
  DEALER_STAND,
} from "./blackjack-cards";

/** ゲーム状態の初期値 */
export const initialBlackjackState: BlackjackState = {
  deck: [],
  playerHand: [],
  dealerHand: [],
  dealerRevealed: false,
  phase: "idle",
  result: null,
  wins: 0,
  maxWins: 0,
  rounds: 0,
  isNewBest: false,
  dialogOpen: false,
};

/** ブラックジャックのゲーム状態を管理する純粋なReducer */
export function blackjackReducer(
  state: BlackjackState,
  action: BlackjackAction
): BlackjackState {
  switch (action.type) {
    case "START_GAME": {
      // プレイヤー2枚、ディーラー2枚を配る
      const [p1, d1, p2, d2, ...rest] = action.deck;
      return {
        ...state,
        deck: rest,
        playerHand: [p1, p2],
        dealerHand: [d1, d2],
        dealerRevealed: false,
        phase: "dealing",
        result: null,
        rounds: state.rounds + 1,
        isNewBest: false,
        dialogOpen: false,
      };
    }

    case "DEAL_COMPLETE": {
      if (state.phase !== "dealing") return state;

      const playerBJ = isNaturalBlackjack(state.playerHand);
      const dealerBJ = isNaturalBlackjack(state.dealerHand);

      // 両方ナチュラルBJ → 引き分け
      if (playerBJ && dealerBJ) {
        return {
          ...state,
          dealerRevealed: true,
          phase: "result",
          result: "draw",
        };
      }

      // プレイヤーのみナチュラルBJ → 特別勝利
      if (playerBJ) {
        return {
          ...state,
          dealerRevealed: true,
          phase: "result",
          result: "blackjack",
        };
      }

      // ディーラーのみナチュラルBJ → プレイヤー負け
      if (dealerBJ) {
        return {
          ...state,
          dealerRevealed: true,
          phase: "result",
          result: "lose",
        };
      }

      // 通常プレイ
      return {
        ...state,
        phase: "playing",
      };
    }

    case "HIT": {
      if (state.phase !== "playing") return state;
      if (state.deck.length === 0) return state;

      const [drawnCard, ...remainingDeck] = state.deck;
      const newHand = [...state.playerHand, drawnCard];

      // バースト判定
      if (isBust(newHand)) {
        return {
          ...state,
          deck: remainingDeck,
          playerHand: newHand,
          dealerRevealed: true,
          phase: "result",
          result: "lose",
        };
      }

      return {
        ...state,
        deck: remainingDeck,
        playerHand: newHand,
      };
    }

    case "STAND": {
      if (state.phase !== "playing") return state;

      return {
        ...state,
        dealerRevealed: true,
        phase: "dealerTurn",
      };
    }

    case "DEALER_DRAW": {
      if (state.phase !== "dealerTurn") return state;

      const dealerTotal = calculateHandTotal(state.dealerHand);

      // 17以上なら勝敗判定
      if (dealerTotal >= DEALER_STAND) {
        const playerTotal = calculateHandTotal(state.playerHand);

        // ディーラーバースト → プレイヤー勝利
        if (dealerTotal > 21) {
          return {
            ...state,
            phase: "result",
            result: "win",
          };
        }

        // 合計比較
        if (playerTotal > dealerTotal) {
          return { ...state, phase: "result", result: "win" };
        }
        if (playerTotal < dealerTotal) {
          return { ...state, phase: "result", result: "lose" };
        }
        return { ...state, phase: "result", result: "draw" };
      }

      // 17未満なら1枚引く
      if (state.deck.length === 0) {
        // デッキ切れ → 現在の手札で勝敗判定
        const playerTotal = calculateHandTotal(state.playerHand);
        if (playerTotal > dealerTotal) {
          return { ...state, phase: "result", result: "win" };
        }
        if (playerTotal < dealerTotal) {
          return { ...state, phase: "result", result: "lose" };
        }
        return { ...state, phase: "result", result: "draw" };
      }

      const [drawnCard, ...remainingDeck] = state.deck;
      return {
        ...state,
        deck: remainingDeck,
        dealerHand: [...state.dealerHand, drawnCard],
      };
    }

    case "SHOW_RESULT": {
      if (state.phase !== "result") return state;

      const isWin = state.result === "win" || state.result === "blackjack";
      const newWins = isWin ? state.wins + 1 : 0;
      const newMaxWins = Math.max(state.maxWins, newWins);

      return {
        ...state,
        phase: "gameOver",
        wins: newWins,
        maxWins: newMaxWins,
        dialogOpen: true,
      };
    }

    case "SET_NEW_BEST":
      return { ...state, isNewBest: action.isNewBest };

    case "NEXT_ROUND":
      return {
        ...state,
        phase: "idle",
        dialogOpen: false,
      };

    case "DISMISS_DIALOG":
      return { ...state, dialogOpen: false };

    case "RESET":
      return initialBlackjackState;

    default:
      return state;
  }
}
