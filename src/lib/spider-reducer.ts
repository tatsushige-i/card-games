import type { SpiderState, SpiderAction } from "@/types/spider";
import {
  buildColumns,
  isValidSequence,
  canMoveToColumn,
  removeCompleteSequence,
  canDealRow,
  TARGET_SETS,
} from "./spider-cards";

/** ゲーム状態の初期値 */
export const initialSpiderState: SpiderState = {
  columns: [],
  stock: [],
  completedSets: 0,
  moves: 0,
  phase: "idle",
  result: null,
  elapsedTime: 0,
  selectedColumn: null,
  selectedCardIndex: null,
  isNewBestMoves: false,
  isNewBestTime: false,
  dialogOpen: false,
};

/**
 * 列の完成列を検出・除去し、状態を更新する
 */
function checkAndRemoveComplete(
  columns: SpiderState["columns"],
  completedSets: number
): { columns: SpiderState["columns"]; completedSets: number } {
  const newColumns = [...columns];
  let sets = completedSets;

  for (let i = 0; i < newColumns.length; i++) {
    const { newColumn, removed } = removeCompleteSequence(newColumns[i]);
    if (removed) {
      newColumns[i] = newColumn;
      sets++;
    }
  }

  return { columns: newColumns, completedSets: sets };
}

/** スパイダーソリティアのゲーム状態を管理する純粋なReducer */
export function spiderReducer(
  state: SpiderState,
  action: SpiderAction
): SpiderState {
  switch (action.type) {
    case "START_GAME": {
      const { columns, stock } = buildColumns(action.deck);
      return {
        ...initialSpiderState,
        columns,
        stock,
        phase: "playing",
      };
    }

    case "SELECT_CARD": {
      if (state.phase !== "playing") return state;

      const { columnIndex, cardIndex } = action;
      const column = state.columns[columnIndex];
      if (!column || cardIndex < 0 || cardIndex >= column.length) return state;

      // 裏向きカードは選択不可
      if (!column[cardIndex].faceUp) return state;

      // 選択位置から末尾までが有効なシーケンスか検証
      if (!isValidSequence(column, cardIndex)) return state;

      return {
        ...state,
        selectedColumn: columnIndex,
        selectedCardIndex: cardIndex,
      };
    }

    case "MOVE_CARDS": {
      if (state.phase !== "playing") return state;
      if (state.selectedColumn === null || state.selectedCardIndex === null) {
        return state;
      }

      const { targetColumn } = action;
      const sourceCol = state.selectedColumn;
      const sourceIndex = state.selectedCardIndex;

      // 同じ列への移動は選択解除
      if (sourceCol === targetColumn) {
        return { ...state, selectedColumn: null, selectedCardIndex: null };
      }

      const sourceColumn = state.columns[sourceCol];
      const movingCards = sourceColumn.slice(sourceIndex);

      // 移動先に移動可能か判定
      if (!canMoveToColumn(movingCards, state.columns[targetColumn])) {
        return { ...state, selectedColumn: null, selectedCardIndex: null };
      }

      // カードを移動
      const newColumns = state.columns.map((col, i) => {
        if (i === sourceCol) return col.slice(0, sourceIndex);
        if (i === targetColumn) return [...col, ...movingCards];
        return col;
      });

      // 移動元の新しい末尾カードを表にする
      const sourceNewCol = newColumns[sourceCol];
      if (
        sourceNewCol.length > 0 &&
        !sourceNewCol[sourceNewCol.length - 1].faceUp
      ) {
        newColumns[sourceCol] = [
          ...sourceNewCol.slice(0, -1),
          { ...sourceNewCol[sourceNewCol.length - 1], faceUp: true },
        ];
      }

      // 完成列の検出・除去
      const result = checkAndRemoveComplete(newColumns, state.completedSets);

      // クリア判定
      if (result.completedSets >= TARGET_SETS) {
        return {
          ...state,
          columns: result.columns,
          completedSets: result.completedSets,
          moves: state.moves + 1,
          selectedColumn: null,
          selectedCardIndex: null,
          phase: "cleared",
          result: "win",
          dialogOpen: true,
        };
      }

      return {
        ...state,
        columns: result.columns,
        completedSets: result.completedSets,
        moves: state.moves + 1,
        selectedColumn: null,
        selectedCardIndex: null,
      };
    }

    case "DEAL_ROW": {
      if (state.phase !== "playing") return state;
      if (!canDealRow(state.columns, state.stock)) return state;

      // 各列に1枚ずつ表向きで追加
      const columnCount = state.columns.length;
      const newColumns = state.columns.map((col, i) => [
        ...col,
        { ...state.stock[i], faceUp: true },
      ]);
      const newStock = state.stock.slice(columnCount);

      // 配布後に完成列の検出・除去
      const result = checkAndRemoveComplete(newColumns, state.completedSets);

      // クリア判定
      if (result.completedSets >= TARGET_SETS) {
        return {
          ...state,
          columns: result.columns,
          stock: newStock,
          completedSets: result.completedSets,
          moves: state.moves + 1,
          selectedColumn: null,
          selectedCardIndex: null,
          phase: "cleared",
          result: "win",
          dialogOpen: true,
        };
      }

      return {
        ...state,
        columns: result.columns,
        stock: newStock,
        moves: state.moves + 1,
        selectedColumn: null,
        selectedCardIndex: null,
      };
    }

    case "DESELECT":
      return { ...state, selectedColumn: null, selectedCardIndex: null };

    case "TICK":
      if (state.phase !== "playing") return state;
      return { ...state, elapsedTime: state.elapsedTime + 1 };

    case "GIVE_UP":
      if (state.phase !== "playing") return state;
      return {
        ...state,
        phase: "gameOver",
        result: "lose",
        dialogOpen: true,
        selectedColumn: null,
        selectedCardIndex: null,
      };

    case "SET_NEW_BEST":
      return {
        ...state,
        isNewBestMoves: action.isNewBestMoves,
        isNewBestTime: action.isNewBestTime,
      };

    case "DISMISS_DIALOG":
      return { ...state, dialogOpen: false };

    case "RESTART":
      return initialSpiderState;

    default:
      return state;
  }
}
