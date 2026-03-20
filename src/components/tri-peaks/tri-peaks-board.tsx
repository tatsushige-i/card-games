"use client";

import { useTriPeaks } from "@/hooks/useTriPeaks";
import { TriPeaksHeader } from "./tri-peaks-header";
import { TriPeaksGrid } from "./tri-peaks-grid";
import { TriPeaksStockArea } from "./tri-peaks-stock-area";
import { TriPeaksGameOverDialog } from "./tri-peaks-game-over-dialog";
import { cn } from "@/lib/utils";

/** トライピークスのメインゲームボード */
export function TriPeaksBoard() {
  const {
    state,
    bestScore,
    startGame,
    draw,
    removeCard,
    dismissDialog,
    resetGame,
  } = useTriPeaks();

  const showBoard = state.phase !== "idle";
  const isWin = state.result === "win";
  const wasteTop =
    state.waste.length > 0 ? state.waste[state.waste.length - 1] : null;

  return (
    <div
      className={cn(
        "game-background flex flex-col items-center px-4 py-6 sm:py-10",
        state.phase === "cleared" && isWin && "celebrate"
      )}
    >
      <div className="w-full max-w-2xl">
        <TriPeaksHeader
          elapsedTime={state.elapsedTime}
          score={state.score}
          combo={state.combo}
          removedCount={state.removedCount}
          phase={state.phase}
          bestScore={bestScore}
          onStart={startGame}
          onReset={resetGame}
        />

        {showBoard && (
          <div className="flex flex-col items-center gap-6">
            {/* 3つのピラミッド */}
            <TriPeaksGrid
              tableau={state.tableau}
              wasteTop={wasteTop}
              onRemoveCard={removeCard}
            />

            {/* 山札・捨て札エリア */}
            <TriPeaksStockArea
              stock={state.stock}
              waste={state.waste}
              phase={state.phase}
              onDraw={draw}
            />
          </div>
        )}
      </div>

      <TriPeaksGameOverDialog
        open={state.dialogOpen}
        result={state.result}
        score={state.score}
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
