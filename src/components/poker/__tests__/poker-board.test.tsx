import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PokerBoard } from "../poker-board";
import { usePoker } from "@/hooks/usePoker";

vi.mock("@/hooks/usePoker", () => ({
  usePoker: vi.fn(),
}));

const mockUsePoker = usePoker as ReturnType<typeof vi.fn>;

const testCard = { id: 1, suit: "spade" as const, rank: "A" as const, value: 14 };

/** デフォルトのモック戻り値を生成 */
function createMockReturn(overrides: Record<string, unknown> = {}) {
  return {
    state: {
      phase: "idle",
      hand: [],
      held: [false, false, false, false, false],
      round: 0,
      totalScore: 0,
      roundScore: 0,
      handRank: null,
      isNewBest: false,
      dialogOpen: false,
      ...overrides,
    },
    bestScore: null,
    startGame: vi.fn(),
    toggleHold: vi.fn(),
    draw: vi.fn(),
    nextRound: vi.fn(),
    dismissDialog: vi.fn(),
    resetGame: vi.fn(),
  };
}

describe("PokerBoard", () => {
  beforeEach(() => {
    mockUsePoker.mockReturnValue(createMockReturn());
  });

  it("idle状態(round=0)でカードエリアを非表示にする", () => {
    render(<PokerBoard />);
    expect(screen.queryByText("ドロー")).not.toBeInTheDocument();
  });

  it("holding状態でドローボタンを表示する", () => {
    const hand = Array.from({ length: 5 }, (_, i) => ({ ...testCard, id: i }));
    mockUsePoker.mockReturnValue(
      createMockReturn({ phase: "holding", hand, round: 1 })
    );
    render(<PokerBoard />);
    expect(screen.getByText("ドロー")).toBeInTheDocument();
  });

  it("ドローボタンクリックでdrawが呼ばれる", async () => {
    const user = userEvent.setup();
    const hand = Array.from({ length: 5 }, (_, i) => ({ ...testCard, id: i }));
    const mock = createMockReturn({ phase: "holding", hand, round: 1 });
    mockUsePoker.mockReturnValue(mock);
    render(<PokerBoard />);
    await user.click(screen.getByText("ドロー"));
    expect(mock.draw).toHaveBeenCalledTimes(1);
  });

  it("勝利結果時にcelebrateクラスを適用する", () => {
    const hand = Array.from({ length: 5 }, (_, i) => ({ ...testCard, id: i }));
    mockUsePoker.mockReturnValue(
      createMockReturn({
        phase: "result",
        hand,
        round: 1,
        handRank: "twoPair",
        roundScore: 2,
      })
    );
    const { container } = render(<PokerBoard />);
    expect(container.firstElementChild?.className).toContain("celebrate");
  });

  it("ノーハンド時にcelebrateクラスを適用しない", () => {
    const hand = Array.from({ length: 5 }, (_, i) => ({ ...testCard, id: i }));
    mockUsePoker.mockReturnValue(
      createMockReturn({
        phase: "result",
        hand,
        round: 1,
        handRank: null,
        roundScore: 0,
      })
    );
    const { container } = render(<PokerBoard />);
    expect(container.firstElementChild?.className).not.toContain("celebrate");
  });

  it("dealing中にメッセージを表示する", () => {
    const hand = Array.from({ length: 5 }, (_, i) => ({ ...testCard, id: i }));
    mockUsePoker.mockReturnValue(
      createMockReturn({ phase: "dealing", hand, round: 1 })
    );
    render(<PokerBoard />);
    expect(screen.getByText("カードを配っています...")).toBeInTheDocument();
  });

  it("drawing中にメッセージを表示する", () => {
    const hand = Array.from({ length: 5 }, (_, i) => ({ ...testCard, id: i }));
    mockUsePoker.mockReturnValue(
      createMockReturn({ phase: "drawing", hand, round: 1 })
    );
    render(<PokerBoard />);
    expect(screen.getByText("カードを交換しています...")).toBeInTheDocument();
  });
});
