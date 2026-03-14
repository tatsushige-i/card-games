import type { PyramidState, PyramidAction } from "@/types/pyramid";
import {
  buildPyramid,
  isExposed,
  isStuck,
  TARGET_SUM,
  MAX_RECYCLES,
} from "./pyramid-cards";

/** ゲーム状態の初期値 */
export const initialPyramidState: PyramidState = {
  pyramid: [],
  stock: [],
  waste: [],
  selectedCardId: null,
  selectedSource: null,
  phase: "idle",
  result: null,
  elapsedTime: 0,
  removedCount: 0,
  stockRecycles: 0,
  invalidPair: null,
  isNewBest: false,
  dialogOpen: false,
};

/** ピラミッド全カードが除去済みか判定する */
function isPyramidCleared(pyramid: PyramidState["pyramid"]): boolean {
  return pyramid.every((c) => c.removed);
}

/** ピラミッドソリティアのゲーム状態を管理する純粋なReducer */
export function pyramidReducer(
  state: PyramidState,
  action: PyramidAction
): PyramidState {
  switch (action.type) {
    case "START_GAME": {
      const { pyramid, remaining } = buildPyramid(action.deck);
      return {
        ...initialPyramidState,
        pyramid,
        stock: remaining,
        phase: "playing",
      };
    }

    case "SELECT_CARD": {
      if (state.phase !== "playing") return state;

      const { cardId, source } = action;

      // カードの値を取得
      let cardValue: number;
      if (source === "pyramid") {
        const pyramidCard = state.pyramid.find((c) => c.id === cardId);
        if (!pyramidCard || pyramidCard.removed) return state;
        // 露出チェック
        if (!isExposed(pyramidCard, state.pyramid)) return state;
        cardValue = pyramidCard.value;
      } else {
        // 捨て札のトップのみ選択可能
        if (state.waste.length === 0) return state;
        const wasteTop = state.waste[state.waste.length - 1];
        if (wasteTop.id !== cardId) return state;
        cardValue = wasteTop.value;
      }

      // K（値13）は単独除去
      if (cardValue === TARGET_SUM) {
        if (source === "pyramid") {
          const newPyramid = state.pyramid.map((c) =>
            c.id === cardId ? { ...c, removed: true } : c
          );
          const newRemovedPairs = state.removedCount + 1;

          // クリア判定
          if (isPyramidCleared(newPyramid)) {
            return {
              ...state,
              pyramid: newPyramid,
              selectedCardId: null,
              selectedSource: null,
              phase: "complete",
              result: "win",
              removedCount: newRemovedPairs,
              dialogOpen: true,
            };
          }

          // removingフェーズへ遷移
          return {
            ...state,
            pyramid: newPyramid,
            selectedCardId: null,
            selectedSource: null,
            phase: "removing",
            removedCount: newRemovedPairs,
          };
        }
        // 捨て札のKも除去可能
        const newWaste = state.waste.slice(0, -1);
        return {
          ...state,
          waste: newWaste,
          selectedCardId: null,
          selectedSource: null,
          phase: "removing",
          removedCount: state.removedCount + 1,
        };
      }

      // 1枚目の選択
      if (state.selectedCardId === null) {
        return {
          ...state,
          selectedCardId: cardId,
          selectedSource: source,
        };
      }

      // 同じカードを再選択 → 選択解除
      if (state.selectedCardId === cardId) {
        return {
          ...state,
          selectedCardId: null,
          selectedSource: null,
        };
      }

      // 2枚目の選択 → ペア判定
      let firstValue: number;
      if (state.selectedSource === "pyramid") {
        const firstCard = state.pyramid.find(
          (c) => c.id === state.selectedCardId
        );
        if (!firstCard) return state;
        firstValue = firstCard.value;
      } else {
        const firstCard = state.waste.find(
          (c) => c.id === state.selectedCardId
        );
        if (!firstCard) return state;
        firstValue = firstCard.value;
      }

      // 合計13チェック
      if (firstValue + cardValue === TARGET_SUM) {
        // ペア除去成功
        let newPyramid = state.pyramid;
        let newWaste = [...state.waste];

        // 1枚目の除去
        if (state.selectedSource === "pyramid") {
          newPyramid = newPyramid.map((c) =>
            c.id === state.selectedCardId ? { ...c, removed: true } : c
          );
        } else {
          newWaste = newWaste.filter((c) => c.id !== state.selectedCardId);
        }

        // 2枚目の除去
        if (source === "pyramid") {
          newPyramid = newPyramid.map((c) =>
            c.id === cardId ? { ...c, removed: true } : c
          );
        } else {
          newWaste = newWaste.filter((c) => c.id !== cardId);
        }

        const newRemovedPairs = state.removedCount + 1;

        // クリア判定
        if (isPyramidCleared(newPyramid)) {
          return {
            ...state,
            pyramid: newPyramid,
            waste: newWaste,
            selectedCardId: null,
            selectedSource: null,
            phase: "complete",
            result: "win",
            removedCount: newRemovedPairs,
            dialogOpen: true,
          };
        }

        // removingフェーズへ遷移
        return {
          ...state,
          pyramid: newPyramid,
          waste: newWaste,
          selectedCardId: null,
          selectedSource: null,
          phase: "removing",
          removedCount: newRemovedPairs,
        };
      }

      // 合計13でない → 不正ペア
      return {
        ...state,
        invalidPair: [state.selectedCardId, cardId],
        selectedCardId: null,
        selectedSource: null,
      };
    }

    case "DESELECT":
      return {
        ...state,
        selectedCardId: null,
        selectedSource: null,
      };

    case "DRAW_STOCK": {
      if (state.phase !== "playing") return state;
      if (state.stock.length === 0) return state;

      const [drawnCard, ...remainingStock] = state.stock;
      const newWaste = [...state.waste, drawnCard];

      // 手詰まり判定（山札から引いた後）
      if (isStuck(state.pyramid, remainingStock, newWaste, state.stockRecycles)) {
        return {
          ...state,
          stock: remainingStock,
          waste: newWaste,
          selectedCardId: null,
          selectedSource: null,
          phase: "complete",
          result: "lose",
          dialogOpen: true,
        };
      }

      return {
        ...state,
        stock: remainingStock,
        waste: newWaste,
        selectedCardId: null,
        selectedSource: null,
      };
    }

    case "RECYCLE_STOCK": {
      if (state.phase !== "playing") return state;
      if (state.stock.length > 0) return state;
      if (state.waste.length === 0) return state;
      if (state.stockRecycles >= MAX_RECYCLES) return state;

      // 捨て札を裏返して山札にする（順序を反転）
      return {
        ...state,
        stock: [...state.waste].reverse(),
        waste: [],
        stockRecycles: state.stockRecycles + 1,
        selectedCardId: null,
        selectedSource: null,
      };
    }

    case "REMOVE_COMPLETE": {
      if (state.phase !== "removing") return state;

      // 手詰まり判定
      if (isStuck(state.pyramid, state.stock, state.waste, state.stockRecycles)) {
        return {
          ...state,
          phase: "complete",
          result: "lose",
          dialogOpen: true,
        };
      }

      return {
        ...state,
        phase: "playing",
      };
    }

    case "TICK":
      if (state.phase !== "playing" && state.phase !== "removing") return state;
      return { ...state, elapsedTime: state.elapsedTime + 1 };

    case "CLEAR_INVALID":
      return {
        ...state,
        invalidPair: null,
      };

    case "SET_NEW_BEST":
      return { ...state, isNewBest: action.isNewBest };

    case "DISMISS_DIALOG":
      return { ...state, dialogOpen: false };

    case "RESET":
      return initialPyramidState;

    default:
      return state;
  }
}
