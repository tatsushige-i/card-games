"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { GolfGameResult } from "@/types/golf";

type GolfGameOverDialogProps = {
  open: boolean;
  result: GolfGameResult | null;
  remainingCards: number;
  removedCount: number;
  elapsedTime: number;
  isNewBest: boolean;
  onPlayAgain: () => void;
  onClose: () => void;
};

/** 秒数をMM:SS形式にフォーマット */
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** ゲーム終了ダイアログ */
export function GolfGameOverDialog({
  open,
  result,
  remainingCards,
  removedCount,
  elapsedTime,
  isNewBest,
  onPlayAgain,
  onClose,
}: GolfGameOverDialogProps) {
  const isWin = result === "win";

  const title = (() => {
    if (isWin) {
      return isNewBest ? "🎉 新記録でクリア！" : "🎊 クリア！";
    }
    return "😢 手詰まり...";
  })();

  const description = (() => {
    if (isWin) return "場のカードをすべて取り除きました！";
    return "これ以上取り除けるカードがありません...";
  })();

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent
        className="sm:max-w-md rounded-2xl"
        aria-describedby="golf-game-over-description"
      >
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">{title}</DialogTitle>
          <DialogDescription
            id="golf-game-over-description"
            className="text-center text-base pt-2"
          >
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-gray-800">{remainingCards}</p>
              <p className="text-sm text-gray-500">残りカード</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800">{removedCount}</p>
              <p className="text-sm text-gray-500">除去数</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800">
                {formatTime(elapsedTime)}
              </p>
              <p className="text-sm text-gray-500">タイム</p>
            </div>
          </div>
          {isNewBest && (
            <p className="text-sm font-medium text-emerald-600">
              ベストスコアを更新しました！
            </p>
          )}
          <div className="flex gap-3 mt-2">
            <Button
              onClick={onPlayAgain}
              size="lg"
              className="rounded-xl px-6"
            >
              もう一度遊ぶ
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
