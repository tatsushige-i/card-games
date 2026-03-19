"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { SpiderGameResult } from "@/types/spider";
import { TARGET_SETS } from "@/lib/spider-cards";

type SpiderGameOverDialogProps = {
  open: boolean;
  result: SpiderGameResult | null;
  completedSets: number;
  moves: number;
  elapsedTime: number;
  isNewBestMoves: boolean;
  isNewBestTime: boolean;
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
export function SpiderGameOverDialog({
  open,
  result,
  completedSets,
  moves,
  elapsedTime,
  isNewBestMoves,
  isNewBestTime,
  onPlayAgain,
  onClose,
}: SpiderGameOverDialogProps) {
  const isWin = result === "win";
  const isNewBest = isNewBestMoves || isNewBestTime;

  const title = (() => {
    if (isWin) {
      return isNewBest ? "🎉 新記録でクリア！" : "🎊 クリア！";
    }
    return "😢 ギブアップ";
  })();

  const description = (() => {
    if (isWin) return `${TARGET_SETS}組すべて完成しました！`;
    return "またチャレンジしてみましょう！";
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
        aria-describedby="spider-game-over-description"
      >
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">{title}</DialogTitle>
          <DialogDescription
            id="spider-game-over-description"
            className="text-center text-base pt-2"
          >
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-gray-800">{moves}</p>
              <p className="text-sm text-gray-500">手数</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800">
                {completedSets}/{TARGET_SETS}
              </p>
              <p className="text-sm text-gray-500">完成セット</p>
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
              {isNewBestMoves && isNewBestTime
                ? "手数・タイムともにベスト更新！"
                : isNewBestMoves
                  ? "手数のベストを更新！"
                  : "タイムのベストを更新！"}
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
