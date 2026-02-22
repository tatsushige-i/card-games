"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MAX_ROUNDS } from "@/lib/poker-cards";
import type { PokerPhase, PokerBestScore } from "@/types/poker";

type PokerHeaderProps = {
  round: number;
  totalScore: number;
  phase: PokerPhase;
  bestScore: PokerBestScore | null;
  onStart: () => void;
  onReset: () => void;
};

/** ポーカーのゲームヘッダー */
export function PokerHeader({
  round,
  totalScore,
  phase,
  bestScore,
  onStart,
  onReset,
}: PokerHeaderProps) {
  const isActive =
    phase === "dealing" ||
    phase === "holding" ||
    phase === "drawing" ||
    phase === "result";

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
          ビデオポーカー
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Jacks or Better — 役を揃えてスコアを稼ごう
        </p>
      </div>

      {/* スコア表示（ゲーム開始後は常に表示） */}
      {(phase !== "idle" || round > 0) && (
        <div className="flex justify-center gap-3 sm:gap-4 mb-4 flex-wrap">
          <Badge
            variant="secondary"
            className="text-sm px-3 py-1.5 rounded-xl"
          >
            🎯 ラウンド: {round}/{MAX_ROUNDS}
          </Badge>
          <Badge
            variant="secondary"
            className="text-sm px-3 py-1.5 rounded-xl"
          >
            💰 スコア: {totalScore}pt
          </Badge>
        </div>
      )}

      {/* ベストスコア */}
      {bestScore && (
        <div className="text-center mb-4">
          <p className="text-xs text-gray-400">
            🏆 ベスト: {bestScore.maxScore}pt
          </p>
        </div>
      )}

      {/* 操作ボタン */}
      <div className="flex justify-center gap-3">
        {phase === "idle" && round === 0 && (
          <Button onClick={onStart} size="lg" className="rounded-xl px-8">
            ゲーム開始
          </Button>
        )}
        {isActive && (
          <Button onClick={onReset} variant="outline" className="rounded-xl">
            やり直す
          </Button>
        )}
        {phase === "gameOver" && round >= MAX_ROUNDS && (
          <Button onClick={onStart} size="lg" className="rounded-xl px-8">
            もう一度遊ぶ
          </Button>
        )}
      </div>
    </div>
  );
}
