import type { ConcentrationState, ConcentrationAction } from "@/types/concentration";
import { TOTAL_PAIRS } from "./concentration-cards";

/** ゲーム状態の初期値 */
export const initialConcentrationState: ConcentrationState = {
  cards: [],
  flippedIds: [],
  moves: 0,
  matchedPairs: 0,
  totalPairs: TOTAL_PAIRS,
  phase: "idle",
  elapsedTime: 0,
  isNewBest: false,
  dialogOpen: false,
};

/** ゲーム状態を管理する純粋なReducer */
export function concentrationReducer(state: ConcentrationState, action: ConcentrationAction): ConcentrationState {
  switch (action.type) {
    case "START_GAME":
      return {
        ...initialConcentrationState,
        cards: action.cards,
        phase: "playing",
      };

    case "FLIP_CARD": {
      // ゲーム中でなければ無視
      if (state.phase !== "playing") return state;
      // 既に2枚めくられていれば無視
      if (state.flippedIds.length >= 2) return state;

      const card = state.cards.find((c) => c.id === action.cardId);
      // カードが存在しない、または既にめくられている/マッチ済みなら無視
      if (!card || card.status !== "hidden") return state;

      const newCards = state.cards.map((c) =>
        c.id === action.cardId ? { ...c, status: "flipped" as const } : c
      );
      const newFlippedIds = [...state.flippedIds, action.cardId];

      return {
        ...state,
        cards: newCards,
        flippedIds: newFlippedIds,
      };
    }

    case "CHECK_MATCH": {
      if (state.flippedIds.length !== 2) return state;

      const [firstId, secondId] = state.flippedIds;
      const firstCard = state.cards.find((c) => c.id === firstId);
      const secondCard = state.cards.find((c) => c.id === secondId);

      if (!firstCard || !secondCard) return state;

      const isMatch = firstCard.emoji === secondCard.emoji;
      const newMatchedPairs = isMatch
        ? state.matchedPairs + 1
        : state.matchedPairs;

      const newCards = state.cards.map((c) => {
        if (c.id === firstId || c.id === secondId) {
          return { ...c, status: isMatch ? ("matched" as const) : ("hidden" as const) };
        }
        return c;
      });

      const isComplete = newMatchedPairs === state.totalPairs;

      return {
        ...state,
        cards: newCards,
        flippedIds: [],
        moves: state.moves + 1,
        matchedPairs: newMatchedPairs,
        phase: isComplete ? "complete" : "playing",
        dialogOpen: isComplete ? true : state.dialogOpen,
      };
    }

    case "TICK":
      if (state.phase !== "playing") return state;
      return { ...state, elapsedTime: state.elapsedTime + 1 };

    case "SET_NEW_BEST":
      return { ...state, isNewBest: action.isNewBest };

    case "DISMISS_DIALOG":
      return { ...state, dialogOpen: false };

    case "RESET":
      return initialConcentrationState;

    default:
      return state;
  }
}
