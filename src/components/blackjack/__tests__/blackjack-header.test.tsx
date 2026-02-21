import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BlackjackHeader } from "../blackjack-header";

describe("BlackjackHeader", () => {
  const defaultProps = {
    wins: 0,
    rounds: 0,
    phase: "idle" as const,
    bestScore: null,
    onStart: vi.fn(),
    onReset: vi.fn(),
  };

  it("idle状態で「ゲーム開始」ボタンを表示する", () => {
    render(<BlackjackHeader {...defaultProps} />);
    expect(screen.getByText("ゲーム開始")).toBeInTheDocument();
  });

  it("playing状態で「やり直す」ボタンとスコアバッジを表示する", () => {
    render(
      <BlackjackHeader
        {...defaultProps}
        phase="playing"
        wins={3}
        rounds={5}
      />
    );
    expect(screen.getByText("やり直す")).toBeInTheDocument();
    expect(screen.getByText(/連勝: 3/)).toBeInTheDocument();
    expect(screen.getByText(/ラウンド: 5/)).toBeInTheDocument();
  });

  it("gameOver状態で「もう一度遊ぶ」ボタンを表示する", () => {
    render(<BlackjackHeader {...defaultProps} phase="gameOver" />);
    expect(screen.getByText("もう一度遊ぶ")).toBeInTheDocument();
  });

  it("ベストスコアを表示する", () => {
    render(
      <BlackjackHeader
        {...defaultProps}
        bestScore={{ maxWins: 7 }}
      />
    );
    expect(screen.getByText(/ベスト: 最大7連勝/)).toBeInTheDocument();
  });

  it("ゲーム開始ボタンクリックでonStartが呼ばれる", async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<BlackjackHeader {...defaultProps} onStart={onStart} />);
    await user.click(screen.getByText("ゲーム開始"));
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it("やり直すボタンクリックでonResetが呼ばれる", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    render(
      <BlackjackHeader {...defaultProps} phase="playing" onReset={onReset} />
    );
    await user.click(screen.getByText("やり直す"));
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
