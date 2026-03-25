import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BlackjackBoard } from "../blackjack-board";
import { useBlackjack } from "@/hooks/useBlackjack";

vi.mock("@/hooks/useBlackjack", () => ({
  useBlackjack: vi.fn(),
}));

const mockUseBlackjack = useBlackjack as ReturnType<typeof vi.fn>;

/** テスト用のカードデータ */
const testCard = { id: 1, suit: "spade" as const, rank: "A" as const, value: 11 };

/** デフォルトのモック戻り値を生成 */
function createMockReturn(overrides: Record<string, unknown> = {}) {
  return {
    state: {
      phase: "idle",
      playerHand: [],
      dealerHand: [],
      dealerRevealed: false,
      result: null,
      wins: 0,
      maxWins: 0,
      rounds: 0,
      dialogOpen: false,
      isNewBest: false,
      ...overrides,
    },
    bestScore: null,
    startGame: vi.fn(),
    hit: vi.fn(),
    stand: vi.fn(),
    nextRound: vi.fn(),
    dismissDialog: vi.fn(),
    resetGame: vi.fn(),
  };
}

describe("BlackjackBoard", () => {
  beforeEach(() => {
    mockUseBlackjack.mockReturnValue(createMockReturn());
  });

  it("idle状態でカードエリアを非表示にする", () => {
    render(<BlackjackBoard />);
    expect(screen.queryByText("ヒット")).not.toBeInTheDocument();
    expect(screen.queryByText("スタンド")).not.toBeInTheDocument();
  });

  it("playing状態でヒット・スタンドボタンを表示する", () => {
    mockUseBlackjack.mockReturnValue(
      createMockReturn({
        phase: "playing",
        playerHand: [testCard],
        dealerHand: [testCard],
      })
    );
    render(<BlackjackBoard />);
    expect(screen.getByText("ヒット")).toBeInTheDocument();
    expect(screen.getByText("スタンド")).toBeInTheDocument();
  });

  it("ヒットボタンクリックでhitが呼ばれる", async () => {
    const user = userEvent.setup();
    const mock = createMockReturn({
      phase: "playing",
      playerHand: [testCard],
      dealerHand: [testCard],
    });
    mockUseBlackjack.mockReturnValue(mock);
    render(<BlackjackBoard />);
    await user.click(screen.getByText("ヒット"));
    expect(mock.hit).toHaveBeenCalledTimes(1);
  });

  it("スタンドボタンクリックでstandが呼ばれる", async () => {
    const user = userEvent.setup();
    const mock = createMockReturn({
      phase: "playing",
      playerHand: [testCard],
      dealerHand: [testCard],
    });
    mockUseBlackjack.mockReturnValue(mock);
    render(<BlackjackBoard />);
    await user.click(screen.getByText("スタンド"));
    expect(mock.stand).toHaveBeenCalledTimes(1);
  });

  it("勝利結果時にcelebrateクラスを適用する", () => {
    mockUseBlackjack.mockReturnValue(
      createMockReturn({
        phase: "result",
        result: "win",
        playerHand: [testCard],
        dealerHand: [testCard],
      })
    );
    const { container } = render(<BlackjackBoard />);
    expect(container.firstElementChild?.className).toContain("celebrate");
  });

  it("敗北結果時にcelebrateクラスを適用しない", () => {
    mockUseBlackjack.mockReturnValue(
      createMockReturn({
        phase: "result",
        result: "lose",
        playerHand: [testCard],
        dealerHand: [testCard],
      })
    );
    const { container } = render(<BlackjackBoard />);
    expect(container.firstElementChild?.className).not.toContain("celebrate");
  });

  it("dealing中にメッセージを表示する", () => {
    mockUseBlackjack.mockReturnValue(
      createMockReturn({
        phase: "dealing",
        playerHand: [testCard],
        dealerHand: [testCard],
      })
    );
    render(<BlackjackBoard />);
    expect(screen.getByText("カードを配っています...")).toBeInTheDocument();
  });

  it("dealerTurn中にメッセージを表示する", () => {
    mockUseBlackjack.mockReturnValue(
      createMockReturn({
        phase: "dealerTurn",
        playerHand: [testCard],
        dealerHand: [testCard],
      })
    );
    render(<BlackjackBoard />);
    expect(screen.getByText("ディーラーのターン...")).toBeInTheDocument();
  });
});
