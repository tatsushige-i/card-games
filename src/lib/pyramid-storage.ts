import type { PyramidBestScore } from "@/types/pyramid";

const STORAGE_KEY = "pyramid-best-score";

/** ベストスコアをlocalStorageから取得する */
export function getPyramidBestScore(): PyramidBestScore | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    const parsed = JSON.parse(data);
    // 旧形式（maxScore）のデータは無効として扱う
    if (typeof parsed.bestTime !== "number") {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed as PyramidBestScore;
  } catch {
    return null;
  }
}

/** ベストスコアをlocalStorageに保存する */
export function savePyramidBestScore(score: PyramidBestScore): void {
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
export function updatePyramidBestScore(time: number): boolean {
  const current = getPyramidBestScore();

  if (!current || time < current.bestTime) {
    savePyramidBestScore({ bestTime: time });
    return true;
  }

  return false;
}
