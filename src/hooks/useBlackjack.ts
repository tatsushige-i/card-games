"use client";

import {
  useReducer,
  useEffect,
  useCallback,
  useRef,
  useSyncExternalStore,
} from "react";
import {
  blackjackReducer,
  initialBlackjackState,
} from "@/lib/blackjack-reducer";
import { createDeck } from "@/lib/blackjack-cards";
import {
  getBlackjackBestScore,
  updateBlackjackBestScore,
} from "@/lib/blackjack-storage";
import type {
  BlackjackBestScore,
  BlackjackPhase,
} from "@/types/blackjack";

/** localStorageのベストスコアを購読するストア（キャッシュ付き） */
let bestScoreListeners: Array<() => void> = [];
let cachedBestScore: BlackjackBestScore | null = null;
let cacheInitialized = false;

function subscribeBestScore(callback: () => void) {
  bestScoreListeners.push(callback);
  return () => {
    bestScoreListeners = bestScoreListeners.filter((l) => l !== callback);
  };
}

/** キャッシュ済みのスナップショットを返す（参照安定） */
function getSnapshotBestScore(): BlackjackBestScore | null {
  if (!cacheInitialized) {
    cachedBestScore = getBlackjackBestScore();
    cacheInitialized = true;
  }
  return cachedBestScore;
}

function getServerSnapshotBestScore(): BlackjackBestScore | null {
  return null;
}

/** キャッシュを更新してリスナーに通知する */
function notifyBestScoreChange() {
  cachedBestScore = getBlackjackBestScore();
  bestScoreListeners.forEach((l) => l());
}

/** ブラックジャックのゲームロジックを管理するカスタムフック */
export function useBlackjack() {
  const [state, dispatch] = useReducer(
    blackjackReducer,
    initialBlackjackState
  );
  const prevPhaseRef = useRef<BlackjackPhase>("idle");

  const bestScore = useSyncExternalStore(
    subscribeBestScore,
    getSnapshotBestScore,
    getServerSnapshotBestScore
  );

  // ゲーム終了時のベストスコア更新
  useEffect(() => {
    const isGameOver = state.phase === "gameOver";
    const wasNotGameOver = prevPhaseRef.current !== "gameOver";
    if (isGameOver && wasNotGameOver) {
      const updated = updateBlackjackBestScore(state.maxWins);
      dispatch({ type: "SET_NEW_BEST", isNewBest: updated });
      if (updated) {
        notifyBestScoreChange();
      }
    }
    prevPhaseRef.current = state.phase;
  }, [state.phase, state.maxWins]);

  // dealing後の自動遷移（600ms遅延）
  useEffect(() => {
    if (state.phase === "dealing") {
      const timer = setTimeout(() => {
        dispatch({ type: "DEAL_COMPLETE" });
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [state.phase]);

  // ディーラーのカード引き（800ms間隔）
  useEffect(() => {
    if (state.phase === "dealerTurn") {
      const timer = setTimeout(() => {
        dispatch({ type: "DEALER_DRAW" });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [state.phase, state.dealerHand.length]);

  // result表示後の自動遷移（1000ms遅延）
  useEffect(() => {
    if (state.phase === "result") {
      const timer = setTimeout(() => {
        dispatch({ type: "SHOW_RESULT" });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.phase]);

  /** ゲームを開始する */
  const startGame = useCallback(() => {
    dispatch({ type: "START_GAME", deck: createDeck() });
  }, []);

  /** カードを引く */
  const hit = useCallback(() => {
    if (state.phase !== "playing") return;
    dispatch({ type: "HIT" });
  }, [state.phase]);

  /** スタンドする */
  const stand = useCallback(() => {
    if (state.phase !== "playing") return;
    dispatch({ type: "STAND" });
  }, [state.phase]);

  /** 次のラウンドへ */
  const nextRound = useCallback(() => {
    dispatch({ type: "NEXT_ROUND" });
  }, []);

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
    hit,
    stand,
    nextRound,
    dismissDialog,
    resetGame,
  };
}
