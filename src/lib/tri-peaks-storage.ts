import type { TriPeaksBestScore } from "@/types/tri-peaks";

const STORAGE_KEY = "tri-peaks-best-score";

/** ベストスコアをlocalStorageから取得する */
export function getTriPeaksBestScore(): TriPeaksBestScore | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data) as TriPeaksBestScore;
  } catch {
    return null;
  }
}

/** ベストスコアをlocalStorageに保存する */
export function saveTriPeaksBestScore(score: TriPeaksBestScore): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(score));
  } catch {
    // localStorageが使用できない場合は何もしない
  }
}

/**
 * スコアがベストを更新するか判定し、更新する場合は保存する
 * 判定基準: score が既存より大きければ更新
 */
export function updateTriPeaksBestScore(score: number): boolean {
  const current = getTriPeaksBestScore();

  if (!current || score > current.score) {
    saveTriPeaksBestScore({
      score,
      date: new Date().toISOString().split("T")[0],
    });
    return true;
  }

  return false;
}
