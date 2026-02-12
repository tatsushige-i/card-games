import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GameHeader } from "../game-header";

describe("GameHeader", () => {
  const defaultProps = {
    moves: 0,
    elapsedTime: 0,
    matchedPairs: 0,
    totalPairs: 8,
    phase: "idle" as const,
    bestScore: null,
    onStart: vi.fn(),
  };

  it("idle状態で「ゲーム開始」ボタンを表示する", () => {
    render(<GameHeader {...defaultProps} />);
    expect(screen.getByText("ゲーム開始")).toBeInTheDocument();
  });

  it("playing状態で「やり直す」ボタンとスコアを表示する", () => {
    render(
      <GameHeader
        {...defaultProps}
        phase="playing"
        moves={5}
        elapsedTime={65}
        matchedPairs={2}
      />
    );
    expect(screen.getByText("やり直す")).toBeInTheDocument();
    expect(screen.getByText(/5 回/)).toBeInTheDocument();
    expect(screen.getByText(/01:05/)).toBeInTheDocument();
    expect(screen.getByText(/2\/8/)).toBeInTheDocument();
  });

  it("complete状態で「もう一度遊ぶ」ボタンを表示する", () => {
    render(<GameHeader {...defaultProps} phase="complete" />);
    expect(screen.getByText("もう一度遊ぶ")).toBeInTheDocument();
  });

  it("ベストスコアを表示する", () => {
    render(
      <GameHeader
        {...defaultProps}
        bestScore={{ moves: 10, time: 45 }}
      />
    );
    expect(screen.getByText(/ベスト: 10回/)).toBeInTheDocument();
  });

  it("ゲーム開始ボタンクリックでonStartが呼ばれる", async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<GameHeader {...defaultProps} onStart={onStart} />);
    await user.click(screen.getByText("ゲーム開始"));
    expect(onStart).toHaveBeenCalledTimes(1);
  });
});
