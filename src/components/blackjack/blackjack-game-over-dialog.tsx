"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { GameResult } from "@/types/blackjack";

type BlackjackGameOverDialogProps = {
  open: boolean;
  result: GameResult | null;
  wins: number;
  maxWins: number;
  rounds: number;
  isNewBest: boolean;
  onNextRound: () => void;
  onReset: () => void;
  onClose: () => void;
};

/** ゲーム終了ダイアログ */
export function BlackjackGameOverDialog({
  open,
  result,
  wins,
  maxWins,
  rounds,
  isNewBest,
  onNextRound,
  onReset,
  onClose,
}: BlackjackGameOverDialogProps) {
  const isWin = result === "win" || result === "blackjack";

  const title = (() => {
    if (result === "blackjack") {
      return isNewBest ? "🎉 新記録！ブラックジャック！" : "🂡 ブラックジャック！";
    }
    if (isWin) {
      return isNewBest ? "🎉 新記録で勝利！" : "🎊 勝利！";
    }
    if (result === "draw") return "🤝 引き分け";
    return "😢 敗北...";
  })();

  const description = (() => {
    if (result === "blackjack") return "ナチュラルブラックジャックで勝利！";
    if (isWin) return "ディーラーに勝ちました！";
    if (result === "draw") return "引き分けです。連勝はリセットされます。";
    return "ディーラーに負けました...";
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
        aria-describedby="blackjack-game-over-description"
      >
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">{title}</DialogTitle>
          <DialogDescription
            id="blackjack-game-over-description"
            className="text-center text-base pt-2"
          >
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-gray-800">{wins}</p>
              <p className="text-sm text-gray-500">連勝数</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800">{maxWins}</p>
              <p className="text-sm text-gray-500">最大連勝</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800">{rounds}</p>
              <p className="text-sm text-gray-500">ラウンド</p>
            </div>
          </div>
          {isNewBest && (
            <p className="text-sm font-medium text-emerald-600">
              ベストスコアを更新しました！
            </p>
          )}
          <div className="flex gap-3 mt-2">
            {isWin && (
              <Button onClick={onNextRound} size="lg" className="rounded-xl px-6">
                次のラウンド
              </Button>
            )}
            <Button
              onClick={onReset}
              variant={isWin ? "outline" : "default"}
              size="lg"
              className="rounded-xl px-6"
            >
              最初から
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
