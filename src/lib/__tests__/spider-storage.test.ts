import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getSpiderBestScore,
  saveSpiderBestScore,
  updateSpiderBestScore,
} from "../spider-storage";

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

describe("getSpiderBestScore", () => {
  it("データがない場合はnullを返す", () => {
    expect(getSpiderBestScore()).toBeNull();
  });

  it("保存済みデータを返す", () => {
    localStorageMock.setItem(
      "spider-best-score",
      JSON.stringify({
        bestMoves: 120,
        bestMovesDate: "2026-03-18",
        bestTime: 600,
        bestTimeDate: "2026-03-18",
      })
    );
    expect(getSpiderBestScore()).toEqual({
      bestMoves: 120,
      bestMovesDate: "2026-03-18",
      bestTime: 600,
      bestTimeDate: "2026-03-18",
    });
  });

  it("不正なJSONの場合はnullを返す", () => {
    localStorageMock.setItem("spider-best-score", "invalid");
    localStorageMock.getItem.mockReturnValueOnce("invalid");
    expect(getSpiderBestScore()).toBeNull();
  });

  it("旧フォーマット（bestTimeなし）の場合はnullを返す", () => {
    localStorageMock.setItem(
      "spider-best-score",
      JSON.stringify({ bestMoves: 147, date: "2026-03-18" })
    );
    expect(getSpiderBestScore()).toBeNull();
  });
});

describe("saveSpiderBestScore", () => {
  it("正しいキーでlocalStorageに保存する", () => {
    const score = {
      bestMoves: 100,
      bestMovesDate: "2026-03-18",
      bestTime: 300,
      bestTimeDate: "2026-03-18",
    };
    saveSpiderBestScore(score);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "spider-best-score",
      JSON.stringify(score)
    );
  });
});

describe("updateSpiderBestScore", () => {
  it("初回は常に更新する", () => {
    const result = updateSpiderBestScore(150, 600);
    expect(result).toEqual({ movesUpdated: true, timeUpdated: true });
    const saved = getSpiderBestScore();
    expect(saved?.bestMoves).toBe(150);
    expect(saved?.bestTime).toBe(600);
  });

  it("手数のみベストなら手数だけ更新する", () => {
    localStorageMock.setItem(
      "spider-best-score",
      JSON.stringify({
        bestMoves: 150,
        bestMovesDate: "2026-03-17",
        bestTime: 300,
        bestTimeDate: "2026-03-17",
      })
    );
    const result = updateSpiderBestScore(100, 500);
    expect(result).toEqual({ movesUpdated: true, timeUpdated: false });
    const saved = getSpiderBestScore();
    expect(saved?.bestMoves).toBe(100);
    expect(saved?.bestTime).toBe(300); // タイムは更新されない
  });

  it("タイムのみベストならタイムだけ更新する", () => {
    localStorageMock.setItem(
      "spider-best-score",
      JSON.stringify({
        bestMoves: 100,
        bestMovesDate: "2026-03-17",
        bestTime: 600,
        bestTimeDate: "2026-03-17",
      })
    );
    const result = updateSpiderBestScore(200, 300);
    expect(result).toEqual({ movesUpdated: false, timeUpdated: true });
    const saved = getSpiderBestScore();
    expect(saved?.bestMoves).toBe(100); // 手数は更新されない
    expect(saved?.bestTime).toBe(300);
  });

  it("両方ベストなら両方更新する", () => {
    localStorageMock.setItem(
      "spider-best-score",
      JSON.stringify({
        bestMoves: 150,
        bestMovesDate: "2026-03-17",
        bestTime: 600,
        bestTimeDate: "2026-03-17",
      })
    );
    const result = updateSpiderBestScore(100, 300);
    expect(result).toEqual({ movesUpdated: true, timeUpdated: true });
    const saved = getSpiderBestScore();
    expect(saved?.bestMoves).toBe(100);
    expect(saved?.bestTime).toBe(300);
  });

  it("どちらもベスト以上なら更新しない", () => {
    localStorageMock.setItem(
      "spider-best-score",
      JSON.stringify({
        bestMoves: 100,
        bestMovesDate: "2026-03-17",
        bestTime: 300,
        bestTimeDate: "2026-03-17",
      })
    );
    const result = updateSpiderBestScore(150, 500);
    expect(result).toEqual({ movesUpdated: false, timeUpdated: false });
  });

  it("同数・同タイムでは更新しない", () => {
    localStorageMock.setItem(
      "spider-best-score",
      JSON.stringify({
        bestMoves: 100,
        bestMovesDate: "2026-03-17",
        bestTime: 300,
        bestTimeDate: "2026-03-17",
      })
    );
    const result = updateSpiderBestScore(100, 300);
    expect(result).toEqual({ movesUpdated: false, timeUpdated: false });
  });
});
