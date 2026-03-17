import type { GolfState, GolfAction } from "@/types/golf";
import {
  buildColumns,
  isAdjacentValue,
  getRemainingCards,
  isStuck,
} from "./golf-cards";

/** ゲーム状態の初期値 */
export const initialGolfState: GolfState = {
  columns: [],
  stock: [],
  waste: [],
  removedCount: 0,
  phase: "idle",
  result: null,
  elapsedTime: 0,
  isNewBest: false,
  dialogOpen: false,
};

/** ゴルフソリティアのゲーム状態を管理する純粋なReducer */
export function golfReducer(
  state: GolfState,
  action: GolfAction
): GolfState {
  switch (action.type) {
    case "START_GAME": {
      const { columns, stock } = buildColumns(action.deck);
      // 山札の先頭1枚を捨て札に置く
      const [firstCard, ...remainingStock] = stock;
      return {
        ...initialGolfState,
        columns,
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

      // ドロー後に手詰まり判定
      if (isStuck(state.columns, remainingStock, newWaste)) {
        return {
          ...state,
          stock: remainingStock,
          waste: newWaste,
          phase: "stuck",
          result: "lose",
          dialogOpen: true,
        };
      }

      return {
        ...state,
        stock: remainingStock,
        waste: newWaste,
      };
    }

    case "REMOVE_CARD": {
      if (state.phase !== "playing") return state;

      const { columnIndex } = action;
      const column = state.columns[columnIndex];
      if (!column || column.length === 0) return state;

      // 捨て札がなければ除去不可
      if (state.waste.length === 0) return state;

      const wasteTop = state.waste[state.waste.length - 1];
      const tableauCard = column[column.length - 1];

      // ±1チェック
      if (!isAdjacentValue(tableauCard.value, wasteTop.value)) return state;

      // カードを除去して捨て札に移動
      const newColumns = state.columns.map((col, i) =>
        i === columnIndex ? col.slice(0, -1) : col
      );
      const newWaste = [...state.waste, tableauCard];
      const newRemovedCount = state.removedCount + 1;

      // クリア判定
      if (getRemainingCards(newColumns) === 0) {
        return {
          ...state,
          columns: newColumns,
          waste: newWaste,
          removedCount: newRemovedCount,
          phase: "cleared",
          result: "win",
          dialogOpen: true,
        };
      }

      // 除去後に手詰まり判定
      if (isStuck(newColumns, state.stock, newWaste)) {
        return {
          ...state,
          columns: newColumns,
          waste: newWaste,
          removedCount: newRemovedCount,
          phase: "stuck",
          result: "lose",
          dialogOpen: true,
        };
      }

      return {
        ...state,
        columns: newColumns,
        waste: newWaste,
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
      return initialGolfState;

    default:
      return state;
  }
}
