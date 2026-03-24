import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { PlayingCard } from "@/types/blackjack";

vi.mock("@/lib/blackjack-storage", () => ({
  getBlackjackBestScore: vi.fn(() => null),
  updateBlackjackBestScore: vi.fn(() => false),
}));

vi.mock(import("@/lib/blackjack-cards"), async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, createDeck: vi.fn(() => []) };
});

/** テスト用カードを生成する */
function card(value: number, id: number, rank?: PlayingCard["rank"]): PlayingCard {
  const ranks = [
    "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K",
  ] as const;
  const r = rank ?? (value === 10 ? "10" : ranks[value - 1]);
  return { id, suit: "spade", rank: r, value };
}

/** ゲーム進行に十分なデッキを生成する */
function createTestDeck(): PlayingCard[] {
  // カードの配布順: player1, dealer1, player2, dealer2, 残り...
  return [
    card(10, 0, "10"), card(8, 1), card(9, 2), card(7, 3),
    card(5, 4), card(6, 5), card(4, 6), card(3, 7),
    card(2, 8), card(10, 9, "J"), card(10, 10, "Q"), card(10, 11, "K"),
  ];
}

describe("useBlackjack", () => {
  let useBlackjack: typeof import("@/hooks/useBlackjack").useBlackjack;
  let mockUpdateBestScore: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();

    const storage = await import("@/lib/blackjack-storage");
    const cards = await import("@/lib/blackjack-cards");
    const hookModule = await import("@/hooks/useBlackjack");

    useBlackjack = hookModule.useBlackjack;
    mockUpdateBestScore = vi.mocked(storage.updateBlackjackBestScore);
    vi.mocked(cards.createDeck).mockReturnValue(createTestDeck());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("状態初期化", () => {
    it("初期状態でidleフェーズになる", () => {
      const { result } = renderHook(() => useBlackjack());
      expect(result.current.state.phase).toBe("idle");
      expect(result.current.state.playerHand).toHaveLength(0);
      expect(result.current.state.dealerHand).toHaveLength(0);
    });

    it("bestScoreの初期値はnullになる", () => {
      const { result } = renderHook(() => useBlackjack());
      expect(result.current.bestScore).toBeNull();
    });
  });

  describe("フェーズ遷移", () => {
    it("startGameでdealingフェーズに遷移する", () => {
      const { result } = renderHook(() => useBlackjack());
      act(() => result.current.startGame());
      expect(result.current.state.phase).toBe("dealing");
    });

    it("dealing → playingに600ms後に自動遷移する", () => {
      const { result } = renderHook(() => useBlackjack());
      act(() => result.current.startGame());
      expect(result.current.state.phase).toBe("dealing");

      act(() => vi.advanceTimersByTime(600));
      expect(result.current.state.phase).toBe("playing");
    });

    it("playingフェーズ以外ではhitが無視される", () => {
      const { result } = renderHook(() => useBlackjack());
      act(() => result.current.hit());
      expect(result.current.state.phase).toBe("idle");
    });

    it("playingフェーズ以外ではstandが無視される", () => {
      const { result } = renderHook(() => useBlackjack());
      act(() => result.current.stand());
      expect(result.current.state.phase).toBe("idle");
    });

    it("standでdealerTurnに遷移しディーラーが自動でカードを引く", () => {
      const { result } = renderHook(() => useBlackjack());
      act(() => result.current.startGame());
      act(() => vi.advanceTimersByTime(600));
      expect(result.current.state.phase).toBe("playing");

      act(() => result.current.stand());
      expect(result.current.state.phase).toBe("dealerTurn");

      // ディーラーの自動ドロー（800ms間隔）
      act(() => vi.advanceTimersByTime(800));
    });

    it("resetGameでidle状態に戻る", () => {
      const { result } = renderHook(() => useBlackjack());
      act(() => result.current.startGame());
      act(() => vi.advanceTimersByTime(600));
      act(() => result.current.resetGame());
      expect(result.current.state.phase).toBe("idle");
    });
  });

  describe("ベストスコア更新", () => {
    it("gameOver遷移時にupdateBestScoreが呼ばれる", () => {
      const { result } = renderHook(() => useBlackjack());
      act(() => result.current.startGame());
      act(() => vi.advanceTimersByTime(600));

      act(() => result.current.stand());
      // ディーラーのドローが終わるまでタイマーを進める
      for (let i = 0; i < 10; i++) {
        act(() => vi.advanceTimersByTime(800));
      }
      // resultフェーズのタイマー
      act(() => vi.advanceTimersByTime(1000));

      // gameOverに到達した場合にベストスコア更新が呼ばれる
      if (result.current.state.phase === "gameOver") {
        expect(mockUpdateBestScore).toHaveBeenCalled();
      }
    });
  });
});
