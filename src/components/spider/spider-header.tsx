"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SpiderPhase, SpiderBestScore } from "@/types/spider";
import { TARGET_SETS } from "@/lib/spider-cards";

type SpiderHeaderProps = {
  moves: number;
  completedSets: number;
  elapsedTime: number;
  stockCount: number;
  phase: SpiderPhase;
  bestScore: SpiderBestScore | null;
  onStart: () => void;
  onReset: () => void;
  onGiveUp: () => void;
};

/** 秒数をMM:SS形式にフォーマット */
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** スパイダーソリティアのゲームヘッダー */
export function SpiderHeader({
  moves,
  completedSets,
  elapsedTime,
  stockCount,
  phase,
  bestScore,
  onStart,
  onReset,
  onGiveUp,
}: SpiderHeaderProps) {
  const isActive = phase === "playing";
  const isGameOver = phase === "cleared" || phase === "gameOver";

  return (
    <div className="glass rounded-2xl p-4 sm:p-6 shadow-lg mb-4 sm:mb-6">
      {/* タイトル */}
      <div className="relative text-center mb-4">
        <Link
          href="/"
          className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="ホームに戻る"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-800">
          スパイダー
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          K〜Aの列を{TARGET_SETS}組完成させよう
        </p>
      </div>

      {/* ステータス表示 */}
      {phase !== "idle" && (
        <div className="flex justify-center gap-3 sm:gap-4 mb-4 flex-wrap">
          <Badge
            variant="secondary"
            className="text-sm px-3 py-1.5 rounded-xl"
          >
            ⏱ {formatTime(elapsedTime)}
          </Badge>
          <Badge
            variant="secondary"
            className="text-sm px-3 py-1.5 rounded-xl"
          >
            🔄 手数: {moves}
          </Badge>
          <Badge
            variant="secondary"
            className="text-sm px-3 py-1.5 rounded-xl"
          >
            ✅ 完成: {completedSets}/{TARGET_SETS}
          </Badge>
          <Badge
            variant="secondary"
            className="text-sm px-3 py-1.5 rounded-xl"
          >
            🃏 山札: {stockCount}枚
          </Badge>
        </div>
      )}

      {/* ベストスコア */}
      {bestScore && (
        <div className="text-center mb-4">
          <p className="text-xs text-gray-400">
            🏆 最少: {bestScore.bestMoves}手 / 最速: {formatTime(bestScore.bestTime)}
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
        {isActive && (
          <>
            <Button onClick={onReset} variant="outline" className="rounded-xl">
              やり直す
            </Button>
            <Button onClick={onGiveUp} variant="outline" className="rounded-xl">
              ギブアップ
            </Button>
          </>
        )}
        {isGameOver && (
          <Button onClick={onStart} size="lg" className="rounded-xl px-8">
            もう一度遊ぶ
          </Button>
        )}
      </div>
    </div>
  );
}
