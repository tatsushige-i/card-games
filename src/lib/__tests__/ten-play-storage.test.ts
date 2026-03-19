import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getTenPlayBestScore,
  saveTenPlayBestScore,
  updateTenPlayBestScore,
} from "../ten-play-storage";

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

describe("getTenPlayBestScore", () => {
  it("データがない場合はnullを返す", () => {
    expect(getTenPlayBestScore()).toBeNull();
  });

  it("保存済みデータを返す", () => {
    localStorageMock.setItem(
      "ten-play-best-score",
      JSON.stringify({ bestTime: 120, date: "2026-03-20" })
    );
    expect(getTenPlayBestScore()).toEqual({ bestTime: 120, date: "2026-03-20" });
  });

  it("不正なJSONの場合はnullを返す", () => {
    localStorageMock.setItem("ten-play-best-score", "invalid");
    localStorageMock.getItem.mockReturnValueOnce("invalid");
    expect(getTenPlayBestScore()).toBeNull();
  });
});

describe("saveTenPlayBestScore", () => {
  it("正しいキーでlocalStorageに保存する", () => {
    saveTenPlayBestScore({ bestTime: 90, date: "2026-03-20" });
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "ten-play-best-score",
      JSON.stringify({ bestTime: 90, date: "2026-03-20" })
    );
  });
});

describe("updateTenPlayBestScore", () => {
  it("初回は常に更新する", () => {
    const result = updateTenPlayBestScore(120);
    expect(result).toBe(true);
  });

  it("既存より短い時間なら更新する", () => {
    localStorageMock.setItem(
      "ten-play-best-score",
      JSON.stringify({ bestTime: 120, date: "2026-03-19" })
    );
    const result = updateTenPlayBestScore(90);
    expect(result).toBe(true);
  });

  it("既存以上の時間なら更新しない", () => {
    localStorageMock.setItem(
      "ten-play-best-score",
      JSON.stringify({ bestTime: 90, date: "2026-03-19" })
    );
    const result = updateTenPlayBestScore(120);
    expect(result).toBe(false);
  });

  it("同じ時間では更新しない", () => {
    localStorageMock.setItem(
      "ten-play-best-score",
      JSON.stringify({ bestTime: 90, date: "2026-03-19" })
    );
    const result = updateTenPlayBestScore(90);
    expect(result).toBe(false);
  });
});
