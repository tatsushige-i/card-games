"use client";

import {
  useReducer,
  useEffect,
  useCallback,
  useRef,
  useSyncExternalStore,
} from "react";
import {
  triPeaksReducer,
  initialTriPeaksState,
} from "@/lib/tri-peaks-reducer";
import { createDeck } from "@/lib/tri-peaks-cards";
import {
  getTriPeaksBestScore,
  updateTriPeaksBestScore,
} from "@/lib/tri-peaks-storage";
import type {
  TriPeaksBestScore,
  TriPeaksPhase,
} from "@/types/tri-peaks";

/** localStorageのベストスコアを購読するストア（キャッシュ付き） */
let bestScoreListeners: Array<() => void> = [];
let cachedBestScore: TriPeaksBestScore | null = null;
let cacheInitialized = false;

function subscribeBestScore(callback: () => void) {
  bestScoreListeners.push(callback);
  // コンポーネント再マウント時にキャッシュを最新化
  cachedBestScore = getTriPeaksBestScore();
  return () => {
    bestScoreListeners = bestScoreListeners.filter((l) => l !== callback);
  };
}

/** キャッシュ済みのスナップショットを返す（参照安定） */
function getSnapshotBestScore(): TriPeaksBestScore | null {
  if (!cacheInitialized) {
    cachedBestScore = getTriPeaksBestScore();
    cacheInitialized = true;
  }
  return cachedBestScore;
}

function getServerSnapshotBestScore(): TriPeaksBestScore | null {
  return null;
}

/** キャッシュを更新してリスナーに通知する */
function notifyBestScoreChange() {
  cachedBestScore = getTriPeaksBestScore();
  bestScoreListeners.forEach((l) => l());
}

/** トライピークスのゲームロジックを管理するカスタムフック */
export function useTriPeaks() {
  const [state, dispatch] = useReducer(
    triPeaksReducer,
    initialTriPeaksState
  );
  const prevPhaseRef = useRef<TriPeaksPhase>("idle");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const bestScore = useSyncExternalStore(
    subscribeBestScore,
    getSnapshotBestScore,
    getServerSnapshotBestScore
  );

  // ゲーム終了時のベストスコア更新
  useEffect(() => {
    const isGameOver = state.phase === "cleared" || state.phase === "stuck";
    const wasNotGameOver =
      prevPhaseRef.current !== "cleared" && prevPhaseRef.current !== "stuck";
    if (isGameOver && wasNotGameOver) {
      const updated = updateTriPeaksBestScore(state.score);
      dispatch({ type: "SET_NEW_BEST", isNewBest: updated });
      if (updated) {
        notifyBestScoreChange();
      }
    }
    prevPhaseRef.current = state.phase;
  }, [state.phase, state.score]);

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

  /** 山札からカードを引く */
  const draw = useCallback(() => {
    if (state.phase !== "playing") return;
    dispatch({ type: "DRAW" });
  }, [state.phase]);

  /** 場のカードを除去する */
  const removeCard = useCallback(
    (row: number, pos: number) => {
      if (state.phase !== "playing") return;
      dispatch({ type: "REMOVE_CARD", row, pos });
    },
    [state.phase]
  );

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
    draw,
    removeCard,
    dismissDialog,
    resetGame,
  };
}
