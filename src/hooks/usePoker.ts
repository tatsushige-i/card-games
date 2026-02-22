"use client";

import {
  useReducer,
  useEffect,
  useCallback,
  useRef,
  useSyncExternalStore,
} from "react";
import { pokerReducer, initialPokerState } from "@/lib/poker-reducer";
import { createDeck, MAX_ROUNDS } from "@/lib/poker-cards";
import {
  getPokerBestScore,
  updatePokerBestScore,
} from "@/lib/poker-storage";
import type { PokerBestScore, PokerPhase } from "@/types/poker";

/** localStorageのベストスコアを購読するストア（キャッシュ付き） */
let bestScoreListeners: Array<() => void> = [];
let cachedBestScore: PokerBestScore | null = null;
let cacheInitialized = false;

function subscribeBestScore(callback: () => void) {
  bestScoreListeners.push(callback);
  return () => {
    bestScoreListeners = bestScoreListeners.filter((l) => l !== callback);
  };
}

/** キャッシュ済みのスナップショットを返す（参照安定） */
function getSnapshotBestScore(): PokerBestScore | null {
  if (!cacheInitialized) {
    cachedBestScore = getPokerBestScore();
    cacheInitialized = true;
  }
  return cachedBestScore;
}

function getServerSnapshotBestScore(): PokerBestScore | null {
  return null;
}

/** キャッシュを更新してリスナーに通知する */
function notifyBestScoreChange() {
  cachedBestScore = getPokerBestScore();
  bestScoreListeners.forEach((l) => l());
}

/** ビデオポーカーのゲームロジックを管理するカスタムフック */
export function usePoker() {
  const [state, dispatch] = useReducer(pokerReducer, initialPokerState);
  const prevPhaseRef = useRef<PokerPhase>("idle");

  const bestScore = useSyncExternalStore(
    subscribeBestScore,
    getSnapshotBestScore,
    getServerSnapshotBestScore
  );

  // ゲーム終了時のベストスコア更新（最終ラウンドのみ）
  useEffect(() => {
    const isGameOver = state.phase === "gameOver";
    const wasNotGameOver = prevPhaseRef.current !== "gameOver";
    if (isGameOver && wasNotGameOver && state.round >= MAX_ROUNDS) {
      const updated = updatePokerBestScore(state.totalScore);
      dispatch({ type: "SET_NEW_BEST", isNewBest: updated });
      if (updated) {
        notifyBestScoreChange();
      }
    }
    prevPhaseRef.current = state.phase;
  }, [state.phase, state.totalScore, state.round]);

  // dealing後の自動遷移（600ms遅延）
  useEffect(() => {
    if (state.phase === "dealing") {
      const timer = setTimeout(() => {
        dispatch({ type: "DEAL_COMPLETE" });
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [state.phase]);

  // drawing後の自動遷移（600ms遅延）
  useEffect(() => {
    if (state.phase === "drawing") {
      const timer = setTimeout(() => {
        dispatch({ type: "DRAW_COMPLETE" });
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [state.phase]);

  // result表示後の自動遷移（1000ms遅延）
  useEffect(() => {
    if (state.phase === "result") {
      const timer = setTimeout(() => {
        dispatch({ type: "SHOW_RESULT" });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.phase]);

  // 中間ラウンド終了後の次ラウンド自動開始（500ms遅延）
  useEffect(() => {
    if (
      state.phase === "idle" &&
      state.round > 0 &&
      state.round < MAX_ROUNDS
    ) {
      const timer = setTimeout(() => {
        dispatch({ type: "START_GAME", deck: createDeck() });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [state.phase, state.round]);

  /** ゲームを開始する */
  const startGame = useCallback(() => {
    dispatch({ type: "START_GAME", deck: createDeck() });
  }, []);

  /** カードのホールドをトグルする */
  const toggleHold = useCallback(
    (index: number) => {
      if (state.phase !== "holding") return;
      dispatch({ type: "TOGGLE_HOLD", index });
    },
    [state.phase]
  );

  /** カードを交換する */
  const draw = useCallback(() => {
    if (state.phase !== "holding") return;
    dispatch({ type: "DRAW" });
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
    toggleHold,
    draw,
    nextRound,
    dismissDialog,
    resetGame,
  };
}
