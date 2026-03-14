"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { PyramidGameResult } from "@/types/pyramid";

type PyramidGameOverDialogProps = {
  open: boolean;
  result: PyramidGameResult | null;
  elapsedTime: number;
  removedPairs: number;
  isNewBest: boolean;
  onPlayAgain: () => void;
  onClose: () => void;
};

/** 秒数をMM:SS形式にフォーマット */
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** ゲーム終了ダイアログ */
export function PyramidGameOverDialog({
  open,
  result,
  elapsedTime,
  removedPairs,
  isNewBest,
  onPlayAgain,
  onClose,
}: PyramidGameOverDialogProps) {
  const isWin = result === "win";

  const title = (() => {
    if (isWin) {
      return isNewBest ? "🎉 新記録でクリア！" : "🎊 クリア！";
    }
    return "😢 手詰まり...";
  })();

  const description = (() => {
    if (isWin) return "ピラミッドを完全に崩しました！";
    return "これ以上ペアを作れません...";
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
        aria-describedby="pyramid-game-over-description"
      >
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">{title}</DialogTitle>
          <DialogDescription
            id="pyramid-game-over-description"
            className="text-center text-base pt-2"
          >
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-gray-800">
                {formatTime(elapsedTime)}
              </p>
              <p className="text-sm text-gray-500">タイム</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800">{removedPairs}</p>
              <p className="text-sm text-gray-500">除去ペア</p>
            </div>
          </div>
          {isNewBest && (
            <p className="text-sm font-medium text-emerald-600">
              ベストタイムを更新しました！
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
