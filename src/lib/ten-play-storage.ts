import type { TenPlayBestScore } from "@/types/ten-play";

const STORAGE_KEY = "ten-play-best-score";

/** ベストスコアをlocalStorageから取得する */
export function getTenPlayBestScore(): TenPlayBestScore | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data) as TenPlayBestScore;
  } catch {
    return null;
  }
}

/** ベストスコアをlocalStorageに保存する */
export function saveTenPlayBestScore(score: TenPlayBestScore): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(score));
  } catch {
    // localStorageが使用できない場合は何もしない
  }
}

/**
 * クリア時間がベストを更新するか判定し、更新する場合は保存する
 * 判定基準: bestTime が既存より短ければ更新
 */
export function updateTenPlayBestScore(elapsedTime: number): boolean {
  const current = getTenPlayBestScore();

  if (!current || elapsedTime < current.bestTime) {
    saveTenPlayBestScore({
      bestTime: elapsedTime,
      date: new Date().toISOString().split("T")[0],
    });
    return true;
  }

  return false;
}
