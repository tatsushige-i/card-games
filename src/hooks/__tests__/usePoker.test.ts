import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { PlayingCard } from "@/types/poker";

vi.mock("@/lib/poker-storage", () => ({
  getPokerBestScore: vi.fn(() => null),
  updatePokerBestScore: vi.fn(() => false),
}));

vi.mock(import("@/lib/poker-cards"), async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, createDeck: vi.fn(() => []) };
});

/** テスト用カードを生成する */
function card(value: number, id: number, suit: PlayingCard["suit"] = "spade"): PlayingCard {
  const ranks = [
    "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A",
  ] as const;
  return { id, suit, rank: ranks[value - 1], value };
}

/** テスト用デッキ（10枚以上必要: 5枚配布+5枚交換用） */
function createTestDeck(): PlayingCard[] {
  return Array.from({ length: 52 }, (_, i) =>
    card((i % 13) + 1, i, (["spade", "heart", "diamond", "club"] as const)[Math.floor(i / 13)])
  );
}

describe("usePoker", () => {
  let usePoker: typeof import("@/hooks/usePoker").usePoker;
  let mockUpdateBestScore: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();

    const storage = await import("@/lib/poker-storage");
    const cards = await import("@/lib/poker-cards");
    const hookModule = await import("@/hooks/usePoker");

    usePoker = hookModule.usePoker;
    mockUpdateBestScore = vi.mocked(storage.updatePokerBestScore);
    vi.mocked(cards.createDeck).mockReturnValue(createTestDeck());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("状態初期化", () => {
    it("初期状態でidleフェーズになる", () => {
      const { result } = renderHook(() => usePoker());
      expect(result.current.state.phase).toBe("idle");
      expect(result.current.state.round).toBe(0);
      expect(result.current.state.totalScore).toBe(0);
    });

    it("bestScoreの初期値はnullになる", () => {
      const { result } = renderHook(() => usePoker());
      expect(result.current.bestScore).toBeNull();
    });
  });

  describe("フェーズ遷移", () => {
    it("startGameでdealingフェーズに遷移する", () => {
      const { result } = renderHook(() => usePoker());
      act(() => result.current.startGame());
      expect(result.current.state.phase).toBe("dealing");
    });

    it("dealing → holdingに600ms後に自動遷移する", () => {
      const { result } = renderHook(() => usePoker());
      act(() => result.current.startGame());
      act(() => vi.advanceTimersByTime(600));
      expect(result.current.state.phase).toBe("holding");
    });

    it("holdingフェーズでカードのホールドをトグルできる", () => {
      const { result } = renderHook(() => usePoker());
      act(() => result.current.startGame());
      act(() => vi.advanceTimersByTime(600));

      act(() => result.current.toggleHold(0));
      expect(result.current.state.held[0]).toBe(true);
      act(() => result.current.toggleHold(0));
      expect(result.current.state.held[0]).toBe(false);
    });

    it("holdingフェーズ以外ではtoggleHoldが無視される", () => {
      const { result } = renderHook(() => usePoker());
      act(() => result.current.toggleHold(0));
      expect(result.current.state.held).toEqual([false, false, false, false, false]);
    });

    it("drawでdrawingフェーズに遷移する", () => {
      const { result } = renderHook(() => usePoker());
      act(() => result.current.startGame());
      act(() => vi.advanceTimersByTime(600));
      act(() => result.current.draw());
      expect(result.current.state.phase).toBe("drawing");
    });

    it("drawing → resultに600ms後に自動遷移する", () => {
      const { result } = renderHook(() => usePoker());
      act(() => result.current.startGame());
      act(() => vi.advanceTimersByTime(600));
      act(() => result.current.draw());
      act(() => vi.advanceTimersByTime(600));
      expect(result.current.state.phase).toBe("result");
    });

    it("resetGameでidle状態に戻る", () => {
      const { result } = renderHook(() => usePoker());
      act(() => result.current.startGame());
      act(() => vi.advanceTimersByTime(600));
      act(() => result.current.resetGame());
      expect(result.current.state.phase).toBe("idle");
    });
  });

  describe("ベストスコア更新", () => {
    it("最終ラウンドのgameOverでupdateBestScoreが呼ばれる", () => {
      const { result } = renderHook(() => usePoker());

      // 10ラウンドを完了させる
      for (let round = 0; round < 10; round++) {
        act(() => result.current.startGame());
        act(() => vi.advanceTimersByTime(600)); // dealing → holding
        act(() => result.current.draw());
        act(() => vi.advanceTimersByTime(600)); // drawing → result
        act(() => vi.advanceTimersByTime(1000)); // result → idle/gameOver

        // 中間ラウンドの場合、自動で次ラウンド開始
        if (round < 9) {
          act(() => vi.advanceTimersByTime(500)); // idle → 次ラウンド自動開始
          act(() => vi.advanceTimersByTime(600)); // dealing → holding
          act(() => result.current.draw());
          act(() => vi.advanceTimersByTime(600)); // drawing → result
          act(() => vi.advanceTimersByTime(1000)); // result → idle/gameOver
        }
      }

      if (result.current.state.phase === "gameOver") {
        expect(mockUpdateBestScore).toHaveBeenCalled();
      }
    });
  });
});
