"use client";

import { useTenPlay } from "@/hooks/useTenPlay";
import { getTotalRemainingCards } from "@/lib/ten-play-cards";
import { TenPlayHeader } from "./ten-play-header";
import { TenPlayTableau } from "./ten-play-tableau";
import { TenPlayGameOverDialog } from "./ten-play-game-over-dialog";
import { cn } from "@/lib/utils";

/** テンプレイのメインゲームボード */
export function TenPlayBoard() {
  const {
    state,
    bestScore,
    startGame,
    selectCard,
    dismissDialog,
    resetGame,
  } = useTenPlay();

  const showBoard = state.phase !== "idle";
  const isWin = state.result === "win";
  const remainingCards = getTotalRemainingCards(state.tableau, state.stock);

  return (
    <div
      className={cn(
        "game-background flex flex-col items-center px-4 py-6 sm:py-10",
        state.phase === "cleared" && isWin && "celebrate"
      )}
    >
      <div className="w-full max-w-2xl">
        <TenPlayHeader
          elapsedTime={state.elapsedTime}
          removedCount={state.removedCount}
          remainingCards={remainingCards}
          stockCount={state.stock.length}
          phase={state.phase}
          bestScore={bestScore}
          onStart={startGame}
          onReset={resetGame}
        />

        {showBoard && (
          <div className="flex flex-col items-center gap-6">
            <TenPlayTableau
              tableau={state.tableau}
              selectedIndices={state.selectedIndices}
              invalidPair={state.invalidPair}
              onSelectCard={selectCard}
            />
          </div>
        )}
      </div>

      <TenPlayGameOverDialog
        open={state.dialogOpen}
        result={state.result}
        remainingCards={remainingCards}
        removedCount={state.removedCount}
        elapsedTime={state.elapsedTime}
        isNewBest={state.isNewBest}
        onPlayAgain={() => {
          startGame();
        }}
        onClose={dismissDialog}
      />
    </div>
  );
}
