"use client";

import {
  useReducer,
  useEffect,
  useCallback,
  useRef,
  useSyncExternalStore,
} from "react";
import {
  golfReducer,
  initialGolfState,
} from "@/lib/golf-reducer";
import { createDeck, getRemainingCards } from "@/lib/golf-cards";
import {
  getGolfBestScore,
  updateGolfBestScore,
} from "@/lib/golf-storage";
import type {
  GolfBestScore,
  GolfPhase,
} from "@/types/golf";

/** localStorageのベストスコアを購読するストア（キャッシュ付き） */
let bestScoreListeners: Array<() => void> = [];
let cachedBestScore: GolfBestScore | null = null;
let cacheInitialized = false;

function subscribeBestScore(callback: () => void) {
  bestScoreListeners.push(callback);
  // コンポーネント再マウント時にキャッシュを最新化
  cachedBestScore = getGolfBestScore();
  return () => {
    bestScoreListeners = bestScoreListeners.filter((l) => l !== callback);
  };
}

/** キャッシュ済みのスナップショットを返す（参照安定） */
function getSnapshotBestScore(): GolfBestScore | null {
  if (!cacheInitialized) {
    cachedBestScore = getGolfBestScore();
    cacheInitialized = true;
  }
  return cachedBestScore;
}

function getServerSnapshotBestScore(): GolfBestScore | null {
  return null;
}

/** キャッシュを更新してリスナーに通知する */
function notifyBestScoreChange() {
  cachedBestScore = getGolfBestScore();
  bestScoreListeners.forEach((l) => l());
}

/** ゴルフソリティアのゲームロジックを管理するカスタムフック */
export function useGolf() {
  const [state, dispatch] = useReducer(
    golfReducer,
    initialGolfState
  );
  const prevPhaseRef = useRef<GolfPhase>("idle");
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
      const remaining = getRemainingCards(state.columns);
      const updated = updateGolfBestScore(remaining);
      dispatch({ type: "SET_NEW_BEST", isNewBest: updated });
      if (updated) {
        notifyBestScoreChange();
      }
    }
    prevPhaseRef.current = state.phase;
  }, [state.phase, state.columns]);

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
    (columnIndex: number) => {
      if (state.phase !== "playing") return;
      dispatch({ type: "REMOVE_CARD", columnIndex });
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
