import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BlackjackGameOverDialog } from "../blackjack-game-over-dialog";

describe("BlackjackGameOverDialog", () => {
  const defaultProps = {
    open: true,
    result: "win" as const,
    wins: 3,
    maxWins: 5,
    rounds: 10,
    isNewBest: false,
    onNextRound: vi.fn(),
    onReset: vi.fn(),
    onClose: vi.fn(),
  };

  it("勝利時のタイトルを表示する", () => {
    render(<BlackjackGameOverDialog {...defaultProps} />);
    expect(screen.getByText("🎊 勝利！")).toBeInTheDocument();
  });

  it("ブラックジャック時のタイトルを表示する", () => {
    render(<BlackjackGameOverDialog {...defaultProps} result="blackjack" />);
    expect(screen.getByText("🂡 ブラックジャック！")).toBeInTheDocument();
  });

  it("敗北時のタイトルを表示する", () => {
    render(<BlackjackGameOverDialog {...defaultProps} result="lose" />);
    expect(screen.getByText("😢 敗北...")).toBeInTheDocument();
  });

  it("引き分け時のタイトルを表示する", () => {
    render(<BlackjackGameOverDialog {...defaultProps} result="draw" />);
    expect(screen.getByText("🤝 引き分け")).toBeInTheDocument();
  });

  it("新記録時のタイトルを表示する", () => {
    render(<BlackjackGameOverDialog {...defaultProps} isNewBest={true} />);
    expect(screen.getByText("🎉 新記録で勝利！")).toBeInTheDocument();
  });

  it("ブラックジャック＋新記録時のタイトルを表示する", () => {
    render(
      <BlackjackGameOverDialog
        {...defaultProps}
        result="blackjack"
        isNewBest={true}
      />
    );
    expect(
      screen.getByText("🎉 新記録！ブラックジャック！")
    ).toBeInTheDocument();
  });

  it("スタッツを表示する", () => {
    render(<BlackjackGameOverDialog {...defaultProps} />);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("連勝数")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("最大連勝")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("ラウンド")).toBeInTheDocument();
  });

  it("新記録メッセージを表示する", () => {
    render(<BlackjackGameOverDialog {...defaultProps} isNewBest={true} />);
    expect(
      screen.getByText("ベストスコアを更新しました！")
    ).toBeInTheDocument();
  });

  it("新記録でない場合はメッセージを非表示にする", () => {
    render(<BlackjackGameOverDialog {...defaultProps} isNewBest={false} />);
    expect(
      screen.queryByText("ベストスコアを更新しました！")
    ).not.toBeInTheDocument();
  });

  it("勝利時に「次のラウンド」と「最初から」ボタンを表示する", () => {
    render(<BlackjackGameOverDialog {...defaultProps} />);
    expect(screen.getByText("次のラウンド")).toBeInTheDocument();
    expect(screen.getByText("最初から")).toBeInTheDocument();
  });

  it("敗北時は「最初から」ボタンのみ表示する", () => {
    render(<BlackjackGameOverDialog {...defaultProps} result="lose" />);
    expect(screen.queryByText("次のラウンド")).not.toBeInTheDocument();
    expect(screen.getByText("最初から")).toBeInTheDocument();
  });

  it("「次のラウンド」クリックでonNextRoundが呼ばれる", async () => {
    const user = userEvent.setup();
    const onNextRound = vi.fn();
    render(
      <BlackjackGameOverDialog {...defaultProps} onNextRound={onNextRound} />
    );
    await user.click(screen.getByText("次のラウンド"));
    expect(onNextRound).toHaveBeenCalledTimes(1);
  });

  it("「最初から」クリックでonResetが呼ばれる", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    render(<BlackjackGameOverDialog {...defaultProps} onReset={onReset} />);
    await user.click(screen.getByText("最初から"));
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
