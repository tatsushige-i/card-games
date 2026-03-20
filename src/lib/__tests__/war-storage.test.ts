import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getWarBestScore,
  saveWarBestScore,
  updateWarBestScore,
} from "../war-storage";

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

describe("getWarBestScore", () => {
  it("データがない場合nullを返す", () => {
    expect(getWarBestScore()).toBeNull();
  });

  it("保存されたデータを取得する", () => {
    localStorageMock.setItem(
      "war-best-score",
      JSON.stringify({ rounds: 30, date: "2026-01-01" })
    );
    expect(getWarBestScore()).toEqual({ rounds: 30, date: "2026-01-01" });
  });

  it("不正なJSONの場合nullを返す", () => {
    localStorageMock.setItem("war-best-score", "invalid");
    localStorageMock.getItem.mockReturnValueOnce("invalid");
    expect(getWarBestScore()).toBeNull();
  });
});

describe("saveWarBestScore", () => {
  it("正しいキーでlocalStorageに保存する", () => {
    saveWarBestScore({ rounds: 25, date: "2026-01-01" });
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "war-best-score",
      JSON.stringify({ rounds: 25, date: "2026-01-01" })
    );
  });
});

describe("updateWarBestScore", () => {
  it("初回は常に更新する", () => {
    const updated = updateWarBestScore(30);
    expect(updated).toBe(true);
  });

  it("roundsが少なければ更新する（少ない方が良い）", () => {
    localStorageMock.setItem(
      "war-best-score",
      JSON.stringify({ rounds: 30, date: "2026-01-01" })
    );
    const updated = updateWarBestScore(20);
    expect(updated).toBe(true);
  });

  it("roundsが同じなら更新しない", () => {
    localStorageMock.setItem(
      "war-best-score",
      JSON.stringify({ rounds: 30, date: "2026-01-01" })
    );
    const updated = updateWarBestScore(30);
    expect(updated).toBe(false);
  });

  it("roundsが多ければ更新しない", () => {
    localStorageMock.setItem(
      "war-best-score",
      JSON.stringify({ rounds: 20, date: "2026-01-01" })
    );
    const updated = updateWarBestScore(30);
    expect(updated).toBe(false);
  });
});
