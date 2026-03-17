import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getGolfBestScore,
  saveGolfBestScore,
  updateGolfBestScore,
} from "../golf-storage";

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

describe("getGolfBestScore", () => {
  it("データがない場合はnullを返す", () => {
    expect(getGolfBestScore()).toBeNull();
  });

  it("保存済みデータを返す", () => {
    localStorageMock.setItem(
      "golf-best-score",
      JSON.stringify({ remainingCards: 5, date: "2026-03-15" })
    );
    expect(getGolfBestScore()).toEqual({ remainingCards: 5, date: "2026-03-15" });
  });

  it("不正なJSONの場合はnullを返す", () => {
    localStorageMock.setItem("golf-best-score", "invalid");
    localStorageMock.getItem.mockReturnValueOnce("invalid");
    expect(getGolfBestScore()).toBeNull();
  });
});

describe("saveGolfBestScore", () => {
  it("正しいキーでlocalStorageに保存する", () => {
    saveGolfBestScore({ remainingCards: 3, date: "2026-03-15" });
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "golf-best-score",
      JSON.stringify({ remainingCards: 3, date: "2026-03-15" })
    );
  });
});

describe("updateGolfBestScore", () => {
  it("初回は常に更新する", () => {
    const result = updateGolfBestScore(10);
    expect(result).toBe(true);
  });

  it("ベストより少なければ更新する", () => {
    localStorageMock.setItem(
      "golf-best-score",
      JSON.stringify({ remainingCards: 10, date: "2026-03-14" })
    );
    const result = updateGolfBestScore(5);
    expect(result).toBe(true);
  });

  it("ベスト以上なら更新しない", () => {
    localStorageMock.setItem(
      "golf-best-score",
      JSON.stringify({ remainingCards: 5, date: "2026-03-14" })
    );
    const result = updateGolfBestScore(10);
    expect(result).toBe(false);
  });

  it("同数では更新しない", () => {
    localStorageMock.setItem(
      "golf-best-score",
      JSON.stringify({ remainingCards: 5, date: "2026-03-14" })
    );
    const result = updateGolfBestScore(5);
    expect(result).toBe(false);
  });
});
