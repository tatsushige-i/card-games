import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TenPlayGameOverDialog } from "../ten-play-game-over-dialog";

describe("TenPlayGameOverDialog", () => {
  const defaultProps = {
    open: true,
    result: "win" as const,
    remainingCards: 0,
    removedCount: 20,
    elapsedTime: 300,
    isNewBest: false,
    onPlayAgain: vi.fn(),
    onClose: vi.fn(),
  };

  it("クリア時のタイトルを表示する", () => {
    render(<TenPlayGameOverDialog {...defaultProps} />);
    expect(screen.getByText("🎊 クリア！")).toBeInTheDocument();
  });

  it("手詰まり時のタイトルを表示する", () => {
    render(<TenPlayGameOverDialog {...defaultProps} result="stuck" />);
    expect(screen.getByText("😢 手詰まり...")).toBeInTheDocument();
  });

  it("新記録時のタイトルを表示する", () => {
    render(<TenPlayGameOverDialog {...defaultProps} isNewBest={true} />);
    expect(screen.getByText("🎉 新記録でクリア！")).toBeInTheDocument();
  });

  it("スタッツを表示する", () => {
    render(<TenPlayGameOverDialog {...defaultProps} />);
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("残りカード")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("除去回数")).toBeInTheDocument();
    expect(screen.getByText("05:00")).toBeInTheDocument();
    expect(screen.getByText("タイム")).toBeInTheDocument();
  });

  it("新記録メッセージを表示する", () => {
    render(<TenPlayGameOverDialog {...defaultProps} isNewBest={true} />);
    expect(
      screen.getByText("ベストスコアを更新しました！")
    ).toBeInTheDocument();
  });

  it("新記録でない場合はメッセージを非表示にする", () => {
    render(<TenPlayGameOverDialog {...defaultProps} />);
    expect(
      screen.queryByText("ベストスコアを更新しました！")
    ).not.toBeInTheDocument();
  });

  it("「もう一度遊ぶ」クリックでonPlayAgainが呼ばれる", async () => {
    const user = userEvent.setup();
    const onPlayAgain = vi.fn();
    render(
      <TenPlayGameOverDialog {...defaultProps} onPlayAgain={onPlayAgain} />
    );
    await user.click(screen.getByText("もう一度遊ぶ"));
    expect(onPlayAgain).toHaveBeenCalledTimes(1);
  });
});
