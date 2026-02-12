"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { GamePhase, BestScore } from "@/types/game";

type GameHeaderProps = {
  moves: number;
  elapsedTime: number;
  matchedPairs: number;
  totalPairs: number;
  phase: GamePhase;
  bestScore: BestScore | null;
  onStart: () => void;
};

/** 時間をMM:SS形式にフォーマットする */
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

/** ゲームヘッダー（スコア・タイマー・操作ボタン） */
export function GameHeader({
  moves,
  elapsedTime,
  matchedPairs,
  totalPairs,
  phase,
  bestScore,
  onStart,
}: GameHeaderProps) {
  return (
    <div className="glass rounded-2xl p-4 sm:p-6 shadow-lg mb-4 sm:mb-6">
      {/* タイトル */}
      <div className="text-center mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-800">
          神経衰弱
        </h1>
        <p className="text-sm text-gray-500 mt-1">カードをめくってペアを見つけよう</p>
      </div>

      {/* スコア表示 */}
      {phase !== "idle" && (
        <div className="flex justify-center gap-3 sm:gap-4 mb-4 flex-wrap">
          <Badge variant="secondary" className="text-sm px-3 py-1.5 rounded-xl">
            🎯 {moves} 回
          </Badge>
          <Badge variant="secondary" className="text-sm px-3 py-1.5 rounded-xl">
            ⏱️ {formatTime(elapsedTime)}
          </Badge>
          <Badge variant="secondary" className="text-sm px-3 py-1.5 rounded-xl">
            ✅ {matchedPairs}/{totalPairs}
          </Badge>
        </div>
      )}

      {/* ベストスコア表示 */}
      {bestScore && (
        <div className="text-center mb-4">
          <p className="text-xs text-gray-400">
            🏆 ベスト: {bestScore.moves}回 / {formatTime(bestScore.time)}
          </p>
        </div>
      )}

      {/* 操作ボタン */}
      <div className="flex justify-center gap-3">
        {phase === "idle" && (
          <Button onClick={onStart} size="lg" className="rounded-xl px-8">
            ゲーム開始
          </Button>
        )}
        {phase === "playing" && (
          <Button onClick={onStart} variant="outline" className="rounded-xl">
            やり直す
          </Button>
        )}
        {phase === "complete" && (
          <Button onClick={onStart} size="lg" className="rounded-xl px-8">
            もう一度遊ぶ
          </Button>
        )}
      </div>
    </div>
  );
}
