import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getPokerBestScore,
  savePokerBestScore,
  updatePokerBestScore,
} from "../poker-storage";

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

describe("getPokerBestScore", () => {
  it("データがない場合nullを返す", () => {
    expect(getPokerBestScore()).toBeNull();
  });

  it("保存されたデータを取得する", () => {
    localStorageMock.setItem(
      "poker-best-score",
      JSON.stringify({ maxScore: 50 })
    );
    expect(getPokerBestScore()).toEqual({ maxScore: 50 });
  });

  it("不正なJSONの場合nullを返す", () => {
    localStorageMock.setItem("poker-best-score", "invalid");
    localStorageMock.getItem.mockReturnValueOnce("invalid");
    expect(getPokerBestScore()).toBeNull();
  });
});

describe("savePokerBestScore", () => {
  it("正しいキーでlocalStorageに保存する", () => {
    savePokerBestScore({ maxScore: 30 });
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "poker-best-score",
      JSON.stringify({ maxScore: 30 })
    );
  });
});

describe("updatePokerBestScore", () => {
  it("初回は常に更新する", () => {
    const updated = updatePokerBestScore(10);
    expect(updated).toBe(true);
  });

  it("maxScoreが上回れば更新する", () => {
    localStorageMock.setItem(
      "poker-best-score",
      JSON.stringify({ maxScore: 30 })
    );
    const updated = updatePokerBestScore(50);
    expect(updated).toBe(true);
  });

  it("maxScoreが同じなら更新しない", () => {
    localStorageMock.setItem(
      "poker-best-score",
      JSON.stringify({ maxScore: 30 })
    );
    const updated = updatePokerBestScore(30);
    expect(updated).toBe(false);
  });

  it("maxScoreが下回れば更新しない", () => {
    localStorageMock.setItem(
      "poker-best-score",
      JSON.stringify({ maxScore: 50 })
    );
    const updated = updatePokerBestScore(30);
    expect(updated).toBe(false);
  });
});
