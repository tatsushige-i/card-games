"use client";

import { useBlackjack } from "@/hooks/useBlackjack";
import { BlackjackHeader } from "./blackjack-header";
import { BlackjackHand } from "./blackjack-hand";
import { BlackjackResult } from "./blackjack-result";
import { BlackjackGameOverDialog } from "./blackjack-game-over-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** ブラックジャックのメインゲームボード */
export function BlackjackBoard() {
  const {
    state,
    bestScore,
    startGame,
    hit,
    stand,
    nextRound,
    dismissDialog,
    resetGame,
  } = useBlackjack();

  const isPlaying = state.phase === "playing";
  const showCards = state.phase !== "idle";
  const showResult =
    state.phase === "result" || state.phase === "gameOver";
  const isWinResult =
    state.result === "win" || state.result === "blackjack";

  return (
    <div
      className={cn(
        "game-background flex flex-col items-center px-4 py-6 sm:py-10",
        showResult && isWinResult && "celebrate"
      )}
    >
      <div className="w-full max-w-lg">
        <BlackjackHeader
          wins={state.wins}
          rounds={state.rounds}
          phase={state.phase}
          bestScore={bestScore}
          onStart={startGame}
          onReset={resetGame}
        />

        {showCards && (
          <div className="flex flex-col items-center gap-6">
            {/* ディーラーの手札 */}
            <BlackjackHand
              label="ディーラー"
              cards={state.dealerHand}
              hideSecond={!state.dealerRevealed}
            />

            {/* 結果表示 */}
            {showResult && (
              <BlackjackResult
                result={state.result}
                playerHand={state.playerHand}
                dealerHand={state.dealerHand}
              />
            )}

            {/* プレイヤーの手札 */}
            <BlackjackHand label="プレイヤー" cards={state.playerHand} />

            {/* ヒット/スタンド ボタン */}
            {isPlaying && (
              <div className="flex gap-4">
                <Button
                  onClick={hit}
                  size="lg"
                  className="rounded-xl px-8 text-lg bg-emerald-500 hover:bg-emerald-600"
                >
                  ヒット
                </Button>
                <Button
                  onClick={stand}
                  size="lg"
                  className="rounded-xl px-8 text-lg bg-amber-500 hover:bg-amber-600"
                >
                  スタンド
                </Button>
              </div>
            )}

            {/* ディーラーターン中の表示 */}
            {state.phase === "dealerTurn" && (
              <p className="text-sm text-gray-500 animate-pulse">
                ディーラーのターン...
              </p>
            )}

            {/* 配布中の表示 */}
            {state.phase === "dealing" && (
              <p className="text-sm text-gray-500 animate-pulse">
                カードを配っています...
              </p>
            )}
          </div>
        )}
      </div>

      <BlackjackGameOverDialog
        open={state.dialogOpen}
        result={state.result}
        wins={state.wins}
        maxWins={state.maxWins}
        rounds={state.rounds}
        isNewBest={state.isNewBest}
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
