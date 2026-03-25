import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConcentrationBoard } from "../concentration-board";
import { useConcentration } from "@/hooks/useConcentration";

vi.mock("@/hooks/useConcentration", () => ({
  useConcentration: vi.fn(),
}));

const mockUseConcentration = useConcentration as ReturnType<typeof vi.fn>;

/** デフォルトのモック戻り値を生成 */
function createMockReturn(overrides: Record<string, unknown> = {}) {
  return {
    state: {
      phase: "idle",
      cards: [],
      flippedIds: [],
      moves: 0,
      matchedPairs: 0,
      totalPairs: 8,
      elapsedTime: 0,
      isNewBest: false,
      dialogOpen: false,
      ...overrides,
    },
    bestScore: null,
    startGame: vi.fn(),
    flipCard: vi.fn(),
    dismissDialog: vi.fn(),
  };
}

describe("ConcentrationBoard", () => {
  beforeEach(() => {
    mockUseConcentration.mockReturnValue(createMockReturn());
  });

  it("idle状態でカードグリッドを非表示にする", () => {
    render(<ConcentrationBoard />);
    // idle時はConcentrationCardGridがレンダリングされない
    expect(
      screen.queryByLabelText("裏向きのカード")
    ).not.toBeInTheDocument();
  });

  it("playing状態でカードグリッドを表示する", () => {
    const testCards = Array.from({ length: 16 }, (_, i) => ({
      id: i,
      emoji: "🃏",
      status: "hidden" as const,
    }));
    mockUseConcentration.mockReturnValue(
      createMockReturn({ phase: "playing", cards: testCards })
    );
    render(<ConcentrationBoard />);
    // カードグリッドがレンダリングされ、裏向きのカードが存在する
    const cards = screen.getAllByLabelText("裏向きのカード");
    expect(cards).toHaveLength(16);
  });

  it("complete時にcelebrateクラスを適用する", () => {
    mockUseConcentration.mockReturnValue(
      createMockReturn({ phase: "complete" })
    );
    const { container } = render(<ConcentrationBoard />);
    expect(container.firstElementChild?.className).toContain("celebrate");
  });

  it("playing時にcelebrateクラスを適用しない", () => {
    mockUseConcentration.mockReturnValue(
      createMockReturn({ phase: "playing" })
    );
    const { container } = render(<ConcentrationBoard />);
    expect(container.firstElementChild?.className).not.toContain("celebrate");
  });
});
