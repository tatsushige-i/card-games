import type { BlackjackBestScore } from "@/types/blackjack";

const STORAGE_KEY = "blackjack-best-score";

/** ベストスコアをlocalStorageから取得する */
export function getBlackjackBestScore(): BlackjackBestScore | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data) as BlackjackBestScore;
  } catch {
    return null;
  }
}

/** ベストスコアをlocalStorageに保存する */
export function saveBlackjackBestScore(score: BlackjackBestScore): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(score));
  } catch {
    // localStorageが使用できない場合は何もしない
  }
}

/**
 * 現在の連勝数がベストを更新するか判定し、更新する場合は保存する
 * 判定基準: maxWins が既存を超えれば更新
 */
export function updateBlackjackBestScore(maxWins: number): boolean {
  const current = getBlackjackBestScore();

  if (!current || maxWins > current.maxWins) {
    saveBlackjackBestScore({ maxWins });
    return true;
  }

  return false;
}
