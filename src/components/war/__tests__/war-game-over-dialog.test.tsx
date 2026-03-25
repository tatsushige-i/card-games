import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WarGameOverDialog } from "../war-game-over-dialog";

describe("WarGameOverDialog", () => {
  const defaultProps = {
    open: true,
    winner: "player" as const,
    roundCount: 30,
    playerCards: 52,
    cpuCards: 0,
    isNewBest: false,
    onRestart: vi.fn(),
    onClose: vi.fn(),
  };

  it("勝利時のタイトルを表示する", () => {
    render(<WarGameOverDialog {...defaultProps} />);
    expect(screen.getByText("🎊 勝利！")).toBeInTheDocument();
  });

  it("敗北時のタイトルを表示する", () => {
    render(
      <WarGameOverDialog
        {...defaultProps}
        winner="cpu"
        playerCards={0}
        cpuCards={52}
      />
    );
    expect(screen.getByText("😢 敗北...")).toBeInTheDocument();
  });

  it("新記録時のタイトルを表示する", () => {
    render(<WarGameOverDialog {...defaultProps} isNewBest={true} />);
    expect(screen.getByText("🎉 新記録で勝利！")).toBeInTheDocument();
  });

  it("スタッツを表示する", () => {
    render(<WarGameOverDialog {...defaultProps} />);
    expect(screen.getByText("30")).toBeInTheDocument();
    expect(screen.getByText("ラウンド")).toBeInTheDocument();
    expect(screen.getByText("52")).toBeInTheDocument();
    expect(screen.getByText("自分")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("CPU")).toBeInTheDocument();
  });

  it("新記録メッセージを表示する", () => {
    render(<WarGameOverDialog {...defaultProps} isNewBest={true} />);
    expect(
      screen.getByText("ベストスコアを更新しました！")
    ).toBeInTheDocument();
  });

  it("新記録でない場合はメッセージを非表示にする", () => {
    render(<WarGameOverDialog {...defaultProps} />);
    expect(
      screen.queryByText("ベストスコアを更新しました！")
    ).not.toBeInTheDocument();
  });

  it("「もう一度遊ぶ」クリックでonRestartが呼ばれる", async () => {
    const user = userEvent.setup();
    const onRestart = vi.fn();
    render(<WarGameOverDialog {...defaultProps} onRestart={onRestart} />);
    await user.click(screen.getByText("もう一度遊ぶ"));
    expect(onRestart).toHaveBeenCalledTimes(1);
  });
});
