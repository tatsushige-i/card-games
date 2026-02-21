"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { BlackjackPhase, BlackjackBestScore } from "@/types/blackjack";

type BlackjackHeaderProps = {
  wins: number;
  rounds: number;
  phase: BlackjackPhase;
  bestScore: BlackjackBestScore | null;
  onStart: () => void;
  onReset: () => void;
};

/** ブラックジャックのゲームヘッダー */
export function BlackjackHeader({
  wins,
  rounds,
  phase,
  bestScore,
  onStart,
  onReset,
}: BlackjackHeaderProps) {
  const isActive =
    phase === "dealing" ||
    phase === "playing" ||
    phase === "dealerTurn" ||
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
          ブラックジャック
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          21に近づけ！ディーラーに勝とう
        </p>
      </div>

      {/* スコア表示 */}
      {phase !== "idle" && (
        <div className="flex justify-center gap-3 sm:gap-4 mb-4 flex-wrap">
          <Badge
            variant="secondary"
            className="text-sm px-3 py-1.5 rounded-xl"
          >
            🔥 連勝: {wins}
          </Badge>
          <Badge
            variant="secondary"
            className="text-sm px-3 py-1.5 rounded-xl"
          >
            🎯 ラウンド: {rounds}
          </Badge>
        </div>
      )}

      {/* ベストスコア */}
      {bestScore && (
        <div className="text-center mb-4">
          <p className="text-xs text-gray-400">
            🏆 ベスト: 最大{bestScore.maxWins}連勝
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
        {phase === "gameOver" && (
          <Button onClick={onStart} size="lg" className="rounded-xl px-8">
            もう一度遊ぶ
          </Button>
        )}
      </div>
    </div>
  );
}
