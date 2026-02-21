"use client";

import {
  useReducer,
  useEffect,
  useCallback,
  useRef,
  useSyncExternalStore,
} from "react";
import {
  highAndLowReducer,
  initialHighAndLowState,
} from "@/lib/high-and-low-reducer";
import { createDeck } from "@/lib/high-and-low-cards";
import {
  getHighAndLowBestScore,
  updateHighAndLowBestScore,
} from "@/lib/high-and-low-storage";
import type {
  HighAndLowBestScore,
  HighAndLowPhase,
  Guess,
} from "@/types/high-and-low";

/** localStorageのベストスコアを購読するストア（キャッシュ付き） */
let bestScoreListeners: Array<() => void> = [];
let cachedBestScore: HighAndLowBestScore | null = null;
let cacheInitialized = false;

function subscribeBestScore(callback: () => void) {
  bestScoreListeners.push(callback);
  return () => {
    bestScoreListeners = bestScoreListeners.filter((l) => l !== callback);
  };
}

/** キャッシュ済みのスナップショットを返す（参照安定） */
function getSnapshotBestScore(): HighAndLowBestScore | null {
  if (!cacheInitialized) {
    cachedBestScore = getHighAndLowBestScore();
    cacheInitialized = true;
  }
  return cachedBestScore;
}

function getServerSnapshotBestScore(): HighAndLowBestScore | null {
  return null;
}

/** キャッシュを更新してリスナーに通知する */
function notifyBestScoreChange() {
  cachedBestScore = getHighAndLowBestScore();
  bestScoreListeners.forEach((l) => l());
}

/** ハイ＆ローのゲームロジックを管理するカスタムフック */
export function useHighAndLow() {
  const [state, dispatch] = useReducer(
    highAndLowReducer,
    initialHighAndLowState
  );
  const prevPhaseRef = useRef<HighAndLowPhase>("idle");

  const bestScore = useSyncExternalStore(
    subscribeBestScore,
    getSnapshotBestScore,
    getServerSnapshotBestScore
  );

  // ゲーム終了時のベストスコア更新（win/lose両方で記録）
  useEffect(() => {
    const isGameOver = state.phase === "win" || state.phase === "lose";
    const wasPlaying =
      prevPhaseRef.current !== "win" && prevPhaseRef.current !== "lose";
    if (isGameOver && wasPlaying) {
      const updated = updateHighAndLowBestScore(state.maxStreak, state.score);
      dispatch({ type: "SET_NEW_BEST", isNewBest: updated });
      if (updated) {
        notifyBestScoreChange();
      }
    }
    prevPhaseRef.current = state.phase;
  }, [state.phase, state.maxStreak, state.score]);

  // revealing後の自動遷移（800ms遅延）
  useEffect(() => {
    if (state.phase === "revealing") {
      const timer = setTimeout(() => {
        dispatch({ type: "REVEAL_COMPLETE" });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [state.phase]);

  /** ゲームを開始する */
  const startGame = useCallback(() => {
    dispatch({ type: "START_GAME", deck: createDeck() });
  }, []);

  /** HIGH/LOWを予想する */
  const guess = useCallback(
    (g: Guess) => {
      if (state.phase !== "playing") return;
      dispatch({ type: "GUESS", guess: g });
    },
    [state.phase]
  );

  /** ゲームをリセットする */
  const resetGame = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  /** ダイアログを閉じる */
  const dismissDialog = useCallback(() => {
    dispatch({ type: "DISMISS_DIALOG" });
  }, []);

  return {
    state,
    bestScore,
    startGame,
    guess,
    resetGame,
    dismissDialog,
  };
}
