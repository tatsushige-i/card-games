import type { PokerBestScore } from "@/types/poker";

const STORAGE_KEY = "poker-best-score";

/** ベストスコアをlocalStorageから取得する */
export function getPokerBestScore(): PokerBestScore | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    const parsed = JSON.parse(data);
    // 必須フィールドの型を検証
    if (typeof parsed.maxScore !== "number") {
      return null;
    }
    return parsed as PokerBestScore;
  } catch {
    return null;
  }
}

/** ベストスコアをlocalStorageに保存する */
export function savePokerBestScore(score: PokerBestScore): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(score));
  } catch {
    // localStorageが使用できない場合は何もしない
  }
}

/**
 * 現在のスコアがベストを更新するか判定し、更新する場合は保存する
 * 判定基準: maxScore が既存を超えれば更新
 */
export function updatePokerBestScore(maxScore: number): boolean {
  const current = getPokerBestScore();

  if (!current || maxScore > current.maxScore) {
    savePokerBestScore({ maxScore });
    return true;
  }

  return false;
}
