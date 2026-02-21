"use client";

import { useHighAndLow } from "@/hooks/useHighAndLow";
import { HighAndLowHeader } from "./high-and-low-header";
import { HighAndLowCard } from "./high-and-low-card";
import { HighAndLowResult } from "./high-and-low-result";
import { HighAndLowGameOverDialog } from "./high-and-low-game-over-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** ハイ＆ローのメインゲームボード */
export function HighAndLowBoard() {
  const { state, bestScore, startGame, guess, dismissDialog } =
    useHighAndLow();

  const isPlaying = state.phase === "playing";
  const isRevealing = state.phase === "revealing";
  const showCards = state.phase !== "idle";

  return (
    <div
      className={cn(
        "game-background flex flex-col items-center px-4 py-6 sm:py-10",
        state.phase === "win" && "celebrate"
      )}
    >
      <div className="w-full max-w-lg">
        <HighAndLowHeader
          score={state.score}
          streak={state.streak}
          cardsPlayed={state.cardsPlayed}
          phase={state.phase}
          bestScore={bestScore}
          onStart={startGame}
        />

        {showCards && (
          <div className="flex flex-col items-center gap-6">
            {/* カード表示エリア */}
            <div className="flex items-center justify-center gap-4 sm:gap-8">
              {/* 現在のカード（連勝中はカードが横に積み重なる） */}
              <div
                className="relative h-40 sm:h-52"
                style={{
                  width: `calc(${7 + 7.5}rem + ${Math.min(state.playedCards.length, 5) * 6}px)`,
                }}
              >
                {/* 連勝中のカードの山（最新5枚まで表示） */}
                {state.playedCards.slice(-5).map((played, i, arr) => {
                  const offset = (arr.length - i) * 6;
                  return (
                    <div
                      key={played.id}
                      className="absolute top-0 left-0 transition-transform duration-300"
                      style={{
                        transform: `translateX(-${offset}px)`,
                        zIndex: i,
                        opacity: 0.35 + (i / arr.length) * 0.45,
                      }}
                    >
                      <HighAndLowCard card={played} />
                    </div>
                  );
                })}
                {/* 現在のカード */}
                <div
                  className="absolute top-0 left-0 transition-transform duration-300"
                  style={{ zIndex: state.playedCards.length + 1 }}
                >
                  <HighAndLowCard card={state.currentCard} />
                </div>
              </div>

              {/* 次のカード（revealing中は表、それ以外は裏） */}
              {isRevealing ? (
                <HighAndLowCard
                  card={state.nextCard}
                  highlight={state.lastResult}
                />
              ) : isPlaying ? (
                <HighAndLowCard card={null} faceDown />
              ) : null}
            </div>

            {/* 結果表示 */}
            <HighAndLowResult result={state.lastResult} />

            {/* HIGH/LOW ボタン */}
            {(isPlaying || isRevealing) && (
              <div className="flex gap-4">
                <Button
                  onClick={() => guess("high")}
                  disabled={!isPlaying}
                  size="lg"
                  className={cn(
                    "rounded-xl px-8 text-lg",
                    isPlaying
                      ? "bg-red-500 hover:bg-red-600"
                      : "opacity-50"
                  )}
                >
                  ⬆ HIGH
                </Button>
                <Button
                  onClick={() => guess("low")}
                  disabled={!isPlaying}
                  size="lg"
                  className={cn(
                    "rounded-xl px-8 text-lg",
                    isPlaying
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "opacity-50"
                  )}
                >
                  ⬇ LOW
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <HighAndLowGameOverDialog
        open={state.dialogOpen}
        phase={state.phase}
        score={state.score}
        maxStreak={state.maxStreak}
        cardsPlayed={state.cardsPlayed}
        isNewBest={state.isNewBest}
        onPlayAgain={startGame}
        onClose={dismissDialog}
      />
    </div>
  );
}
