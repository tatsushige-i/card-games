import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { PlayingCard } from "@/types/tri-peaks";

vi.mock("@/lib/tri-peaks-storage", () => ({
  getTriPeaksBestScore: vi.fn(() => null),
  updateTriPeaksBestScore: vi.fn(() => false),
}));

vi.mock(import("@/lib/tri-peaks-cards"), async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, createDeck: vi.fn(() => []) };
});

/** テスト用カードを生成する */
function card(value: number, id: number): PlayingCard {
  const ranks = [
    "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K",
  ] as const;
  return { id, suit: "spade", rank: ranks[value - 1], value };
}

/** テスト用デッキを生成する（52枚） */
function createTestDeck(): PlayingCard[] {
  return Array.from({ length: 52 }, (_, i) => card((i % 13) + 1, i));
}

describe("useTriPeaks", () => {
  let useTriPeaks: typeof import("@/hooks/useTriPeaks").useTriPeaks;
  beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();

    const cards = await import("@/lib/tri-peaks-cards");
    const hookModule = await import("@/hooks/useTriPeaks");

    useTriPeaks = hookModule.useTriPeaks;
    vi.mocked(cards.createDeck).mockReturnValue(createTestDeck());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("状態初期化", () => {
    it("初期状態でidleフェーズになる", () => {
      const { result } = renderHook(() => useTriPeaks());
      expect(result.current.state.phase).toBe("idle");
      expect(result.current.state.score).toBe(0);
      expect(result.current.state.combo).toBe(0);
      expect(result.current.state.elapsedTime).toBe(0);
    });

    it("bestScoreの初期値はnullになる", () => {
      const { result } = renderHook(() => useTriPeaks());
      expect(result.current.bestScore).toBeNull();
    });
  });

  describe("フェーズ遷移", () => {
    it("startGameでplayingフェーズに遷移する", () => {
      const { result } = renderHook(() => useTriPeaks());
      act(() => result.current.startGame());
      expect(result.current.state.phase).toBe("playing");
    });

    it("playing中にタイマーが動作する", () => {
      const { result } = renderHook(() => useTriPeaks());
      act(() => result.current.startGame());
      act(() => vi.advanceTimersByTime(3000));
      expect(result.current.state.elapsedTime).toBe(3);
    });

    it("playingフェーズ以外ではdrawが無視される", () => {
      const { result } = renderHook(() => useTriPeaks());
      act(() => result.current.draw());
      expect(result.current.state.phase).toBe("idle");
    });

    it("playingフェーズ以外ではremoveCardが無視される", () => {
      const { result } = renderHook(() => useTriPeaks());
      act(() => result.current.removeCard(0, 0));
      expect(result.current.state.phase).toBe("idle");
    });

    it("resetGameでidle状態に戻る", () => {
      const { result } = renderHook(() => useTriPeaks());
      act(() => result.current.startGame());
      act(() => result.current.resetGame());
      expect(result.current.state.phase).toBe("idle");
    });

    it("idle状態に戻るとタイマーが停止する", () => {
      const { result } = renderHook(() => useTriPeaks());
      act(() => result.current.startGame());
      act(() => vi.advanceTimersByTime(2000));
      expect(result.current.state.elapsedTime).toBe(2);

      act(() => result.current.resetGame());
      act(() => vi.advanceTimersByTime(2000));
      expect(result.current.state.elapsedTime).toBe(0);
    });
  });
});
