import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getHighAndLowBestScore,
  saveHighAndLowBestScore,
  updateHighAndLowBestScore,
} from "../high-and-low-storage";

/** localStorageのモック */
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

describe("getHighAndLowBestScore", () => {
  it("データがない場合はnullを返す", () => {
    expect(getHighAndLowBestScore()).toBeNull();
  });

  it("保存済みのベストスコアを返す", () => {
    localStorageMock.setItem(
      "high-and-low-best-score",
      JSON.stringify({ maxStreak: 5, maxScore: 8 })
    );
    expect(getHighAndLowBestScore()).toEqual({ maxStreak: 5, maxScore: 8 });
  });

  it("不正なJSONの場合はnullを返す", () => {
    localStorageMock.setItem("high-and-low-best-score", "invalid");
    localStorageMock.getItem.mockReturnValueOnce("invalid");
    expect(getHighAndLowBestScore()).toBeNull();
  });
});

describe("saveHighAndLowBestScore", () => {
  it("正しいキーでlocalStorageに保存する", () => {
    saveHighAndLowBestScore({ maxStreak: 5, maxScore: 8 });
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "high-and-low-best-score",
      JSON.stringify({ maxStreak: 5, maxScore: 8 })
    );
  });
});

describe("updateHighAndLowBestScore", () => {
  it("初回プレイ時は保存してtrueを返す", () => {
    const result = updateHighAndLowBestScore(3, 7);
    expect(result).toBe(true);
  });

  it("最大連勝数が上回る場合は更新する", () => {
    localStorageMock.setItem(
      "high-and-low-best-score",
      JSON.stringify({ maxStreak: 3, maxScore: 7 })
    );
    const result = updateHighAndLowBestScore(5, 6);
    expect(result).toBe(true);
  });

  it("同じ連勝数でスコアが上回る場合は更新する", () => {
    localStorageMock.setItem(
      "high-and-low-best-score",
      JSON.stringify({ maxStreak: 3, maxScore: 7 })
    );
    const result = updateHighAndLowBestScore(3, 9);
    expect(result).toBe(true);
  });

  it("スコアが下回る場合は更新しない", () => {
    localStorageMock.setItem(
      "high-and-low-best-score",
      JSON.stringify({ maxStreak: 5, maxScore: 8 })
    );
    const result = updateHighAndLowBestScore(3, 6);
    expect(result).toBe(false);
  });
});
