import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SpiderHeader } from "../spider-header";

describe("SpiderHeader", () => {
  const defaultProps = {
    moves: 0,
    completedSets: 0,
    elapsedTime: 0,
    stockCount: 50,
    phase: "idle" as const,
    bestScore: null,
    onStart: vi.fn(),
    onReset: vi.fn(),
    onGiveUp: vi.fn(),
  };

  it("idle状態で「ゲーム開始」ボタンを表示する", () => {
    render(<SpiderHeader {...defaultProps} />);
    expect(screen.getByText("ゲーム開始")).toBeInTheDocument();
  });

  it("playing状態で「やり直す」と「ギブアップ」ボタンを表示する", () => {
    render(<SpiderHeader {...defaultProps} phase="playing" />);
    expect(screen.getByText("やり直す")).toBeInTheDocument();
    expect(screen.getByText("ギブアップ")).toBeInTheDocument();
  });

  it("cleared状態で「もう一度遊ぶ」ボタンを表示する", () => {
    render(<SpiderHeader {...defaultProps} phase="cleared" />);
    expect(screen.getByText("もう一度遊ぶ")).toBeInTheDocument();
  });

  it("gameOver状態で「もう一度遊ぶ」ボタンを表示する", () => {
    render(<SpiderHeader {...defaultProps} phase="gameOver" />);
    expect(screen.getByText("もう一度遊ぶ")).toBeInTheDocument();
  });

  it("ステータスバッジを表示する", () => {
    render(
      <SpiderHeader
        {...defaultProps}
        phase="playing"
        moves={25}
        completedSets={3}
        stockCount={20}
      />
    );
    expect(screen.getByText(/手数: 25/)).toBeInTheDocument();
    expect(screen.getByText(/完成: 3\/8/)).toBeInTheDocument();
    expect(screen.getByText(/山札: 20枚/)).toBeInTheDocument();
  });

  it("ベストスコアを表示する", () => {
    render(
      <SpiderHeader
        {...defaultProps}
        bestScore={{
          bestMoves: 100,
          bestMovesDate: "2026-03-18",
          bestTime: 330,
          bestTimeDate: "2026-03-18",
        }}
      />
    );
    expect(screen.getByText(/最少: 100手/)).toBeInTheDocument();
    expect(screen.getByText(/最速: 05:30/)).toBeInTheDocument();
  });

  it("bestScore=nullの時ベストスコアを表示しない", () => {
    render(<SpiderHeader {...defaultProps} />);
    expect(screen.queryByText(/最少:/)).not.toBeInTheDocument();
  });

  it("ゲーム開始ボタンクリックでonStartが呼ばれる", async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<SpiderHeader {...defaultProps} onStart={onStart} />);
    await user.click(screen.getByText("ゲーム開始"));
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it("やり直すボタンクリックでonResetが呼ばれる", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    render(<SpiderHeader {...defaultProps} phase="playing" onReset={onReset} />);
    await user.click(screen.getByText("やり直す"));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("ギブアップボタンクリックでonGiveUpが呼ばれる", async () => {
    const user = userEvent.setup();
    const onGiveUp = vi.fn();
    render(<SpiderHeader {...defaultProps} phase="playing" onGiveUp={onGiveUp} />);
    await user.click(screen.getByText("ギブアップ"));
    expect(onGiveUp).toHaveBeenCalledTimes(1);
  });
});
