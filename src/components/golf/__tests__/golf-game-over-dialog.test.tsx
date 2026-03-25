import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GolfGameOverDialog } from "../golf-game-over-dialog";

describe("GolfGameOverDialog", () => {
  const defaultProps = {
    open: true,
    result: "win" as const,
    remainingCards: 0,
    removedCount: 35,
    elapsedTime: 120,
    isNewBest: false,
    onPlayAgain: vi.fn(),
    onClose: vi.fn(),
  };

  it("クリア時のタイトルを表示する", () => {
    render(<GolfGameOverDialog {...defaultProps} />);
    expect(screen.getByText("🎊 クリア！")).toBeInTheDocument();
  });

  it("手詰まり時のタイトルを表示する", () => {
    render(<GolfGameOverDialog {...defaultProps} result="stuck" />);
    expect(screen.getByText("😢 手詰まり...")).toBeInTheDocument();
  });

  it("新記録時のタイトルを表示する", () => {
    render(<GolfGameOverDialog {...defaultProps} isNewBest={true} />);
    expect(screen.getByText("🎉 新記録でクリア！")).toBeInTheDocument();
  });

  it("スタッツを表示する", () => {
    render(<GolfGameOverDialog {...defaultProps} />);
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("残りカード")).toBeInTheDocument();
    expect(screen.getByText("35")).toBeInTheDocument();
    expect(screen.getByText("除去数")).toBeInTheDocument();
    expect(screen.getByText("02:00")).toBeInTheDocument();
    expect(screen.getByText("タイム")).toBeInTheDocument();
  });

  it("新記録メッセージを表示する", () => {
    render(<GolfGameOverDialog {...defaultProps} isNewBest={true} />);
    expect(
      screen.getByText("ベストスコアを更新しました！")
    ).toBeInTheDocument();
  });

  it("新記録でない場合はメッセージを非表示にする", () => {
    render(<GolfGameOverDialog {...defaultProps} />);
    expect(
      screen.queryByText("ベストスコアを更新しました！")
    ).not.toBeInTheDocument();
  });

  it("「もう一度遊ぶ」クリックでonPlayAgainが呼ばれる", async () => {
    const user = userEvent.setup();
    const onPlayAgain = vi.fn();
    render(
      <GolfGameOverDialog {...defaultProps} onPlayAgain={onPlayAgain} />
    );
    await user.click(screen.getByText("もう一度遊ぶ"));
    expect(onPlayAgain).toHaveBeenCalledTimes(1);
  });
});
