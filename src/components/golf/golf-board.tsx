"use client";

import { useGolf } from "@/hooks/useGolf";
import { getRemainingCards } from "@/lib/golf-cards";
import { GolfHeader } from "./golf-header";
import { GolfColumns } from "./golf-columns";
import { GolfStockArea } from "./golf-stock-area";
import { GolfGameOverDialog } from "./golf-game-over-dialog";
import { cn } from "@/lib/utils";

/** ゴルフソリティアのメインゲームボード */
export function GolfBoard() {
  const {
    state,
    bestScore,
    startGame,
    draw,
    removeCard,
    dismissDialog,
    resetGame,
  } = useGolf();

  const showBoard = state.phase !== "idle";
  const isWin = state.result === "win";
  const remainingCards = getRemainingCards(state.columns);
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
        <GolfHeader
          elapsedTime={state.elapsedTime}
          removedCount={state.removedCount}
          remainingCards={remainingCards}
          phase={state.phase}
          bestScore={bestScore}
          onStart={startGame}
          onReset={resetGame}
        />

        {showBoard && (
          <div className="flex flex-col items-center gap-6">
            {/* 7列のカード */}
            <GolfColumns
              columns={state.columns}
              wasteTop={wasteTop}
              onRemoveCard={removeCard}
            />

            {/* 山札・捨て札エリア */}
            <GolfStockArea
              stock={state.stock}
              waste={state.waste}
              phase={state.phase}
              onDraw={draw}
            />
          </div>
        )}
      </div>

      <GolfGameOverDialog
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
