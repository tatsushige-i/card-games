"use client";

import { usePyramid } from "@/hooks/usePyramid";
import { PyramidHeader } from "./pyramid-header";
import { PyramidGrid } from "./pyramid-grid";
import { PyramidStockArea } from "./pyramid-stock-area";
import { PyramidGameOverDialog } from "./pyramid-game-over-dialog";
import { cn } from "@/lib/utils";

/** ピラミッドソリティアのメインゲームボード */
export function PyramidBoard() {
  const {
    state,
    bestScore,
    startGame,
    selectCard,
    drawStock,
    recycleStock,
    dismissDialog,
    resetGame,
  } = usePyramid();

  const showBoard = state.phase !== "idle";
  const isWin = state.result === "win";

  return (
    <div
      className={cn(
        "game-background flex flex-col items-center px-4 py-6 sm:py-10",
        state.phase === "complete" && isWin && "celebrate"
      )}
    >
      <div className="w-full max-w-2xl">
        <PyramidHeader
          elapsedTime={state.elapsedTime}
          removedCount={state.removedCount}
          phase={state.phase}
          bestScore={bestScore}
          onStart={startGame}
          onReset={resetGame}
        />

        {showBoard && (
          <div className="flex flex-col items-center gap-6">
            {/* ピラミッドグリッド */}
            <PyramidGrid
              pyramid={state.pyramid}
              selectedCardId={state.selectedCardId}
              invalidPair={state.invalidPair}
              onSelectCard={(cardId) => selectCard(cardId, "pyramid")}
            />

            {/* 山札・捨て札エリア */}
            <PyramidStockArea
              stock={state.stock}
              waste={state.waste}
              stockRecycles={state.stockRecycles}
              selectedCardId={state.selectedCardId}
              invalidPair={state.invalidPair}
              onDrawStock={drawStock}
              onRecycleStock={recycleStock}
              onSelectWaste={(cardId) => selectCard(cardId, "waste")}
            />
          </div>
        )}
      </div>

      <PyramidGameOverDialog
        open={state.dialogOpen}
        result={state.result}
        elapsedTime={state.elapsedTime}
        removedCount={state.removedCount}
        isNewBest={state.isNewBest}
        onPlayAgain={() => {
          resetGame();
          startGame();
        }}
        onClose={dismissDialog}
      />
    </div>
  );
}
