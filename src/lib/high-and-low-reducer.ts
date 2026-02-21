import type { HighAndLowState, HighAndLowAction } from "@/types/high-and-low";
import { INITIAL_SCORE, WIN_SCORE, LOSE_SCORE } from "./high-and-low-cards";

/** ゲーム状態の初期値 */
export const initialHighAndLowState: HighAndLowState = {
  deck: [],
  currentCard: null,
  nextCard: null,
  playedCards: [],
  score: INITIAL_SCORE,
  streak: 0,
  maxStreak: 0,
  lastResult: null,
  phase: "idle",
  cardsPlayed: 0,
  isNewBest: false,
  dialogOpen: false,
};

/** ハイ＆ローのゲーム状態を管理する純粋なReducer */
export function highAndLowReducer(
  state: HighAndLowState,
  action: HighAndLowAction
): HighAndLowState {
  switch (action.type) {
    case "START_GAME": {
      const [firstCard, ...rest] = action.deck;
      return {
        ...initialHighAndLowState,
        deck: rest,
        currentCard: firstCard,
        phase: "playing",
        cardsPlayed: 1,
      };
    }

    case "GUESS": {
      if (state.phase !== "playing") return state;
      if (!state.currentCard || state.deck.length === 0) return state;

      const [nextCard, ...remainingDeck] = state.deck;

      // 予想の判定
      const isHigher = nextCard.value > state.currentCard.value;
      const isLower = nextCard.value < state.currentCard.value;
      const isDraw = nextCard.value === state.currentCard.value;
      const isCorrect =
        (action.guess === "high" && isHigher) ||
        (action.guess === "low" && isLower);

      // 同値は引き分け（スコア±0、連勝維持）
      const result = isDraw ? "draw" : isCorrect ? "correct" : "incorrect";
      const newScore = isDraw ? state.score : isCorrect ? state.score + 1 : state.score - 1;
      const newStreak = isDraw ? state.streak : isCorrect ? state.streak + 1 : 0;
      const newMaxStreak = Math.max(state.maxStreak, newStreak);

      // 正解時のみカードを積み重ねる（連勝の視覚表現）
      const newPlayedCards = isCorrect
        ? [...state.playedCards, state.currentCard]
        : [];

      return {
        ...state,
        deck: remainingDeck,
        nextCard,
        playedCards: newPlayedCards,
        lastResult: result,
        score: newScore,
        streak: newStreak,
        maxStreak: newMaxStreak,
        cardsPlayed: state.cardsPlayed + 1,
        phase: "revealing",
      };
    }

    case "REVEAL_COMPLETE": {
      if (state.phase !== "revealing") return state;

      // 勝利判定
      if (state.score >= WIN_SCORE) {
        return {
          ...state,
          currentCard: state.nextCard,
          nextCard: null,
          lastResult: null,
          phase: "win",
          dialogOpen: true,
        };
      }

      // 敗北判定
      if (state.score <= LOSE_SCORE) {
        return {
          ...state,
          currentCard: state.nextCard,
          nextCard: null,
          lastResult: null,
          phase: "lose",
          dialogOpen: true,
        };
      }

      // デッキ切れ → 生き残り勝利
      if (state.deck.length === 0) {
        return {
          ...state,
          currentCard: state.nextCard,
          nextCard: null,
          lastResult: null,
          phase: "win",
          dialogOpen: true,
        };
      }

      // ゲーム続行
      return {
        ...state,
        currentCard: state.nextCard,
        nextCard: null,
        lastResult: null,
        phase: "playing",
      };
    }

    case "SET_NEW_BEST":
      return { ...state, isNewBest: action.isNewBest };

    case "DISMISS_DIALOG":
      return { ...state, dialogOpen: false };

    case "RESET":
      return initialHighAndLowState;

    default:
      return state;
  }
}
