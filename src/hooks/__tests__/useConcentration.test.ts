import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { ConcentrationCard } from "@/types/concentration";

vi.mock("@/lib/concentration-storage", () => ({
  getConcentrationBestScore: vi.fn(() => null),
  updateConcentrationBestScore: vi.fn(() => false),
}));

vi.mock(import("@/lib/concentration-cards"), async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, createCards: vi.fn(() => []) };
});

/** テスト用カードペアを生成する */
function createTestCards(pairs: number): ConcentrationCard[] {
  const cards: ConcentrationCard[] = [];
  for (let i = 0; i < pairs; i++) {
    const emoji = String.fromCodePoint(0x1f34e + i);
    cards.push({ id: i * 2, emoji, status: "hidden" });
    cards.push({ id: i * 2 + 1, emoji, status: "hidden" });
  }
  return cards;
}

describe("useConcentration", () => {
  let useConcentration: typeof import("@/hooks/useConcentration").useConcentration;
  let mockUpdateBestScore: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();

    const storage = await import("@/lib/concentration-storage");
    const cards = await import("@/lib/concentration-cards");
    const hookModule = await import("@/hooks/useConcentration");

    useConcentration = hookModule.useConcentration;
    mockUpdateBestScore = vi.mocked(storage.updateConcentrationBestScore);
    vi.mocked(cards.createCards).mockReturnValue(createTestCards(8));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("状態初期化", () => {
    it("初期状態でidleフェーズになる", () => {
      const { result } = renderHook(() => useConcentration());
      expect(result.current.state.phase).toBe("idle");
      expect(result.current.state.moves).toBe(0);
      expect(result.current.state.elapsedTime).toBe(0);
    });

    it("bestScoreの初期値はnullになる", () => {
      const { result } = renderHook(() => useConcentration());
      expect(result.current.bestScore).toBeNull();
    });
  });

  describe("フェーズ遷移", () => {
    it("startGameでplayingフェーズに遷移する", () => {
      const { result } = renderHook(() => useConcentration());
      act(() => result.current.startGame());
      expect(result.current.state.phase).toBe("playing");
      expect(result.current.state.cards).toHaveLength(16);
    });

    it("playing中にタイマーが動作する", () => {
      const { result } = renderHook(() => useConcentration());
      act(() => result.current.startGame());
      act(() => vi.advanceTimersByTime(3000));
      expect(result.current.state.elapsedTime).toBe(3);
    });

    it("2枚めくった後にCHECK_MATCHが800ms後に実行される", () => {
      const { result } = renderHook(() => useConcentration());
      act(() => result.current.startGame());
      act(() => result.current.flipCard(0));
      act(() => result.current.flipCard(2));
      expect(result.current.state.flippedIds).toHaveLength(2);

      act(() => vi.advanceTimersByTime(800));
      expect(result.current.state.flippedIds).toHaveLength(0);
    });

    it("resetGameでidle状態に戻る", () => {
      const { result } = renderHook(() => useConcentration());
      act(() => result.current.startGame());
      act(() => result.current.resetGame());
      expect(result.current.state.phase).toBe("idle");
    });

    it("フリップ済みカードが2枚ある場合、追加のフリップは無視される", () => {
      const { result } = renderHook(() => useConcentration());
      act(() => result.current.startGame());
      act(() => result.current.flipCard(0));
      act(() => result.current.flipCard(2));
      act(() => result.current.flipCard(4));
      expect(result.current.state.flippedIds).toHaveLength(2);
    });
  });

  describe("ベストスコア更新", () => {
    it("全ペアマッチでcompleteになりupdateBestScoreが呼ばれる", async () => {
      const cards = await import("@/lib/concentration-cards");
      // 1ペアだけのテストカードで簡略化
      vi.mocked(cards.createCards).mockReturnValue(createTestCards(1));
      Object.defineProperty(
        await import("@/lib/concentration-cards"),
        "TOTAL_PAIRS",
        { value: 1 }
      );

      // フレッシュなフックが必要
      vi.resetModules();
      const hookModule = await import("@/hooks/useConcentration");
      const freshHook = hookModule.useConcentration;
      const freshStorage = await import("@/lib/concentration-storage");
      mockUpdateBestScore = vi.mocked(freshStorage.updateConcentrationBestScore);
      vi.mocked((await import("@/lib/concentration-cards")).createCards).mockReturnValue(
        createTestCards(1)
      );

      const { result } = renderHook(() => freshHook());
      act(() => result.current.startGame());

      // ペアを揃える（id=0とid=1は同じ絵文字）
      act(() => result.current.flipCard(0));
      act(() => result.current.flipCard(1));
      act(() => vi.advanceTimersByTime(800));

      expect(result.current.state.phase).toBe("complete");
      expect(mockUpdateBestScore).toHaveBeenCalled();
    });
  });
});
