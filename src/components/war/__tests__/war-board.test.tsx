import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WarBoard } from "../war-board";
import { useWar } from "@/hooks/useWar";

vi.mock("@/hooks/useWar", () => ({
  useWar: vi.fn(),
}));

const mockUseWar = useWar as ReturnType<typeof vi.fn>;

/** デフォルトのモック戻り値を生成 */
function createMockReturn(overrides: Record<string, unknown> = {}) {
  return {
    state: {
      phase: "ready",
      playerDeck: Array.from({ length: 26 }, (_, i) => ({ id: i })),
      cpuDeck: Array.from({ length: 26 }, (_, i) => ({ id: i + 26 })),
      playerCard: null,
      cpuCard: null,
      warPile: [],
      roundResult: null,
      winner: null,
      roundCount: 0,
      isNewBest: false,
      dialogOpen: false,
      ...overrides,
    },
    bestScore: null,
    playCard: vi.fn(),
    dismissDialog: vi.fn(),
    restart: vi.fn(),
  };
}

describe("WarBoard", () => {
  beforeEach(() => {
    mockUseWar.mockReturnValue(createMockReturn());
  });

  it("ready状態で「カードを出す」ボタンを表示する", () => {
    render(<WarBoard />);
    expect(screen.getByText("カードを出す")).toBeInTheDocument();
  });

  it("「カードを出す」クリックでplayCardが呼ばれる", async () => {
    const user = userEvent.setup();
    const mock = createMockReturn();
    mockUseWar.mockReturnValue(mock);
    render(<WarBoard />);
    await user.click(screen.getByText("カードを出す"));
    expect(mock.playCard).toHaveBeenCalledTimes(1);
  });

  it("battle中にメッセージを表示する", () => {
    mockUseWar.mockReturnValue(
      createMockReturn({ phase: "battle" })
    );
    render(<WarBoard />);
    expect(screen.getByText("勝負判定中...")).toBeInTheDocument();
  });

  it("war中にメッセージを表示する", () => {
    mockUseWar.mockReturnValue(
      createMockReturn({ phase: "war" })
    );
    render(<WarBoard />);
    expect(
      screen.getByText("戦争カードを出しています...")
    ).toBeInTheDocument();
  });

  it("プレイヤー勝利のresult時にcelebrateクラスを適用する", () => {
    mockUseWar.mockReturnValue(
      createMockReturn({ phase: "result", roundResult: "player" })
    );
    const { container } = render(<WarBoard />);
    expect(container.firstElementChild?.className).toContain("celebrate");
  });

  it("CPU勝利のresult時にcelebrateクラスを適用しない", () => {
    mockUseWar.mockReturnValue(
      createMockReturn({ phase: "result", roundResult: "cpu" })
    );
    const { container } = render(<WarBoard />);
    expect(container.firstElementChild?.className).not.toContain("celebrate");
  });
});
