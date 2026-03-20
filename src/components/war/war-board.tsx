"use client";

import { useWar } from "@/hooks/useWar";
import { WarHeader } from "./war-header";
import { WarBattleField } from "./war-battle-field";
import { WarResult } from "./war-result";
import { WarGameOverDialog } from "./war-game-over-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** 戦争ゲームのメインボード */
export function WarBoard() {
  const { state, bestScore, playCard, dismissDialog, restart } = useWar();

  const showResult = state.phase === "result";
  const isPlayerWinResult = showResult && state.roundResult === "player";

  return (
    <div
      className={cn(
        "game-background flex flex-col items-center px-4 py-6 sm:py-10",
        isPlayerWinResult && "celebrate"
      )}
    >
      <div className="w-full max-w-lg">
        <WarHeader
          roundCount={state.roundCount}
          playerCards={state.playerDeck.length}
          cpuCards={state.cpuDeck.length}
          phase={state.phase}
          bestScore={bestScore}
          onRestart={restart}
        />

        <div className="flex flex-col items-center gap-6">
          {/* 対決エリア */}
          <WarBattleField
            playerCard={state.playerCard}
            cpuCard={state.cpuCard}
            playerDeckCount={state.playerDeck.length}
            cpuDeckCount={state.cpuDeck.length}
            warPileCount={state.warPile.length}
            phase={state.phase}
          />

          {/* ラウンド結果表示 */}
          {showResult && <WarResult roundResult={state.roundResult} />}

          {/* カードを出すボタン */}
          {state.phase === "ready" && (
            <Button
              onClick={playCard}
              size="lg"
              className="rounded-xl px-8 text-lg bg-emerald-500 hover:bg-emerald-600"
            >
              カードを出す
            </Button>
          )}

          {/* バトル中の表示 */}
          {state.phase === "battle" && (
            <p className="text-sm text-gray-500 animate-pulse">
              勝負判定中...
            </p>
          )}

          {/* 戦争準備中の表示 */}
          {state.phase === "war" && (
            <p className="text-sm text-gray-500 animate-pulse">
              戦争カードを出しています...
            </p>
          )}

          {/* 戦争カードオープン中の表示 */}
          {state.phase === "warReveal" && (
            <p className="text-sm text-gray-500 animate-pulse">
              勝負判定中...
            </p>
          )}
        </div>
      </div>

      <WarGameOverDialog
        open={state.dialogOpen}
        winner={state.winner}
        roundCount={state.roundCount}
        playerCards={state.playerDeck.length}
        cpuCards={state.cpuDeck.length}
        isNewBest={state.isNewBest}
        onRestart={restart}
        onClose={dismissDialog}
      />
    </div>
  );
}
