import type { WarBestScore } from "@/types/war";

const STORAGE_KEY = "war-best-score";

/** ベストスコアをlocalStorageから取得する */
export function getWarBestScore(): WarBestScore | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data) as WarBestScore;
  } catch {
    return null;
  }
}

/** ベストスコアをlocalStorageに保存する */
export function saveWarBestScore(score: WarBestScore): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(score));
  } catch {
    // localStorageが使用できない場合は何もしない
  }
}

/**
 * 勝利時のラウンド数がベストを更新するか判定し、更新する場合は保存する
 * 判定基準: rounds が既存より少なければ更新（少ない方が良い）
 */
export function updateWarBestScore(rounds: number): boolean {
  const current = getWarBestScore();

  if (!current || rounds < current.rounds) {
    saveWarBestScore({ rounds, date: new Date().toISOString() });
    return true;
  }

  return false;
}
