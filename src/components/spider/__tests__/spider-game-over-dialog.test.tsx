import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SpiderGameOverDialog } from "../spider-game-over-dialog";
import { TARGET_SETS } from "@/lib/spider-cards";

describe("SpiderGameOverDialog", () => {
  const defaultProps = {
    open: true,
    result: "win" as const,
    completedSets: TARGET_SETS,
    moves: 150,
    elapsedTime: 600,
    isNewBestMoves: false,
    isNewBestTime: false,
    onPlayAgain: vi.fn(),
    onClose: vi.fn(),
  };

  it("クリア時のタイトルを表示する", () => {
    render(<SpiderGameOverDialog {...defaultProps} />);
    expect(screen.getByText("🎊 クリア！")).toBeInTheDocument();
  });

  it("ギブアップ時のタイトルを表示する", () => {
    render(
      <SpiderGameOverDialog {...defaultProps} result="giveUp" completedSets={3} />
    );
    expect(screen.getByText("😢 ギブアップ")).toBeInTheDocument();
  });

  it("新記録時のタイトルを表示する", () => {
    render(
      <SpiderGameOverDialog {...defaultProps} isNewBestMoves={true} />
    );
    expect(screen.getByText("🎉 新記録でクリア！")).toBeInTheDocument();
  });

  it("スタッツを表示する", () => {
    render(<SpiderGameOverDialog {...defaultProps} />);
    expect(screen.getByText("150")).toBeInTheDocument();
    expect(screen.getByText("手数")).toBeInTheDocument();
    expect(
      screen.getByText(`${TARGET_SETS}/${TARGET_SETS}`)
    ).toBeInTheDocument();
    expect(screen.getByText("完成セット")).toBeInTheDocument();
    expect(screen.getByText("10:00")).toBeInTheDocument();
    expect(screen.getByText("タイム")).toBeInTheDocument();
  });

  it("手数・タイムともにベスト更新メッセージを表示する", () => {
    render(
      <SpiderGameOverDialog
        {...defaultProps}
        isNewBestMoves={true}
        isNewBestTime={true}
      />
    );
    expect(
      screen.getByText("手数・タイムともにベスト更新！")
    ).toBeInTheDocument();
  });

  it("手数のみベスト更新メッセージを表示する", () => {
    render(
      <SpiderGameOverDialog {...defaultProps} isNewBestMoves={true} />
    );
    expect(screen.getByText("手数のベストを更新！")).toBeInTheDocument();
  });

  it("タイムのみベスト更新メッセージを表示する", () => {
    render(
      <SpiderGameOverDialog {...defaultProps} isNewBestTime={true} />
    );
    expect(screen.getByText("タイムのベストを更新！")).toBeInTheDocument();
  });

  it("ベスト更新なしの場合はメッセージを非表示にする", () => {
    render(<SpiderGameOverDialog {...defaultProps} />);
    expect(
      screen.queryByText("手数・タイムともにベスト更新！")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("手数のベストを更新！")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("タイムのベストを更新！")
    ).not.toBeInTheDocument();
  });

  it("「もう一度遊ぶ」クリックでonPlayAgainが呼ばれる", async () => {
    const user = userEvent.setup();
    const onPlayAgain = vi.fn();
    render(
      <SpiderGameOverDialog {...defaultProps} onPlayAgain={onPlayAgain} />
    );
    await user.click(screen.getByText("もう一度遊ぶ"));
    expect(onPlayAgain).toHaveBeenCalledTimes(1);
  });
});
