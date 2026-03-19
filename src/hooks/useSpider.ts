"use client";

import {
  useReducer,
  useEffect,
  useCallback,
  useRef,
  useSyncExternalStore,
} from "react";
import {
  spiderReducer,
  initialSpiderState,
} from "@/lib/spider-reducer";
import { createDeck, isValidSequence, canMoveToColumn } from "@/lib/spider-cards";
import {
  getSpiderBestScore,
  updateSpiderBestScore,
} from "@/lib/spider-storage";
import type {
  SpiderBestScore,
  SpiderPhase,
} from "@/types/spider";

/** localStorageのベストスコアを購読するストア（キャッシュ付き） */
let bestScoreListeners: Array<() => void> = [];
let cachedBestScore: SpiderBestScore | null = null;
let cacheInitialized = false;

function subscribeBestScore(callback: () => void) {
  bestScoreListeners.push(callback);
  // コンポーネント再マウント時にキャッシュを最新化
  cachedBestScore = getSpiderBestScore();
  return () => {
    bestScoreListeners = bestScoreListeners.filter((l) => l !== callback);
  };
}

/** キャッシュ済みのスナップショットを返す（参照安定） */
function getSnapshotBestScore(): SpiderBestScore | null {
  if (!cacheInitialized) {
    cachedBestScore = getSpiderBestScore();
    cacheInitialized = true;
  }
  return cachedBestScore;
}

function getServerSnapshotBestScore(): SpiderBestScore | null {
  return null;
}

/** キャッシュを更新してリスナーに通知する */
function notifyBestScoreChange() {
  cachedBestScore = getSpiderBestScore();
  bestScoreListeners.forEach((l) => l());
}

/** スパイダーソリティアのゲームロジックを管理するカスタムフック */
export function useSpider() {
  const [state, dispatch] = useReducer(
    spiderReducer,
    initialSpiderState
  );
  const prevPhaseRef = useRef<SpiderPhase>("idle");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const bestScore = useSyncExternalStore(
    subscribeBestScore,
    getSnapshotBestScore,
    getServerSnapshotBestScore
  );

  // ゲーム終了時のベストスコア更新（クリア時のみ）
  useEffect(() => {
    const isCleared = state.phase === "cleared";
    const wasNotCleared = prevPhaseRef.current !== "cleared";
    if (isCleared && wasNotCleared) {
      const { movesUpdated, timeUpdated } = updateSpiderBestScore(state.moves, state.elapsedTime);
      dispatch({ type: "SET_NEW_BEST", isNewBestMoves: movesUpdated, isNewBestTime: timeUpdated });
      if (movesUpdated || timeUpdated) {
        notifyBestScoreChange();
      }
    }
    prevPhaseRef.current = state.phase;
  }, [state.phase, state.moves, state.elapsedTime]);

  // タイマー管理
  useEffect(() => {
    if (state.phase === "playing") {
      timerRef.current = setInterval(() => {
        dispatch({ type: "TICK" });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [state.phase]);

  /** ゲームを開始する */
  const startGame = useCallback(() => {
    dispatch({ type: "START_GAME", deck: createDeck() });
  }, []);

  /** カードをクリックする */
  const handleCardClick = useCallback(
    (columnIndex: number, cardIndex: number) => {
      if (state.phase !== "playing") return;

      const column = state.columns[columnIndex];

      // 選択中でない場合 → 選択
      if (state.selectedColumn === null) {
        dispatch({ type: "SELECT_CARD", columnIndex, cardIndex });
        return;
      }

      // 同じ列の同じカードをクリック → 選択解除
      if (
        state.selectedColumn === columnIndex &&
        state.selectedCardIndex === cardIndex
      ) {
        dispatch({ type: "DESELECT" });
        return;
      }

      // 同じ列の別カードをクリック → 再選択
      if (state.selectedColumn === columnIndex) {
        // まず選択解除してから再選択
        dispatch({ type: "DESELECT" });
        dispatch({ type: "SELECT_CARD", columnIndex, cardIndex });
        return;
      }

      // 別列をクリック → 移動を試みる
      // クリックしたのが列末尾のカードか空列の場合は移動先として扱う
      if (column.length === 0 || cardIndex === column.length - 1) {
        dispatch({ type: "MOVE_CARDS", targetColumn: columnIndex });
        return;
      }

      // 別列の途中カードをクリック → 移動を試みる
      // 移動先の列のトップにマッチするか確認
      const sourceColumn = state.columns[state.selectedColumn];
      const movingCards = sourceColumn.slice(state.selectedCardIndex!);
      if (canMoveToColumn(movingCards, column)) {
        dispatch({ type: "MOVE_CARDS", targetColumn: columnIndex });
      } else {
        // 移動できない → そのカードで再選択を試みる
        dispatch({ type: "DESELECT" });
        if (column[cardIndex].faceUp && isValidSequence(column, cardIndex)) {
          dispatch({ type: "SELECT_CARD", columnIndex, cardIndex });
        }
      }
    },
    [state.phase, state.columns, state.selectedColumn, state.selectedCardIndex]
  );

  /** 空列をクリックする */
  const handleEmptyColumnClick = useCallback(
    (columnIndex: number) => {
      if (state.phase !== "playing") return;
      if (state.selectedColumn === null) return;
      dispatch({ type: "MOVE_CARDS", targetColumn: columnIndex });
    },
    [state.phase, state.selectedColumn]
  );

  /** 山札から配布する */
  const dealRow = useCallback(() => {
    if (state.phase !== "playing") return;
    dispatch({ type: "DEAL_ROW" });
  }, [state.phase]);

  /** ギブアップする */
  const giveUp = useCallback(() => {
    if (state.phase !== "playing") return;
    dispatch({ type: "GIVE_UP" });
  }, [state.phase]);

  /** ダイアログを閉じる */
  const dismissDialog = useCallback(() => {
    dispatch({ type: "DISMISS_DIALOG" });
  }, []);

  /** ゲームをリセットする */
  const resetGame = useCallback(() => {
    dispatch({ type: "RESTART" });
  }, []);

  return {
    state,
    bestScore,
    startGame,
    handleCardClick,
    handleEmptyColumnClick,
    dealRow,
    giveUp,
    dismissDialog,
    resetGame,
  };
}
