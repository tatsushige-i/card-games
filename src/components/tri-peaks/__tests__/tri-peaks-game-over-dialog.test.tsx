import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TriPeaksGameOverDialog } from "../tri-peaks-game-over-dialog";

describe("TriPeaksGameOverDialog", () => {
  const defaultProps = {
    open: true,
    result: "win" as const,
    score: 45,
    removedCount: 28,
    elapsedTime: 240,
    isNewBest: false,
    onPlayAgain: vi.fn(),
    onClose: vi.fn(),
  };

  it("クリア時のタイトルを表示する", () => {
    render(<TriPeaksGameOverDialog {...defaultProps} />);
    expect(screen.getByText("🎊 クリア！")).toBeInTheDocument();
  });

  it("手詰まり時のタイトルを表示する", () => {
    render(<TriPeaksGameOverDialog {...defaultProps} result="stuck" />);
    expect(screen.getByText("😢 手詰まり...")).toBeInTheDocument();
  });

  it("新記録時のタイトルを表示する", () => {
    render(<TriPeaksGameOverDialog {...defaultProps} isNewBest={true} />);
    expect(screen.getByText("🎉 新記録でクリア！")).toBeInTheDocument();
  });

  it("スタッツを表示する", () => {
    render(<TriPeaksGameOverDialog {...defaultProps} />);
    expect(screen.getByText("45")).toBeInTheDocument();
    expect(screen.getByText("スコア")).toBeInTheDocument();
    expect(screen.getByText("28")).toBeInTheDocument();
    expect(screen.getByText("除去数")).toBeInTheDocument();
    expect(screen.getByText("04:00")).toBeInTheDocument();
    expect(screen.getByText("タイム")).toBeInTheDocument();
  });

  it("新記録メッセージを表示する", () => {
    render(<TriPeaksGameOverDialog {...defaultProps} isNewBest={true} />);
    expect(
      screen.getByText("ベストスコアを更新しました！")
    ).toBeInTheDocument();
  });

  it("新記録でない場合はメッセージを非表示にする", () => {
    render(<TriPeaksGameOverDialog {...defaultProps} />);
    expect(
      screen.queryByText("ベストスコアを更新しました！")
    ).not.toBeInTheDocument();
  });

  it("「もう一度遊ぶ」クリックでonPlayAgainが呼ばれる", async () => {
    const user = userEvent.setup();
    const onPlayAgain = vi.fn();
    render(
      <TriPeaksGameOverDialog {...defaultProps} onPlayAgain={onPlayAgain} />
    );
    await user.click(screen.getByText("もう一度遊ぶ"));
    expect(onPlayAgain).toHaveBeenCalledTimes(1);
  });
});
