import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { SpiderCard } from "@/types/spider";

vi.mock("@/lib/spider-storage", () => ({
  getSpiderBestScore: vi.fn(() => null),
  updateSpiderBestScore: vi.fn(() => ({ movesUpdated: false, timeUpdated: false })),
}));

vi.mock(import("@/lib/spider-cards"), async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, createDeck: vi.fn(() => []) };
});

/** テスト用スパイダーカードを生成する */
function spiderCard(value: number, id: number, faceUp = true): SpiderCard {
  const ranks = [
    "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K",
  ] as const;
  return { id, suit: "spade", rank: ranks[value - 1], value, faceUp };
}

/** テスト用デッキ（104枚: 2デッキ分） */
function createTestDeck(): SpiderCard[] {
  return Array.from({ length: 104 }, (_, i) =>
    spiderCard((i % 13) + 1, i, false)
  );
}

describe("useSpider", () => {
  let useSpider: typeof import("@/hooks/useSpider").useSpider;
  beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();

    const cards = await import("@/lib/spider-cards");
    const hookModule = await import("@/hooks/useSpider");

    useSpider = hookModule.useSpider;
    vi.mocked(cards.createDeck).mockReturnValue(createTestDeck());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("状態初期化", () => {
    it("初期状態でidleフェーズになる", () => {
      const { result } = renderHook(() => useSpider());
      expect(result.current.state.phase).toBe("idle");
      expect(result.current.state.moves).toBe(0);
      expect(result.current.state.elapsedTime).toBe(0);
      expect(result.current.state.completedSets).toBe(0);
    });

    it("bestScoreの初期値はnullになる", () => {
      const { result } = renderHook(() => useSpider());
      expect(result.current.bestScore).toBeNull();
    });
  });

  describe("フェーズ遷移", () => {
    it("startGameでplayingフェーズに遷移する", () => {
      const { result } = renderHook(() => useSpider());
      act(() => result.current.startGame());
      expect(result.current.state.phase).toBe("playing");
    });

    it("playing中にタイマーが動作する", () => {
      const { result } = renderHook(() => useSpider());
      act(() => result.current.startGame());
      act(() => vi.advanceTimersByTime(3000));
      expect(result.current.state.elapsedTime).toBe(3);
    });

    it("playingフェーズ以外ではhandleCardClickが無視される", () => {
      const { result } = renderHook(() => useSpider());
      act(() => result.current.handleCardClick(0, 0));
      expect(result.current.state.phase).toBe("idle");
    });

    it("playingフェーズ以外ではdealRowが無視される", () => {
      const { result } = renderHook(() => useSpider());
      act(() => result.current.dealRow());
      expect(result.current.state.phase).toBe("idle");
    });

    it("playingフェーズ以外ではgiveUpが無視される", () => {
      const { result } = renderHook(() => useSpider());
      act(() => result.current.giveUp());
      expect(result.current.state.phase).toBe("idle");
    });

    it("resetGameでidle状態に戻る", () => {
      const { result } = renderHook(() => useSpider());
      act(() => result.current.startGame());
      act(() => result.current.resetGame());
      expect(result.current.state.phase).toBe("idle");
    });

    it("idle状態に戻るとタイマーが停止する", () => {
      const { result } = renderHook(() => useSpider());
      act(() => result.current.startGame());
      act(() => vi.advanceTimersByTime(2000));
      expect(result.current.state.elapsedTime).toBe(2);

      act(() => result.current.resetGame());
      act(() => vi.advanceTimersByTime(2000));
      expect(result.current.state.elapsedTime).toBe(0);
    });
  });
});
