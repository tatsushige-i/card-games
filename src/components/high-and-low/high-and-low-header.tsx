"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type {
  HighAndLowPhase,
  HighAndLowBestScore,
} from "@/types/high-and-low";
import { WIN_SCORE } from "@/lib/high-and-low-cards";

type HighAndLowHeaderProps = {
  score: number;
  streak: number;
  cardsPlayed: number;
  phase: HighAndLowPhase;
  bestScore: HighAndLowBestScore | null;
  onStart: () => void;
};

/** ハイ＆ローのゲームヘッダー */
export function HighAndLowHeader({
  score,
  streak,
  cardsPlayed,
  phase,
  bestScore,
  onStart,
}: HighAndLowHeaderProps) {
  const isGameOver = phase === "win" || phase === "lose";

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
          ハイ＆ロー
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          次のカードは高い？低い？
        </p>
      </div>

      {/* スコア表示 */}
      {phase !== "idle" && (
        <div className="flex justify-center gap-3 sm:gap-4 mb-4 flex-wrap">
          <Badge
            variant="secondary"
            className="text-sm px-3 py-1.5 rounded-xl"
          >
            💰 スコア: {score}/{WIN_SCORE}
          </Badge>
          <Badge
            variant="secondary"
            className="text-sm px-3 py-1.5 rounded-xl"
          >
            🔥 連勝: {streak}
          </Badge>
          <Badge
            variant="secondary"
            className="text-sm px-3 py-1.5 rounded-xl"
          >
            🃏 {cardsPlayed}枚目
          </Badge>
        </div>
      )}

      {/* ベストスコア */}
      {bestScore && (
        <div className="text-center mb-4">
          <p className="text-xs text-gray-400">
            🏆 ベスト: 最大{bestScore.maxStreak}連勝
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
        {(phase === "playing" || phase === "revealing") && (
          <Button onClick={onStart} variant="outline" className="rounded-xl">
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
