"use client";

import {
  useReducer,
  useEffect,
  useCallback,
  useRef,
  useSyncExternalStore,
} from "react";
import { warReducer, initialWarState } from "@/lib/war-reducer";
import { dealCards } from "@/lib/war-cards";
import { getWarBestScore, updateWarBestScore } from "@/lib/war-storage";
import type { WarBestScore, WarPhase } from "@/types/war";

/** localStorageのベストスコアを購読するストア（キャッシュ付き） */
let bestScoreListeners: Array<() => void> = [];
let cachedBestScore: WarBestScore | null = null;
let cacheInitialized = false;

function subscribeBestScore(callback: () => void) {
  bestScoreListeners.push(callback);
  return () => {
    bestScoreListeners = bestScoreListeners.filter((l) => l !== callback);
  };
}

/** キャッシュ済みのスナップショットを返す（参照安定） */
function getSnapshotBestScore(): WarBestScore | null {
  if (!cacheInitialized) {
    cachedBestScore = getWarBestScore();
    cacheInitialized = true;
  }
  return cachedBestScore;
}

function getServerSnapshotBestScore(): WarBestScore | null {
  return null;
}

/** キャッシュを更新してリスナーに通知する */
function notifyBestScoreChange() {
  cachedBestScore = getWarBestScore();
  bestScoreListeners.forEach((l) => l());
}

/** 初期デッキを生成するイニシャライザ */
function createInitialState() {
  const { playerDeck, cpuDeck } = dealCards();
  return {
    ...initialWarState,
    playerDeck,
    cpuDeck,
  };
}

/** 戦争ゲームのロジックを管理するカスタムフック */
export function useWar() {
  const [state, dispatch] = useReducer(warReducer, null, createInitialState);
  const prevPhaseRef = useRef<WarPhase>("ready");

  const bestScore = useSyncExternalStore(
    subscribeBestScore,
    getSnapshotBestScore,
    getServerSnapshotBestScore
  );

  // ゲーム終了時のベストスコア更新（プレイヤー勝利時のみ）
  useEffect(() => {
    const isGameOver = state.phase === "gameOver";
    const wasNotGameOver = prevPhaseRef.current !== "gameOver";
    if (isGameOver && wasNotGameOver && state.winner === "player") {
      const updated = updateWarBestScore(state.roundCount);
      dispatch({ type: "SET_NEW_BEST", isNewBest: updated });
      if (updated) {
        notifyBestScoreChange();
      }
    }
    prevPhaseRef.current = state.phase;
  }, [state.phase, state.roundCount, state.winner]);

  // battle → 勝敗判定（800ms遅延）
  useEffect(() => {
    if (state.phase === "battle") {
      const timer = setTimeout(() => {
        dispatch({ type: "RESOLVE_BATTLE" });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [state.phase]);

  // result → 戦争開始 or カード回収（1000ms遅延）
  useEffect(() => {
    if (state.phase === "result") {
      const timer = setTimeout(() => {
        if (state.roundResult === "war") {
          dispatch({ type: "START_WAR" });
        } else {
          dispatch({ type: "COLLECT_CARDS" });
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.phase, state.roundResult]);

  // war → 戦争カードオープン（800ms遅延）
  useEffect(() => {
    if (state.phase === "war") {
      const timer = setTimeout(() => {
        dispatch({ type: "REVEAL_WAR_CARDS" });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [state.phase]);

  // warReveal → 勝敗判定（800ms遅延）
  useEffect(() => {
    if (state.phase === "warReveal") {
      const timer = setTimeout(() => {
        dispatch({ type: "RESOLVE_BATTLE" });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [state.phase]);

  /** カードを出す */
  const playCard = useCallback(() => {
    if (state.phase !== "ready") return;
    dispatch({ type: "PLAY_CARD" });
  }, [state.phase]);

  /** ダイアログを閉じる */
  const dismissDialog = useCallback(() => {
    dispatch({ type: "DISMISS_DIALOG" });
  }, []);

  /** ゲームをリスタートする */
  const restart = useCallback(() => {
    const { playerDeck, cpuDeck } = dealCards();
    dispatch({ type: "RESTART", playerDeck, cpuDeck });
  }, []);

  return {
    state,
    bestScore,
    playCard,
    dismissDialog,
    restart,
  };
}
