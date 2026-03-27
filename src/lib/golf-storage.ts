import type { GolfBestScore } from "@/types/golf";

const STORAGE_KEY = "golf-best-score";

/** ベストスコアをlocalStorageから取得する */
export function getGolfBestScore(): GolfBestScore | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    const parsed = JSON.parse(data);
    // 必須フィールドの型を検証
    if (
      typeof parsed.remainingCards !== "number" ||
      typeof parsed.date !== "string"
    ) {
      return null;
    }
    return parsed as GolfBestScore;
  } catch {
    return null;
  }
}

/** ベストスコアをlocalStorageに保存する */
export function saveGolfBestScore(score: GolfBestScore): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(score));
  } catch {
    // localStorageが使用できない場合は何もしない
  }
}

/**
 * 残りカード数がベストを更新するか判定し、更新する場合は保存する
 * 判定基準: remainingCards が既存より少なければ更新
 */
export function updateGolfBestScore(remainingCards: number): boolean {
  const current = getGolfBestScore();

  if (!current || remainingCards < current.remainingCards) {
    saveGolfBestScore({
      remainingCards,
      date: new Date().toISOString().split("T")[0],
    });
    return true;
  }

  return false;
}
