import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getPyramidBestScore,
  savePyramidBestScore,
  updatePyramidBestScore,
} from "../pyramid-storage";

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

describe("getPyramidBestScore", () => {
  it("データがない場合はnullを返す", () => {
    expect(getPyramidBestScore()).toBeNull();
  });

  it("保存済みデータを返す", () => {
    localStorageMock.setItem(
      "pyramid-best-score",
      JSON.stringify({ bestTime: 120 })
    );
    expect(getPyramidBestScore()).toEqual({ bestTime: 120 });
  });

  it("旧形式（maxScore）のデータはnullを返しlocalStorageから削除する", () => {
    localStorageMock.setItem(
      "pyramid-best-score",
      JSON.stringify({ maxScore: 310 })
    );
    expect(getPyramidBestScore()).toBeNull();
    expect(localStorageMock.getItem("pyramid-best-score")).toBeNull();
  });

  it("不正なJSONの場合はnullを返す", () => {
    localStorageMock.setItem("pyramid-best-score", "invalid");
    localStorageMock.getItem.mockReturnValueOnce("invalid");
    expect(getPyramidBestScore()).toBeNull();
  });
});

describe("savePyramidBestScore", () => {
  it("正しいキーでlocalStorageに保存する", () => {
    savePyramidBestScore({ bestTime: 90 });
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "pyramid-best-score",
      JSON.stringify({ bestTime: 90 })
    );
  });
});

describe("updatePyramidBestScore", () => {
  it("初回は常に更新する", () => {
    const result = updatePyramidBestScore(100);
    expect(result).toBe(true);
  });

  it("ベストより短ければ更新する", () => {
    localStorageMock.setItem(
      "pyramid-best-score",
      JSON.stringify({ bestTime: 100 })
    );
    const result = updatePyramidBestScore(80);
    expect(result).toBe(true);
  });

  it("ベスト以上なら更新しない", () => {
    localStorageMock.setItem(
      "pyramid-best-score",
      JSON.stringify({ bestTime: 80 })
    );
    const result = updatePyramidBestScore(100);
    expect(result).toBe(false);
  });

  it("同タイムでは更新しない", () => {
    localStorageMock.setItem(
      "pyramid-best-score",
      JSON.stringify({ bestTime: 100 })
    );
    const result = updatePyramidBestScore(100);
    expect(result).toBe(false);
  });
});
