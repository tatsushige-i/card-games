import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { GolfBoard } from "../golf-board";
import { useGolf } from "@/hooks/useGolf";

vi.mock("@/hooks/useGolf", () => ({
  useGolf: vi.fn(),
}));

vi.mock("@/lib/golf-cards", () => ({
  getRemainingCards: vi.fn(() => 5),
}));

const mockUseGolf = useGolf as ReturnType<typeof vi.fn>;

/** デフォルトのモック戻り値を生成 */
function createMockReturn(overrides: Record<string, unknown> = {}) {
  return {
    state: {
      phase: "idle",
      columns: [],
      stock: [],
      waste: [],
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

describe("GolfBoard", () => {
  beforeEach(() => {
    mockUseGolf.mockReturnValue(createMockReturn());
  });

  it("idle状態でボードを非表示にする", () => {
    render(<GolfBoard />);
    // idle時はゲームエリアが表示されない
    expect(screen.queryByText("山札")).not.toBeInTheDocument();
  });

  it("playing状態でボードを表示する", () => {
    mockUseGolf.mockReturnValue(
      createMockReturn({ phase: "playing" })
    );
    render(<GolfBoard />);
    // showBoard=trueのときのみ描画される山札・捨て札エリアが存在する
    expect(screen.getByText("山札")).toBeInTheDocument();
    expect(screen.getByText("捨て札")).toBeInTheDocument();
  });

  it("クリア＋勝利時にcelebrateクラスを適用する", () => {
    mockUseGolf.mockReturnValue(
      createMockReturn({ phase: "cleared", result: "win" })
    );
    const { container } = render(<GolfBoard />);
    expect(container.firstElementChild?.className).toContain("celebrate");
  });

  it("クリア＋手詰まり時にcelebrateクラスを適用しない", () => {
    mockUseGolf.mockReturnValue(
      createMockReturn({ phase: "cleared", result: "stuck" })
    );
    const { container } = render(<GolfBoard />);
    expect(container.firstElementChild?.className).not.toContain("celebrate");
  });
});
