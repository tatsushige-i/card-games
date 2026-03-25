import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HighAndLowBoard } from "../high-and-low-board";
import { useHighAndLow } from "@/hooks/useHighAndLow";

vi.mock("@/hooks/useHighAndLow", () => ({
  useHighAndLow: vi.fn(),
}));

const mockUseHighAndLow = useHighAndLow as ReturnType<typeof vi.fn>;

const testCard = { id: 1, suit: "spade" as const, rank: "5" as const, value: 5 };

/** デフォルトのモック戻り値を生成 */
function createMockReturn(overrides: Record<string, unknown> = {}) {
  return {
    state: {
      phase: "idle",
      currentCard: testCard,
      nextCard: null,
      playedCards: [],
      score: 3,
      streak: 0,
      maxStreak: 0,
      cardsPlayed: 0,
      lastResult: null,
      isNewBest: false,
      dialogOpen: false,
      ...overrides,
    },
    bestScore: null,
    startGame: vi.fn(),
    guess: vi.fn(),
    dismissDialog: vi.fn(),
  };
}

describe("HighAndLowBoard", () => {
  beforeEach(() => {
    mockUseHighAndLow.mockReturnValue(createMockReturn());
  });

  it("idle状態でカードエリアを非表示にする", () => {
    render(<HighAndLowBoard />);
    expect(screen.queryByText("⬆ HIGH")).not.toBeInTheDocument();
    expect(screen.queryByText("⬇ LOW")).not.toBeInTheDocument();
  });

  it("playing状態でHIGH/LOWボタンを表示する", () => {
    mockUseHighAndLow.mockReturnValue(
      createMockReturn({ phase: "playing" })
    );
    render(<HighAndLowBoard />);
    expect(screen.getByText("⬆ HIGH")).toBeInTheDocument();
    expect(screen.getByText("⬇ LOW")).toBeInTheDocument();
  });

  it("HIGHボタンクリックでguess('high')が呼ばれる", async () => {
    const user = userEvent.setup();
    const mock = createMockReturn({ phase: "playing" });
    mockUseHighAndLow.mockReturnValue(mock);
    render(<HighAndLowBoard />);
    await user.click(screen.getByText("⬆ HIGH"));
    expect(mock.guess).toHaveBeenCalledWith("high");
  });

  it("LOWボタンクリックでguess('low')が呼ばれる", async () => {
    const user = userEvent.setup();
    const mock = createMockReturn({ phase: "playing" });
    mockUseHighAndLow.mockReturnValue(mock);
    render(<HighAndLowBoard />);
    await user.click(screen.getByText("⬇ LOW"));
    expect(mock.guess).toHaveBeenCalledWith("low");
  });

  it("win時にcelebrateクラスを適用する", () => {
    mockUseHighAndLow.mockReturnValue(
      createMockReturn({ phase: "win" })
    );
    const { container } = render(<HighAndLowBoard />);
    expect(container.firstElementChild?.className).toContain("celebrate");
  });

  it("lose時にcelebrateクラスを適用しない", () => {
    mockUseHighAndLow.mockReturnValue(
      createMockReturn({ phase: "lose" })
    );
    const { container } = render(<HighAndLowBoard />);
    expect(container.firstElementChild?.className).not.toContain("celebrate");
  });
});
