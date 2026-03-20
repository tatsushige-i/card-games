import type { TriPeaksState, TriPeaksAction } from "@/types/tri-peaks";
import {
  buildTableau,
  isExposed,
  isAdjacentValue,
  isStuck,
  TABLEAU_CARD_COUNT,
} from "./tri-peaks-cards";

/** ゲーム状態の初期値 */
export const initialTriPeaksState: TriPeaksState = {
  tableau: [],
  stock: [],
  waste: [],
  score: 0,
  combo: 0,
  removedCount: 0,
  elapsedTime: 0,
  phase: "idle",
  result: null,
  isNewBest: false,
  dialogOpen: false,
};

/** トライピークスのゲーム状態を管理する純粋なReducer */
export function triPeaksReducer(
  state: TriPeaksState,
  action: TriPeaksAction
): TriPeaksState {
  switch (action.type) {
    case "START_GAME": {
      const { tableau, stock } = buildTableau(action.deck);
      // 山札の先頭1枚を捨て札に置く
      const [firstCard, ...remainingStock] = stock;
      return {
        ...initialTriPeaksState,
        tableau,
        stock: remainingStock,
        waste: [firstCard],
        phase: "playing",
      };
    }

    case "DRAW": {
      if (state.phase !== "playing") return state;
      if (state.stock.length === 0) return state;

      const [drawnCard, ...remainingStock] = state.stock;
      const newWaste = [...state.waste, drawnCard];

      // ドロー時にコンボリセット
      const newCombo = 0;

      // ドロー後に手詰まり判定
      if (isStuck(state.tableau, remainingStock, newWaste)) {
        return {
          ...state,
          stock: remainingStock,
          waste: newWaste,
          combo: newCombo,
          phase: "stuck",
          result: "lose",
          dialogOpen: true,
        };
      }

      return {
        ...state,
        stock: remainingStock,
        waste: newWaste,
        combo: newCombo,
      };
    }

    case "REMOVE_CARD": {
      if (state.phase !== "playing") return state;

      const { row, pos } = action;
      const cardIndex = state.tableau.findIndex(
        (c) => c.row === row && c.pos === pos
      );
      if (cardIndex === -1) return state;

      const card = state.tableau[cardIndex];
      if (card.removed) return state;
      if (!isExposed(card, state.tableau)) return state;

      // 捨て札がなければ除去不可
      if (state.waste.length === 0) return state;

      const wasteTop = state.waste[state.waste.length - 1];

      // ±1チェック（K↔Aラップアラウンドあり）
      if (!isAdjacentValue(card.value, wasteTop.value)) return state;

      // カードを除去して捨て札に移動
      const newTableau = state.tableau.map((c, i) =>
        i === cardIndex ? { ...c, removed: true } : c
      );
      const newWaste = [...state.waste, { id: card.id, suit: card.suit, rank: card.rank, value: card.value }];
      const newCombo = state.combo + 1;
      const newScore = state.score + newCombo;
      const newRemovedCount = state.removedCount + 1;

      // クリア判定
      if (newRemovedCount === TABLEAU_CARD_COUNT) {
        return {
          ...state,
          tableau: newTableau,
          waste: newWaste,
          score: newScore,
          combo: newCombo,
          removedCount: newRemovedCount,
          phase: "cleared",
          result: "win",
          dialogOpen: true,
        };
      }

      // 除去後に手詰まり判定
      if (isStuck(newTableau, state.stock, newWaste)) {
        return {
          ...state,
          tableau: newTableau,
          waste: newWaste,
          score: newScore,
          combo: newCombo,
          removedCount: newRemovedCount,
          phase: "stuck",
          result: "lose",
          dialogOpen: true,
        };
      }

      return {
        ...state,
        tableau: newTableau,
        waste: newWaste,
        score: newScore,
        combo: newCombo,
        removedCount: newRemovedCount,
      };
    }

    case "TICK":
      if (state.phase !== "playing") return state;
      return { ...state, elapsedTime: state.elapsedTime + 1 };

    case "SET_NEW_BEST":
      return { ...state, isNewBest: action.isNewBest };

    case "DISMISS_DIALOG":
      return { ...state, dialogOpen: false };

    case "RESTART":
      return initialTriPeaksState;

    default:
      return state;
  }
}
