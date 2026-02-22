"use client";

import { usePoker } from "@/hooks/usePoker";
import { PokerHeader } from "./poker-header";
import { PokerPayTable } from "./poker-pay-table";
import { PokerHand } from "./poker-hand";
import { PokerResult } from "./poker-result";
import { PokerGameOverDialog } from "./poker-game-over-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MAX_ROUNDS, HAND_PAYOUTS } from "@/lib/poker-cards";

/** ビデオポーカーのメインゲームボード */
export function PokerBoard() {
  const {
    state,
    bestScore,
    startGame,
    toggleHold,
    draw,
    nextRound,
    dismissDialog,
    resetGame,
  } = usePoker();

  // 中間ラウンドのidle（自動開始待ち）でもカード領域を表示し続ける
  const isIntermediateIdle =
    state.phase === "idle" && state.round > 0 && state.round < MAX_ROUNDS;
  const showCards = state.phase !== "idle" || isIntermediateIdle;
  const showResult =
    state.phase === "result" || state.phase === "gameOver";
  const isHolding = state.phase === "holding";
  const isWinResult =
    showResult && state.handRank !== null && HAND_PAYOUTS[state.handRank] > 0;
  const isLastRound = state.round >= MAX_ROUNDS;

  return (
    <div
      className={cn(
        "game-background flex flex-col items-center px-4 py-6 sm:py-10",
        showResult && isWinResult && "celebrate"
      )}
    >
      <div className="w-full max-w-lg">
        <PokerHeader
          round={state.round}
          totalScore={state.totalScore}
          phase={state.phase}
          bestScore={bestScore}
          onStart={() => {
            if (isLastRound || state.round === 0) {
              resetGame();
            }
            startGame();
          }}
          onReset={() => {
            resetGame();
          }}
        />

        {showCards && (
          <div className="flex flex-col items-center gap-4 sm:gap-6">
            {/* 配当表 */}
            <PokerPayTable currentRank={showResult ? state.handRank : null} />

            {/* 手札 */}
            <PokerHand
              cards={state.hand}
              held={state.held}
              onToggleHold={toggleHold}
              clickable={isHolding}
              faceDown={state.phase === "dealing"}
            />

            {/* 役結果表示 */}
            {showResult && <PokerResult handRank={state.handRank} />}

            {/* ドローボタン */}
            {isHolding && (
              <Button
                onClick={draw}
                size="lg"
                className="rounded-xl px-10 text-lg bg-violet-500 hover:bg-violet-600"
              >
                ドロー
              </Button>
            )}

            {/* 配布中の表示 */}
            {state.phase === "dealing" && (
              <p className="text-sm text-gray-500 animate-pulse">
                カードを配っています...
              </p>
            )}

            {/* 交換中の表示 */}
            {state.phase === "drawing" && (
              <p className="text-sm text-gray-500 animate-pulse">
                カードを交換しています...
              </p>
            )}
          </div>
        )}
      </div>

      <PokerGameOverDialog
        open={state.dialogOpen}
        handRank={state.handRank}
        roundScore={state.roundScore}
        totalScore={state.totalScore}
        round={state.round}
        isNewBest={state.isNewBest}
        isLastRound={isLastRound}
        onNextRound={() => {
          nextRound();
          startGame();
        }}
        onReset={() => {
          resetGame();
          startGame();
        }}
        onClose={dismissDialog}
      />
    </div>
  );
}
