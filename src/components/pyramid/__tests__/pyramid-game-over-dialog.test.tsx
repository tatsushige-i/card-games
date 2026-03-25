import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PyramidGameOverDialog } from "../pyramid-game-over-dialog";

describe("PyramidGameOverDialog", () => {
  const defaultProps = {
    open: true,
    result: "win" as const,
    elapsedTime: 180,
    removedCount: 14,
    isNewBest: false,
    onPlayAgain: vi.fn(),
    onClose: vi.fn(),
  };

  it("クリア時のタイトルを表示する", () => {
    render(<PyramidGameOverDialog {...defaultProps} />);
    expect(screen.getByText("🎊 クリア！")).toBeInTheDocument();
  });

  it("手詰まり時のタイトルを表示する", () => {
    render(<PyramidGameOverDialog {...defaultProps} result="stuck" />);
    expect(screen.getByText("😢 手詰まり...")).toBeInTheDocument();
  });

  it("新記録時のタイトルを表示する", () => {
    render(<PyramidGameOverDialog {...defaultProps} isNewBest={true} />);
    expect(screen.getByText("🎉 新記録でクリア！")).toBeInTheDocument();
  });

  it("スタッツを表示する", () => {
    render(<PyramidGameOverDialog {...defaultProps} />);
    expect(screen.getByText("03:00")).toBeInTheDocument();
    expect(screen.getByText("タイム")).toBeInTheDocument();
    expect(screen.getByText("14")).toBeInTheDocument();
    expect(screen.getByText("除去回数")).toBeInTheDocument();
  });

  it("新記録メッセージを表示する", () => {
    render(<PyramidGameOverDialog {...defaultProps} isNewBest={true} />);
    expect(
      screen.getByText("ベストタイムを更新しました！")
    ).toBeInTheDocument();
  });

  it("新記録でない場合はメッセージを非表示にする", () => {
    render(<PyramidGameOverDialog {...defaultProps} />);
    expect(
      screen.queryByText("ベストタイムを更新しました！")
    ).not.toBeInTheDocument();
  });

  it("「もう一度遊ぶ」クリックでonPlayAgainが呼ばれる", async () => {
    const user = userEvent.setup();
    const onPlayAgain = vi.fn();
    render(
      <PyramidGameOverDialog {...defaultProps} onPlayAgain={onPlayAgain} />
    );
    await user.click(screen.getByText("もう一度遊ぶ"));
    expect(onPlayAgain).toHaveBeenCalledTimes(1);
  });
});
