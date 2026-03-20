import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getTriPeaksBestScore,
  saveTriPeaksBestScore,
  updateTriPeaksBestScore,
} from "../tri-peaks-storage";

/** localStorageのモック */
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
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

describe("getTriPeaksBestScore", () => {
  it("データがない場合はnullを返す", () => {
    expect(getTriPeaksBestScore()).toBeNull();
  });

  it("保存済みデータを返す", () => {
    localStorageMock.setItem(
      "tri-peaks-best-score",
      JSON.stringify({ score: 42, date: "2026-03-20" })
    );
    expect(getTriPeaksBestScore()).toEqual({ score: 42, date: "2026-03-20" });
  });

  it("不正なJSONの場合はnullを返す", () => {
    localStorageMock.setItem("tri-peaks-best-score", "invalid");
    localStorageMock.getItem.mockReturnValueOnce("invalid");
    expect(getTriPeaksBestScore()).toBeNull();
  });
});

describe("saveTriPeaksBestScore", () => {
  it("正しいキーでlocalStorageに保存する", () => {
    saveTriPeaksBestScore({ score: 42, date: "2026-03-20" });
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "tri-peaks-best-score",
      JSON.stringify({ score: 42, date: "2026-03-20" })
    );
  });
});

describe("updateTriPeaksBestScore", () => {
  it("初回は常に更新する", () => {
    const result = updateTriPeaksBestScore(10);
    expect(result).toBe(true);
  });

  it("ベストより高ければ更新する", () => {
    localStorageMock.setItem(
      "tri-peaks-best-score",
      JSON.stringify({ score: 10, date: "2026-03-19" })
    );
    const result = updateTriPeaksBestScore(20);
    expect(result).toBe(true);
  });

  it("ベスト以下なら更新しない", () => {
    localStorageMock.setItem(
      "tri-peaks-best-score",
      JSON.stringify({ score: 20, date: "2026-03-19" })
    );
    const result = updateTriPeaksBestScore(10);
    expect(result).toBe(false);
  });

  it("同スコアでは更新しない", () => {
    localStorageMock.setItem(
      "tri-peaks-best-score",
      JSON.stringify({ score: 20, date: "2026-03-19" })
    );
    const result = updateTriPeaksBestScore(20);
    expect(result).toBe(false);
  });
});
