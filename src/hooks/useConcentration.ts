"use client";

import { useReducer, useEffect, useCallback, useRef, useSyncExternalStore } from "react";
import { concentrationReducer, initialConcentrationState } from "@/lib/concentration-reducer";
import { createCards } from "@/lib/concentration-cards";
import { getBestScore, updateBestScore } from "@/lib/concentration-storage";
import type { ConcentrationBestScore, ConcentrationPhase } from "@/types/concentration";

/** localStorageのベストスコアを購読するストア（キャッシュ付き） */
let bestScoreListeners: Array<() => void> = [];
let cachedBestScore: ConcentrationBestScore | null = null;
let cacheInitialized = false;

function subscribeBestScore(callback: () => void) {
  bestScoreListeners.push(callback);
  return () => {
    bestScoreListeners = bestScoreListeners.filter((l) => l !== callback);
  };
}

/** キャッシュ済みのスナップショットを返す（参照安定） */
function getSnapshotBestScore(): ConcentrationBestScore | null {
  if (!cacheInitialized) {
    cachedBestScore = getBestScore();
    cacheInitialized = true;
  }
  return cachedBestScore;
}

function getServerSnapshotBestScore(): ConcentrationBestScore | null {
  return null;
}

/** キャッシュを更新してリスナーに通知する */
function notifyBestScoreChange() {
  cachedBestScore = getBestScore();
  bestScoreListeners.forEach((l) => l());
}

/** ゲーム全体のロジックを管理するカスタムフック */
export function useConcentration() {
  const [state, dispatch] = useReducer(concentrationReducer, initialConcentrationState);
  const prevPhaseRef = useRef<ConcentrationPhase>("idle");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // useSyncExternalStoreでlocalStorageのベストスコアを購読
  const bestScore = useSyncExternalStore(
    subscribeBestScore,
    getSnapshotBestScore,
    getServerSnapshotBestScore
  );

  // ゲーム完了時のベストスコア更新
  useEffect(() => {
    if (state.phase === "complete" && prevPhaseRef.current !== "complete") {
      const updated = updateBestScore(state.moves, state.elapsedTime);
      dispatch({ type: "SET_NEW_BEST", isNewBest: updated });
      if (updated) {
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

  // 2枚めくった後のマッチ判定（遅延付き）
  useEffect(() => {
    if (state.flippedIds.length === 2) {
      const timer = setTimeout(() => {
        dispatch({ type: "CHECK_MATCH" });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [state.flippedIds]);

  /** ゲームを開始する */
  const startGame = useCallback(() => {
    dispatch({ type: "START_GAME", cards: createCards() });
  }, []);

  /** カードをめくる */
  const flipCard = useCallback(
    (cardId: number) => {
      if (state.flippedIds.length >= 2) return;
      dispatch({ type: "FLIP_CARD", cardId });
    },
    [state.flippedIds.length]
  );

  /** ゲームをリセットする */
  const resetGame = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  /** 完了ダイアログを閉じる */
  const dismissDialog = useCallback(() => {
    dispatch({ type: "DISMISS_DIALOG" });
  }, []);

  return {
    state,
    bestScore,
    startGame,
    flipCard,
    resetGame,
    dismissDialog,
  };
}
