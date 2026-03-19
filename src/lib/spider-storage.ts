import type { SpiderBestScore } from "@/types/spider";

const STORAGE_KEY = "spider-best-score";

/** ベストスコアをlocalStorageから取得する（旧フォーマットは無効として扱う） */
export function getSpiderBestScore(): SpiderBestScore | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    const parsed = JSON.parse(data) as SpiderBestScore;
    // 新フォーマットの必須フィールドが揃っているか検証
    if (
      typeof parsed.bestMoves !== "number" ||
      typeof parsed.bestTime !== "number" ||
      typeof parsed.bestMovesDate !== "string" ||
      typeof parsed.bestTimeDate !== "string"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/** ベストスコアをlocalStorageに保存する */
export function saveSpiderBestScore(score: SpiderBestScore): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(score));
  } catch {
    // localStorageが使用できない場合は何もしない
  }
}

/**
 * 手数・タイムそれぞれ独立にベストを更新する
 * 判定基準: moves/time が既存より少なければそれぞれ更新
 * 返り値: いずれかが更新されたかどうか
 */
export function updateSpiderBestScore(
  moves: number,
  time: number
): { movesUpdated: boolean; timeUpdated: boolean } {
  const current = getSpiderBestScore();
  const today = new Date().toISOString().split("T")[0];

  if (!current) {
    saveSpiderBestScore({
      bestMoves: moves,
      bestMovesDate: today,
      bestTime: time,
      bestTimeDate: today,
    });
    return { movesUpdated: true, timeUpdated: true };
  }

  const movesUpdated = moves < current.bestMoves;
  const timeUpdated = time < current.bestTime;

  if (movesUpdated || timeUpdated) {
    saveSpiderBestScore({
      bestMoves: movesUpdated ? moves : current.bestMoves,
      bestMovesDate: movesUpdated ? today : current.bestMovesDate,
      bestTime: timeUpdated ? time : current.bestTime,
      bestTimeDate: timeUpdated ? today : current.bestTimeDate,
    });
  }

  return { movesUpdated, timeUpdated };
}
