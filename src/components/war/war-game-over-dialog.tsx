"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Winner } from "@/types/war";

type WarGameOverDialogProps = {
  open: boolean;
  winner: Winner | null;
  roundCount: number;
  playerCards: number;
  cpuCards: number;
  isNewBest: boolean;
  onRestart: () => void;
  onClose: () => void;
};

/** ゲーム終了ダイアログ */
export function WarGameOverDialog({
  open,
  winner,
  roundCount,
  playerCards,
  cpuCards,
  isNewBest,
  onRestart,
  onClose,
}: WarGameOverDialogProps) {
  const isWin = winner === "player";

  const title = (() => {
    if (isWin && isNewBest) return "🎉 新記録で勝利！";
    if (isWin) return "🎊 勝利！";
    return "😢 敗北...";
  })();

  const description = (() => {
    if (isWin) return "CPUのカードをすべて獲得しました！";
    return "カードがなくなってしまいました...";
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
        aria-describedby="war-game-over-description"
      >
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">{title}</DialogTitle>
          <DialogDescription
            id="war-game-over-description"
            className="text-center text-base pt-2"
          >
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-gray-800">{roundCount}</p>
              <p className="text-sm text-gray-500">ラウンド</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800">{playerCards}</p>
              <p className="text-sm text-gray-500">自分</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800">{cpuCards}</p>
              <p className="text-sm text-gray-500">CPU</p>
            </div>
          </div>
          {isNewBest && (
            <p className="text-sm font-medium text-emerald-600">
              ベストスコアを更新しました！
            </p>
          )}
          <div className="flex gap-3 mt-2">
            <Button
              onClick={onRestart}
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
