"use client";

import {
  useReducer,
  useEffect,
  useCallback,
  useRef,
  useSyncExternalStore,
} from "react";
import {
  tenPlayReducer,
  initialTenPlayState,
} from "@/lib/ten-play-reducer";
import { createDeck } from "@/lib/ten-play-cards";
import {
  getTenPlayBestScore,
  updateTenPlayBestScore,
} from "@/lib/ten-play-storage";
import type {
  TenPlayBestScore,
  TenPlayPhase,
} from "@/types/ten-play";

/** localStorageのベストスコアを購読するストア（キャッシュ付き） */
let bestScoreListeners: Array<() => void> = [];
let cachedBestScore: TenPlayBestScore | null = null;
let cacheInitialized = false;

function subscribeBestScore(callback: () => void) {
  bestScoreListeners.push(callback);
  // コンポーネント再マウント時にキャッシュを最新化
  cachedBestScore = getTenPlayBestScore();
  return () => {
    bestScoreListeners = bestScoreListeners.filter((l) => l !== callback);
  };
}

/** キャッシュ済みのスナップショットを返す（参照安定） */
function getSnapshotBestScore(): TenPlayBestScore | null {
  if (!cacheInitialized) {
    cachedBestScore = getTenPlayBestScore();
    cacheInitialized = true;
  }
  return cachedBestScore;
}

function getServerSnapshotBestScore(): TenPlayBestScore | null {
  return null;
}

/** キャッシュを更新してリスナーに通知する */
function notifyBestScoreChange() {
  cachedBestScore = getTenPlayBestScore();
  bestScoreListeners.forEach((l) => l());
}

/** テンプレイのゲームロジックを管理するカスタムフック */
export function useTenPlay() {
  const [state, dispatch] = useReducer(
    tenPlayReducer,
    initialTenPlayState
  );
  const prevPhaseRef = useRef<TenPlayPhase>("idle");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const bestScore = useSyncExternalStore(
    subscribeBestScore,
    getSnapshotBestScore,
    getServerSnapshotBestScore
  );

  // クリア時のみベストスコア更新（手詰まりは対象外）
  useEffect(() => {
    const isCleared = state.phase === "cleared";
    const wasNotCleared = prevPhaseRef.current !== "cleared";
    if (isCleared && wasNotCleared) {
      const updated = updateTenPlayBestScore(state.elapsedTime);
      dispatch({ type: "SET_NEW_BEST", isNewBest: updated });
      if (updated) {
        notifyBestScoreChange();
      }
    }
    prevPhaseRef.current = state.phase;
  }, [state.phase, state.elapsedTime]);

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

  // 不正ペアの自動クリア（500ms後）
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
    (index: number) => {
      if (state.phase !== "playing") return;
      dispatch({ type: "SELECT_CARD", index });
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
    selectCard,
    dismissDialog,
    resetGame,
  };
}
