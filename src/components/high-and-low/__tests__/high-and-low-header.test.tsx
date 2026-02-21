import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HighAndLowHeader } from "../high-and-low-header";

describe("HighAndLowHeader", () => {
  const defaultProps = {
    score: 3,
    streak: 0,
    cardsPlayed: 1,
    phase: "idle" as const,
    bestScore: null,
    onStart: vi.fn(),
  };

  it("idle状態で「ゲーム開始」ボタンを表示する", () => {
    render(<HighAndLowHeader {...defaultProps} />);
    expect(screen.getByText("ゲーム開始")).toBeInTheDocument();
  });

  it("playing状態で「やり直す」ボタンとスコアバッジを表示する", () => {
    render(
      <HighAndLowHeader
        {...defaultProps}
        phase="playing"
        score={5}
        streak={3}
        cardsPlayed={8}
      />
    );
    expect(screen.getByText("やり直す")).toBeInTheDocument();
    expect(screen.getByText(/スコア: 5\/10/)).toBeInTheDocument();
    expect(screen.getByText(/連勝: 3/)).toBeInTheDocument();
    expect(screen.getByText(/8枚目/)).toBeInTheDocument();
  });

  it("win状態で「もう一度遊ぶ」ボタンを表示する", () => {
    render(<HighAndLowHeader {...defaultProps} phase="win" />);
    expect(screen.getByText("もう一度遊ぶ")).toBeInTheDocument();
  });

  it("lose状態で「もう一度遊ぶ」ボタンを表示する", () => {
    render(<HighAndLowHeader {...defaultProps} phase="lose" />);
    expect(screen.getByText("もう一度遊ぶ")).toBeInTheDocument();
  });

  it("ベストスコアを表示する", () => {
    render(
      <HighAndLowHeader
        {...defaultProps}
        bestScore={{ maxStreak: 7, maxScore: 10 }}
      />
    );
    expect(screen.getByText(/ベスト: 最大7連勝/)).toBeInTheDocument();
  });

  it("ゲーム開始ボタンクリックでonStartが呼ばれる", async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<HighAndLowHeader {...defaultProps} onStart={onStart} />);
    await user.click(screen.getByText("ゲーム開始"));
    expect(onStart).toHaveBeenCalledTimes(1);
  });
});
