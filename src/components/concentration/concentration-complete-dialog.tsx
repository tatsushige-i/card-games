"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ConcentrationCompleteDialogProps = {
  open: boolean;
  moves: number;
  elapsedTime: number;
  isNewBest: boolean;
  onPlayAgain: () => void;
  onClose: () => void;
};

/** 時間をMM:SS形式にフォーマットする */
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

/** ゲーム完了モーダル */
export function ConcentrationCompleteDialog({
  open,
  moves,
  elapsedTime,
  isNewBest,
  onPlayAgain,
  onClose,
}: ConcentrationCompleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="sm:max-w-md rounded-2xl" aria-describedby="game-complete-description">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            {isNewBest ? "🎉 新記録！" : "🎊 クリア！"}
          </DialogTitle>
          <DialogDescription id="game-complete-description" className="text-center text-base pt-2">
            全てのペアを見つけました！
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-gray-800">{moves}</p>
              <p className="text-sm text-gray-500">試行回数</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800">
                {formatTime(elapsedTime)}
              </p>
              <p className="text-sm text-gray-500">クリアタイム</p>
            </div>
          </div>
          {isNewBest && (
            <p className="text-sm font-medium text-emerald-600">
              ベストスコアを更新しました！
            </p>
          )}
          <Button onClick={onPlayAgain} size="lg" className="rounded-xl px-8 mt-2">
            もう一度遊ぶ
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
