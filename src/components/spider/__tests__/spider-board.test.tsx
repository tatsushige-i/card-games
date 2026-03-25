import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { SpiderBoard } from "../spider-board";
import { useSpider } from "@/hooks/useSpider";

vi.mock("@/hooks/useSpider", () => ({
  useSpider: vi.fn(),
}));

vi.mock("@/lib/spider-cards", () => ({
  canDealRow: vi.fn(() => false),
  TARGET_SETS: 8,
  COLUMN_COUNT: 10,
}));

const mockUseSpider = useSpider as ReturnType<typeof vi.fn>;

/** デフォルトのモック戻り値を生成 */
function createMockReturn(overrides: Record<string, unknown> = {}) {
  return {
    state: {
      phase: "idle",
      columns: Array.from({ length: 10 }, () => []),
      stock: [],
      selectedColumn: null,
      selectedCardIndex: null,
      completedSets: 0,
      moves: 0,
      elapsedTime: 0,
      result: null,
      isNewBestMoves: false,
      isNewBestTime: false,
      dialogOpen: false,
      ...overrides,
    },
    bestScore: null,
    startGame: vi.fn(),
    handleCardClick: vi.fn(),
    handleEmptyColumnClick: vi.fn(),
    dealRow: vi.fn(),
    giveUp: vi.fn(),
    dismissDialog: vi.fn(),
    resetGame: vi.fn(),
  };
}

describe("SpiderBoard", () => {
  beforeEach(() => {
    mockUseSpider.mockReturnValue(createMockReturn());
  });

  it("idle状態でボードを非表示にする", () => {
    render(<SpiderBoard />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("空列あり＋山札ありでヒントメッセージを表示する", () => {
    mockUseSpider.mockReturnValue(
      createMockReturn({
        phase: "playing",
        stock: [{ id: 1 }],
      })
    );
    render(<SpiderBoard />);
    expect(
      screen.getByText("すべての列にカードを置くと山札から配れます")
    ).toBeInTheDocument();
  });

  it("カード選択中にヒントメッセージを表示する", () => {
    mockUseSpider.mockReturnValue(
      createMockReturn({ phase: "playing", selectedColumn: 0 })
    );
    render(<SpiderBoard />);
    expect(
      screen.getByText("移動先の列をクリックしてください（同じカードで選択解除）")
    ).toBeInTheDocument();
  });

  it("cleared＋勝利時にcelebrateクラスを適用する", () => {
    mockUseSpider.mockReturnValue(
      createMockReturn({ phase: "cleared", result: "win" })
    );
    const { container } = render(<SpiderBoard />);
    expect(container.firstElementChild?.className).toContain("celebrate");
  });

  it("cleared＋ギブアップ時にcelebrateクラスを適用しない", () => {
    mockUseSpider.mockReturnValue(
      createMockReturn({ phase: "cleared", result: "giveUp" })
    );
    const { container } = render(<SpiderBoard />);
    expect(container.firstElementChild?.className).not.toContain("celebrate");
  });
});
