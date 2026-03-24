import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { PlayingCard } from "@/types/pyramid";

vi.mock("@/lib/pyramid-storage", () => ({
  getPyramidBestScore: vi.fn(() => null),
  updatePyramidBestScore: vi.fn(() => false),
}));

vi.mock(import("@/lib/pyramid-cards"), async (importOriginal) => {
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

describe("usePyramid", () => {
  let usePyramid: typeof import("@/hooks/usePyramid").usePyramid;
  beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();

    const cards = await import("@/lib/pyramid-cards");
    const hookModule = await import("@/hooks/usePyramid");

    usePyramid = hookModule.usePyramid;
    vi.mocked(cards.createDeck).mockReturnValue(createTestDeck());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("状態初期化", () => {
    it("初期状態でidleフェーズになる", () => {
      const { result } = renderHook(() => usePyramid());
      expect(result.current.state.phase).toBe("idle");
      expect(result.current.state.elapsedTime).toBe(0);
      expect(result.current.state.removedCount).toBe(0);
    });

    it("bestScoreの初期値はnullになる", () => {
      const { result } = renderHook(() => usePyramid());
      expect(result.current.bestScore).toBeNull();
    });
  });

  describe("フェーズ遷移", () => {
    it("startGameでplayingフェーズに遷移する", () => {
      const { result } = renderHook(() => usePyramid());
      act(() => result.current.startGame());
      expect(result.current.state.phase).toBe("playing");
    });

    it("playing中にタイマーが動作する", () => {
      const { result } = renderHook(() => usePyramid());
      act(() => result.current.startGame());
      act(() => vi.advanceTimersByTime(3000));
      expect(result.current.state.elapsedTime).toBe(3);
    });

    it("playingフェーズ以外ではselectCardが無視される", () => {
      const { result } = renderHook(() => usePyramid());
      act(() => result.current.selectCard(0, "pyramid"));
      expect(result.current.state.phase).toBe("idle");
    });

    it("resetGameでidle状態に戻る", () => {
      const { result } = renderHook(() => usePyramid());
      act(() => result.current.startGame());
      act(() => result.current.resetGame());
      expect(result.current.state.phase).toBe("idle");
    });

    it("idle状態に戻るとタイマーが停止する", () => {
      const { result } = renderHook(() => usePyramid());
      act(() => result.current.startGame());
      act(() => vi.advanceTimersByTime(2000));
      expect(result.current.state.elapsedTime).toBe(2);

      act(() => result.current.resetGame());
      act(() => vi.advanceTimersByTime(2000));
      expect(result.current.state.elapsedTime).toBe(0);
    });
  });
});
