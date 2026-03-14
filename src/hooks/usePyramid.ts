"use client";

import {
  useReducer,
  useEffect,
  useCallback,
  useRef,
  useSyncExternalStore,
} from "react";
import {
  pyramidReducer,
  initialPyramidState,
} from "@/lib/pyramid-reducer";
import { createDeck } from "@/lib/pyramid-cards";
import {
  getPyramidBestScore,
  updatePyramidBestScore,
} from "@/lib/pyramid-storage";
import type {
  PyramidBestScore,
  PyramidPhase,
} from "@/types/pyramid";

/** localStorageのベストスコアを購読するストア（キャッシュ付き） */
let bestScoreListeners: Array<() => void> = [];
let cachedBestScore: PyramidBestScore | null = null;
let cacheInitialized = false;

function subscribeBestScore(callback: () => void) {
  bestScoreListeners.push(callback);
  // コンポーネント再マウント時にキャッシュを最新化
  cachedBestScore = getPyramidBestScore();
  return () => {
    bestScoreListeners = bestScoreListeners.filter((l) => l !== callback);
  };
}

/** キャッシュ済みのスナップショットを返す（参照安定） */
function getSnapshotBestScore(): PyramidBestScore | null {
  if (!cacheInitialized) {
    cachedBestScore = getPyramidBestScore();
    cacheInitialized = true;
  }
  return cachedBestScore;
}

function getServerSnapshotBestScore(): PyramidBestScore | null {
  return null;
}

/** キャッシュを更新してリスナーに通知する */
function notifyBestScoreChange() {
  cachedBestScore = getPyramidBestScore();
  bestScoreListeners.forEach((l) => l());
}

/** ピラミッドソリティアのゲームロジックを管理するカスタムフック */
export function usePyramid() {
  const [state, dispatch] = useReducer(
    pyramidReducer,
    initialPyramidState
  );
  const prevPhaseRef = useRef<PyramidPhase>("idle");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const bestScore = useSyncExternalStore(
    subscribeBestScore,
    getSnapshotBestScore,
    getServerSnapshotBestScore
  );

  // ゲーム完了時のベストスコア更新（勝利時のみ）
  useEffect(() => {
    const isComplete = state.phase === "complete";
    const wasNotComplete = prevPhaseRef.current !== "complete";
    if (isComplete && wasNotComplete && state.result === "win") {
      const updated = updatePyramidBestScore(state.elapsedTime);
      dispatch({ type: "SET_NEW_BEST", isNewBest: updated });
      if (updated) {
        notifyBestScoreChange();
      }
    }
    prevPhaseRef.current = state.phase;
  }, [state.phase, state.result, state.elapsedTime]);

  // タイマー管理
  useEffect(() => {
    if (state.phase === "playing" || state.phase === "removing") {
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

  // removing完了後の自動遷移（500ms遅延）
  useEffect(() => {
    if (state.phase === "removing") {
      const timer = setTimeout(() => {
        dispatch({ type: "REMOVE_COMPLETE" });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [state.phase]);

  // 不正ペア表示のクリア（500ms遅延）
  useEffect(() => {
    if (state.invalidPair) {
      const timer = setTimeout(() => {
        dispatch({ type: "CLEAR_INVALID" });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [state.invalidPair]);

  /** ゲームを開始する */
  const startGame = useCallback(() => {
    dispatch({ type: "START_GAME", deck: createDeck() });
  }, []);

  /** カードを選択する */
  const selectCard = useCallback(
    (cardId: number, source: "pyramid" | "waste") => {
      if (state.phase !== "playing") return;
      dispatch({ type: "SELECT_CARD", cardId, source });
    },
    [state.phase]
  );

  /** 選択を解除する */
  const deselect = useCallback(() => {
    dispatch({ type: "DESELECT" });
  }, []);

  /** 山札からカードを引く */
  const drawStock = useCallback(() => {
    if (state.phase !== "playing") return;
    dispatch({ type: "DRAW_STOCK" });
  }, [state.phase]);

  /** 山札をリサイクルする */
  const recycleStock = useCallback(() => {
    if (state.phase !== "playing") return;
    dispatch({ type: "RECYCLE_STOCK" });
  }, [state.phase]);

  /** ダイアログを閉じる */
  const dismissDialog = useCallback(() => {
    dispatch({ type: "DISMISS_DIALOG" });
  }, []);

  /** ゲームをリセットする */
  const resetGame = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  return {
    state,
    bestScore,
    startGame,
    selectCard,
    deselect,
    drawStock,
    recycleStock,
    dismissDialog,
    resetGame,
  };
}
