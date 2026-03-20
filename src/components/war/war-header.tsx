"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { WarPhase, WarBestScore } from "@/types/war";

type WarHeaderProps = {
  roundCount: number;
  playerCards: number;
  cpuCards: number;
  phase: WarPhase;
  bestScore: WarBestScore | null;
  onRestart: () => void;
};

/** 戦争ゲームのヘッダー */
export function WarHeader({
  roundCount,
  playerCards,
  cpuCards,
  phase,
  bestScore,
  onRestart,
}: WarHeaderProps) {
  const isActive = phase !== "gameOver";

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
          戦争
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          カードを出して数値で勝負！
        </p>
      </div>

      {/* スコア表示 */}
      <div className="flex justify-center gap-3 sm:gap-4 mb-4 flex-wrap">
        <Badge
          variant="secondary"
          className="text-sm px-3 py-1.5 rounded-xl"
        >
          🎯 ラウンド: {roundCount}
        </Badge>
        <Badge
          variant="secondary"
          className="text-sm px-3 py-1.5 rounded-xl"
        >
          🃏 自分: {playerCards}枚
        </Badge>
        <Badge
          variant="secondary"
          className="text-sm px-3 py-1.5 rounded-xl"
        >
          🤖 CPU: {cpuCards}枚
        </Badge>
      </div>

      {/* ベストスコア */}
      {bestScore && (
        <div className="text-center mb-4">
          <p className="text-xs text-gray-400">
            🏆 ベスト: {bestScore.rounds}ラウンドで勝利
          </p>
        </div>
      )}

      {/* 操作ボタン */}
      <div className="flex justify-center gap-3">
        {isActive && (
          <Button onClick={onRestart} variant="outline" className="rounded-xl">
            やり直す
          </Button>
        )}
        {phase === "gameOver" && (
          <Button onClick={onRestart} size="lg" className="rounded-xl px-8">
            もう一度遊ぶ
          </Button>
        )}
      </div>
    </div>
  );
}
