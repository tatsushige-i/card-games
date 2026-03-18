import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PokerHeader } from "../poker-header";
import { MAX_ROUNDS } from "@/lib/poker-cards";

describe("PokerHeader", () => {
  const defaultProps = {
    round: 0,
    totalScore: 0,
    phase: "idle" as const,
    bestScore: null,
    onStart: vi.fn(),
    onReset: vi.fn(),
  };

  it("idle状態かつround=0で「ゲーム開始」ボタンを表示する", () => {
    render(<PokerHeader {...defaultProps} />);
    expect(screen.getByText("ゲーム開始")).toBeInTheDocument();
  });

  it("dealing状態で「やり直す」ボタンを表示する", () => {
    render(<PokerHeader {...defaultProps} phase="dealing" round={1} />);
    expect(screen.getByText("やり直す")).toBeInTheDocument();
  });

  it("holding状態で「やり直す」ボタンを表示する", () => {
    render(<PokerHeader {...defaultProps} phase="holding" round={1} />);
    expect(screen.getByText("やり直す")).toBeInTheDocument();
  });

  it("drawing状態で「やり直す」ボタンを表示する", () => {
    render(<PokerHeader {...defaultProps} phase="drawing" round={1} />);
    expect(screen.getByText("やり直す")).toBeInTheDocument();
  });

  it("result状態で「やり直す」ボタンを表示する", () => {
    render(<PokerHeader {...defaultProps} phase="result" round={1} />);
    expect(screen.getByText("やり直す")).toBeInTheDocument();
  });

  it("gameOver状態かつround>=MAX_ROUNDSで「もう一度遊ぶ」ボタンを表示する", () => {
    render(
      <PokerHeader
        {...defaultProps}
        phase="gameOver"
        round={MAX_ROUNDS}
      />
    );
    expect(screen.getByText("もう一度遊ぶ")).toBeInTheDocument();
  });

  it("スコアバッジを表示する", () => {
    render(
      <PokerHeader
        {...defaultProps}
        phase="holding"
        round={3}
        totalScore={150}
      />
    );
    expect(screen.getByText(/ラウンド: 3/)).toBeInTheDocument();
    expect(screen.getByText(/スコア: 150pt/)).toBeInTheDocument();
  });

  it("ベストスコアを表示する", () => {
    render(
      <PokerHeader
        {...defaultProps}
        bestScore={{ maxScore: 500 }}
      />
    );
    expect(screen.getByText(/ベスト: 500pt/)).toBeInTheDocument();
  });

  it("bestScore=nullの時ベストスコアを表示しない", () => {
    render(<PokerHeader {...defaultProps} />);
    expect(screen.queryByText(/ベスト:/)).not.toBeInTheDocument();
  });

  it("ゲーム開始ボタンクリックでonStartが呼ばれる", async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<PokerHeader {...defaultProps} onStart={onStart} />);
    await user.click(screen.getByText("ゲーム開始"));
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it("やり直すボタンクリックでonResetが呼ばれる", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    render(
      <PokerHeader {...defaultProps} phase="holding" round={1} onReset={onReset} />
    );
    await user.click(screen.getByText("やり直す"));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("もう一度遊ぶボタンクリックでonStartが呼ばれる", async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(
      <PokerHeader
        {...defaultProps}
        phase="gameOver"
        round={MAX_ROUNDS}
        onStart={onStart}
      />
    );
    await user.click(screen.getByText("もう一度遊ぶ"));
    expect(onStart).toHaveBeenCalledTimes(1);
  });
});
