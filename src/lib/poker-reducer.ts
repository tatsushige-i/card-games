import type { PokerState, PokerAction } from "@/types/poker";
import { evaluateHand, HAND_PAYOUTS, MAX_ROUNDS } from "./poker-cards";

/** ゲーム状態の初期値 */
export const initialPokerState: PokerState = {
  deck: [],
  hand: [],
  held: [false, false, false, false, false],
  phase: "idle",
  handRank: null,
  roundScore: 0,
  totalScore: 0,
  round: 0,
  isNewBest: false,
  dialogOpen: false,
};

/** ビデオポーカーのゲーム状態を管理する純粋なReducer */
export function pokerReducer(
  state: PokerState,
  action: PokerAction
): PokerState {
  switch (action.type) {
    case "START_GAME": {
      // デッキから5枚配る
      const hand = action.deck.slice(0, 5);
      const rest = action.deck.slice(5);
      return {
        ...state,
        deck: rest,
        hand,
        held: [false, false, false, false, false],
        phase: "dealing",
        handRank: null,
        roundScore: 0,
        round: state.round + 1,
        isNewBest: false,
        dialogOpen: false,
      };
    }

    case "DEAL_COMPLETE": {
      if (state.phase !== "dealing") return state;
      return {
        ...state,
        phase: "holding",
      };
    }

    case "TOGGLE_HOLD": {
      if (state.phase !== "holding") return state;
      if (action.index < 0 || action.index >= 5) return state;
      const newHeld = [...state.held];
      newHeld[action.index] = !newHeld[action.index];
      return {
        ...state,
        held: newHeld,
      };
    }

    case "DRAW": {
      if (state.phase !== "holding") return state;

      // ホールドしていないカードをデッキから交換
      const newHand = [...state.hand];
      let deckIndex = 0;
      for (let i = 0; i < 5; i++) {
        if (!state.held[i] && deckIndex < state.deck.length) {
          newHand[i] = state.deck[deckIndex];
          deckIndex++;
        }
      }

      return {
        ...state,
        hand: newHand,
        deck: state.deck.slice(deckIndex),
        phase: "drawing",
      };
    }

    case "DRAW_COMPLETE": {
      if (state.phase !== "drawing") return state;

      // 役判定
      const handRank = evaluateHand(state.hand);
      const roundScore = HAND_PAYOUTS[handRank];

      return {
        ...state,
        handRank,
        roundScore,
        phase: "result",
      };
    }

    case "SHOW_RESULT": {
      if (state.phase !== "result") return state;

      const newTotalScore = state.totalScore + state.roundScore;
      const isLastRound = state.round >= MAX_ROUNDS;

      // 最終ラウンド: ダイアログを表示
      if (isLastRound) {
        return {
          ...state,
          totalScore: newTotalScore,
          phase: "gameOver",
          dialogOpen: true,
        };
      }

      // 中間ラウンド: ダイアログなしで自動的に次のラウンドへ
      return {
        ...state,
        totalScore: newTotalScore,
        phase: "idle",
      };
    }

    case "SET_NEW_BEST":
      return { ...state, isNewBest: action.isNewBest };

    case "NEXT_ROUND": {
      if (state.round >= MAX_ROUNDS) return state;
      return {
        ...state,
        phase: "idle",
        dialogOpen: false,
      };
    }

    case "DISMISS_DIALOG":
      return { ...state, dialogOpen: false };

    case "RESET":
      return initialPokerState;

    default:
      return state;
  }
}
