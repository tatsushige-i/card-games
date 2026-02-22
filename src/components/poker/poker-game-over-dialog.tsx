"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HAND_NAMES, HAND_PAYOUTS, MAX_ROUNDS } from "@/lib/poker-cards";
import type { HandRank } from "@/types/poker";

type PokerGameOverDialogProps = {
  open: boolean;
  handRank: HandRank | null;
  roundScore: number;
  totalScore: number;
  round: number;
  isNewBest: boolean;
  isLastRound: boolean;
  onNextRound: () => void;
  onReset: () => void;
  onClose: () => void;
};

/** ゲーム終了ダイアログ */
export function PokerGameOverDialog({
  open,
  handRank,
  roundScore,
  totalScore,
  round,
  isNewBest,
  isLastRound,
  onNextRound,
  onReset,
  onClose,
}: PokerGameOverDialogProps) {
  const isWin = roundScore > 0;

  const title = (() => {
    if (isLastRound) {
      return isNewBest ? "🎉 新記録！ゲーム終了！" : "🎊 ゲーム終了！";
    }
    if (handRank === "royalFlush") {
      return "👑 ロイヤルフラッシュ！";
    }
    if (isWin) {
      return `🎊 ${HAND_NAMES[handRank!]}！`;
    }
    return "😢 ノーハンド...";
  })();

  const description = (() => {
    if (isLastRound) {
      return `${MAX_ROUNDS}ラウンド終了！合計${totalScore}ptを獲得しました`;
    }
    if (isWin) {
      return `+${HAND_PAYOUTS[handRank!]}pt 獲得！`;
    }
    return "残念、役が揃いませんでした";
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
        aria-describedby="poker-game-over-description"
      >
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">{title}</DialogTitle>
          <DialogDescription
            id="poker-game-over-description"
            className="text-center text-base pt-2"
          >
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-gray-800">
                {roundScore}pt
              </p>
              <p className="text-sm text-gray-500">今回の獲得</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800">
                {totalScore}pt
              </p>
              <p className="text-sm text-gray-500">合計スコア</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800">
                {round}/{MAX_ROUNDS}
              </p>
              <p className="text-sm text-gray-500">ラウンド</p>
            </div>
          </div>
          {isNewBest && (
            <p className="text-sm font-medium text-emerald-600">
              ベストスコアを更新しました！
            </p>
          )}
          <div className="flex gap-3 mt-2">
            {!isLastRound && (
              <Button onClick={onNextRound} size="lg" className="rounded-xl px-6">
                次のラウンド
              </Button>
            )}
            <Button
              onClick={onReset}
              variant={isLastRound ? "default" : "outline"}
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
