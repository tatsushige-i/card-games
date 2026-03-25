import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { PyramidBoard } from "../pyramid-board";
import { usePyramid } from "@/hooks/usePyramid";

vi.mock("@/hooks/usePyramid", () => ({
  usePyramid: vi.fn(),
}));

const mockUsePyramid = usePyramid as ReturnType<typeof vi.fn>;

/** デフォルトのモック戻り値を生成 */
function createMockReturn(overrides: Record<string, unknown> = {}) {
  return {
    state: {
      phase: "idle",
      pyramid: [],
      stock: [],
      waste: [],
      selectedCardId: null,
      invalidPair: null,
      removedCount: 0,
      elapsedTime: 0,
      stockRecycles: 0,
      result: null,
      isNewBest: false,
      dialogOpen: false,
      ...overrides,
    },
    bestScore: null,
    startGame: vi.fn(),
    selectCard: vi.fn(),
    drawStock: vi.fn(),
    recycleStock: vi.fn(),
    dismissDialog: vi.fn(),
    resetGame: vi.fn(),
  };
}

describe("PyramidBoard", () => {
  beforeEach(() => {
    mockUsePyramid.mockReturnValue(createMockReturn());
  });

  it("idle状態でボードを非表示にする", () => {
    render(<PyramidBoard />);
    // showBoard=falseのとき山札・捨て札エリアは描画されない
    expect(screen.queryByText("山札")).not.toBeInTheDocument();
    expect(screen.queryByText("捨て札")).not.toBeInTheDocument();
  });

  it("complete＋勝利時にcelebrateクラスを適用する", () => {
    mockUsePyramid.mockReturnValue(
      createMockReturn({ phase: "complete", result: "win" })
    );
    const { container } = render(<PyramidBoard />);
    expect(container.firstElementChild?.className).toContain("celebrate");
  });

  it("complete＋手詰まり時にcelebrateクラスを適用しない", () => {
    mockUsePyramid.mockReturnValue(
      createMockReturn({ phase: "complete", result: "stuck" })
    );
    const { container } = render(<PyramidBoard />);
    expect(container.firstElementChild?.className).not.toContain("celebrate");
  });

  it("playing時にcelebrateクラスを適用しない", () => {
    mockUsePyramid.mockReturnValue(
      createMockReturn({ phase: "playing" })
    );
    const { container } = render(<PyramidBoard />);
    expect(container.firstElementChild?.className).not.toContain("celebrate");
  });
});
