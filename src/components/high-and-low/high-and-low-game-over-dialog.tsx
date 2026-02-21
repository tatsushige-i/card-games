"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { HighAndLowPhase } from "@/types/high-and-low";

type HighAndLowGameOverDialogProps = {
  open: boolean;
  phase: HighAndLowPhase;
  score: number;
  maxStreak: number;
  cardsPlayed: number;
  isNewBest: boolean;
  onPlayAgain: () => void;
  onClose: () => void;
};

/** ゲーム終了ダイアログ */
export function HighAndLowGameOverDialog({
  open,
  phase,
  score,
  maxStreak,
  cardsPlayed,
  isNewBest,
  onPlayAgain,
  onClose,
}: HighAndLowGameOverDialogProps) {
  const isWin = phase === "win";

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent
        className="sm:max-w-md rounded-2xl"
        aria-describedby="game-over-description"
      >
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            {isWin
              ? isNewBest
                ? "🎉 新記録で勝利！"
                : "🎊 勝利！"
              : "😢 ゲームオーバー"}
          </DialogTitle>
          <DialogDescription
            id="game-over-description"
            className="text-center text-base pt-2"
          >
            {isWin
              ? "目標スコアに到達しました！"
              : "スコアが0になりました..."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-gray-800">{score}</p>
              <p className="text-sm text-gray-500">最終スコア</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800">{maxStreak}</p>
              <p className="text-sm text-gray-500">最大連勝</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800">{cardsPlayed}</p>
              <p className="text-sm text-gray-500">プレイ枚数</p>
            </div>
          </div>
          {isNewBest && (
            <p className="text-sm font-medium text-emerald-600">
              ベストスコアを更新しました！
            </p>
          )}
          <Button
            onClick={onPlayAgain}
            size="lg"
            className="rounded-xl px-8 mt-2"
          >
            もう一度遊ぶ
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
