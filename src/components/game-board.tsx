"use client";

import { useGame } from "@/hooks/useGame";
import { GameHeader } from "./game-header";
import { CardGrid } from "./card-grid";
import { GameCompleteDialog } from "./game-complete-dialog";
import { cn } from "@/lib/utils";

/** ゲーム全体をまとめるクライアントコンポーネント */
export function GameBoard() {
  const { state, bestScore, startGame, flipCard, dismissDialog } = useGame();

  // 2枚めくられている間はカード操作を無効化
  const isLocked = state.flippedIds.length >= 2;

  return (
    <div
      className={cn(
        "game-background flex flex-col items-center px-4 py-6 sm:py-10",
        state.phase === "complete" && "celebrate"
      )}
    >
      <div className="w-full max-w-lg">
        <GameHeader
          moves={state.moves}
          elapsedTime={state.elapsedTime}
          matchedPairs={state.matchedPairs}
          totalPairs={state.totalPairs}
          phase={state.phase}
          bestScore={bestScore}
          onStart={startGame}
        />

        {state.phase !== "idle" && (
          <CardGrid
            cards={state.cards}
            onFlip={flipCard}
            disabled={isLocked}
          />
        )}
      </div>

      <GameCompleteDialog
        open={state.dialogOpen}
        moves={state.moves}
        elapsedTime={state.elapsedTime}
        isNewBest={state.isNewBest}
        onPlayAgain={startGame}
        onClose={dismissDialog}
      />
    </div>
  );
}
