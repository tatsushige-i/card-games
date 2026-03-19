import type { TenPlayState, TenPlayAction } from "@/types/ten-play";
import {
  buildTableau,
  isValidPair,
  isSoloRemovable,
  getRemainingTableauCards,
  isStuck,
  refillTableau,
  TABLEAU_SIZE,
} from "./ten-play-cards";

/** ゲーム状態の初期値 */
export const initialTenPlayState: TenPlayState = {
  tableau: [],
  stock: [],
  selectedIndices: [],
  removedCount: 0,
  phase: "idle",
  result: null,
  elapsedTime: 0,
  invalidPair: null,
  isNewBest: false,
  dialogOpen: false,
};

/** 除去→補充→クリア/手詰まり判定を行う共通処理 */
function removeAndRefill(
  state: TenPlayState,
  indicesToRemove: number[]
): TenPlayState {
  // カードを除去（nullにする）
  const newTableau = state.tableau.map((c, i) =>
    indicesToRemove.includes(i) ? null : c
  );
  const newRemovedCount = state.removedCount + 1;

  // 補充
  const { tableau: refilledTableau, stock: newStock } = refillTableau(
    newTableau,
    state.stock
  );

  // クリア判定（タブロー上のカードが0枚かつ山札も0枚）
  if (getRemainingTableauCards(refilledTableau) === 0 && newStock.length === 0) {
    return {
      ...state,
      tableau: refilledTableau,
      stock: newStock,
      selectedIndices: [],
      removedCount: newRemovedCount,
      phase: "cleared",
      result: "win",
      invalidPair: null,
      dialogOpen: true,
    };
  }

  // 手詰まり判定
  if (isStuck(refilledTableau)) {
    return {
      ...state,
      tableau: refilledTableau,
      stock: newStock,
      selectedIndices: [],
      removedCount: newRemovedCount,
      phase: "stuck",
      result: "lose",
      invalidPair: null,
      dialogOpen: true,
    };
  }

  return {
    ...state,
    tableau: refilledTableau,
    stock: newStock,
    selectedIndices: [],
    removedCount: newRemovedCount,
    invalidPair: null,
  };
}

/** テンプレイのゲーム状態を管理する純粋なReducer */
export function tenPlayReducer(
  state: TenPlayState,
  action: TenPlayAction
): TenPlayState {
  switch (action.type) {
    case "START_GAME": {
      const { tableau, stock } = buildTableau(action.deck);

      // 初期手詰まり判定
      if (isStuck(tableau)) {
        return {
          ...initialTenPlayState,
          tableau,
          stock,
          phase: "stuck",
          result: "lose",
          dialogOpen: true,
        };
      }

      return {
        ...initialTenPlayState,
        tableau,
        stock,
        phase: "playing",
      };
    }

    case "SELECT_CARD": {
      if (state.phase !== "playing") return state;

      const { index } = action;
      if (index < 0 || index >= TABLEAU_SIZE) return state;

      const card = state.tableau[index];
      if (!card) return state;

      // 既に選択済み → 選択解除
      if (state.selectedIndices.includes(index)) {
        return {
          ...state,
          selectedIndices: state.selectedIndices.filter((i) => i !== index),
        };
      }

      // 10のカード → 単独除去
      if (isSoloRemovable(card)) {
        return removeAndRefill(state, [index]);
      }

      // 1枚目の選択
      if (state.selectedIndices.length === 0) {
        return {
          ...state,
          selectedIndices: [index],
        };
      }

      // 2枚目の選択 → ペア判定
      const firstIndex = state.selectedIndices[0];
      const firstCard = state.tableau[firstIndex];
      if (!firstCard) return state;

      if (isValidPair(firstCard, card)) {
        // ペア除去成功
        return removeAndRefill(state, [firstIndex, index]);
      }

      // 不正ペア
      return {
        ...state,
        invalidPair: [firstIndex, index],
        selectedIndices: [],
      };
    }

    case "CLEAR_INVALID":
      return {
        ...state,
        invalidPair: null,
      };

    case "TICK":
      if (state.phase !== "playing") return state;
      return { ...state, elapsedTime: state.elapsedTime + 1 };

    case "SET_NEW_BEST":
      return { ...state, isNewBest: action.isNewBest };

    case "DISMISS_DIALOG":
      return { ...state, dialogOpen: false };

    case "RESTART":
      return initialTenPlayState;

    default:
      return state;
  }
}
