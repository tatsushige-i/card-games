import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { PlayingCard } from "@/types/high-and-low";

// モック定義
vi.mock("@/lib/high-and-low-storage", () => ({
  getHighAndLowBestScore: vi.fn(() => null),
  updateHighAndLowBestScore: vi.fn(() => false),
}));

vi.mock(import("@/lib/high-and-low-cards"), async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, createDeck: vi.fn(() => []) };
});

/** テスト用カードを生成する */
function card(value: number, id = 0): PlayingCard {
  const ranks = [
    "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K",
  ] as const;
  return { id, suit: "spade", rank: ranks[value - 1], value };
}

describe("useHighAndLow", () => {
  let useHighAndLow: typeof import("@/hooks/useHighAndLow").useHighAndLow;
  let mockUpdateBestScore: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();

    const storage = await import("@/lib/high-and-low-storage");
    const cards = await import("@/lib/high-and-low-cards");
    const hookModule = await import("@/hooks/useHighAndLow");

    useHighAndLow = hookModule.useHighAndLow;
    mockUpdateBestScore = vi.mocked(storage.updateHighAndLowBestScore);
    // デフォルトで十分なカードを返す
    vi.mocked(cards.createDeck).mockReturnValue([
      card(5, 0), card(8, 1), card(3, 2), card(10, 3), card(7, 4),
    ]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("状態初期化", () => {
    it("初期状態でidleフェーズになる", () => {
      const { result } = renderHook(() => useHighAndLow());
      expect(result.current.state.phase).toBe("idle");
      expect(result.current.state.score).toBe(3);
      expect(result.current.state.currentCard).toBeNull();
    });

    it("bestScoreの初期値はnullになる", () => {
      const { result } = renderHook(() => useHighAndLow());
      expect(result.current.bestScore).toBeNull();
    });
  });

  describe("フェーズ遷移", () => {
    it("startGameでplayingフェーズに遷移する", () => {
      const { result } = renderHook(() => useHighAndLow());
      act(() => result.current.startGame());
      expect(result.current.state.phase).toBe("playing");
      expect(result.current.state.currentCard).not.toBeNull();
    });

    it("guessでrevealingフェーズに遷移する", () => {
      const { result } = renderHook(() => useHighAndLow());
      act(() => result.current.startGame());
      act(() => result.current.guess("high"));
      expect(result.current.state.phase).toBe("revealing");
    });

    it("revealing → playingに800ms後に自動遷移する", () => {
      const { result } = renderHook(() => useHighAndLow());
      act(() => result.current.startGame());
      act(() => result.current.guess("high"));
      expect(result.current.state.phase).toBe("revealing");

      act(() => vi.advanceTimersByTime(800));
      expect(result.current.state.phase).toBe("playing");
    });

    it("playingフェーズ以外ではguessが無視される", () => {
      const { result } = renderHook(() => useHighAndLow());
      const initialState = result.current.state;
      act(() => result.current.guess("high"));
      expect(result.current.state).toBe(initialState);
    });

    it("resetGameでidle状態に戻る", () => {
      const { result } = renderHook(() => useHighAndLow());
      act(() => result.current.startGame());
      act(() => result.current.resetGame());
      expect(result.current.state.phase).toBe("idle");
    });
  });

  describe("ベストスコア更新", () => {
    it("ゲーム終了時にupdateBestScoreが呼ばれる", async () => {
      const cards = await import("@/lib/high-and-low-cards");
      // スコアが0になるようにカードを設定（初期3点 → 3回不正解で0点）
      vi.mocked(cards.createDeck).mockReturnValue([
        card(5, 0), card(3, 1), card(2, 2), card(1, 3),
      ]);

      const { result } = renderHook(() => useHighAndLow());
      act(() => result.current.startGame());

      // 3回不正解でスコア0 → lose
      for (let i = 0; i < 3; i++) {
        act(() => result.current.guess("high")); // 5→3は不正解（low）
        act(() => vi.advanceTimersByTime(800));
      }

      expect(mockUpdateBestScore).toHaveBeenCalled();
    });

    it("新記録時にisNewBestがtrueになる", async () => {
      const cards = await import("@/lib/high-and-low-cards");
      vi.mocked(cards.createDeck).mockReturnValue([
        card(5, 0), card(3, 1), card(2, 2), card(1, 3),
      ]);
      mockUpdateBestScore.mockReturnValue(true);

      const { result } = renderHook(() => useHighAndLow());
      act(() => result.current.startGame());

      for (let i = 0; i < 3; i++) {
        act(() => result.current.guess("high"));
        act(() => vi.advanceTimersByTime(800));
      }

      expect(result.current.state.isNewBest).toBe(true);
    });
  });
});
