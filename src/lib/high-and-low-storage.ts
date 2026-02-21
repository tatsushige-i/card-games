import type { HighAndLowBestScore } from "@/types/high-and-low";

const STORAGE_KEY = "high-and-low-best-score";

/** ベストスコアをlocalStorageから取得する */
export function getHighAndLowBestScore(): HighAndLowBestScore | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data) as HighAndLowBestScore;
  } catch {
    return null;
  }
}

/** ベストスコアをlocalStorageに保存する */
export function saveHighAndLowBestScore(score: HighAndLowBestScore): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(score));
  } catch {
    // localStorageが使用できない場合は何もしない
  }
}

/**
 * 現在のスコアがベストを更新するか判定し、更新する場合は保存する
 * 判定基準: 最大連続正解数が多い方が優先、同数なら最高スコアが高い方
 */
export function updateHighAndLowBestScore(
  maxStreak: number,
  maxScore: number
): boolean {
  const current = getHighAndLowBestScore();

  if (
    !current ||
    maxStreak > current.maxStreak ||
    (maxStreak === current.maxStreak && maxScore > current.maxScore)
  ) {
    saveHighAndLowBestScore({ maxStreak, maxScore });
    return true;
  }

  return false;
}
