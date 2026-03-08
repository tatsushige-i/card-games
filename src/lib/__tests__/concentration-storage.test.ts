import { describe, it, expect, beforeEach, vi } from "vitest";
import { getConcentrationBestScore, saveConcentrationBestScore, updateConcentrationBestScore } from "../concentration-storage";

/** localStorageのモックを作成する */
function createLocalStorageMock() {
  const store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn(() => null),
  };
}

describe("storage", () => {
  let mockStorage: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    mockStorage = createLocalStorageMock();
    Object.defineProperty(globalThis, "localStorage", {
      value: mockStorage,
      writable: true,
      configurable: true,
    });
  });

  describe("getConcentrationBestScore", () => {
    it("データがない場合はnullを返す", () => {
      expect(getConcentrationBestScore()).toBeNull();
    });

    it("保存されたスコアを取得する", () => {
      mockStorage.setItem(
        "concentration-best-score",
        JSON.stringify({ moves: 10, time: 30 })
      );
      expect(getConcentrationBestScore()).toEqual({ moves: 10, time: 30 });
    });

    it("不正なJSONの場合はnullを返す", () => {
      mockStorage.setItem("concentration-best-score", "invalid");
      expect(getConcentrationBestScore()).toBeNull();
    });
  });

  describe("saveConcentrationBestScore", () => {
    it("スコアをlocalStorageに保存する", () => {
      saveConcentrationBestScore({ moves: 8, time: 25 });
      const stored = JSON.parse(
        mockStorage.getItem("concentration-best-score")!
      );
      expect(stored).toEqual({ moves: 8, time: 25 });
    });
  });

  describe("updateConcentrationBestScore", () => {
    it("初回は常に保存してtrueを返す", () => {
      const result = updateConcentrationBestScore(10, 30);
      expect(result).toBe(true);
      expect(getConcentrationBestScore()).toEqual({ moves: 10, time: 30 });
    });

    it("試行回数が少ない場合は更新する", () => {
      saveConcentrationBestScore({ moves: 10, time: 30 });
      const result = updateConcentrationBestScore(8, 40);
      expect(result).toBe(true);
      expect(getConcentrationBestScore()?.moves).toBe(8);
    });

    it("同じ試行回数で時間が短い場合は更新する", () => {
      saveConcentrationBestScore({ moves: 10, time: 30 });
      const result = updateConcentrationBestScore(10, 25);
      expect(result).toBe(true);
      expect(getConcentrationBestScore()?.time).toBe(25);
    });

    it("スコアが劣る場合は更新しない", () => {
      saveConcentrationBestScore({ moves: 8, time: 20 });
      const result = updateConcentrationBestScore(10, 30);
      expect(result).toBe(false);
      expect(getConcentrationBestScore()?.moves).toBe(8);
    });
  });
});
