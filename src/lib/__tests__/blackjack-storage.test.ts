import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getBlackjackBestScore,
  saveBlackjackBestScore,
  updateBlackjackBestScore,
} from "../blackjack-storage";

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

describe("getBlackjackBestScore", () => {
  it("データがない場合nullを返す", () => {
    expect(getBlackjackBestScore()).toBeNull();
  });

  it("保存されたデータを取得する", () => {
    localStorageMock.setItem(
      "blackjack-best-score",
      JSON.stringify({ maxWins: 5 })
    );
    expect(getBlackjackBestScore()).toEqual({ maxWins: 5 });
  });

  it("不正なJSONの場合nullを返す", () => {
    localStorageMock.setItem("blackjack-best-score", "invalid");
    localStorageMock.getItem.mockReturnValueOnce("invalid");
    expect(getBlackjackBestScore()).toBeNull();
  });
});

describe("saveBlackjackBestScore", () => {
  it("正しいキーでlocalStorageに保存する", () => {
    saveBlackjackBestScore({ maxWins: 3 });
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "blackjack-best-score",
      JSON.stringify({ maxWins: 3 })
    );
  });
});

describe("updateBlackjackBestScore", () => {
  it("初回は常に更新する", () => {
    const updated = updateBlackjackBestScore(1);
    expect(updated).toBe(true);
  });

  it("maxWinsが上回れば更新する", () => {
    localStorageMock.setItem(
      "blackjack-best-score",
      JSON.stringify({ maxWins: 3 })
    );
    const updated = updateBlackjackBestScore(5);
    expect(updated).toBe(true);
  });

  it("maxWinsが同じなら更新しない", () => {
    localStorageMock.setItem(
      "blackjack-best-score",
      JSON.stringify({ maxWins: 3 })
    );
    const updated = updateBlackjackBestScore(3);
    expect(updated).toBe(false);
  });

  it("maxWinsが下回れば更新しない", () => {
    localStorageMock.setItem(
      "blackjack-best-score",
      JSON.stringify({ maxWins: 5 })
    );
    const updated = updateBlackjackBestScore(3);
    expect(updated).toBe(false);
  });
});
