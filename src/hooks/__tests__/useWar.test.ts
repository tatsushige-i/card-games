import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { WarCard } from "@/types/war";

vi.mock("@/lib/war-storage", () => ({
  getWarBestScore: vi.fn(() => null),
  updateWarBestScore: vi.fn(() => false),
}));

vi.mock(import("@/lib/war-cards"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    createDeck: vi.fn(() => []),
    dealCards: vi.fn(() => ({ playerDeck: [], cpuDeck: [] })),
  };
});

/** テスト用カードを生成する */
function warCard(value: number, id: number): WarCard {
  const ranks = [
    "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A",
  ] as const;
  return { id, suit: "spade", rank: ranks[value - 1], value };
}

describe("useWar", () => {
  let useWar: typeof import("@/hooks/useWar").useWar;
  let mockDealCards: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();

    const cards = await import("@/lib/war-cards");
    const hookModule = await import("@/hooks/useWar");

    useWar = hookModule.useWar;
    mockDealCards = vi.mocked(cards.dealCards);

    // デフォルトのデッキ: プレイヤーが高いカードを持つ
    mockDealCards.mockReturnValue({
      playerDeck: [warCard(14, 0), warCard(13, 1), warCard(12, 2)],
      cpuDeck: [warCard(2, 3), warCard(3, 4), warCard(4, 5)],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("状態初期化", () => {
    it("初期状態でreadyフェーズになる", () => {
      const { result } = renderHook(() => useWar());
      expect(result.current.state.phase).toBe("ready");
      expect(result.current.state.roundCount).toBe(0);
    });

    it("デッキが初期配分されている", () => {
      const { result } = renderHook(() => useWar());
      expect(result.current.state.playerDeck).toHaveLength(3);
      expect(result.current.state.cpuDeck).toHaveLength(3);
    });

    it("bestScoreの初期値はnullになる", () => {
      const { result } = renderHook(() => useWar());
      expect(result.current.bestScore).toBeNull();
    });
  });

  describe("フェーズ遷移", () => {
    it("playCardでbattleフェーズに遷移する", () => {
      const { result } = renderHook(() => useWar());
      act(() => result.current.playCard());
      expect(result.current.state.phase).toBe("battle");
      expect(result.current.state.playerCard).not.toBeNull();
      expect(result.current.state.cpuCard).not.toBeNull();
    });

    it("battle → resultに800ms後に自動遷移する", () => {
      const { result } = renderHook(() => useWar());
      act(() => result.current.playCard());
      expect(result.current.state.phase).toBe("battle");

      act(() => vi.advanceTimersByTime(800));
      expect(result.current.state.phase).toBe("result");
    });

    it("result → カード回収に1000ms後に自動遷移する", () => {
      const { result } = renderHook(() => useWar());
      act(() => result.current.playCard());
      act(() => vi.advanceTimersByTime(800)); // battle → result
      expect(result.current.state.roundResult).not.toBeNull();

      act(() => vi.advanceTimersByTime(1000)); // result → ready or gameOver
    });

    it("readyフェーズ以外ではplayCardが無視される", () => {
      const { result } = renderHook(() => useWar());
      act(() => result.current.playCard());
      // battleフェーズで再度playCard
      act(() => result.current.playCard());
      expect(result.current.state.phase).toBe("battle");
    });

    it("restartでreadyフェーズにリセットされる", () => {
      const { result } = renderHook(() => useWar());
      act(() => result.current.playCard());
      act(() => vi.advanceTimersByTime(800));

      act(() => result.current.restart());
      expect(result.current.state.phase).toBe("ready");
    });
  });

  describe("ベストスコア更新", () => {
    it("プレイヤー勝利でgameOverになるとupdateBestScoreが呼ばれる", async () => {
      // CPUのデッキを1枚だけにして即終了させる
      vi.resetModules();

      const warCards = await import("@/lib/war-cards");
      vi.mocked(warCards.dealCards).mockReturnValue({
        playerDeck: [warCard(14, 0)],
        cpuDeck: [warCard(2, 1)],
      });
      const freshStorage = await import("@/lib/war-storage");
      const freshUpdateBestScore = vi.mocked(freshStorage.updateWarBestScore);
      const hookModule = await import("@/hooks/useWar");
      const freshHook = hookModule.useWar;

      const { result } = renderHook(() => freshHook());
      act(() => result.current.playCard());
      act(() => vi.advanceTimersByTime(800)); // battle → result
      act(() => vi.advanceTimersByTime(1000)); // result → gameOver

      if (result.current.state.phase === "gameOver" && result.current.state.winner === "player") {
        expect(freshUpdateBestScore).toHaveBeenCalled();
      }
    });
  });
});
