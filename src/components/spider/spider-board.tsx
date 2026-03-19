"use client";

import { useMemo } from "react";
import { useSpider } from "@/hooks/useSpider";
import { canDealRow } from "@/lib/spider-cards";
import type { SpiderPhase } from "@/types/spider";
import { SpiderHeader } from "./spider-header";
import { SpiderColumns } from "./spider-columns";
import { SpiderStockArea } from "./spider-stock-area";
import { SpiderGameOverDialog } from "./spider-game-over-dialog";
import { cn } from "@/lib/utils";

/** ゲーム状態に応じたナビゲーションメッセージを返す */
function getHintMessage(
  phase: SpiderPhase,
  selectedColumn: number | null,
  stockLength: number,
  hasEmptyColumns: boolean,
  canDeal: boolean
): string | null {
  if (phase !== "playing") return null;

  // カード選択中
  if (selectedColumn !== null) {
    return "移動先の列をクリックしてください（同じカードで選択解除）";
  }

  // 空列あり＋山札あり → 配布不可の理由を案内
  if (hasEmptyColumns && stockLength > 0) {
    return "すべての列にカードを置くと山札から配れます";
  }

  // 山札配布可能
  if (canDeal) {
    return "山札をクリックして各列に1枚ずつ配れます";
  }

  return null;
}

/** スパイダーソリティアのメインゲームボード */
export function SpiderBoard() {
  const {
    state,
    bestScore,
    startGame,
    handleCardClick,
    handleEmptyColumnClick,
    dealRow,
    giveUp,
    dismissDialog,
    resetGame,
  } = useSpider();

  const showBoard = state.phase !== "idle";
  const isWin = state.result === "win";

  const hasEmptyColumns = useMemo(
    () => state.columns.some((col) => col.length === 0),
    [state.columns]
  );

  const canDeal = state.phase === "playing" && canDealRow(state.columns, state.stock);

  const hintMessage = getHintMessage(
    state.phase,
    state.selectedColumn,
    state.stock.length,
    hasEmptyColumns,
    canDeal
  );

  return (
    <div
      className={cn(
        "game-background flex flex-col items-center px-4 py-6 sm:py-10",
        state.phase === "cleared" && isWin && "celebrate"
      )}
    >
      <div className="w-full max-w-4xl">
        <SpiderHeader
          moves={state.moves}
          completedSets={state.completedSets}
          elapsedTime={state.elapsedTime}
          stockCount={state.stock.length}
          phase={state.phase}
          bestScore={bestScore}
          onStart={startGame}
          onReset={resetGame}
          onGiveUp={giveUp}
        />

        {showBoard && (
          <div className="flex flex-col items-center gap-6">
            {/* ナビゲーションメッセージ（常にスペースを確保してレイアウトシフトを防止） */}
            <div className={cn(
              "glass rounded-xl px-4 py-2 shadow-sm transition-opacity duration-200",
              hintMessage ? "opacity-100" : "opacity-0 pointer-events-none"
            )}>
              <p className="text-sm text-gray-600 text-center">
                {hintMessage || "\u00A0"}
              </p>
            </div>

            {/* 10列のカード */}
            <SpiderColumns
              columns={state.columns}
              selectedColumn={state.selectedColumn}
              selectedCardIndex={state.selectedCardIndex}
              onCardClick={handleCardClick}
              onEmptyColumnClick={handleEmptyColumnClick}
            />

            {/* 山札エリア */}
            <SpiderStockArea
              stock={state.stock}
              columns={state.columns}
              phase={state.phase}
              onDeal={dealRow}
            />
          </div>
        )}
      </div>

      <SpiderGameOverDialog
        open={state.dialogOpen}
        result={state.result}
        completedSets={state.completedSets}
        moves={state.moves}
        elapsedTime={state.elapsedTime}
        isNewBestMoves={state.isNewBestMoves}
        isNewBestTime={state.isNewBestTime}
        onPlayAgain={() => {
          startGame();
        }}
        onClose={dismissDialog}
      />
    </div>
  );
}
