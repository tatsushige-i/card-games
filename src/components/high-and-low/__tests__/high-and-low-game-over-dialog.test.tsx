import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HighAndLowGameOverDialog } from "../high-and-low-game-over-dialog";

describe("HighAndLowGameOverDialog", () => {
  const defaultProps = {
    open: true,
    phase: "win" as const,
    score: 10,
    maxStreak: 5,
    cardsPlayed: 15,
    isNewBest: false,
    onPlayAgain: vi.fn(),
    onClose: vi.fn(),
  };

  it("勝利時のタイトルを表示する", () => {
    render(<HighAndLowGameOverDialog {...defaultProps} />);
    expect(screen.getByText("🎊 勝利！")).toBeInTheDocument();
  });

  it("ゲームオーバー時のタイトルを表示する", () => {
    render(<HighAndLowGameOverDialog {...defaultProps} phase="lose" />);
    expect(screen.getByText("😢 ゲームオーバー")).toBeInTheDocument();
  });

  it("新記録時のタイトルを表示する", () => {
    render(
      <HighAndLowGameOverDialog {...defaultProps} isNewBest={true} />
    );
    expect(screen.getByText("🎉 新記録で勝利！")).toBeInTheDocument();
  });

  it("スタッツを表示する", () => {
    render(<HighAndLowGameOverDialog {...defaultProps} />);
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("最終スコア")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("最大連勝")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("プレイ枚数")).toBeInTheDocument();
  });

  it("新記録メッセージを表示する", () => {
    render(
      <HighAndLowGameOverDialog {...defaultProps} isNewBest={true} />
    );
    expect(
      screen.getByText("ベストスコアを更新しました！")
    ).toBeInTheDocument();
  });

  it("新記録でない場合はメッセージを非表示にする", () => {
    render(<HighAndLowGameOverDialog {...defaultProps} />);
    expect(
      screen.queryByText("ベストスコアを更新しました！")
    ).not.toBeInTheDocument();
  });

  it("「もう一度遊ぶ」クリックでonPlayAgainが呼ばれる", async () => {
    const user = userEvent.setup();
    const onPlayAgain = vi.fn();
    render(
      <HighAndLowGameOverDialog
        {...defaultProps}
        onPlayAgain={onPlayAgain}
      />
    );
    await user.click(screen.getByText("もう一度遊ぶ"));
    expect(onPlayAgain).toHaveBeenCalledTimes(1);
  });
});
