import type { ConcentrationBestScore } from "@/types/concentration";

const STORAGE_KEY = "concentration-best-score";

/** ベストスコアをlocalStorageから取得する */
export function getBestScore(): ConcentrationBestScore | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data) as ConcentrationBestScore;
  } catch {
    return null;
  }
}

/** ベストスコアをlocalStorageに保存する */
export function saveBestScore(score: ConcentrationBestScore): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(score));
  } catch {
    // localStorageが使用できない場合は何もしない
  }
}

/**
 * 現在のスコアがベストスコアを更新するか判定し、更新する場合は保存する
 * ベストスコアの判定基準: 試行回数が少ない方が優先、同数なら時間が短い方
 */
export function updateBestScore(moves: number, time: number): boolean {
  const current = getBestScore();

  if (
    !current ||
    moves < current.moves ||
    (moves === current.moves && time < current.time)
  ) {
    saveBestScore({ moves, time });
    return true;
  }

  return false;
}
