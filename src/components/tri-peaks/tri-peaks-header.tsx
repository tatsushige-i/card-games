"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { TriPeaksPhase, TriPeaksBestScore } from "@/types/tri-peaks";

type TriPeaksHeaderProps = {
  elapsedTime: number;
  score: number;
  combo: number;
  removedCount: number;
  phase: TriPeaksPhase;
  bestScore: TriPeaksBestScore | null;
  onStart: () => void;
  onReset: () => void;
};

/** 秒数をMM:SS形式にフォーマット */
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** トライピークスのゲームヘッダー */
export function TriPeaksHeader({
  elapsedTime,
  score,
  combo,
  removedCount,
  phase,
  bestScore,
  onStart,
  onReset,
}: TriPeaksHeaderProps) {
  const isActive = phase === "playing";
  const isGameOver = phase === "cleared" || phase === "stuck";

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
          トライピークス
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          ±1のカードを連続で取り除こう
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
            🏆 {score}pt
          </Badge>
          {combo > 0 && (
            <Badge
              variant="secondary"
              className="text-sm px-3 py-1.5 rounded-xl bg-amber-100 text-amber-700"
            >
              🔥 x{combo}コンボ
            </Badge>
          )}
          <Badge
            variant="secondary"
            className="text-sm px-3 py-1.5 rounded-xl"
          >
            🃏 除去: {removedCount}/28
          </Badge>
        </div>
      )}

      {/* ベストスコア */}
      {bestScore && (
        <div className="text-center mb-4">
          <p className="text-xs text-gray-400">
            🏆 ベスト: {bestScore.score}pt
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
          <Button onClick={onReset} variant="outline" className="rounded-xl">
            やり直す
          </Button>
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
