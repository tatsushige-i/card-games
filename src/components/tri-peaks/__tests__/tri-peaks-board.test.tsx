import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { TriPeaksBoard } from "../tri-peaks-board";
import { useTriPeaks } from "@/hooks/useTriPeaks";

vi.mock("@/hooks/useTriPeaks", () => ({
  useTriPeaks: vi.fn(),
}));

const mockUseTriPeaks = useTriPeaks as ReturnType<typeof vi.fn>;

/** デフォルトのモック戻り値を生成 */
function createMockReturn(overrides: Record<string, unknown> = {}) {
  return {
    state: {
      phase: "idle",
      tableau: [],
      stock: [],
      waste: [],
      score: 0,
      combo: 0,
      removedCount: 0,
      elapsedTime: 0,
      result: null,
      isNewBest: false,
      dialogOpen: false,
      ...overrides,
    },
    bestScore: null,
    startGame: vi.fn(),
    draw: vi.fn(),
    removeCard: vi.fn(),
    dismissDialog: vi.fn(),
    resetGame: vi.fn(),
  };
}

describe("TriPeaksBoard", () => {
  beforeEach(() => {
    mockUseTriPeaks.mockReturnValue(createMockReturn());
  });

  it("idle状態でボードを非表示にする", () => {
    const { container } = render(<TriPeaksBoard />);
    expect(container.firstElementChild?.className).not.toContain("celebrate");
  });

  it("cleared＋勝利時にcelebrateクラスを適用する", () => {
    mockUseTriPeaks.mockReturnValue(
      createMockReturn({ phase: "cleared", result: "win" })
    );
    const { container } = render(<TriPeaksBoard />);
    expect(container.firstElementChild?.className).toContain("celebrate");
  });

  it("cleared＋手詰まり時にcelebrateクラスを適用しない", () => {
    mockUseTriPeaks.mockReturnValue(
      createMockReturn({ phase: "cleared", result: "stuck" })
    );
    const { container } = render(<TriPeaksBoard />);
    expect(container.firstElementChild?.className).not.toContain("celebrate");
  });

  it("playing時にcelebrateクラスを適用しない", () => {
    mockUseTriPeaks.mockReturnValue(
      createMockReturn({ phase: "playing" })
    );
    const { container } = render(<TriPeaksBoard />);
    expect(container.firstElementChild?.className).not.toContain("celebrate");
  });
});
