import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { TenPlayBoard } from "../ten-play-board";
import { useTenPlay } from "@/hooks/useTenPlay";

vi.mock("@/hooks/useTenPlay", () => ({
  useTenPlay: vi.fn(),
}));

vi.mock("@/lib/ten-play-cards", () => ({
  getTotalRemainingCards: vi.fn(() => 10),
}));

const mockUseTenPlay = useTenPlay as ReturnType<typeof vi.fn>;

/** デフォルトのモック戻り値を生成 */
function createMockReturn(overrides: Record<string, unknown> = {}) {
  return {
    state: {
      phase: "idle",
      tableau: [],
      stock: [],
      selectedIndices: [],
      invalidPair: null,
      removedCount: 0,
      elapsedTime: 0,
      result: null,
      isNewBest: false,
      dialogOpen: false,
      ...overrides,
    },
    bestScore: null,
    startGame: vi.fn(),
    selectCard: vi.fn(),
    dismissDialog: vi.fn(),
    resetGame: vi.fn(),
  };
}

describe("TenPlayBoard", () => {
  beforeEach(() => {
    mockUseTenPlay.mockReturnValue(createMockReturn());
  });

  it("idle状態でボードを非表示にする", () => {
    const { container } = render(<TenPlayBoard />);
    expect(container.firstElementChild?.className).not.toContain("celebrate");
  });

  it("cleared＋勝利時にcelebrateクラスを適用する", () => {
    mockUseTenPlay.mockReturnValue(
      createMockReturn({ phase: "cleared", result: "win" })
    );
    const { container } = render(<TenPlayBoard />);
    expect(container.firstElementChild?.className).toContain("celebrate");
  });

  it("cleared＋手詰まり時にcelebrateクラスを適用しない", () => {
    mockUseTenPlay.mockReturnValue(
      createMockReturn({ phase: "cleared", result: "stuck" })
    );
    const { container } = render(<TenPlayBoard />);
    expect(container.firstElementChild?.className).not.toContain("celebrate");
  });

  it("playing時にcelebrateクラスを適用しない", () => {
    mockUseTenPlay.mockReturnValue(
      createMockReturn({ phase: "playing" })
    );
    const { container } = render(<TenPlayBoard />);
    expect(container.firstElementChild?.className).not.toContain("celebrate");
  });
});
