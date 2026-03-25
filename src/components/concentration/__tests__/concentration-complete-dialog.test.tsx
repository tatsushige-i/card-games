import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConcentrationCompleteDialog } from "../concentration-complete-dialog";

describe("ConcentrationCompleteDialog", () => {
  const defaultProps = {
    open: true,
    moves: 24,
    elapsedTime: 90,
    isNewBest: false,
    onPlayAgain: vi.fn(),
    onClose: vi.fn(),
  };

  it("クリア時のタイトルを表示する", () => {
    render(<ConcentrationCompleteDialog {...defaultProps} />);
    expect(screen.getByText("🎊 クリア！")).toBeInTheDocument();
  });

  it("新記録時のタイトルを表示する", () => {
    render(
      <ConcentrationCompleteDialog {...defaultProps} isNewBest={true} />
    );
    expect(screen.getByText("🎉 新記録！")).toBeInTheDocument();
  });

  it("スタッツを表示する", () => {
    render(<ConcentrationCompleteDialog {...defaultProps} />);
    expect(screen.getByText("24")).toBeInTheDocument();
    expect(screen.getByText("試行回数")).toBeInTheDocument();
    expect(screen.getByText("01:30")).toBeInTheDocument();
    expect(screen.getByText("クリアタイム")).toBeInTheDocument();
  });

  it("新記録メッセージを表示する", () => {
    render(
      <ConcentrationCompleteDialog {...defaultProps} isNewBest={true} />
    );
    expect(
      screen.getByText("ベストスコアを更新しました！")
    ).toBeInTheDocument();
  });

  it("新記録でない場合はメッセージを非表示にする", () => {
    render(<ConcentrationCompleteDialog {...defaultProps} />);
    expect(
      screen.queryByText("ベストスコアを更新しました！")
    ).not.toBeInTheDocument();
  });

  it("「もう一度遊ぶ」クリックでonPlayAgainが呼ばれる", async () => {
    const user = userEvent.setup();
    const onPlayAgain = vi.fn();
    render(
      <ConcentrationCompleteDialog
        {...defaultProps}
        onPlayAgain={onPlayAgain}
      />
    );
    await user.click(screen.getByText("もう一度遊ぶ"));
    expect(onPlayAgain).toHaveBeenCalledTimes(1);
  });
});
