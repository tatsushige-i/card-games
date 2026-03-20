"use client";

import { TriPeaksCard } from "./tri-peaks-card";
import { isExposed, isAdjacentValue, ROW_SIZES } from "@/lib/tri-peaks-cards";
import type { TriPeaksCard as TriPeaksCardType, PlayingCard } from "@/types/tri-peaks";

type TriPeaksGridProps = {
  tableau: TriPeaksCardType[];
  wasteTop: PlayingCard | null;
  onRemoveCard: (row: number, pos: number) => void;
};

/**
 * Row 0-1をピークごとにグループ化する際のギャップ位置
 * Row 0: 3つのピーク（各1枚）
 * Row 1: 3つのピーク（各2枚）
 */
const PEAK_GROUPS: Record<number, number[][]> = {
  0: [[0], [1], [2]],
  1: [
    [0, 1],
    [2, 3],
    [4, 5],
  ],
};

/** 3つのピラミッドを表示するグリッド */
export function TriPeaksGrid({
  tableau,
  wasteTop,
  onRemoveCard,
}: TriPeaksGridProps) {
  /** カードを取得する */
  const getCard = (row: number, pos: number) =>
    tableau.find((c) => c.row === row && c.pos === pos);

  /** カードが表向きか判定する（露出カード＝子が全て除去済み） */
  const isFaceUp = (card: TriPeaksCardType) => isExposed(card, tableau);

  /** カードがクリック可能か（露出 かつ 捨て札と±1） */
  const isClickable = (card: TriPeaksCardType) => {
    if (!isExposed(card, tableau)) return false;
    if (!wasteTop) return false;
    return isAdjacentValue(card.value, wasteTop.value);
  };

  /** 単一カードをレンダリングする */
  const renderCard = (row: number, pos: number) => {
    const card = getCard(row, pos);
    if (!card) return null;

    if (card.removed) {
      // 除去済み: 空スペース
      return (
        <div
          key={`${row}-${pos}`}
          className="w-10 h-14 sm:w-12 sm:h-16"
        />
      );
    }

    const faceUp = isFaceUp(card);
    const clickable = faceUp && isClickable(card);

    return (
      <TriPeaksCard
        key={card.id}
        card={card}
        faceUp={faceUp}
        clickable={clickable}
        highlighted={clickable}
        onClick={clickable ? () => onRemoveCard(row, pos) : undefined}
      />
    );
  };

  return (
    <div className="flex flex-col items-center">
      {/* Row 0-1: ピークごとにグループ化 */}
      {[0, 1].map((row) => (
        <div
          key={row}
          className="flex justify-center gap-4 sm:gap-6"
          style={{ marginTop: row === 0 ? 0 : -4 }}
        >
          {PEAK_GROUPS[row].map((positions, groupIndex) => (
            <div key={groupIndex} className="flex gap-0.5">
              {positions.map((pos) => renderCard(row, pos))}
            </div>
          ))}
        </div>
      ))}

      {/* Row 2-3: 連続配置 */}
      {[2, 3].map((row) => (
        <div
          key={row}
          className="flex justify-center gap-0.5"
          style={{ marginTop: -4 }}
        >
          {Array.from({ length: ROW_SIZES[row] }, (_, pos) =>
            renderCard(row, pos)
          )}
        </div>
      ))}
    </div>
  );
}
